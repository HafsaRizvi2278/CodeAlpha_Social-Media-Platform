import { createApp } from './app.js';
const {app,db}=createApp();
const server=app.listen(Number(process.env.PORT||3001),'127.0.0.1',()=>console.log(`Connectly: http://localhost:${process.env.PORT||3001}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{db.close();process.exit(0);}));
