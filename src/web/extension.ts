// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { QuickPickItem } from 'vscode';


export type Config = {
	domain?: string;
}

async function fileExists(uri: vscode.Uri) {
	try {
		await vscode.workspace.fs.stat(uri);
		return true;
	} catch (_) {
		return false;
	}
}

async function loadConfig(folderUri: vscode.Uri): Promise<Config | null> {
	for (const configPath of [vscode.Uri.joinPath(folderUri, '.smallweb', 'config.jsonc'), vscode.Uri.joinPath(folderUri, '.smallweb', 'config.json')]) {
		try {
			const configBytes = await vscode.workspace.fs.readFile(configPath);
			const jsonc = await import("@std/jsonc");
			const config = jsonc.parse(new TextDecoder().decode(configBytes));
			return config as Config;
		} catch (_) {
			continue;
		}
	}

	return null;
}

async function getAppUrl(folderUri: vscode.Uri) {
	let smallwebFolder = folderUri;
	let app: string | undefined = undefined;
	while (true) {
		if (await fileExists(vscode.Uri.joinPath(smallwebFolder, '.smallweb'))) {
			break;
		}

		const parentFolder = vscode.Uri.joinPath(smallwebFolder, '..');
		if (parentFolder.fsPath === smallwebFolder.fsPath) {
			vscode.window.showErrorMessage('Not a smallweb app');
			return;
		}

		app = smallwebFolder.path.substring(parentFolder.path.length + 1);
		smallwebFolder = parentFolder;
	}

	const config = await loadConfig(smallwebFolder);
	if (!config) {
		vscode.window.showErrorMessage('No config found');
		return;
	}

	if (!config.domain) {
		vscode.window.showErrorMessage('No domain configured');
		return;
	}

	if (app) {
		return vscode.Uri.parse(`https://${app}.${config.domain}`);
	}

	const entries = await vscode.workspace.fs.readDirectory(smallwebFolder);
	const items: (QuickPickItem & { url: string })[] = entries
		.filter(([name, fileType]) => fileType === vscode.FileType.Directory && !name.startsWith('.'))
		.map(([name]) => ({
			label: name,
			description: `https://${name}.${config.domain}`,
			url: `https://${name}.${config.domain}`
		}));

	const pick = await vscode.window.showQuickPick(items);
	if (!pick) {
		return;
	}

	return vscode.Uri.parse(pick.url);
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "smallweb" is now active in the web extension host!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('smallweb.openCurrentAppInBrowser', async () => {
		const currentDocument = vscode.window.activeTextEditor?.document;
		const currentFolder = currentDocument ? vscode.Uri.joinPath(currentDocument.uri, "..") : vscode.workspace.workspaceFolders?.[0].uri;
		if (!currentFolder) {
			vscode.window.showErrorMessage('No workspace folder open');
			return;
		}

		const appUrl = await getAppUrl(currentFolder);
		if (!appUrl) {
			return;
		}

		await vscode.env.openExternal(appUrl);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('smallweb.openCurrentAppInSimpleBrowser', async () => {
		const currentDocument = vscode.window.activeTextEditor?.document;
		const currentFolder = currentDocument ? vscode.Uri.joinPath(currentDocument.uri, "..") : vscode.workspace.workspaceFolders?.[0].uri;
		if (!currentFolder) {
			vscode.window.showErrorMessage('No workspace folder open');
			return;
		}

		const appUrl = await getAppUrl(currentFolder);
		if (!appUrl) {
			return;
		}

		await vscode.commands.executeCommand('simpleBrowser.api.open', appUrl.toString(), {
			viewColumn: vscode.ViewColumn.Beside
		});
	}));

	async function openApp(domain: string = "") {
		if (!domain) {
			const input = await vscode.window.showInputBox({ prompt: 'Enter the domain of the app to open' });
			if (!input) {
				return;
			}

			domain = input;
		}

		const dirs = vscode.workspace.getConfiguration("smallweb").get<string[]>("dirs", []);
		const [app, ...parts] = domain!.split('.');
		const rootDomain = parts.join('.');
		console.debug({ app, rootDomain });
		for (const dir of dirs) {
			const config = await loadConfig(vscode.Uri.file(dir));
			if (!config) {
				continue;
			}

			if (config.domain !== rootDomain) {
				continue;
			}

			const appFolder = vscode.Uri.joinPath(vscode.Uri.file(dir), app);
			if (!await fileExists(appFolder)) {
				vscode.window.showErrorMessage('App not found');
				return;
			}

			await vscode.commands.executeCommand('vscode.openFolder', appFolder, true);
			return;
		}

		vscode.window.showErrorMessage(`Could not find app directory for domain: ${domain}`);
	}

	context.subscriptions.push(vscode.commands.registerCommand('smallweb.openApp', openApp));

	context.subscriptions.push(vscode.window.registerUriHandler({
		async handleUri(uri: vscode.Uri) {
			switch (uri.path) {
				case '/openApp': {
					const domain = new URLSearchParams(uri.query).get('domain');
					if (!domain) {
						vscode.window.showErrorMessage('No domain provided');
						return;
					}

					await openApp(domain);
					break;
				}
				default: {
					vscode.window.showErrorMessage('Invalid URI');
				}
			}
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() { }
