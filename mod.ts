import { serveDir } from "./file_server.ts";
import dir from "./dist/dir.ts";

export class VSCode {
    fetch(req: Request): Promise<Response> {
        return serveDir(req, {
            dir: dir,
        });
    }
}
