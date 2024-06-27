import { VSCode } from "./mod.ts";
import { LocalFS } from "./fs/local.ts";

const vscode = new VSCode({ fs: new LocalFS() });

export default vscode;
