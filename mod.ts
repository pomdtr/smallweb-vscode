import { serveDir } from "./file_server.ts";
import dir from "./dist/dir.ts";
import { Hono } from "jsr:@hono/hono@4.4.9";
import type { FS } from "./fs/fs.ts";

interface WebApp {
    fetch: (req: Request) => Response | Promise<Response>;
}

export type VSCodeConfig = {
    fs: FS;
};

export class VSCode implements WebApp {
    constructor(public config: VSCodeConfig) {}
    fetch = (req: Request) => {
        const app = new Hono();

        app.get("/api/fs/readDir/:dir", async (c) => {
            const { dir } = c.req.param();
            return c.json(await this.config.fs.readDir(dir));
        });

        app.get("/api/fs/stat/:path", async (c) => {
            const { path } = c.req.param();
            try {
                return c.json(await this.config.fs.stat(path));
            } catch (_e) {
                return new Response(null, {
                    status: 404,
                });
            }
        });

        app.get("/api/fs/readFile/:key", async (c) => {
            const { key } = c.req.param();
            try {
                const data = await this.config.fs.readFile(key);
                return new Response(data);
            } catch (_e) {
                return new Response(null, {
                    status: 404,
                });
            }
        });

        app.post("/api/fs/mkdir/:dir", async (c) => {
            const { dir } = c.req.param();
            await this.config.fs.mkdir(dir);
            return new Response(null, {
                status: 201,
            });
        });

        app.post("/api/fs/writeFile/:key", async (c) => {
            const { key } = c.req.param();

            const data = new Uint8Array(await c.req.arrayBuffer());
            await this.config.fs.writeFile(key, data);
            return new Response(null, {
                status: 201,
            });
        });

        app.post("/api/fs/remove/:key", async (c) => {
            const { key } = c.req.param();
            await this.config.fs.remove(key);
            return new Response(null, {
                status: 204,
            });
        });

        app.post("/api/fs/rename/:src/:dst", async (c) => {
            const { src, dst } = c.req.param();
            await this.config.fs.rename(src, dst);
            return new Response(null, {
                status: 201,
            });
        });

        app.post("/api/fs/copyFile/:src/:dst", async (c) => {
            const { src, dst } = c.req.param();
            await this.config.fs.copyFile(src, dst);
            return new Response(null, {
                status: 201,
            });
        });

        app.get("*", (c) => {
            return serveDir(c.req.raw, {
                dir: dir,
            });
        });

        return app.fetch(req);
    };
}
