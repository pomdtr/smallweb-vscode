import * as vscode from "vscode";

export const FS_SCHEME = "smallweb";
const apiRoot = "/api/fs";

class SmallwebFileSytemProvider implements vscode.FileSystemProvider {
    constructor() {}
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
        this._emitter.event;

    async readFile(uri: vscode.Uri) {
        const resp = await fetch(
            `${apiRoot}/readFile/${encodeURIComponent(uri.path)}`,
        );
        if (!resp.ok) {
            if (resp.status == 404) {
                throw vscode.FileSystemError.FileNotFound(uri);
            }
            throw new Error(resp.statusText);
        }
        const content = await resp.arrayBuffer();

        return new Uint8Array(content);
    }

    async delete(uri: vscode.Uri) {
        const resp = await fetch(
            `${apiRoot}/remove/${encodeURIComponent(uri.path)}`,
            {
                method: "POST",
            },
        );

        if (resp.status == 404) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        if (!resp.ok) {
            throw new Error(resp.statusText);
        }

        this._emitter.fire([{ type: vscode.FileChangeType.Deleted, uri }]);
    }

    async rename(
        source: vscode.Uri,
        destination: vscode.Uri,
        options: { readonly overwrite: boolean },
    ) {
        const resp = await fetch(
            `${apiRoot}/rename/${encodeURIComponent(source.path)}/${
                encodeURIComponent(destination.path)
            }`,
            {
                method: "POST",
            },
        );

        if (!resp.ok) {
            throw new Error(resp.statusText);
        }

        this._emitter.fire([
            { type: vscode.FileChangeType.Deleted, uri: source },
            { type: vscode.FileChangeType.Created, uri: destination },
        ]);
    }

    async copy(
        source: vscode.Uri,
        destination: vscode.Uri,
        options: { readonly overwrite: boolean },
    ) {
        const oldKey = source.path.slice(1);
        const newKey = destination.path.slice(1);

        const resp = await fetch(
            `${apiRoot}/copyFile/${encodeURIComponent(oldKey)}/${
                encodeURIComponent(newKey)
            }`,
            {
                method: "POST",
            },
        );
        if (!resp.ok) {
            throw new Error(resp.statusText);
        }

        this._emitter.fire([
            { type: vscode.FileChangeType.Created, uri: destination },
        ]);
    }

    async stat(uri: vscode.Uri) {
        const resp = await fetch(
            `${apiRoot}/stat/${encodeURIComponent(uri.path)}`,
        );

        if (resp.status == 404) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }

        if (!resp.ok) {
            throw new Error(resp.statusText);
        }

        const { type, size } = await resp.json() as {
            type: "file" | "dir";
            size: number;
        };

        return {
            type: type == "dir"
                ? vscode.FileType.Directory
                : vscode.FileType.File,
            ctime: Date.now(),
            mtime: Date.now(),
            size: size,
        };
    }

    async writeFile(
        uri: vscode.Uri,
        content: Uint8Array,
        options: { readonly create: boolean; readonly overwrite: boolean },
    ) {
        const key = uri.path.slice(1);
        const resp = await fetch(
            `${apiRoot}/writeFile/${encodeURIComponent(key)}`,
            {
                method: "POST",
                body: content,
            },
        );
        if (!resp.ok) {
            throw new Error(resp.statusText);
        }
    }

    watch(
        uri: vscode.Uri,
        options: {
            readonly recursive: boolean;
            readonly excludes: readonly string[];
        },
    ): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => {});
    }

    async createDirectory(uri: vscode.Uri) {
        const resp = await fetch(
            `${apiRoot}/mkdir/${encodeURIComponent(uri.path)}`,
            {
                method: "POST",
            },
        );

        if (!resp.ok) {
            throw new Error(resp.statusText);
        }

        this._emitter.fire([
            { type: vscode.FileChangeType.Created, uri },
        ]);
    }

    async readDirectory(uri: vscode.Uri) {
        const resp = await fetch(
            `${apiRoot}/readDir/${encodeURIComponent(uri.path)}`,
        );
        const blobs = await resp.json() as {
            name: string;
            type: "file" | "dir";
        }[];
        return blobs.map(
            (
                blob,
            ) => [
                blob.name,
                blob.type == "dir"
                    ? vscode.FileType.Directory
                    : vscode.FileType.File,
            ] as [string, vscode.FileType],
        );
    }
}

export function registerSmallwebFileSystemProvider(
    context: vscode.ExtensionContext,
) {
    const fs = new SmallwebFileSytemProvider();
    context.subscriptions.push(
        vscode.workspace.registerFileSystemProvider(FS_SCHEME, fs),
    );
}
