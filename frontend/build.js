import fs from "fs"

fs.rmSync("dist", { recursive: true, force: true })
fs.cpSync("node_modules/vscode-web/dist", "dist", { recursive: true })
fs.rmSync("dist/extensions/typescript-language-features", { recursive: true, force: true })
fs.rmSync("dist/extensions/markdown-language-features", { recursive: true, force: true })
fs.cpSync("index.html", "dist/index.html")
fs.cpSync("product.json", "dist/product.json")
// fs.cpSync("myExt", "dist/myExt", { recursive: true })
fs.cpSync("../extension/package.json", "dist/fs-provider/package.json")
fs.cpSync("../extension/package.nls.json", "dist/fs-provider/package.nls.json")
fs.cpSync("../extension/dist/extension.js", "dist/fs-provider/dist/extension.js", { recursive: true })



