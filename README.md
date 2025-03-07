# Smallweb

![extension screenshot](assets/screenshot.jpg)

## Configuration

- `smallweb.dirs` - A list of directories that contain smallweb apps.

```json
{
    "smallweb.dirs": [
        "/Users/pomdtr/smallweb/smallweb.run",
        "/Users/pomdtr/smallweb/pomdtr.me",
        "/Users/pomdtr/smallweb/pomdtr.smallweb.live"
    ]
}
```

## Available Commands

- `Open App` - Open an workspace by inputting the app's name.
- `Open Current App in Browser` - Open the current app in your default browser.
- `Open Current App in Simple Browser` - Open the current app in the simple browser on the side.

## URI handlers

You can open a workspace by using the a `vscode://` URI handler:

```bash
# Windows
start vscode://pomdtr.smallweb/openApp?domain=www.smallweb.run

# Mac OS
open vscode://pomdtr.smallweb/openApp?domain=www.smallweb.run

# Linux
xdg-open vscode://pomdtr.smallweb/openApp?domain=www.smallweb.run
```
