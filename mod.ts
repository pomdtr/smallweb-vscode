import { serveDir } from "./file_server.ts";
import dir from "./dist/dir.ts";

export type RequestHandler = (req: Request) => Response | Promise<Response>;

export function createVSCode(): RequestHandler {
    return (req) => {
        return serveDir(req, {
            dir: dir,
        });
    };
}
