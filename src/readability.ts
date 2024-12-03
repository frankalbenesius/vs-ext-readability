import * as vscode from "vscode";
import rs from "text-readability-ts";

export function getReadabilityScores(textEditor: vscode.TextEditor) {
  const text = textEditor.selection.isEmpty
    ? textEditor.document.getText()
    : textEditor.document.getText(textEditor.selection);
  const scores = {
    fleschReadingEase: rs.fleschReadingEase(text),
    fleschKincaidGrade: rs.fleschKincaidGrade(text),
    gunningFog: rs.gunningFog(text),
    smogIndex: rs.smogIndex(text),
    automatedReadabilityIndex: rs.automatedReadabilityIndex(text),
    colemanLiauIndex: rs.colemanLiauIndex(text),
    linsearWriteFormula: rs.linsearWriteFormula(text),
    daleChallReadabilityScore: rs.daleChallReadabilityScore(text),
    readabilityConsensus: rs.textStandard(text, false),
    // // other stuff we could use:
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
