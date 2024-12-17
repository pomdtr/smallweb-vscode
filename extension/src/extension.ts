import * as vscode from 'vscode';
import { SmallwebFS } from './fileSystemProvider';

type SmallwebConfig = {
	domain: string;
}

async function exists(uri: vscode.Uri): Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(uri)
		return true
	} catch (e) {
		return false
	}
}

async function loadSmallwebConfig(uri: vscode.Uri): Promise<SmallwebConfig> {
	for (const candidate of ["config.jsonc", "config.json"]) {
		if (await exists(vscode.Uri.joinPath(uri, ".smallweb", candidate))) {
			const config = await vscode.workspace.fs.readFile(vscode.Uri.joinPath(uri, ".smallweb", candidate));
			return JSON.parse(new TextDecoder().decode(config));
		}
	}

	throw new Error("No config file found")
}

async function updateSmallwebContext() {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (workspaceFolders) {
		const workspacePath = workspaceFolders[0].uri;
		const smallwebDir = vscode.Uri.joinPath(workspacePath, '.smallweb');
		const smallwebExists = await exists(smallwebDir);
		vscode.commands.executeCommand('setContext', 'smallweb.directoryExists', smallwebExists);
	}
}

export async function activate(context: vscode.ExtensionContext) {
	updateSmallwebContext();

	const tokens = vscode.workspace.getConfiguration('smallweb').get<Record<string, string>>('tokens', {})

	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('smallweb', new SmallwebFS(tokens), { isCaseSensitive: true }));
	context.subscriptions.push(vscode.commands.registerCommand('smallweb.openApp', async () => {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			return;
		}

		const { domain } = await loadSmallwebConfig(workspaceFolder.uri);

		const entries = await vscode.workspace.fs.readDirectory(workspaceFolder.uri);
		const items = entries.filter(([name, type]) => !name.startsWith('.') && type == vscode.FileType.Directory).map(([name]) => ({
			label: name,
			description: `https://${name}.${domain}/`,
			url: `https://${name}.${domain}/`
		}));

		const quickPick = vscode.window.createQuickPick<typeof items[0]>()
		quickPick.items = items;

		quickPick.onDidAccept(async () => {
			const picked = quickPick.activeItems[0];
			if (!picked) {
				return;
			}
			await vscode.commands.executeCommand('simpleBrowser.api.open', vscode.Uri.parse(picked.url), {
				viewColumn: vscode.ViewColumn.Beside
			});
		})

		quickPick.show();
	}))


	context.subscriptions.push(vscode.commands.registerCommand('smallweb.workspaceInit', _ => {
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('smallweb://vscode-dev.smallweb.run/'), name: "Smallweb - Sample" });
	}));
}
