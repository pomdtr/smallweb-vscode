import { VSCode } from "./pkg/mod.ts";

const vscode = new VSCode({
    readOnly: ["/readonly.txt"],
    password: "password",
});

export default vscode;
