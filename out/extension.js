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
exports.ReadabilityTreeItem = void 0;
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const text_readability_ts_1 = __importDefault(require("text-readability-ts"));
const lodash_1 = require("lodash");
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
        readabilityConsensus: text_readability_ts_1.default.textStandard(text, true),
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
    const treeProvider = new ReadabilityTreeProvider();
    vscode.window.registerTreeDataProvider("vs-ext-readability.readabilityView", treeProvider);
    // vscode.commands.registerCommand("vs-ext-readability.refresh", () =>
    //   treeProvider.refresh()
    // );
    // vscode.commands.registerCommand('extension.openPackageOnNpm', moduleName => vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(`https://www.npmjs.com/package/${moduleName}`)));
    // context.subscriptions.push(
    //   vscode.window.registerWebviewViewProvider(
    //     ReadabilityViewProvider.viewType,
    //     provider
    //   )
    // );
    const commandId = "vs-ext-readability.showReadability";
    const readabilityCommand = vscode.commands.registerTextEditorCommand(commandId, (textEditor) => {
        const scores = analyzeReadability(textEditor);
        console.log(scores);
    });
    context.subscriptions.push(readabilityCommand);
    // create a new status bar item that we can now manage
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
        const scores = analyzeReadability(textEditor);
        readabilityStatusBarItem.text = `Readability: ${scores.readabilityConsensus}`;
        readabilityStatusBarItem.tooltip =
            'The "Readability Consensus" is the estimated school grade level required to understand the text. Click to open the Readability view for more information.';
        readabilityStatusBarItem.show();
    }
    else {
        readabilityStatusBarItem.hide();
    }
}
class ReadabilityTreeProvider {
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    constructor() {
        vscode.window.onDidChangeActiveTextEditor(() => this.refresh());
        vscode.window.onDidChangeTextEditorSelection(() => this.refresh());
        vscode.workspace.onDidChangeTextDocument(() => this.refresh());
        this.updateScores();
    }
    scores = null;
    selection = null;
    updateScores() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            this.selection = editor.selection;
            this.scores = analyzeReadability(editor);
        }
        else {
            this.selection = null;
            this.scores = null;
        }
    }
    refresh = (0, lodash_1.debounce)(() => {
        this.updateScores();
        this._onDidChangeTreeData.fire();
    }, 500);
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (this.scores === null) {
            return Promise.resolve([]);
        }
        if (element) {
            return Promise.resolve([
                new ReadabilityTreeItem(element.details.score.toString(), vscode.TreeItemCollapsibleState.None),
            ]);
        }
        else {
            const itemConfigs = [
                {
                    label: "Flesch Reading Ease Formula",
                    details: {
                        score: this.scores.fleschReadingEase,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Flesch-Kincaid Grade Level",
                    details: {
                        score: this.scores.fleschKincaidGrade,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Fog Scale",
                    details: {
                        score: this.scores.gunningFog,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "SMOG Index",
                    details: {
                        score: this.scores.smogIndex,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Automated Readability Index",
                    details: {
                        score: this.scores.automatedReadabilityIndex,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Coleman-Liau Index",
                    details: {
                        score: this.scores.colemanLiauIndex,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Linsear Write Formula",
                    details: {
                        score: this.scores.linsearWriteFormula,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Dale-Chall Readability details:{Score",
                    details: {
                        score: this.scores.daleChallReadabilityScore,
                        url: "",
                        description: "",
                    },
                },
                {
                    label: "Readability Consensus",
                    details: {
                        score: this.scores.readabilityConsensus,
                        url: "",
                        description: "",
                    },
                },
            ];
            const prettyPos = (pos) => {
                return `Ln ${pos.line + 1}, Col ${pos.character + 1}`;
            };
            const selectionText = this.selection && !this.selection.isEmpty
                ? `${prettyPos(this.selection.start)} - ${prettyPos(this.selection.end)}`
                : "All";
            return Promise.resolve([
                new ReadabilityTreeItem(`Selection: ${selectionText}`, vscode.TreeItemCollapsibleState.None),
                ...itemConfigs.map((itemConfig) => new ReadabilityTreeItem(itemConfig.label, vscode.TreeItemCollapsibleState.Expanded, itemConfig.details)),
            ]);
        }
    }
}
class ReadabilityTreeItem extends vscode.TreeItem {
    label;
    collapsibleState;
    details;
    constructor(label, collapsibleState, details // public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.details = details;
        if (details) {
            this.tooltip = details.description;
        }
        // this.description = "some description"; // creates subtle text
    }
}
exports.ReadabilityTreeItem = ReadabilityTreeItem;
//# sourceMappingURL=extension.js.map