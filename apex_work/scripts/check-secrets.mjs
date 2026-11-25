// Scan source and configuration without printing matched values.
import {readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
const ignore=new Set(['.git','node_modules','dist','coverage','review']);
const patterns=[
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /mongodb(?:\+srv)?:\/\/[^\s/:@]+:[^\s/@]+@/,
  /\bgsk_[a-zA-Z0-9]{24,}/,
  /\bgh[pousr]_[A-Za-z0-9]{30,}/,
];
let count=0;
async function walk(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){if(!ignore.has(entry.name))await walk(file);continue;}
    if(!entry.isFile())continue;
    if(/^\.env(?:\.|$)/.test(entry.name)&&entry.name!=='.env.example')throw Error('Private environment file: '+file);
    const data=await readFile(file);if(data.includes(0))continue;
    if(patterns.some(p=>p.test(data.toString())))throw Error('Possible credential in '+file);
    count++;
  }
}
await walk('.');console.log('Credential-pattern scan completed for',count,'text files.');
