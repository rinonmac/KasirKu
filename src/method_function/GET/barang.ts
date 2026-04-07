import { user_session_interface } from "../../user_session/user_session";
import { global } from "../../global";

export default async function(req: Request, url: URL, user_info: user_session_interface) {
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});
    
    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.MANAGE_BARANG))) return new Response("0", {status: 403});
    
    const user_input = url.searchParams;
    
    const id = Number(user_input.get("id"));
                    
    let res;
    const query = db
    .selectFrom('barang as b')
    .innerJoin('kategori_barang as k', 'b.kategori_barang_id', 'k.id')
    .select([
        'b.id',
        'b.nama_barang',
        'b.stok_barang',
        'b.kategori_barang_id',
        'b.harga_modal',
        'b.harga_jual',
        'b.barcode_barang',
        'b.created_ms',
        'b.modified_ms',
        'k.nama_kategori as nama_kategori'
    ]);

    if (isNaN(id) || !id) res = await query.execute();
    else res = await query.where('b.id', '=', id).executeTakeFirst();
    
    return new Response(JSON.stringify(res), {status: 200});
}