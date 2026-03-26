import { Client, ClientConfig } from "pg";

export async function create_postgresql(config: ClientConfig) {
    const client = new Client(config);
    await client.connect();

    // convert placeholder '?' -> '$num'
    function convert_ph(query: string, params: any[]) {
        let index = 0;
        const newQuery = query.replace(/\?/g, () => {
            index++;
            return `$${index}`;
        });
        return { query: newQuery, params };
    }

    return {
        async run(query: string, params: any[] = []) {
            const { query: q, params: p } = convert_ph(query, params);
            return client.query(q, p);
        },

        async get(query: string, params: any[] = []) {
            const { query: q, params: p } = convert_ph(query, params);
            const res = await client.query(q, p);
            return res.rows[0];
        },

        async all(query: string, params: any[] = []) {
            const { query: q, params: p } = convert_ph(query, params);
            const res = await client.query(q, p);
            return res.rows;
        },

        async transaction(fn: (tx: any) => Promise<void>) {
            try {
                await client.query("BEGIN");

                const tx = {
                    run: (q: string, p: any[] = []) => {
                        const { query, params } = convert_ph(q, p);
                        return client.query(query, params);
                    },
                    get: async (q: string, p: any[] = []) => {
                        const { query, params } = convert_ph(q, p);
                        const res = await client.query(query, params);
                        return res.rows[0];
                    },
                    all: async (q: string, p: any[] = []) => {
                        const { query, params } = convert_ph(q, p);
                        const res = await client.query(query, params);
                        return res.rows;
                    }
                };

                const result = await fn(tx);

                await client.query("COMMIT");
                return result;
            } catch (err) {
                await client.query("ROLLBACK");
                throw err;
            }
        },

        async close() {
            await client.end();
        }
    };
}