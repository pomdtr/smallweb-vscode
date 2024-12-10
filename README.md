# VS Code

## Usage

```ts
// ~/smallweb/vscode/main.ts
import { VSCode } from 'jsr:@smallweb/vscode@0.1.2';

const vscode = new VSCode();

export default vscode;
```

## Config

- `rootDir` - The root directory of the project. Default to "./data".
- `readonly` - Readonly config. Set to `true` to enable readonly mode, or pass an array of globs to restrict write access. Default to `false`.
- `password` - VS Code password. Optional. Can be set via the `VSCODE_PASSWORD` environment variable.

See [@pomdtr/lastlogin](https://jsr.io/@pomdtr/lastlogin) to learn more about the lastlogin middleware.

### Examples

### Admin App

The following example shows how to create a VS Code instance with write access to the root directory (protected by lastlogin).

```ts
// ~/smallweb/vscode/main.ts
import { VSCode } from 'jsr:@smallweb/vscode@0.1.2';

const vscode = new VSCode({
    rootDir: Deno.env.get("SMALLWEB_DIR"),
})

export default vscode;
```

```sh
# ~/smallweb/vscode/.env
VSCODE_PASSWORD=my-secret-password
```

Then add "vscode" to the `adminApps` array in `~/smallweb/.smallweb/config.json`:

```json
{
    "adminApps": ["vscode"]
}
```
