"use strict";

import * as vscode from "vscode";
import { registerSmallwebFileSystemProvider } from "./fs_provider";

export function activate(context: vscode.ExtensionContext) {
	registerSmallwebFileSystemProvider(context);
}
