import type { DirEntry, FileType, FS } from "./fs.ts";

export type Blob = { key: string; size: number; lastModified: string };

export class ValTownFS implements FS {
    public token: string;
    constructor(token?: string) {
        if (token) {
            this.token = token;
            return;
        }

        token = Deno.env.get("valtown");
        if (!token) {
            throw new Error("valtown token is required");
        }

        this.token = token;
    }

    private fetch(path: string, init?: RequestInit) {
        const url = `https://api.val.town${path}`;
        console.log(url);
        return fetch(url, {
            ...init,
            headers: {
                Authorization: `Bearer ${this.token}`,
                ...init?.headers,
            },
        });
    }

    async mkdir(_path: string) {
        return;
    }

    async readFile(path: string) {
        const key = path.slice(1);
        const resp = await this.fetch(`/v1/blob/${encodeURIComponent(key)}`);
        const data = await resp.arrayBuffer();
        return new Uint8Array(data);
    }

    async writeFile(path: string, data: Uint8Array): Promise<void> {
        const resp = await this.fetch(`/v1/blob/${encodeURIComponent(path)}`, {
            method: "POST",
            body: data,
        });
        if (!resp.ok) {
            const message = await resp.text();
            console.error(message);
            throw new Error(message);
        }

        return;
    }

    async remove(path: string): Promise<void> {
        const key = path.slice(1);
        const resp = await this.fetch(`/v1/blob/${encodeURIComponent(key)}`, {
            method: "DELETE",
        });
        if (!resp.ok) {
            throw new Error(resp.statusText);
        }

        return;
    }

    async rename(src: string, dst: string) {
        await this.copyFile(src, dst);
        await this.remove(src);
    }

    async copyFile(src: string, dst: string) {
        const content = await this.readFile(src);
        await this.writeFile(dst, content);
    }

    async stat(path: string) {
        const prefix = path.slice(1);
        const resp = await this.fetch(
            `/v1/blob?prefix=${encodeURIComponent(prefix)}`,
        );
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const blobs = await resp.json() as Blob[];
        if (blobs.length === 0) {
            throw new Error("not found");
        }

        if (blobs.length > 1) {
            return {
                name: path,
                type: "dir" as FileType,
                size: 0,
            };
        }

        const blob = blobs[0];
        if (blob.key === prefix) {
            return {
                name: blob.key,
                type: "file" as FileType,
                size: blob.size,
            };
        }

        return {
            type: "dir" as FileType,
            size: 0,
        };
    }

    async readDir(path: string) {
        let prefix = path.slice(1);
        if (prefix.length > 0 && !prefix.endsWith("/")) {
            prefix += "/";
        }

        const resp = await this.fetch(
            `/v1/blob?prefix=${encodeURIComponent(prefix)}`,
        );
        if (!resp.ok) {
            throw new Error(await resp.text());
        }

        const blobs = await resp.json() as Blob[];
        const entries: Record<string, DirEntry> = {};
        for (const entry of blobs) {
            const name = entry.key.slice(prefix.length);
            if (!name.includes("/")) {
                entries[name] = {
                    name,
                    type: "file",
                };
                continue;
            }

            const [dir] = name.split("/");
            entries[dir] = {
                name: dir,
                type: "dir",
            };
        }

        return Object.values(entries);
    }
}
