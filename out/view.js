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
exports.ReadabilityTreeItem = exports.ReadabilityTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const lodash_1 = require("lodash");
const readability_1 = require("./readability");
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
            this.scores = (0, readability_1.getReadabilityScores)(editor);
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
exports.ReadabilityTreeProvider = ReadabilityTreeProvider;
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
//# sourceMappingURL=view.js.map