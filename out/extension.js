"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const text_readability_ts_1 = __importDefault(require("text-readability-ts"));
let readabilityStatusBarItem;
function analyzeReadability(textEditor) {
    const text = textEditor.selection.isEmpty
        ? textEditor.document.getText()
        : textEditor.document.getText(textEditor.selection);
    const scores = {
        // grade level tests:
        fleschReadingEase: text_readability_ts_1.default.fleschReadingEase(text),
        fleschKincaidGrade: text_readability_ts_1.default.fleschKincaidGrade(text),
        gunningFog: text_readability_ts_1.default.gunningFog(text),
        smogIndex: text_readability_ts_1.default.smogIndex(text),
        automatedReadabilityIndex: text_readability_ts_1.default.automatedReadabilityIndex(text),
        colemanLiauIndex: text_readability_ts_1.default.colemanLiauIndex(text),
        linsearWriteFormula: text_readability_ts_1.default.linsearWriteFormula(text),
        daleChallReadabilityScore: text_readability_ts_1.default.daleChallReadabilityScore(text),
        // estimated aggregate of the above scores:
        textStandard: text_readability_ts_1.default.textStandard(text, true),
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
function activate(context) {
    const provider = new ReadabilityViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ReadabilityViewProvider.viewType, provider));
    const commandId = "vs-ext-readability.showReadability";
    const readabilityCommand = vscode.commands.registerTextEditorCommand(commandId, (textEditor) => {
        const scores = analyzeReadability(textEditor);
    });
    context.subscriptions.push(readabilityCommand);
    // create a new status bar item that we can now manage
    readabilityStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    readabilityStatusBarItem.command = commandId;
    context.subscriptions.push(readabilityStatusBarItem);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));
    updateStatusBarItem();
}
function updateStatusBarItem() {
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor &&
        ["plaintext", "markdown"].includes(textEditor.document.languageId)) {
        const scores = analyzeReadability(textEditor);
        // TODO: status bar hover information?
        readabilityStatusBarItem.text = `Readability: ${scores.textStandard}`;
        readabilityStatusBarItem.tooltip =
            "The value shown is the estimated school grade level required to understand the text. Click to open the Readability view for more information.";
        // TODO: maybe put warning status color if low readability?
        // readabilityStatusBarItem.backgroundColor = new vscode.ThemeColor(
        //   "statusBarItem.warningBackground"
        // );
        readabilityStatusBarItem.show();
    }
    else {
        readabilityStatusBarItem.hide();
    }
}
class ReadabilityViewProvider {
    _extensionUri;
    static viewType = "vs-ext-readability.readabilityView";
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, token) {
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
    // TODO: message passing to populate webview state on text update
    _getHtmlForWebview(webview) {
        const textEditor = vscode.window.activeTextEditor;
        let scores = null;
        if (textEditor &&
            ["plaintext", "markdown"].includes(textEditor.document.languageId)) {
            scores = analyzeReadability(textEditor);
        }
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
        const scoreObjs = [
            {
                name: "Flesch Reading Ease",
                url: "https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests#Flesch_reading_ease",
                score: scores?.fleschReadingEase,
            },
        ];
        return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>readability title?</title>
        <style>
        .scores {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .score {
          padding: 0.5rem;
          background: rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        </style>
			</head>

			<body>
        <div class="scores">
        ${scoreObjs.map((scoreObj) => {
            return `
          <div class="score">
            <a class="score_name" href="${scoreObj.url}">${scoreObj.name}</a>
            <div class="score_value">${scoreObj.score}</div>
          </div>
          `;
        })}
        </div>
        
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
//# sourceMappingURL=extension.js.map