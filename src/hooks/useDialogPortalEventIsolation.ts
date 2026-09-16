import { useEffect } from "react";

/**
 * useDialogPortalEventIsolation
 *
 * Keeps a `<body>`-portaled dropdown fully interactive when it is rendered
 * *outside* of a modal Radix Dialog. While a modal Dialog is open, several
 * libraries attach document-level listeners that hijack such a portaled dropdown:
 *   • DismissableLayer    → 'pointerdown'                        (treats clicks as "outside")
 *   • react-remove-scroll → 'wheel' / 'touchmove' / 'touchstart' (blocks scrolling the list)
 *   • FocusScope          → 'focusin' / 'focusout'               (traps focus → search untypable)
 *
 * The first two listen in the BUBBLE phase, so stopping those events before they
 * reach `document` is enough — we attach to `getBubbleTarget()` (the dropdown root,
 * or a common ancestor such as <body>) and stop only events that originate inside
 * the dropdown. We never call preventDefault, so the browser's own overflow-y
 * scroll still runs.
 *
 * FocusScope is different: its focus-stealing 'focusout' fires on the element
 * *inside the dialog* losing focus (not on the dropdown), so a listener on the
 * dropdown can't stop it. We instead guard at `document` in the CAPTURE phase and stop
 * the event whenever its target OR relatedTarget is inside the dropdown — i.e. focus
 * moving into or out of it. `stopPropagation` (not `stopImmediatePropagation`) is
 * deliberate: stopping in the capture phase already prevents the event from reaching the
 * target and the bubble phase — so FocusScope's bubble listener never fires — while still
 * letting other legitimate capture-phase document listeners run. Stopping propagation only
 * suppresses the notification; the browser has already moved focus, so the input keeps it.
 *
 * SOLID: Single Responsibility — isolating a portaled dropdown's events.
 * DRY: Shared by Select and PhoneInput (and any future body-portaled dropdown).
 *
 * @param active          Whether the isolation listeners should be attached.
 * @param getBubbleTarget Resolves the element to attach bubble-phase stops to
 *                        (the dropdown root, or a common ancestor like document.body).
 *                        NOTE: resolved ONCE per effect run — if the returned node can
 *                        remount, `active` must toggle across that remount (as Select's
 *                        `isOpen && !!dropdownStyle` gate does) or the listeners stay on
 *                        the stale node. Prefer a long-lived node such as document.body.
 *                        Returning null skips ALL isolation for that run — including the
 *                        document-level focus guard, not just the bubble stops.
 * @param isInside        Returns true when a node is inside the portaled dropdown.
 */
interface DialogPortalEventIsolationOptions {
  active: boolean;
  getBubbleTarget: () => EventTarget | null;
  isInside: (node: EventTarget | null) => boolean;
}

const BUBBLE_EVENTS = ["pointerdown", "wheel", "touchstart", "touchmove"];

export function useDialogPortalEventIsolation({
  active,
  getBubbleTarget,
  isInside,
}: DialogPortalEventIsolationOptions): void {
  useEffect(() => {
    if (typeof document === "undefined" || !active) return;
    const bubbleTarget = getBubbleTarget();
    if (!bubbleTarget) return;

    const stop = (event: Event) => {
      if (isInside(event.target)) event.stopPropagation();
    };
    BUBBLE_EVENTS.forEach((type) => bubbleTarget.addEventListener(type, stop));

    const focusGuard = (event: FocusEvent) => {
      if (isInside(event.target) || isInside(event.relatedTarget)) {
        event.stopPropagation();
      }
    };
    document.addEventListener("focusin", focusGuard, true);
    document.addEventListener("focusout", focusGuard, true);

    return () => {
      BUBBLE_EVENTS.forEach((type) =>
        bubbleTarget.removeEventListener(type, stop),
      );
      document.removeEventListener("focusin", focusGuard, true);
      document.removeEventListener("focusout", focusGuard, true);
    };
  }, [active, getBubbleTarget, isInside]);
}
