import { createFetchHandler } from "./server.ts";
import { createCommand } from "./command.ts";
import * as path from "@std/path";

export type VSCodeConfig = {
    rootDir?: string;
    readOnly?: boolean | string[]
    password?: string;
};

export class VSCode {
    private server
    private command

    constructor(config: VSCodeConfig = {}) {
        this.server = createFetchHandler({
            rootDir: path.resolve(config.rootDir || "./data"),
            readOnly: config.readOnly || false,
            password: config.password || Deno.env.get("VSCODE_PASSWORD"),
        });

        const url = Deno.env.get("SMALLWEB_APP_URL")!
        const domain = new URL(url).hostname;

        this.command = createCommand({
            domain,
            password: config.password || Deno.env.get("VSCODE_PASSWORD"),
        });
    }

    fetch: (req: Request) => Response | Promise<Response> = (req) => this.server.fetch(req);
    run: (args: string[]) => void | Promise<void> = (args) => this.command(args);
}
