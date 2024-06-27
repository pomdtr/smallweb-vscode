export type FileType = "file" | "dir" | "symlink";
export type DirEntry = { name: string; type: FileType };
export interface FS {
    readFile: (path: string) => Promise<Uint8Array>;
    writeFile: (path: string, data: Uint8Array) => Promise<void>;
    mkdir: (path: string) => Promise<void>;
    remove: (path: string) => Promise<void>;
    rename: (src: string, dst: string) => Promise<void>;
    copyFile: (src: string, dst: string) => Promise<void>;
    readDir: (
        path: string,
    ) => Promise<DirEntry[]>;
    stat(path: string): Promise<{ type: FileType; size: number }>;
}
