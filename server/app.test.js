import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from './app.js';
test('API authentication, ownership, relationships, cascade deletion and restart persistence',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'connectly-'));const file=join(dir,'test.sqlite');let instance=createApp(file),server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));let base=`http://127.0.0.1:${server.address().port}`;
 async function call(action,args=[],cookie=''){const r=await fetch(`${base}/api/actions/${action}`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({args})});return {status:r.status,...await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]};}
 try {
  assert.equal((await call('createPost',['u1',{text:'x'}])).status,401);
  assert.equal((await call('login',['hafsa@example.com','wrong'])).status,401);
  const login=await call('login',['hafsa@example.com','Demo1234!']);assert.equal(login.status,200);const a=login.cookie;
  const reg=await call('register',[{name:'Test Member',username:'test_member',email:'test@example.com',password:'Testing123!'}]);assert.equal(reg.status,200);const b=reg.cookie,id=reg.result.id;
  assert.equal((await call('register',[{name:'Duplicate',username:'TEST_MEMBER',email:'other@example.com',password:'Testing123!'}])).status,409);
  assert.equal((await call('login',['test@example.com','Testing123!'])).status,200);
  const p=await call('createPost',['u1',{text:'persistent post',imageUrl:''}],a);assert.equal(p.status,200);
  assert.equal((await call('updatePost',[p.result.id,{text:'stolen'}],b)).status,403);
  assert.equal((await call('updateProfile',['u1',{name:'stolen'}],b)).status,403);
  assert.equal((await call('createPost',['u1',{text:' '.repeat(10)}],a)).status,400);
  assert.equal((await call('addComment',[p.result.id,id,''],b)).status,400);
  const comment=await call('addComment',[p.result.id,id,'A comment'],b);assert.equal(comment.status,200);
  assert.equal((await call('deleteComment',[comment.result.id],a)).status,403);
  assert.equal((await call('toggleLike',[p.result.id,id],b)).result,true);
  await call('followUser',[id,'u1'],b);await call('followUser',[id,'u1'],b);
  let snap=(await call('getSnapshot',[],b)).result;assert.equal(snap.follows.filter(f=>f.followerId===id&&f.followingId==='u1').length,1);assert.ok(!snap.users.find(u=>u.id==='u1').email);
  await new Promise(r=>server.close(r));instance.db.close();instance=createApp(file);server=instance.app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base=`http://127.0.0.1:${server.address().port}`;
  snap=(await call('getSnapshot',[],b)).result;assert.equal(snap.currentUserId,id);assert.ok(snap.posts.some(x=>x.id===p.result.id));assert.ok(snap.comments.some(x=>x.id===comment.result.id));
  await call('deletePost',[p.result.id],a);snap=(await call('getSnapshot',[],b)).result;assert.ok(!snap.comments.some(x=>x.postId===p.result.id));assert.ok(!snap.likes.some(x=>x.postId===p.result.id));
  await call('logout',[],b);assert.equal((await call('createPost',[id,{text:'no session'}],b)).status,401);
  const cross=await fetch(`${base}/api/actions/logout`,{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:'{"args":[]}'});assert.equal(cross.status,403);
 } finally {await new Promise(r=>server.close(r));instance.db.close();rmSync(dir,{recursive:true,force:true});}
});
