/** The optional simulation tools; retain the original implementations and function identities. */
import { animationHz, tintLevel, shiftEntry, shiftOrder, holds, simEffects } from './bind';
import { magnetFrames, evaluateSimOnStage } from './carrier';
import { changedByCard, cardTimelines, cardStates } from './replay';
import { timeToken, timeText, valueWords, outputWords, valueText, outputText } from './text';
import { isCell, cellValue, tableExperimentOf, tableRow, tableCombinations, solveTable, tableSources, tableQuantity, tableStates } from './table';

export const simToolsRuntime = { animationHz, tintLevel, shiftEntry, shiftOrder, holds, simEffects, magnetFrames, evaluateSimOnStage, changedByCard, cardTimelines, cardStates, timeToken, timeText, valueWords, outputWords, valueText, outputText, isCell, cellValue, tableExperimentOf, tableRow, tableCombinations, solveTable, tableSources, tableQuantity, tableStates };
