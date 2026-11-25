import test from 'node:test';
import assert from 'node:assert/strict';
import {answersSchema,overviewSchema} from '../src/services/academicOverviewService.js';
const answers={goal:'Improve mathematics before exams',biggestObstacle:'I lose focus when revising',currentHabits:'I practice questions every weekend',availableTime:'90 minutes each weekday',preferredSupport:'Help me structure revision sessions'};
test('overview requires complete student clarifications',()=>{assert.equal(answersSchema.safeParse(answers).success,true);assert.equal(answersSchema.safeParse({goal:answers.goal}).success,false);});
test('overview requires all four actionable sections',()=>{const item={action:'Practice more past questions',reason:'To improve exam readiness',firstStep:'Start with ten questions',evidence:'Student reports weekend practice'};assert.equal(overviewSchema.safeParse({summary:'A structured overview of current academic habits',start:[item],stop:[item],reduce:[item],reinforce:[item]}).success,true);assert.equal(overviewSchema.safeParse({summary:'Missing all sections'}).success,false);});
