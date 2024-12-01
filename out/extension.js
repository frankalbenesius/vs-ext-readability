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
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const text_readability_ts_1 = __importDefault(require("text-readability-ts"));
let readabilityStatusBarItem;
function analyzeReadability(textEditor) {
    const text = textEditor.selection.isEmpty
        ? textEditor.document.getText()
        : textEditor.document.getText(textEditor.selection);
    const scores = {
        fleschReadingEase: text_readability_ts_1.default.fleschReadingEase(text),
        fleschKincaidGrade: text_readability_ts_1.default.fleschKincaidGrade(text),
        colemanLiauIndex: text_readability_ts_1.default.colemanLiauIndex(text),
        automatedReadabilityIndex: text_readability_ts_1.default.automatedReadabilityIndex(text),
        daleChallReadabilityScore: text_readability_ts_1.default.daleChallReadabilityScore(text),
        difficultWords: text_readability_ts_1.default.difficultWords(text),
        linsearWriteFormula: text_readability_ts_1.default.linsearWriteFormula(text),
        gunningFog: text_readability_ts_1.default.gunningFog(text),
        textStandard: text_readability_ts_1.default.textStandard(text),
    };
    return scores;
}
function activate(context) {
    const commandId = "vs-ext-readability.helloWorld";
    const disposable = vscode.commands.registerTextEditorCommand(commandId, (textEditor) => {
        const scores = analyzeReadability(textEditor);
        if (scores) {
            console.log(scores);
            // TODO: some view of the info
            // TODO: display the range of what's being scored somehow
        }
    });
    // create a new status bar item that we can now manage
    readabilityStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    readabilityStatusBarItem.command = commandId;
    context.subscriptions.push(readabilityStatusBarItem);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));
    updateStatusBarItem();
    context.subscriptions.push(disposable);
}
function updateStatusBarItem() {
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor &&
        ["plaintext", "markdown"].includes(textEditor.document.languageId)) {
        const scores = analyzeReadability(textEditor);
        // TODO: status bar hover information?
        readabilityStatusBarItem.text = `Readability: ${scores.fleschReadingEase}`;
        readabilityStatusBarItem.tooltip = new vscode.MarkdownString("[google](https://www.google.com)");
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
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map