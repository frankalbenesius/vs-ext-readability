// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import rs from "text-readability-ts";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vs-ext-readability" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  const disposable = vscode.commands.registerTextEditorCommand(
    "vs-ext-readability.helloWorld",
    (textEditor) => {
      // TODO: display the range of what's being scored somehow
      const text = textEditor.selection.isEmpty
        ? textEditor.document.getText()
        : textEditor.document.getText(
            new vscode.Range(
              textEditor.selection.start,
              textEditor.selection.end
            )
          );

      // vscode.workspace.openTextDocument(uri).then((document) => {
      //   let text = document.getText();
      // });

      console.log(
        rs.fleschReadingEase(text),
        rs.fleschKincaidGrade(text),
        rs.colemanLiauIndex(text),
        rs.automatedReadabilityIndex(text),
        rs.daleChallReadabilityScore(text),
        rs.difficultWords(text),
        rs.linsearWriteFormula(text),
        rs.gunningFog(text),
        rs.textStandard(text)
      );
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
