import express from 'express';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { seedData, demoCredentials } from '../src/data/mockData.js';
const digest = s => createHash('sha256').update(s).digest('hex');
const hash = password => { const salt=randomBytes(16).toString('hex'); return salt+':'+scryptSync(password,salt,64).toString('hex'); };
const verify = (password, stored) => { const [salt,key]=stored.split(':'); return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(key,'hex')); };
export function createApp(filename = process.env.DB_PATH || 'server/data/connectly.sqlite') {
 if(filename!==':memory:') mkdirSync(dirname(resolve(filename)),{recursive:true});
 const db=new DatabaseSync(filename); db.exec(`PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS posts(id TEXT PRIMARY KEY, authorId TEXT REFERENCES users(id), data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS comments(id TEXT PRIMARY KEY, postId TEXT REFERENCES posts(id) ON DELETE CASCADE, authorId TEXT REFERENCES users(id), data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS likes(userId TEXT REFERENCES users(id), postId TEXT REFERENCES posts(id) ON DELETE CASCADE, PRIMARY KEY(userId,postId));
 CREATE TABLE IF NOT EXISTS follows(followerId TEXT REFERENCES users(id), followingId TEXT REFERENCES users(id), PRIMARY KEY(followerId,followingId), CHECK(followerId<>followingId));
 CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,userId TEXT REFERENCES users(id),expires INTEGER);`);
 if(!db.prepare('SELECT id FROM users LIMIT 1').get() && process.env.SEED_DEMO!=='false') {
  db.exec('BEGIN'); try {
   for(const u of seedData.users) db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(u.id,u.email.toLowerCase(),u.username.toLowerCase(),hash(demoCredentials.find(c=>c.userId===u.id)?.password || randomBytes(24).toString('hex')),JSON.stringify(u));
   for(const p of seedData.posts) db.prepare('INSERT INTO posts VALUES(?,?,?)').run(p.id,p.authorId,JSON.stringify(p));
   for(const c of seedData.comments) db.prepare('INSERT INTO comments VALUES(?,?,?,?)').run(c.id,c.postId,c.authorId,JSON.stringify(c));
   for(const l of seedData.likes) db.prepare('INSERT OR IGNORE INTO likes VALUES(?,?)').run(l.userId,l.postId);
   for(const f of seedData.follows) db.prepare('INSERT OR IGNORE INTO follows VALUES(?,?)').run(f.followerId,f.followingId);
   db.exec('COMMIT');
  } catch(e) {db.exec('ROLLBACK');throw e;}
 }
 const app=express(); app.disable('x-powered-by');
 app.use((req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');next();});
 app.use('/api',(req,res,next)=>{res.setHeader('Cache-Control','no-store'); if(req.method==='POST' && (req.get('sec-fetch-site')==='cross-site' || (req.get('origin') && req.get('origin')!==(process.env.APP_ORIGIN || `${req.protocol}://${req.get('host')}`)))) return res.status(403).json({error:'Origin not allowed.'}); next();});
 app.use(express.json({limit:'12mb'}));
 const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
 const user=id=>{const r=db.prepare('SELECT data FROM users WHERE id=?').get(id);if(!r)fail('User not found.',404);return JSON.parse(r.data);};
 const read=(table)=>db.prepare(`SELECT data FROM ${table}`).all().map(r=>JSON.parse(r.data));
 const publicUser=u=>{const {email,...rest}=u;return rest;};
 const text=(value,max,required=false)=>{if(typeof value!=='string' || value.length>max || (required&&!value.trim()))fail('Invalid text input.');return value.trim();};
 const image=value=>{if(!value)return '';if(typeof value!=='string'||value.length>7000000||!(/^https?:\/\//.test(value)||/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(value)))fail('Invalid image. Use PNG, JPEG, WebP or GIF up to 5MB.');return value;};
 const postValues=v=>{const t=text(v.text,500),i=image(v.imageUrl);if(!t&&!i)fail('Add text or an image.');return {text:t,imageUrl:i};};
 const entity=(table,id)=>{const r=db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);if(!r)fail('Content not found.',404);return r;};
 const cookieToken=req=>{const match=(req.headers.cookie||'').match(/(?:^|;\s*)connectly_session=([a-f0-9]+)/);return match?.[1];};
 const identity=req=>{const t=cookieToken(req);return t?db.prepare('SELECT userId FROM sessions WHERE token=? AND expires>?').get(digest(t),Date.now())?.userId:null;};
 function session(req,res,id) {const old=cookieToken(req);if(old)db.prepare('DELETE FROM sessions WHERE token=?').run(digest(old));db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());const token=randomBytes(32).toString('hex');db.prepare('INSERT INTO sessions VALUES(?,?,?)').run(digest(token),id,Date.now()+7*86400000);res.cookie('connectly_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:7*86400000,path:'/'});}
 const attempts=new Map();
 app.post('/api/actions/:action',(req,res,next)=>{try {
  const action=req.params.action,args=req.body.args;if(!Array.isArray(args))fail('Invalid request.');
  const me=identity(req); const [a,b,c]=args; let result;
  if(action==='login'||action==='register') {const ip=req.ip,now=Date.now(),entry=attempts.get(ip);if(!entry||entry.until<now)attempts.set(ip,{count:1,until:now+60000});else if(++entry.count>20)fail('Too many attempts. Try again in a minute.',429);}
  if(action==='login') {const email=text(a,254,true).toLowerCase();if(typeof b!=='string'||b.length>128)fail('Email or password is incorrect.',401);const r=db.prepare('SELECT * FROM users WHERE email=?').get(email);if(!r||!verify(b,r.password))fail('Email or password is incorrect.',401);session(req,res,r.id);result=JSON.parse(r.data);}
  else if(action==='register') {const name=text(a.name,100,true),username=text(a.username,30,true).replace(/^@/,'').toLowerCase(),email=text(a.email,254,true).toLowerCase();if(!/^[a-z0-9_]{3,30}$/.test(username))fail('Username must contain 3–30 letters, numbers or underscores.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail('Invalid email.');if(typeof a.password!=='string'||a.password.length<8||a.password.length>128)fail('Password must contain 8–128 characters.');if(db.prepare('SELECT id FROM users WHERE email=? OR username=?').get(email,username))fail('Email or username already registered.',409);const u={id:randomUUID(),name,username,email,bio:'New to Connectly and ready to share.',avatarUrl:'',coverUrl:'',location:'',website:'',createdAt:new Date().toISOString()};db.prepare('INSERT INTO users VALUES(?,?,?,?,?)').run(u.id,email,username,hash(a.password),JSON.stringify(u));session(req,res,u.id);result=u;}
  else if(action==='logout') {const token=cookieToken(req);if(token)db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token));res.clearCookie('connectly_session',{path:'/'});result=true;}
  else if(action==='getSnapshot') {result=me?{users:read('users').map(u=>u.id===me?u:publicUser(u)),posts:read('posts'),comments:read('comments'),likes:db.prepare('SELECT * FROM likes').all(),follows:db.prepare('SELECT * FROM follows').all(),currentUserId:me}:{users:[],posts:[],comments:[],likes:[],follows:[],currentUserId:null};}
  else {if(!me)fail('Please sign in.',401);
   switch(action) {
    case 'getCurrentUser':result=user(me);break;
    case 'getUsers':result=read('users').map(publicUser);break;
    case 'getUserProfile':result=a===me?user(a):publicUser(user(a));break;
    case 'getPosts':result=read('posts').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));break;
    case 'getComments':result=read('comments').filter(c=>c.postId===a);break;
    case 'updateProfile':{if(a!==me)fail('You can edit only your own profile.',403);const u=user(me);const changes={name:text(b.name,100,true),bio:text(b.bio||'',500),location:text(b.location||'',100),website:text(b.website||'',500),avatarUrl:image(b.avatarUrl),coverUrl:image(b.coverUrl)};if(changes.website&&!/^https?:\/\//.test(changes.website))fail('Website must start with https:// or http://.');result={...u,...changes};db.prepare('UPDATE users SET data=? WHERE id=?').run(JSON.stringify(result),me);break;}
    case 'createPost':{const values=postValues(b);if(a!==me)fail('Invalid author.',403);result={id:randomUUID(),authorId:me,...values,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};db.prepare('INSERT INTO posts VALUES(?,?,?)').run(result.id,me,JSON.stringify(result));break;}
    case 'updatePost':{const p=entity('posts',a);if(p.authorId!==me)fail('You can edit only your posts.',403);result={...JSON.parse(p.data),...postValues(b),updatedAt:new Date().toISOString()};db.prepare('UPDATE posts SET data=? WHERE id=?').run(JSON.stringify(result),a);break;}
    case 'deletePost':{if(entity('posts',a).authorId!==me)fail('You can delete only your posts.',403);db.prepare('DELETE FROM posts WHERE id=?').run(a);result=true;break;}
    case 'addComment':{entity('posts',a);if(b!==me)fail('Invalid author.',403);result={id:randomUUID(),postId:a,authorId:me,text:text(c,300,true),createdAt:new Date().toISOString()};db.prepare('INSERT INTO comments VALUES(?,?,?,?)').run(result.id,a,me,JSON.stringify(result));break;}
    case 'deleteComment':{if(entity('comments',a).authorId!==me)fail('You can delete only your comments.',403);db.prepare('DELETE FROM comments WHERE id=?').run(a);result=true;break;}
    case 'toggleLike':{entity('posts',a);if(b!==me)fail('Invalid user.',403);const old=db.prepare('SELECT 1 FROM likes WHERE userId=? AND postId=?').get(me,a);db.prepare(old?'DELETE FROM likes WHERE userId=? AND postId=?':'INSERT INTO likes VALUES(?,?)').run(me,a);result=!old;break;}
    case 'followUser':case 'unfollowUser':{if(a!==me)fail('Invalid user.',403);user(b);if(b===me)fail('You cannot follow yourself.');db.prepare(action==='followUser'?'INSERT OR IGNORE INTO follows VALUES(?,?)':'DELETE FROM follows WHERE followerId=? AND followingId=?').run(me,b);result=true;break;}
    case 'getFollowers':result=db.prepare('SELECT followerId AS id FROM follows WHERE followingId=?').all(a).map(r=>publicUser(user(r.id)));break;
    case 'getFollowing':result=db.prepare('SELECT followingId AS id FROM follows WHERE followerId=?').all(a).map(r=>publicUser(user(r.id)));break;
    default:fail('Unknown action.',404);
   }
  }
  res.json({result});
 }catch(e){next(e);}});
 app.get('/api/health',(_,res)=>res.json({status:'ok'}));
 app.use('/api',(_,res)=>res.status(404).json({error:'Endpoint not found.'}));
 app.use(express.static(resolve('dist')));
 app.use((err,req,res,next)=>{res.status(err.status|| (err.type==='entity.too.large'?413:500)).json({error:err.status?err.message:err.type==='entity.too.large'?'Image or request is too large.':'Unable to complete request.'});});
 return {app,db};
}
