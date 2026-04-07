import { user_session_interface } from "../../user_session/user_session";
import { global } from "../../global";

export default async function(req: Request, url: URL, user_info: user_session_interface) {
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});

    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.MANAGE_PEMBUKUAN))) return new Response("0", {status: 403});

    const user_input = url.searchParams;
    const tanggal_key = Number(user_input.get("tanggal_key"));
    const id = Number(user_input.get("id"));

    let res;
    const query = db
    .selectFrom('pembukuan')
    .selectAll()
    .where('tipe', '=', 1);
    
    if (!isNaN(id) && id) {
        res = await query
        .where('id', '=', id)
        .executeTakeFirst();
    } else {
        if (isNaN(tanggal_key)) return new Response("Bad Request", { status: 400 });
        
        res = await query
        .where('tanggal_key', '=', tanggal_key)
        .execute();
    }

    return new Response(JSON.stringify(res), {status: 200});
}