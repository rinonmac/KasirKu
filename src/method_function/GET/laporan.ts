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

    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.MANAGE_PEMBUKUAN))) return new Response("0", {status: 403});
                
    const user_input = url.searchParams;
                
    const tanggal_start = Number(user_input.get("tanggal_start"));
    const tanggal_end = Number(user_input.get("tanggal_end"));
    
    if (isNaN(tanggal_start) || isNaN(tanggal_end) || !tanggal_start || !tanggal_end) return new Response("Bad Request", {status: 400});

    const penjualan = await db
    .selectFrom('penjualan')
    .selectAll()
    .where('tanggal_key', '>=', tanggal_start)
    .where('tanggal_key', '<=', tanggal_end)
    .execute();

    const pengeluaran = await db
    .selectFrom('pembukuan')
    .selectAll()
    .where('tipe', '=', 1)
    .where('tanggal_key', '>=', tanggal_start)
    .where('tanggal_key', '<=', tanggal_end)
    .execute();

    return new Response(JSON.stringify({
        penjualan, pengeluaran
    }), {status: 200});
}