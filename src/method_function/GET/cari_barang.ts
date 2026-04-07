/*
──────────────────────────────────────────────────────────────
                           KasirKu
        Simple & Efficient Point of Sale (PoS) System

            Author      : Kevin Adhaikal
            Copyright   : (C) 2026 Kevin Adhaikal
            License     : AplikasiKasir License

    Permission is granted to modify and distribute this
    software, but the author's name must not be removed
                     or altered.
──────────────────────────────────────────────────────────────
*/

import { user_session_interface } from "../../user_session/user_session";
import { global } from "../../global";

export default async function(req: Request, url: URL, user_info: user_session_interface) {
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});

    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.MANAGE_BARANG))) return new Response("0", {status: 403});

    const user_input = url.searchParams;

    const barang = <string>user_input.get("barang"); // nama barang and barcode barang
    const bm = <string>user_input.get("bm"); // apakah cari barang ini untuk barang masuk?
    if (!barang) return new Response("Bad Request", {status: 400});

    const query = db.selectFrom('barang').selectAll();

    let res;
    if (bm) {
        res = await query
        .where((eb) => eb.or([
            eb('barcode_barang', '=', barang),
            eb('nama_barang', 'like', `%${barang}%`)
        ]))
        .execute();
    } else {
        res = await query
        .where('stok_barang', '>', 0)
        .where((eb) => eb.or([
            eb('barcode_barang', '=', barang),
            eb('nama_barang', 'like', `%${barang}%`)
        ]))
        .execute();
    }
    
    return new Response(JSON.stringify(res), {status: 200});
}