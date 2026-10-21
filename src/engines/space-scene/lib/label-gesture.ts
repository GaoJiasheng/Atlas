/** Camera gestures forwarded from a placard must not start model picking. */
const labelEvents = new WeakSet<Event>();

export const isLabelGestureEvent = (event: Event): boolean => labelEvents.has(event);

/**
 * A placard shares the stage's orbit gesture, while a short tap selects it.
 * OrbitControls captures the forwarded pointer on the stage, so moves and
 * releases keep reaching it even when the pointer crosses another placard.
 */
export function beginLabelGesture(event: PointerEvent, stage: HTMLElement, select: () => void): () => void {
  const x = event.clientX;
  const y = event.clientY;
  const pointer = event.pointerId;
  let dragged = !event.isPrimary || event.button !== 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const move = (e: PointerEvent) => {
    if (e.pointerId === pointer && Math.hypot(e.clientX - x, e.clientY - y) > 6) dragged = true;
  };
  const anotherPointer = (e: PointerEvent) => {
    if (e.pointerId !== pointer) dragged = true;
  };
  // The browser's click is retargeted to the capturing stage. It must not
  // select a model part underneath the placard or clear the label selection.
  const click = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const clean = () => {
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('pointerdown', anotherPointer, true);
    window.removeEventListener('pointerup', up, true);
    window.removeEventListener('pointercancel', cancel, true);
    window.removeEventListener('click', click, true);
    if (timer !== undefined) clearTimeout(timer);
  };
  const finish = () => {
    // A native click follows pointerup in the same browser task.
    timer = setTimeout(clean, 0);
  };
  const up = (e: PointerEvent) => {
    if (e.pointerId !== pointer) return;
    move(e);
    if (!dragged) select();
    finish();
  };
  const cancel = (e: PointerEvent) => {
    if (e.pointerId === pointer) finish();
  };
  window.addEventListener('pointermove', move, true);
  window.addEventListener('pointerdown', anotherPointer, true);
  window.addEventListener('pointerup', up, true);
  window.addEventListener('pointercancel', cancel, true);
  window.addEventListener('click', click, true);
  const forwarded = new PointerEvent('pointerdown', event);
  labelEvents.add(forwarded);
  stage.dispatchEvent(forwarded);
  return clean;
}
