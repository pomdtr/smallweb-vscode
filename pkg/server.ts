import { Hono } from "hono";
import { sign, verify } from "hono/jwt"
import { createApi } from "./api.ts";
import embeds from "./static/mod.ts";
import { getCookie, deleteCookie, setCookie } from "hono/cookie"
import { escape } from "@std/html";
import * as path from "@std/path";
import { cors } from 'hono/cors'
import { openAPISpecs } from "hono-openapi";
import { apiReference } from '@scalar/hono-api-reference'

const AUTH_COOKIE = "vscode-jwt"

export function createServer(params: {
    rootDir: string;
    readOnly: boolean | string[];
    password?: string;
}) {
    const api = createApi({
        rootDir: params.rootDir,
        readOnly: params.readOnly,
    });

    const app = new Hono()
    app.use(cors())

    app.get("/openapi.json", openAPISpecs(app, {
        documentation: {
            info: {
                title: "Smallweb Editor",
                version: "1.0.0",
                description: "Smallweb Editor API",
            }
        }
    }))

    app.get(
        '/reference',
        apiReference({
            spec: {
                url: '/openapi.json',
            },
        }),
    )

    app.get("/auth/login", (c) => {
        return c.html(/* html */`<html>
            <head>
              <link rel="icon" href="https://fav.farm/🔒" />
              <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
            </head>
            <body style="display: flex; justify-content: center; align-items: center;">
              <article>
              <p>This website is protected behind a password.</p>
              <footer>
              <form method="POST" style="margin-block-end: 0em;">
                <fieldset role="group" style="margin-bottom: 0em;">
                  <input id="password" placeholder="Password" name="password" type="password" />
                  <input type="submit" value="Unlock"/>
                </fieldset>
              </form>
              </footer>
              </article>
            </body>
          </html>`)
    })

    app.post("/auth/login", async (c) => {
        const data = await c.req.formData()
        const password = data.get("password")
        if (password !== params.password) {
            return c.redirect("/login")
        }

        const maxAge = 60 * 60 * 24 * 7
        const token = await sign({
            exp: Math.floor(Date.now() / 1000) + maxAge,
            iat: Math.floor(Date.now() / 1000),
        }, password);

        setCookie(c, AUTH_COOKIE, token, { maxAge })
        return c.redirect("/")
    })

    app.get("/auth/logout", (c) => {
        deleteCookie(c, AUTH_COOKIE)
        return c.redirect("/")
    })

    app.use(async (c, next) => {
        if (!params.password) {
            await next()
            return
        }

        const authorization = c.req.header("authorization");
        if (authorization) {
            const token = authorization.replace("Bearer ", "");
            try {
                await verify(token, params.password)
            } catch (_) {
                return c.newResponse("Unauthorized", { status: 401 })
            }

            await next()
            return
        }

        const token = getCookie(c, AUTH_COOKIE)
        if (!token) {
            return c.redirect("/auth/login")
        }

        try {
            await verify(token, params.password)
        } catch (_) {
            deleteCookie(c, AUTH_COOKIE)
            return c.redirect("/auth/login")
        }

        await next()
        return
    })

    app.route("/api", api)

    app.get("/manifest.json", (c) => {
        return embeds.serve(c.req.raw);
    })

    app.get("*", async (c) => {
        const url = new URL(c.req.url);
        const target = path.resolve(
            path.join(params.rootDir, url.pathname),
        );
        if (!target.startsWith(params.rootDir)) {
            return new Response("target is outside rootDir", { status: 403 });
        }

        const stat = await Deno.stat(target).catch(() => null);
        if (!stat || !stat.isDirectory) {
            return new Response("rootDir does not exist", { status: 404 });
        }

        const homepage = await embeds.load("index.html").then((embed) =>
            embed.text()
        );

        let token: string | undefined;
        if (params.password) {
            const maxAge = 60 * 60
            token = await sign({
                exp: Math.floor(Date.now() / 1000) + maxAge, // 1 hour
                iat: Math.floor(Date.now() / 1000),
            }, params.password);
        }


        return new Response(
            homepage.replace(
                "{{VSCODE_WORKBENCH_WEB_CONFIGURATION}}",
                escape(
                    JSON.stringify(workbenchConfig(url.host, {
                        path: c.req.path,
                        token,
                    })),
                ),
            ),
            {
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                },
            },
        );
    });

    return app
}

function workbenchConfig(host: string, options: {
    token?: string;
    path?: string;
} = {}) {
    return {
        "productConfiguration": {
            "nameShort": "Smallweb Editor",
            "nameLong": "Smallweb Editor",
            "applicationName": "code-web-sample",
            "dataFolderName": ".vscode-web-sample",
            "version": "1.95.2",
            "extensionsGallery": {
                "serviceUrl": "https://open-vsx.org/vscode/gallery",
                "itemUrl": "https://open-vsx.org/vscode/item",
                "resourceUrlTemplate":
                    "https://openvsxorg.blob.core.windows.net/resources/{publisher}/{name}/{version}/{path}",
            },
            "extensionEnabledApiProposals": {
                "pomdtr.smallweb": [
                    "fileSearchProviderNew",
                    "textSearchProviderNew",
                ],
            },
        },
        "folderUri": {
            "scheme": "smallweb",
            "authority": host,
            "query": options.token ? `?token=${options.token}` : "",
            "path": options.path ?? "/",
        },
        "additionalBuiltinExtensions": [
            {
                "scheme": "https",
                "authority": "cdn.jsdelivr.net",
                "path": "/npm/smallweb-vscode@0.0.9",
            },
        ],
    };
}
