# VS Code

## Usage

```ts
// ~/smallweb/vscode/main.ts
import { VSCode } from '@smallweb/vscode@0.1.0';

const vscode = new VSCode();

export default vscode;
```

## Config

- `rootDir` - The root directory of the project. Default to "./data".
- `readOnly` - Whether the editor is read-only. Default to false.
- `lastlogin` - Lastlogin config. Set to `false` to disable lastlogin. Default to `false`.

See [@pomdtr/lastlogin](https://jsr.io/@pomdtr/lastlogin) to learn more about the lastlogin middleware.

### Examples

### Admin App

The following example shows how to create a VS Code instance with write access to the root directory (protected by lastlogin).

```ts
// ~/smallweb/vscode/main.ts
import { VSCode } from '@smallweb/vscode@0.1.0';

const vscode = new VSCode({
    rootDir: Deno.env.get("SMALLWEB_DIR"),
    lastlogin: true,
})

export default vscode;
```

```ts
// ~/smallweb/vscode/.env
LASTLOGIN_SECRET_KEY=my-secret-key
LASTLOGIN_EMAIL=my.email@example.com
```

```json
// ~/smallweb/vscode/smallweb.json
{
    "admin": true
}
```
