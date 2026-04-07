import { global } from "../../global";

export default async function(req: Request, token: string) {
    if (!token) return new Response("Bad Request", {status: 400});
            
    global.user_sessions.remove(token);
    global.sse_clients.remove(token);
    
    return new Response("", {status: 302, headers: {
        "set-cookie": "token=; Path=/; Max-Age=0"
    }});
}