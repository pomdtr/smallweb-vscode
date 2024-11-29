import { Hono } from "hono";
import { createApi } from "./api.ts";
import embeds from "./static/mod.ts";
import { escape } from "@std/html";
import { createOpenApiDocument } from "hono-zod-openapi";
import * as path from "@std/path";
import { type LastLoginOptions, createToken, lastlogin } from "@pomdtr/lastlogin";

export function createFetchHandler(params: {
    rootDir: string;
    readOnly: boolean;
    lastlogin: boolean | LastLoginOptions
}) {
    const api = createApi({
        rootDir: params.rootDir,
        readOnly: params.readOnly,
    });
    const app = new Hono()
        .route("/api", api)
        .get("/openapi.json", (c) => {
            const doc = createOpenApiDocument(api, {
                info: {
                    title: "VS Code API",
                    version: "1.0.0",
                },
            }, {
                addRoute: false,
            });

            return c.json(doc);
        })
        .get("/openapi.ts", (c) => {
            const doc = createOpenApiDocument(api, {
                info: {
                    title: "VS Code API",
                    version: "1.0.0",
                },
            }, {
                addRoute: false,
            });

            return c.text(
                `export default ${JSON.stringify(doc, null, 4)} as const;`,
                {},
            );
        })
        .get("manifest.json", (c) => {
            return embeds.serve(c.req.raw);
        })
        .get("*", async (c) => {
            const url = new URL(c.req.url);
            const target = path.resolve(
                path.join(params.rootDir, url.pathname),
            );
            if (!target.startsWith(params.rootDir)) {
                return new Response("Not found", { status: 404 });
            }

            const stat = await Deno.stat(target).catch(() => null);
            if (!stat || !stat.isDirectory) {
                return new Response("Not found", { status: 404 });
            }

            const homepage = await embeds.load("index.html").then((embed) =>
                embed.text()
            );

            let token: string | undefined;
            if (params.lastlogin) {
                const options = typeof params.lastlogin === "object" ? params.lastlogin : {};
                token = await createToken({
                    email: c.req.header("X-Lastlogin-Email"),
                    domain: url.hostname,
                    exp: Date.now() + 1000 * 60 * 60, // 1 hour
                }, options)
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

    if (params.lastlogin) {
        const options = typeof params.lastlogin === "object" ? params.lastlogin : {};
        return lastlogin(app.fetch, options);
    } else {
        return app.fetch
    }

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
                "path": "npm/smallweb-vscode@0.0.5",
            },
        ],
    };
}
