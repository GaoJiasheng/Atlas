/** The presentation system (docs/06 "演示系统（core）"): beats, caption card, auto-play, voice. */
export type { PresentationAdapter, SpaceBeatSpec, SpaceSavedState, SpacePresentationAdapter } from './adapter';
export { buildBeats, defaultCaption, type Beat, type BeatBase } from './beats';
export { BEAT_SETTLE_MS } from './autoplay';
export { usePresentation, type PresentationApi } from './usePresentation';
