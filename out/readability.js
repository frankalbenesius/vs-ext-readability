"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadabilityScores = getReadabilityScores;
const text_readability_ts_1 = __importDefault(require("text-readability-ts"));
function getReadabilityScores(textEditor) {
    const text = textEditor.selection.isEmpty
        ? textEditor.document.getText()
        : textEditor.document.getText(textEditor.selection);
    const scores = {
        fleschReadingEase: text_readability_ts_1.default.fleschReadingEase(text),
        fleschKincaidGrade: text_readability_ts_1.default.fleschKincaidGrade(text),
        gunningFog: text_readability_ts_1.default.gunningFog(text),
        smogIndex: text_readability_ts_1.default.smogIndex(text),
        automatedReadabilityIndex: text_readability_ts_1.default.automatedReadabilityIndex(text),
        colemanLiauIndex: text_readability_ts_1.default.colemanLiauIndex(text),
        linsearWriteFormula: text_readability_ts_1.default.linsearWriteFormula(text),
        daleChallReadabilityScore: text_readability_ts_1.default.daleChallReadabilityScore(text),
        readabilityConsensus: text_readability_ts_1.default.textStandard(text, false),
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
//# sourceMappingURL=readability.js.map