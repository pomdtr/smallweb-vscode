import { createServer } from "./server.ts";
import { createCli } from "./cli.ts";
import * as path from "@std/path";

export type VSCodeConfig = {
    rootDir?: string;
    readOnly?: boolean | string[]
    password?: string;
};

export class VSCode {
    private server
    private cli

    constructor(config: VSCodeConfig = {}) {
        this.server = createServer({
            rootDir: path.resolve(config.rootDir || "./data"),
            readOnly: config.readOnly || false,
            password: config.password || Deno.env.get("VSCODE_PASSWORD"),
        });

        this.cli = createCli({
            password: config.password || Deno.env.get("VSCODE_PASSWORD"),
        });
    }

    fetch: (req: Request) => Response | Promise<Response> = (req) => {
        return this.server.fetch(req);
    }

    run: (args: string[]) => void | Promise<void> = async (args) => {
        await this.cli.parseAsync(args, { from: "user" })
    }
}
