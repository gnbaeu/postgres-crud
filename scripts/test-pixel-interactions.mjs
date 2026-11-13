import assert from 'node:assert/strict';
import {createSoundEngine} from '../pixel-interactions.js';
let made=0,tones=0,time=0,stops=[];
class Audio {state='running';currentTime=1;destination={};constructor(){made++}resume(){this.state='running';return Promise.resolve()}createOscillator(){return {frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){tones++},stop(t){stops.push(t)}}}createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(v){assert.ok(v<=.018)}},connect(){},disconnect(){}}}}
const values=new Map();const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
const engine=createSoundEngine({storage,AudioContextClass:Audio,now:()=>time});
assert.equal(engine.isEnabled(),false);assert.equal(await engine.play(),false);assert.equal(made,0);
engine.setEnabled(true);assert.equal(made,0);assert.equal(await engine.play('draw'),true);assert.equal(tones,1);assert.equal(await engine.play(),false);assert.equal(tones,1);assert.equal(stops[0],1.06);
engine.setEnabled(false);time=200;assert.equal(await engine.play(),false);assert.equal(tones,1);
engine.setEnabled(true);assert.equal(createSoundEngine({storage}).isEnabled(),true);
const broken={getItem(){throw Error()},setItem(){throw Error()}};const fallback=createSoundEngine({storage:broken});fallback.setEnabled(true);assert.equal(await fallback.play(),false);
class Blocked {state='suspended';resume(){return Promise.reject(Error())}}
const blocked=createSoundEngine({AudioContextClass:Blocked});blocked.setEnabled(true);assert.equal(await blocked.play(),false);
console.log('Pixel sound engine PASS: opt-in, lazy context, quiet 60ms tone, throttle, OFF silence, persistence and failure fallback.');
