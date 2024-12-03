import * as vscode from "vscode";
import { ReadabilityTreeProvider } from "./view";
import { getReadabilityScores } from "./readability";

let readabilityStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // View Configuration
  const treeProvider = new ReadabilityTreeProvider();
  vscode.window.registerTreeDataProvider(
    "readability.readabilityView",
    treeProvider
  );

  // Command configuration. (Opens the Readability View)
  const commandId = "readability.showReadability";
  const readabilityCommand = vscode.commands.registerCommand(commandId, () => {
    vscode.commands.executeCommand("readability.readabilityView.focus");
  });
  context.subscriptions.push(readabilityCommand);

  // Status bar configuration.
  readabilityStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    1000
  );
  readabilityStatusBarItem.command = commandId;
  context.subscriptions.push(readabilityStatusBarItem);
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  );
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
  );
  updateStatusBarItem();
}

function updateStatusBarItem(): void {
  const textEditor = vscode.window.activeTextEditor;
  if (
    textEditor &&
    ["plaintext", "markdown"].includes(textEditor.document.languageId)
  ) {
    const scores = getReadabilityScores(textEditor);
    readabilityStatusBarItem.text = `Readability: ${scores.readabilityConsensus}`;
    readabilityStatusBarItem.tooltip =
      'The "Readability Consensus" is the estimated school grade level required to understand the text. Click to open the Readability view for more information.';
    readabilityStatusBarItem.show();
  } else {
    readabilityStatusBarItem.hide();
  }
}
