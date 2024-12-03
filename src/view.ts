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
          vscode.TreeItemCollapsibleState.None,
          {
            url: element.details!.url,
          } as any // i just want the dang url, ok?
        ),
      ]);
    } else {
      const itemConfigs: {
        label: string;
        details: { score: string | number; url: string; description: string };
      }[] = [
        {
          label: "Flesch Reading Ease Formula",
          details: {
            score: this.scores.fleschReadingEase,
            description:
              "Assesses the ease of readability in a document. While the maximum score is 121.22, there is no limit on how low the score can be. A negative score is valid.",
            url: "https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests#Flesch_reading_ease",
          },
        },
        {
          label: "Flesch-Kincaid Grade Level",
          details: {
            score: this.scores.fleschKincaidGrade,
            description:
              "Returns the Flesch-Kincaid Grade of the given text. This is a grade formula in that a score of 9.3 means that a ninth grader would be able to read the document.",
            url: "https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests#Flesch%E2%80%93Kincaid_grade_level",
          },
        },
        {
          label: "Fog Scale",
          details: {
            score: this.scores.gunningFog,
            url: "https://en.wikipedia.org/wiki/Gunning_fog_index",
            description:
              "Returns the FOG index of the given text. This is a grade formula in that a score of 9.3 means that a ninth grader would be able to read the document.",
          },
        },
        {
          label: "SMOG Index",
          details: {
            score: this.scores.smogIndex,
            url: "https://en.wikipedia.org/wiki/SMOG",
            description:
              "Returns the SMOG index of the given text. This is a grade formula in that a score of 9.3 means that a ninth grader would be able to read the document.\n\nTexts of fewer than 30 sentences are statistically invalid, because the SMOG formula was normed on 30-sentence samples. textstat requires at least 3 sentences for a result.",
          },
        },
        {
          label: "Automated Readability Index",
          details: {
            score: this.scores.automatedReadabilityIndex,
            url: "https://en.wikipedia.org/wiki/Automated_readability_index",
            description:
              "Returns the ARI (Automated Readability Index) which outputs a number that approximates the grade level needed to comprehend the text.\n\nFor example if the ARI is 6.5, then the grade level to comprehend the text is 6th to 7th grade.",
          },
        },
        {
          label: "Coleman-Liau Index",
          details: {
            score: this.scores.colemanLiauIndex,
            url: "https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index",
            description:
              "Returns the grade level of the text using the Coleman-Liau Formula. This is a grade formula in that a score of 9.3 means that a ninth grader would be able to read the document.",
          },
        },
        {
          label: "Linsear Write Formula",
          details: {
            score: this.scores.linsearWriteFormula,
            url: "https://en.wikipedia.org/wiki/Linsear_Write",
            description:
              "Returns the grade level using the Linsear Write Formula. This is a grade formula in that a score of 9.3 means that a ninth grader would be able to read the document.",
          },
        },
        {
          label: "Dale-Chall Readability",
          details: {
            score: this.scores.daleChallReadabilityScore,
            url: "https://en.wikipedia.org/wiki/Dale%E2%80%93Chall_readability_formula",
            description:
              "Different from other tests, since it uses a lookup table of the most commonly used 3000 English words. Thus it returns the grade level using the New Dale-Chall Formula.",
          },
        },
        {
          label: "Readability Consensus",
          details: {
            score: this.scores.readabilityConsensus,
            url: "",
            description:
              "Based upon all the above tests, returns the estimated school grade level required to understand the text.",
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
      description: string;
    } // public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    if (details?.description) {
      // this is a root node
      this.tooltip = details.description;
    } else {
      // this is a score leaf node
      if (details?.url) {
        this.command = {
          title: "Open Link",
          command: "vscode.open",
          arguments: [details.url],
        };
        this.tooltip = "Click to open Wikipedia description.";
      }
    }
  }
}
