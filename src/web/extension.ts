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

	const configUri = vscode.Uri.joinPath(smallwebFolder, '.smallweb', 'config.json');
	const configBytes = await vscode.workspace.fs.readFile(configUri);
	const config = JSON.parse(new TextDecoder().decode(configBytes));
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
	context.subscriptions.push(vscode.commands.registerCommand('smallweb.openInExternalBrowser', async () => {
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

	context.subscriptions.push(vscode.commands.registerCommand('smallweb.openInSimpleBrowser', async () => {
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


}

// This method is called when your extension is deactivated
export function deactivate() { }
