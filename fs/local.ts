import type { DirEntry, FileType, FS } from "./fs.ts";
import { join } from "jsr:@std/path@0.225.0";

export class LocalFS implements FS {
    public root: string;
    constructor(root?: string) {
        this.root = root || Deno.cwd();
    }

    mkdir(path: string) {
        return Deno.mkdir(join(this.root, path), { recursive: true });
    }

    readFile(path: string) {
        return Deno.readFile(join(this.root, path));
    }

    async writeFile(path: string, data: Uint8Array): Promise<void> {
        await Deno.writeFile(join(this.root, path), data);
    }

    async remove(path: string): Promise<void> {
        await Deno.remove(join(this.root, path));
    }

    async rename(src: string, dst: string) {
        await Deno.rename(join(this.root, src), join(this.root, dst));
    }

    async copyFile(src: string, dst: string) {
        await Deno.copyFile(join(this.root, src), join(this.root, dst));
    }

    async stat(path: string) {
        const info = await Deno.stat(
            path == "/" ? this.root : join(this.root, path),
        );
        const type: FileType = info.isDirectory ? "dir" : "file";
        return {
            type,
            size: info.size,
        };
    }

    async readDir(path: string) {
        const entries: DirEntry[] = [];
        for await (
            const entry of Deno.readDir(
                path == "/" ? this.root : join(this.root, path),
            )
        ) {
            entries.push({
                name: entry.name,
                type: entry.isDirectory ? "dir" : "file",
            });
        }
        return entries;
    }
}
