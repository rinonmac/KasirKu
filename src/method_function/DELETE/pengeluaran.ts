import { global } from "../../global";

export default async function(req: Request, token: string) {
    const user_info = global.user_sessions.get(token);
    if (!token || !user_info) return new Response("Unauthorized", {status: 401});
            
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});

    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.MANAGE_PEMBUKUAN))) return new Response("0", {status: 403});

    const user_input = new URLSearchParams(await req.text());
            
    const id = Number(user_input.get("id"));
    const tanggal_key = Number(user_input.get("tanggal_key"));

    if (isNaN(id) || isNaN(tanggal_key) || !id || !tanggal_key) return new Response("", {status: 400});

    let res;
    try {
        res = await db
        .deleteFrom('pembukuan')
        .where('id', '=', id)
        .where('tanggal_key', '=', tanggal_key)
        .where('tipe', '=', 1)
        .executeTakeFirst();
    } catch(e) {
        console.log("An error occured in delete_method.ts at /pengeluaran:", e);
        return new Response("Internal Server Error", {status: 500});
    }

    if (res.numDeletedRows > 0n) global.sse_clients.broadcast(JSON.stringify({
        type: 5,
        code: "DELETE_PENGELUARAN",
        data: {
            id,
            tanggal_key
        }
    }));
            
    return new Response("", {status: 200});
}