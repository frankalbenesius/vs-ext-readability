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
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const view_1 = require("./view");
const readability_1 = require("./readability");
let readabilityStatusBarItem;
function activate(context) {
    // View Configuration
    const treeProvider = new view_1.ReadabilityTreeProvider();
    vscode.window.registerTreeDataProvider("vs-ext-readability.readabilityView", treeProvider);
    // Command configuration. (Opens the Readability View)
    const commandId = "vs-ext-readability.showReadability";
    const readabilityCommand = vscode.commands.registerTextEditorCommand(commandId, (textEditor) => {
        const scores = (0, readability_1.getReadabilityScores)(textEditor);
        console.log(scores);
    });
    context.subscriptions.push(readabilityCommand);
    // Status bar configuration.
    readabilityStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    readabilityStatusBarItem.command = commandId;
    context.subscriptions.push(readabilityStatusBarItem);
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
    context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));
    updateStatusBarItem();
}
function updateStatusBarItem() {
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor &&
        ["plaintext", "markdown"].includes(textEditor.document.languageId)) {
        const scores = (0, readability_1.getReadabilityScores)(textEditor);
        readabilityStatusBarItem.text = `Readability: ${scores.readabilityConsensus}`;
        readabilityStatusBarItem.tooltip =
            'The "Readability Consensus" is the estimated school grade level required to understand the text. Click to open the Readability view for more information.';
        readabilityStatusBarItem.show();
    }
    else {
        readabilityStatusBarItem.hide();
    }
}
//# sourceMappingURL=extension.js.map