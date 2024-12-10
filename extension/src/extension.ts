import * as vscode from 'vscode';
import { SmallwebFS } from './fileSystemProvider';

export function activate(context: vscode.ExtensionContext) {
	const tokens = vscode.workspace.getConfiguration('smallweb').get<Record<string, string>>('tokens', {})
	const smallwebFs = new SmallwebFS(tokens);
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('smallweb', smallwebFs, { isCaseSensitive: true }));

	context.subscriptions.push(vscode.commands.registerCommand('smallweb.workspaceInit', _ => {
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('smallweb://vscode-dev.smallweb.run/'), name: "Smallweb - Sample" });
	}));
}
