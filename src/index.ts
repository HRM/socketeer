import {createServer} from "http"
import {Server} from "socket.io"
import Koa from "koa";
import zod from "zod"
import fetch from "node-fetch";
import Router from "@koa/router";
import bodyParser from 'koa-bodyparser'

export interface Config{
    authUrl:string,
    socketPort:number,
    socketPath:string,
    backendPort:number,
}

const authSchema = zod.object({
    data:zod.string(),
    contentType:zod.string().optional()
});

const authResponse = zod.object({
    user:zod.string(),
});

export function startServer(config:Config){
    const koa = new Koa()
    const server = createServer();
    const io = new Server(server,{path:config.socketPath});

    io.on("connect",socket => {
        socket.on("auth",async (data)=>{
            const parsed = authSchema.safeParse(data);
            if(parsed.success){
                try {
                    const res = await fetch(config.authUrl, {
                        method: "POST",
                        body: parsed.data.data,
                        headers: {
                            "Content-Type": parsed.data.contentType ?? "text/html",
                        }
                    })
                    const parsedRes = authResponse.safeParse(await res.json())
                    if(parsedRes.success){
                        socket.join("user_"+parsedRes.data.user)
                    }
                }catch (e){}
            }
        })
    })

    const router = new Router();

    router.post("/send/:event/:user",(ctx)=>{
        io.in("user_"+ctx.params.user).emit(ctx.params.event,ctx.body);
    })

    router.post("/send/:event",(ctx)=>{
        io.emit(ctx.params.event,ctx.body);
    })

    server.listen(config.socketPort);
    koa.use(bodyParser());
    koa.use(router.routes());
    koa.use(router.allowedMethods());
    koa.listen(config.backendPort)
}