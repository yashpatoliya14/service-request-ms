import { createClient } from "redis";

const globalRedis = globalThis as unknown as {redis:any}

export const redis = globalRedis.redis || createClient({
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    }
})

if (process.env.NODE_ENV !== "production") {
    globalRedis.redis = redis;
}


redis.on("error",(err:any)=>{
    console.error(err);
    
})

if(!redis.isOpen){
    await redis.connect().catch((err:any)=>{
        console.error(err);
    });
}

