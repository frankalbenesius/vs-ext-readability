import * as vscode from "vscode";
import { debounce } from "lodash";
import { getReadabilityScores } from "./readability";

export class ReadabilityTreeProvider
  implements vscode.TreeDataProvider<ReadabilityTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    ReadabilityTreeItem | undefined | void
  > = new vscode.EventEmitter<ReadabilityTreeItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    ReadabilityTreeItem | undefined | void
  > = this._onDidChangeTreeData.event;

  constructor() {
    vscode.window.onDidChangeActiveTextEditor(() => this.refresh());
    vscode.window.onDidChangeTextEditorSelection(() => this.refresh());
    vscode.workspace.onDidChangeTextDocument(() => this.refresh());
    this.updateScores();
  }

  scores: ReturnType<typeof getReadabilityScores> | null = null;
  selection: vscode.Range | null = null;

  updateScores(): void {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      this.selection = editor.selection;
      this.scores = getReadabilityScores(editor);
    } else {
      this.selection = null;
      this.scores = null;
    }
  }

  refresh = debounce(() => {
    this.updateScores();
    this._onDidChangeTreeData.fire();
  }, 500);

  getTreeItem(element: ReadabilityTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ReadabilityTreeItem): Thenable<ReadabilityTreeItem[]> {
    if (this.scores === null) {
      return Promise.resolve([]);
    }
    if (element) {
      return Promise.resolve([
        new ReadabilityTreeItem(
          element.details!.score.toString(),
          vscode.TreeItemCollapsibleState.None
        ),
      ]);
    } else {
      const itemConfigs: {
        label: string;
        details: { score: string | number; url: string; description: "" };
      }[] = [
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
      const prettyPos = (pos: vscode.Position): string => {
        return `Ln ${pos.line + 1}, Col ${pos.character + 1}`;
      };
      const selectionText: string =
        this.selection && !this.selection.isEmpty
          ? `${prettyPos(this.selection.start)} - ${prettyPos(
              this.selection.end
            )}`
          : "All";
      return Promise.resolve([
        new ReadabilityTreeItem(
          `Selection: ${selectionText}`,
          vscode.TreeItemCollapsibleState.None
        ),
        ...itemConfigs.map(
          (itemConfig) =>
            new ReadabilityTreeItem(
              itemConfig.label,
              vscode.TreeItemCollapsibleState.Expanded,
              itemConfig.details
            )
        ),
      ]);
    }
  }
}

export class ReadabilityTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly details?: {
      score: string | number;
      url: string;
      description: "";
    } // public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    if (details) {
      this.tooltip = details.description;
    }
    // this.description = "some description"; // creates subtle text
  }

  // iconPath = {
  // 	light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
  // 	dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  // };
}
