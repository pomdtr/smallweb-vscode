import { Hono } from "npm:hono@4.6.10";
import * as path from "@std/path";
import z from "zod"
import { decodeBase64, encodeBase64 } from "@std/encoding/base64";
import * as fs from "@std/fs";
import { cors } from "hono/cors";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import "zod-openapi/extend";


const FileType = z.union([z.literal(1), z.literal(2), z.literal(64)]);
type FileType = z.infer<typeof FileType>;

const FileStat = z.object({
    type: FileType,
    ctime: z.number(),
    mtime: z.number(),
    size: z.number(),
    permissions: z.literal(1).optional(),
});

function getFileType(stat: Deno.FileInfo | Deno.DirEntry): FileType {
    if (stat.isSymlink) {
        return 64;
    }
    if (stat.isDirectory) {
        return 2;
    }
    return 1;
}

export function createApi(params: {
    readOnly: boolean | string[];
    rootDir: string;
}) {
    const isReadonly = (input: string) => {
        if (Array.isArray(params.readOnly)) {
            for (const pattern of params.readOnly) {
                const regexp = path.globToRegExp(pattern);
                if (regexp.test(input)) {
                    return true;
                }
            }

            return false;
        }

        return params.readOnly;
    }

    const rootDir = path.resolve(params.rootDir);
    return new Hono()
        .use("*", cors())
        .post(
            "/fs/stat",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(FileStat),
                            },
                        }
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                }))
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                }))
                            },
                        },
                    },
                }
            }), zValidator("json", z.object({
                path: z.string(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                if (!(await fs.exists(fullPath))) {
                    return c.json({ error: "Not Found" }, 404);
                }


                const stat = await Deno.stat(fullPath);
                return c.json({
                    type: getFileType(stat),
                    ctime: stat.birthtime?.getTime() || 0,
                    mtime: stat.mtime?.getTime() || 0,
                    size: stat.size,
                    permissions: isReadonly(body.path) ? 1 : undefined,
                });
            },
        )
        .post(
            "/fs/readDirectory",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.array(z.object({
                                    name: z.string(),
                                    type: FileType,
                                }))),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                path: z.string(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                const entries = await Array.fromAsync(
                    Deno.readDir(fullPath),
                );
                return c.json(
                    entries.map((entry) => ({
                        name: entry.name,
                        type: getFileType(entry),
                    })),
                );
            },
        )
        .post(
            "/fs/createDirectory",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                path: z.string(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                if (isReadonly(body.path)) {
                    return c.json({ error: "File is readonly" }, 400);
                }

                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                await Deno.mkdir(fullPath, {
                    recursive: true,
                });
                return c.json({ success: true });
            },
        )
        .post(
            "/fs/readFile",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                    b64: z.string(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                path: z.string(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                if (!await fs.exists(fullPath)) {
                    return c.json({ error: "File not found" }, 404);
                }

                const content = await Deno.readFile(fullPath);
                return c.json({
                    success: true,
                    b64: encodeBase64(content),
                });
            },
        )
        .post(
            "/fs/writeFile",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                path: z.string(),
                b64: z.string(),
                options: z.object({
                    create: z.boolean(),
                    overwrite: z.boolean(),
                }),
            })),
            async (c) => {
                const body = c.req.valid("json");
                if (isReadonly(body.path)) {
                    return c.json({ error: "File is readonly" }, 400);
                }

                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                if (!body.options.create && !await fs.exists(fullPath)) {
                    return c.json({ error: "File not found" }, 404);
                }

                if (!body.options.overwrite && await fs.exists(fullPath)) {
                    return c.json({ error: "File already exists" }, 400);
                }

                const content = decodeBase64(body.b64);
                await Deno.writeFile(
                    path.join(params.rootDir, body.path),
                    content,
                );

                return c.json({});
            },
        )
        .post(
            "fs/copy",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                source: z.string(),
                destination: z.string(),
                options: z.object({
                    overwrite: z.boolean(),
                }).optional(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                if (isReadonly(body.destination)) {
                    return c.json({ error: "File is readonly" }, 400);
                }

                const fullSourcePath = path.resolve(
                    path.join(rootDir, body.source),
                );
                if (!fullSourcePath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                const destinationPath = path.resolve(
                    path.join(rootDir, body.destination),
                );
                if (!destinationPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                if (
                    !body.options?.overwrite && await fs.exists(destinationPath)
                ) {
                    return c.json({ error: "File already exists" }, 400);
                }

                await fs.copy(fullSourcePath, destinationPath);
                return c.json({ success: true });
            },
        )
        .post(
            "/fs/rename",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                oldPath: z.string(),
                newPath: z.string(),
                options: z.object({
                    overwrite: z.boolean(),
                }).optional()
            })),
            async (c) => {
                const body = c.req.valid("json");
                if (isReadonly(body.oldPath) || isReadonly(body.newPath)) {
                    return c.json({ error: "File is readonly" }, 400);
                }

                const fullOldPath = path.resolve(
                    path.join(rootDir, body.oldPath),
                );
                if (!fullOldPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                const fullNewPath = path.resolve(
                    path.join(rootDir, body.newPath),
                );
                if (!fullNewPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                if (!body.options?.overwrite && await fs.exists(fullNewPath)) {
                    return c.json({ error: "File already exists" }, 400);
                }

                await Deno.rename(
                    fullOldPath,
                    fullNewPath,
                );
                return c.json({ success: true });
            },
        )
        .post(
            "/fs/delete",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                    404: {
                        description: "Not Found",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    },
                },
            }), zValidator("json", z.object({
                path: z.string(),
                options: z.object({
                    recursive: z.boolean(),
                }).optional(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                if (isReadonly(body.path)) {
                    return c.json({ error: "File is readonly" }, 400);
                }

                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                if (!await fs.exists(fullPath)) {
                    return c.json({ error: "File not found" }, 404);
                }

                await Deno.remove(fullPath, {
                    recursive: body.options?.recursive,
                });
                return c.json({ success: true });
            },
        )
        .post(
            "/fs/createDirectory",
            describeRoute({
                responses: {
                    200: {
                        description: "Success",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    success: z.boolean(),
                                })),
                            },
                        },
                    },
                    400: {
                        description: "Bad Request",
                        content: {
                            "application/json": {
                                schema: resolver(z.object({
                                    error: z.string(),
                                })),
                            },
                        },
                    }
                },
            }), zValidator("json", z.object({
                path: z.string(),
            })),
            async (c) => {
                const body = c.req.valid("json");
                if (isReadonly(body.path)) {
                    return c.json({ error: "File is readonly" }, 400);
                }

                const fullPath = path.resolve(path.join(rootDir, body.path));
                if (!fullPath.startsWith(rootDir)) {
                    return c.json({ error: "Bad Request" }, 404);
                }

                await Deno.mkdir(path.join(params.rootDir, body.path), {
                    recursive: true,
                });
                return c.json({ success: true });
            },
        )
}
