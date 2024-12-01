import * as vscode from "vscode";
import rs from "text-readability-ts";

let readabilityStatusBarItem: vscode.StatusBarItem;

function analyzeReadability(textEditor: vscode.TextEditor) {
  const text = textEditor.selection.isEmpty
    ? textEditor.document.getText()
    : textEditor.document.getText(textEditor.selection);
  const scores = {
    // grade level tests:
    fleschReadingEase: rs.fleschReadingEase(text),
    fleschKincaidGrade: rs.fleschKincaidGrade(text),
    gunningFog: rs.gunningFog(text),
    smogIndex: rs.smogIndex(text),
    automatedReadabilityIndex: rs.automatedReadabilityIndex(text),
    colemanLiauIndex: rs.colemanLiauIndex(text),
    linsearWriteFormula: rs.linsearWriteFormula(text),
    daleChallReadabilityScore: rs.daleChallReadabilityScore(text),

    // estimated aggregate of the above scores:
    textStandard: rs.textStandard(text, true),

    // other stuff we could use:
    // syllableCount: rs.syllableCount(text),
    // lexiconCount: rs.lexiconCount(text),
    // sentenceCount: rs.sentenceCount(text),
    // characterCount: rs.charCount(text),
    // letterCount: rs.letterCount(text),
    // polysyllableCount: rs.polySyllableCount(text),
    // difficultWordCount: rs.difficultWords(text),
  };
  return scores;
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new ReadabilityViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ReadabilityViewProvider.viewType,
      provider
    )
  );

  const commandId = "vs-ext-readability.showReadability";
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
  context.subscriptions.push(disposable);

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
}

function updateStatusBarItem(): void {
  const textEditor = vscode.window.activeTextEditor;
  if (
    textEditor &&
    ["plaintext", "markdown"].includes(textEditor.document.languageId)
  ) {
    const scores = analyzeReadability(textEditor);
    // TODO: status bar hover information?
    readabilityStatusBarItem.text = `Grade Level: ~${scores.textStandard}`;
    readabilityStatusBarItem.tooltip = "Click to see all scores.";

    // TODO: maybe put warning status color if low readability?
    // readabilityStatusBarItem.backgroundColor = new vscode.ThemeColor(
    //   "statusBarItem.warningBackground"
    // );
    readabilityStatusBarItem.show();
  } else {
    readabilityStatusBarItem.hide();
  }
}

class ReadabilityViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vs-ext-readability.readabilityView";
  constructor(private readonly _extensionUri: vscode.Uri) {}
  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): Thenable<void> | void {
    webviewView.webview.options = {
      // Allow scripts in the webview
      // enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // webviewView.webview.onDidReceiveMessage((data) => {
    //   switch (data.type) {
    //     case "colorSelected": {
    //       vscode.window.activeTextEditor?.insertSnippet(
    //         new vscode.SnippetString(`#${data.value}`)
    //       );
    //       break;
    //     }
    //   }
    // });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    // const scriptUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "media", "main.js")
    // );

    // Do the same for the stylesheet.
    // const styleResetUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    // );
    // const styleVSCodeUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    // );
    // const styleMainUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "media", "main.css")
    // );

    // Use a nonce to only allow a specific script to be run.
    // const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>readability title?</title>
			</head>
			<body>
        <div> readabbbility</div>
			</body>
			</html>`;
  }
}

// function getNonce() {
// 	let text = '';
// 	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// 	for (let i = 0; i < 32; i++) {
// 		text += possible.charAt(Math.floor(Math.random() * possible.length));
// 	}
// 	return text;
// }
