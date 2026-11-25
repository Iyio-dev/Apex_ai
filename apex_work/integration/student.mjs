import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import test from 'node:test';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import User from '../src/models/User.js';
import Assessment from '../src/models/Assessment.js';
import AIPractice from '../src/models/AIPractice.js';
import {dateKey} from '../src/utils/date.js';

// Always create a new local database. Never read a deployment URI or provider key.
test('isolated student, editor and assessment workflows',async t=>{
  const port=Number(process.env.QA_MONGO_PORT || 27017);
  const db='apex_qa_'+randomUUID().replaceAll('-','');
  process.env.JWT_SECRET=randomBytes(48).toString('hex');
  delete process.env.GROQ_API_KEY;
  await mongoose.connect(`mongodb://127.0.0.1:${port}/${db}`,{serverSelectionTimeoutMS:5000});
  const server=app.listen(0,'127.0.0.1');
  t.after(async()=>{await new Promise(r=>server.close(r));await mongoose.connection.dropDatabase();await mongoose.disconnect();});
  await new Promise(r=>server.once('listening',r));
  const root='http://127.0.0.1:'+server.address().port+'/api/v1';
  async function request(path,method='GET',body,cookie){
    return fetch(root+path,{method,headers:{Origin:'http://localhost:5173','Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  }
  async function register(name){
    const r=await request('/auth/register','POST',{name,email:name+'@example.invalid',password:randomBytes(18).toString('hex')});
    assert.equal(r.status,201);assert.match(r.headers.get('set-cookie'),/HttpOnly/);
    return {id:(await r.json()).user.id,cookie:r.headers.get('set-cookie').split(';')[0]};
  }
  const student=await register('Student'),editor=await register('Editor');
  await User.updateOne({_id:editor.id},{$set:{role:'admin'}});
  const ac=(path,method,body,actor=student)=>request('/academic'+path,method,body,actor.cookie);
  let topic,plan;
  await t.test('role gate and stable topic references on admin edit',async()=>{
    assert.equal((await ac('/admin/access')).status,403);
    const r=await ac('/syllabuses','POST',{programme:'OAU JUPEB',subject:'Biology',topics:[{name:'Cells',lectureCovered:true,subtopics:[{name:'Mitosis'}]}]},editor);
    assert.equal(r.status,201);const syllabus=(await r.json()).data;topic=syllabus.topics[0];
    const edited=await ac('/syllabuses/'+syllabus._id,'PATCH',{topics:[{...topic,courseCode:'001'}]},editor);
    assert.equal(edited.status,200);const saved=(await edited.json()).data.topics[0];
    assert.equal(saved._id,topic._id);assert.equal(saved.subtopics[0]._id,topic.subtopics[0]._id);
  });
  await t.test('profile, understanding, coverage, plan persistence and ownership',async()=>{
    assert.equal((await ac('/profile','PUT',{subjects:['Biology'],weeklyHours:7})).status,200);
    assert.equal((await ac('/progress/'+topic._id,'PUT',{understanding:3})).status,200);
    assert.equal((await (await ac('/statistics')).json()).data.syllabus.covered,1);
    const r=await ac('/plans/ai-generate','POST',{days:7,minutesPerDay:30,breakDays:[]});assert.equal(r.status,201);
    plan=(await r.json()).data;assert.equal(plan.source,'rule-based');assert.ok(plan.activities.length);
    assert.equal((await ac('/plans/'+plan._id)).status,200);assert.equal((await ac('/plans/'+plan._id,'GET',undefined,editor)).status,404);
  });
  await t.test('daily assessment is scored once and hides grading fields before submission',async()=>{
    const questions=Array.from({length:5},(_,i)=>({text:'Synthetic question '+i,subject:'Biology',options:['A','B','C','D'],correctIndex:0,explanation:'Fixture'}));
    await Assessment.create({user:student.id,day:dateKey(),generatedQuestions:questions});
    const {data}=await (await ac('/assessments/daily')).json();
    assert.equal(data.questions.length,5);assert.ok(data.questions.every(q=>!('correctIndex' in q)&&!('explanation' in q)));
    const body={answers:data.questions.map(q=>({question:q._id,answer:'A'}))};
    const responses=await Promise.all([ac('/assessments/daily','POST',body),ac('/assessments/daily','POST',body)]);
    assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);assert.equal((await responses.find(r=>r.ok).json()).data.score,5);
  });
  await t.test('five-question revision accepts all five selections',async()=>{
    const practice=await AIPractice.create({user:student.id,plan:plan._id,mode:'revision',questions:Array.from({length:5},()=>({text:'Review cells',topicId:topic._id,options:['A','B','C','D'],correctIndex:0}))});
    const r=await ac('/practice/'+practice.id+'/submit','POST',{answers:[0,0,0,0,0]});assert.equal(r.status,200);assert.equal((await r.json()).data.score,5);
  });
  await t.test('expired and signed-out sessions require authentication',async()=>{
    const expired=jwt.sign({id:student.id,version:0},process.env.JWT_SECRET,{expiresIn:-1});
    assert.equal((await request('/auth/me','GET',undefined,'apex_session='+expired)).status,401);
    assert.equal((await request('/auth/logout','POST',undefined,student.cookie)).status,200);
    assert.equal((await request('/auth/me','GET',undefined,student.cookie)).status,401);
  });
});
