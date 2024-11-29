import { createFetchHandler } from "./server.ts";
import { createCommand } from "./command.ts";
import * as path from "@std/path";
import type { LastLoginOptions } from "@pomdtr/lastlogin"

export type VSCodeConfig = {
    rootDir?: string;
    readOnly?: boolean;
    lastlogin?: boolean | LastLoginOptions;
};

export class VSCode {
    private fetchHandler
    private command

    constructor(config: VSCodeConfig = {}) {
        this.fetchHandler = createFetchHandler({
            rootDir: path.resolve(config.rootDir || "./data"),
            readOnly: config.readOnly || false,
            lastlogin: config.lastlogin || false,
        });

        const url = Deno.env.get("SMALLWEB_APP_URL")!
        const domain = new URL(url).hostname;

        this.command = createCommand({
            domain,
            lastlogin: config.lastlogin || false,
        });
    }

    fetch: (req: Request) => Response | Promise<Response> = (req) => this.fetchHandler(req);
    run: (args: string[]) => void | Promise<void> = (args) => this.command(args);
}
