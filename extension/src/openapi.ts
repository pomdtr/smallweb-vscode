export default {
    openapi: "3.1.0",
    info: {
        title: "Smallweb Editor",
        description: "Smallweb Editor API",
        version: "1.0.0",
    },
    paths: {
        "/api/fs/stat": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        type: {
                                            anyOf: [
                                                { type: "number", const: 1 },
                                                { type: "number", const: 2 },
                                                { type: "number", const: 64 },
                                            ],
                                        },
                                        ctime: { type: "number" },
                                        mtime: { type: "number" },
                                        size: { type: "number" },
                                    },
                                    required: ["type", "ctime", "mtime", "size"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsStat",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { path: { type: "string" } },
                                required: ["path"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/readDirectory": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            name: { type: "string" },
                                            type: {
                                                anyOf: [
                                                    { type: "number", const: 1 },
                                                    { type: "number", const: 2 },
                                                    { type: "number", const: 64 },
                                                ],
                                            },
                                        },
                                        required: ["name", "type"],
                                    },
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsReadDirectory",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { path: { type: "string" } },
                                required: ["path"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/createDirectory": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                    required: ["success"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsCreateDirectory",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { path: { type: "string" } },
                                required: ["path"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/readFile": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        b64: { type: "string" },
                                    },
                                    required: ["success", "b64"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsReadFile",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: { path: { type: "string" } },
                                required: ["path"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/writeFile": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                    required: ["success"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsWriteFile",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    path: { type: "string" },
                                    b64: { type: "string" },
                                    options: {
                                        type: "object",
                                        properties: {
                                            create: { type: "boolean" },
                                            overwrite: { type: "boolean" },
                                        },
                                        required: ["create", "overwrite"],
                                    },
                                },
                                required: ["path", "b64", "options"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/copy": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                    required: ["success"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsCopy",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    source: { type: "string" },
                                    destination: { type: "string" },
                                    options: {
                                        type: "object",
                                        properties: { overwrite: { type: "boolean" } },
                                        required: ["overwrite"],
                                    },
                                },
                                required: ["source", "destination"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/rename": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                    required: ["success"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsRename",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    oldPath: { type: "string" },
                                    newPath: { type: "string" },
                                    options: {
                                        type: "object",
                                        properties: { overwrite: { type: "boolean" } },
                                        required: ["overwrite"],
                                    },
                                },
                                required: ["oldPath", "newPath"],
                            },
                        },
                    },
                },
            },
        },
        "/api/fs/delete": {
            post: {
                responses: {
                    "200": {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { success: { type: "boolean" } },
                                    required: ["success"],
                                },
                            },
                        },
                    },
                    "400": {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                    "404": {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: { error: { type: "string" } },
                                    required: ["error"],
                                },
                            },
                        },
                    },
                },
                operationId: "postApiFsDelete",
                requestBody: {
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    path: { type: "string" },
                                    options: {
                                        type: "object",
                                        properties: { recursive: { type: "boolean" } },
                                        required: ["recursive"],
                                    },
                                },
                                required: ["path"],
                            },
                        },
                    },
                },
            },
        },
    },
    components: { schemas: {} },
} as const;
