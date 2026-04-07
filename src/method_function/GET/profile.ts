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

    const res = await db
    .selectFrom('users as u')
    .innerJoin('roles as r', 'u.role_id', 'r.id')
    .select([
        'u.id',
        'u.username',
        'u.full_name',
        'u.profile_img',
        'u.modified_ms',
        'u.created_ms',
        'r.name as role_name',
        'r.permission_level as permission_level'
    ])
    .where('u.id', '=', user_info.user_id)
    .executeTakeFirst();

    return new Response(JSON.stringify(res), {status: 200});
}