import { program } from '@commander-js/extra-typings';
import { sign } from "hono/jwt"
import { open } from "@smallweb/open"

export function createCli(params: {
    password?: string;
}) {
    const { SMALLWEB_APP_NAME, SMALLWEB_APP_URL } = Deno.env.toObject()

    program.name(SMALLWEB_APP_NAME)

    program.command("create-token").action(async () => {
        if (!params.password) {
            console.error("No password provided")
            Deno.exit(1)
        }

        const token = await sign({ iat: Date.now() / 1000 }, params.password)
        console.log(token)
    })

    program.command("open").argument("<app>").action(async (app) => {
        const url = new URL(app, SMALLWEB_APP_URL)
        await open(url.toString())
    })

    return program
}
