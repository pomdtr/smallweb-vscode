import * as embedder from "jsr:@nfnitloop/deno-embedder@1.4.7";

const options = {
    importMeta: import.meta,
    mappings: [
        {
            sourceDir: "frontend/dist",
            destDir: "dist",
        },
    ],
};

await embedder.main({ options });
