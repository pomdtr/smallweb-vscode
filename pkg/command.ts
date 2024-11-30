import { parseArgs } from "@std/cli";
import { type LastLoginOptions, createToken } from "@pomdtr/lastlogin";

export function createCommand(params: {
    domain: string;
    lastlogin: boolean | LastLoginOptions;
}) {
    return async (args: string[]) => {
        const { email, exp } = parseArgs(args, { string: ["email", "exp", "description"] })
        if (!email) {
            console.error("Email is required");
            Deno.exitCode = 1;
            return;
        }

        if (!params.lastlogin) {
            console.error("Last login options are required");
            Deno.exitCode = 1;
            return;
        }

        const options = typeof params.lastlogin === "boolean" ? {} : params.lastlogin;
        const token = await createToken({
            exp: exp ? parseInt(exp) : Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
            email,
            domain: params.domain,
        }, options);
        console.log(token);
    }
}
