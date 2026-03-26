import { Database } from "bun:sqlite";

export function create_sqlite(config: { filename?: string }) {
    const db = new Database(config.filename || ":memory:");

    return {
        async run(query: string, params: any[] = []) {
            return db.run(query, ...params);
        },

        async get(query: string, params: any[] = []) {
            return db.query(query).get(...params);
        },

        async all(query: string, params: any[] = []) {
            return db.query(query).all(...params);
        },

        async transaction(fn: (tx: any) => Promise<void>) {
            return db.transaction(() => {
                const tx = {
                    run: (query: string, params: any[] = []) => db.prepare(query).run(...params),
                    get: (query: string, params: any[] = []) => db.prepare(query).get(...params),
                    all: (query: string, params: any[] = []) => db.prepare(query).all(...params),
                };

                return fn(tx);
            })();
        },

        async close() {
            db.close();
        }
    };
}