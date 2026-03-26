import mysql from "mysql2/promise";

export async function create_mysql(config: mysql.ConnectionOptions) {
    const conn = await mysql.createConnection(config);

    return {
        async run(query: string, params: any[] = []) {
            const [res] = await conn.execute(query, params);
            return res;
        },

        async get(query: string, params: any[] = []) {
            const [rows]: any = await conn.execute(query, params);
            return rows[0];
        },

        async all(query: string, params: any[] = []) {
            const [rows]: any = await conn.execute(query, params);
            return rows;
        },

        async transaction(fn: (tx: any) => Promise<void>) {
            try {
                await conn.beginTransaction();

                const tx = {
                    run: (q: string, p: any[] = []) => conn.execute(q, p),
                    get: async (q: string, p: any[] = []) => {
                        const [rows]: any = await conn.execute(q, p);
                        return rows[0];
                    },
                    all: async (q: string, p: any[] = []) => {
                        const [rows]: any = await conn.execute(q, p);
                        return rows;
                    }
                };

                const result = await fn(tx);

                await conn.commit();
                return result;
            } catch (err) {
                await conn.rollback();
                throw err;
            }
        },

        async close() {
            await conn.end();
        }
    };
}