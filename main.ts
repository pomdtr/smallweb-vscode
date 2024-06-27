import { VSCode } from "./mod.ts";

// import { LocalFS } from "./fs/local.ts";
// const fs = new LocalFS()

import { ValTownFS } from "./fs/val_town.ts";
const token = Deno.env.get("valtown");
if (!token) {
    throw new Error("valtown is required");
}
const fs = new ValTownFS(token);

const vscode = new VSCode({ fs });
export default vscode;
