import * as vscode from "vscode";
import rs from "text-readability-ts";

let readabilityStatusBarItem: vscode.StatusBarItem;

function analyzeReadability(textEditor: vscode.TextEditor) {
  const text = textEditor.selection.isEmpty
    ? textEditor.document.getText()
    : textEditor.document.getText(textEditor.selection);
  const scores = {
    fleschReadingEase: rs.fleschReadingEase(text),
    fleschKincaidGrade: rs.fleschKincaidGrade(text),
    colemanLiauIndex: rs.colemanLiauIndex(text),
    automatedReadabilityIndex: rs.automatedReadabilityIndex(text),
    daleChallReadabilityScore: rs.daleChallReadabilityScore(text),
    difficultWords: rs.difficultWords(text),
    linsearWriteFormula: rs.linsearWriteFormula(text),
    gunningFog: rs.gunningFog(text),
    textStandard: rs.textStandard(text),
  };
  return scores;
}

export function activate(context: vscode.ExtensionContext) {
  const commandId = "vs-ext-readability.helloWorld";
  const disposable = vscode.commands.registerTextEditorCommand(
    commandId,
    (textEditor) => {
      const scores = analyzeReadability(textEditor);
      if (scores) {
        console.log(scores);
        // TODO: some view of the info
        // TODO: display the range of what's being scored somehow
      }
    }
  );

  // create a new status bar item that we can now manage
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
    vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
  );
  updateStatusBarItem();

  context.subscriptions.push(disposable);
}

function updateStatusBarItem(): void {
  const textEditor = vscode.window.activeTextEditor;
  if (
    textEditor &&
    ["plaintext", "markdown"].includes(textEditor.document.languageId)
  ) {
    const scores = analyzeReadability(textEditor);
    // TODO: status bar hover information?
    readabilityStatusBarItem.text = `Readability: ${scores.fleschReadingEase}`;
    readabilityStatusBarItem.tooltip = new vscode.MarkdownString(
      "[google](https://www.google.com)"
    );

    // TODO: maybe put warning status color if low readability?
    // readabilityStatusBarItem.backgroundColor = new vscode.ThemeColor(
    //   "statusBarItem.warningBackground"
    // );
    readabilityStatusBarItem.show();
  } else {
    readabilityStatusBarItem.hide();
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
