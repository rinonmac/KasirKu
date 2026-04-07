import { sql } from "kysely";
import { global } from "../../global";

export default async function(req: Request, token: string) {
    const user_info = global.user_sessions.get(token);
    if (!token || !user_info) return new Response("Unauthorized", {status: 401});
    
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});
    
    if (!(res_role.permission_level & global.permissions.ADMINISTRATOR)) return new Response("0", {status: 403});
    
    const user_input = new URLSearchParams(await req.text());
    
    const id = Number(user_input.get("id"));
    const recursive = user_input.get("recursive");
    
    if (!id || isNaN(id)) return new Response("Bad Request", {status: 400});
    
    if (id === 1) return new Response("1", {status: 403});
                
    if (!recursive) {
        const res = await db
            .selectFrom('users')
            .select(sql`1`.as('exists'))
            .where('role_id', '=', id)
            .executeTakeFirst();
            
        if (res) return new Response("2", { status: 403 });
    }
    
    try {
        await db
        .deleteFrom('roles')
        .where('id', '=', id)
        .execute();
    } catch (e) {
        console.log("An error occured in delete_method.ts at /role:", e);
        return new Response("Internal Server Error", { status: 500 });
    }
    
    global.sse_clients.remove_by_role_id(id);
    global.user_sessions.revoke_all_by_roleid(id);
    
    global.sse_clients.send_to_role(1, JSON.stringify({
        type: 1,
        code: "REFRESH_RP"
    }))
    
    return new Response("", {status: 200});
}