import { sql } from "kysely";
import { global } from "../../global";
import { user_session_interface } from "../../user_session/user_session";

export default async function(req: Request, url: URL, user_info: user_session_interface) {
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();

    if (!res_role) return new Response("Internal Server Error", {status: 500});
    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.DASHBOARD))) return new Response("0", {status: 403}); 
    
    const user_input = url.searchParams;
    const tanggal_key = Number(user_input.get("tanggal_key")); 
    if (isNaN(tanggal_key) || !tanggal_key) return new Response("Bad Request", {status: 400}); 
    
    const res = await db
    .selectNoFrom(() => [
        sql<number>`(SELECT SUM(total_barang) FROM penjualan WHERE tanggal_key = ${tanggal_key})`.as('total_barang'),
        sql<number>`(SELECT SUM(total_harga_modal) FROM penjualan WHERE tanggal_key = ${tanggal_key})`.as('total_harga_modal'),
        sql<number>`(SELECT SUM(total_harga_jual) FROM penjualan WHERE tanggal_key = ${tanggal_key})`.as('total_harga_jual'),
        sql<number>`(SELECT SUM(jumlah_uang) FROM pembukuan WHERE tanggal_key = ${tanggal_key} AND tipe = 1)`.as('jumlah_uang')
    ])
    .executeTakeFirst();   
    
    return new Response(JSON.stringify(res), {status: 200});
}