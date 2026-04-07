import { user_session_interface } from "../../user_session/user_session";
import { global } from "../../global";

export default async function(req: Request, url: URL, user_info: user_session_interface) {
    const db = global.database;

    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});

    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.DASHBOARD))) return new Response("0", {status: 403});

    const res = await db
    .selectFrom('barang')
    .select('nama_barang')
    .where('stok_barang', '<=', 0)
    .execute();

    return new Response(JSON.stringify(res), {status: 200});
}