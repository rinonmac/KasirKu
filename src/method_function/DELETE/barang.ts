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

import { global } from "../../global";

export default async function(req: Request, token: string) {
    const user_info = global.user_sessions.get(token);
    if (!token || !user_info) return new Response("Unauthorized", {status: 401});
    
    const db = global.database;
    if (!db) return new Response("Internal Server Error", {status: 500});
    const res_role = await db.selectFrom('roles').select('permission_level').where('id', '=', user_info.role_id).executeTakeFirst();
    if (!res_role) return new Response("Internal Server Error", {status: 500});
    
    if (!(res_role.permission_level & (global.permissions.ADMINISTRATOR | global.permissions.MANAGE_BARANG))) return new Response("0", {status: 403});
    
    const user_input = new URLSearchParams(await req.text());
    
    const id = Number(user_input.get("id"));
    
    if (!id || isNaN(id)) return new Response("Bad Request", {status: 400});
    
    const res = await db
    .selectFrom('barang')
    .select('kategori_barang_id')
    .where('id', '=', id)
    .executeTakeFirst();
    
    if (!res) return new Response("Not Found", { status: 404 });
    
    try {
        await db.deleteFrom('barang').where('id', '=', id).execute();
    } catch (e) {
        console.log("An error occured in delete_method.ts at /barang:", e);
        return new Response("Internal Server Error", { status: 500 });
    }
    
    global.sse_clients.broadcast(JSON.stringify({
        type: 2,
        code: "DELETE_BARANG",
        data: {
            id,
            kategori_barang_id: res.kategori_barang_id
        }
    }));
    
    return new Response("", {status: 200});
}