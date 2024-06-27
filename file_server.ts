import type { Embeds } from "jsr:@nfnitloop/deno-embedder@^1.4.1/embed.ts";
import { extname } from "jsr:@std/path@^0.225.0/extname";
import { contentType } from "jsr:@std/media-types@^0.224.1";

/** Interface for serveDir options. */
export interface ServeDirParams {
    /** Serves the files under the given directory root. Defaults to your current directory.
     *
     * @default {"."}
     */
    dir: Embeds;
    /** Specified that part is stripped from the beginning of the requested pathname.
     *
     * @default {undefined}
     */
    urlRoot?: string;
    /** Enable directory listing.
     *
     * @default {false}
     */
    // showDirListing?: boolean;
    /** Serves dotfiles.
     *
     * @default {false}
     */
    // showDotfiles?: boolean;
    /** Serves index.html as the index file of the directory.
     *
     * @default {true}
     */
    // showIndex?: boolean;
    /** Enable CORS via the "Access-Control-Allow-Origin" header.
     *
     * @default {false}
     */
    // enableCors?: boolean;
    /** Do not print request level logs. Defaults to false.
     *
     * @default {false}
     */
    // quiet?: boolean;
    /** The algorithm to use for generating the ETag.
     *
     * @default {"SHA-256"}
     */
    // etagAlgorithm?: AlgorithmIdentifier;
    /** Headers to add to each response
     *
     * @default {[]}
     */
    headers?: Headers;
}

export async function serveDir(
    req: Request,
    params: ServeDirParams,
): Promise<Response> {
    const url = new URL(req.url);
    let pathname = url.pathname;
    if (pathname.endsWith("/")) {
        pathname += "index.html";
    }

    if (params.urlRoot) {
        if (!pathname.startsWith(params.urlRoot)) {
            return new Response("Not found", { status: 404 });
        }
        pathname = pathname.slice(params.urlRoot.length);
    }

    const file = await params.dir.get(pathname.slice(1));
    if (!file) {
        return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set(
        "Content-Type",
        contentType(extname(pathname)) || "application/octet-stream",
    );

    for (const header of params.headers || []) {
        headers.set(header[0], header[1]);
    }

    return new Response(await file.bytes(), {
        headers: {
            "Content-Type": contentType(extname(pathname)) ||
                "application/octet-stream",
        },
    });
}
