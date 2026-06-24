import { useLayoutEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { gsap } from "gsap";

/**
 * Bridges GSAP (time-based) and Remotion (frame-based).
 *
 * Remotion is deterministic and frame-driven; GSAP normally animates on its own
 * rAF ticker, which would desync from the rendered timeline. So we:
 *
 *   1. Build a single `gsap.timeline({ paused: true })` once, scoped to this
 *      component via `gsap.context` (so selectors resolve inside `scope` and
 *      everything is reverted cleanly on unmount).
 *   2. Never let GSAP's ticker run it. Instead, on every Remotion frame we seek
 *      the timeline explicitly with `tl.time(frame / fps)`.
 *
 * The seek lives in a `useLayoutEffect` keyed on `frame` so the DOM is mutated
 * *before* Remotion captures the frame — this is what keeps the still render and
 * the Studio preview pixel-identical.
 *
 * Usage:
 *   const scope = useGsapTimeline((tl) => {
 *     tl.from(".title", { y: 40, opacity: 0, ease: "power4.out", duration: 1 });
 *   });
 *   return <div ref={scope}>…</div>;
 */
export const useGsapTimeline = (
  build: (tl: gsap.core.Timeline, scope: HTMLDivElement) => void,
) => {
  const scope = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Build the paused master timeline exactly once per mount.
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) {
      return;
    }
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true });
      build(timeline, el);
      tl.current = timeline;
    }, el);

    return () => {
      ctx.revert();
      tl.current = null;
    };
    // `build` is provided fresh each render but is logically stable; we only
    // ever want to construct the timeline a single time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive the timeline from Remotion's clock — this is the actual sync.
  useLayoutEffect(() => {
    tl.current?.time(frame / fps);
  }, [frame, fps]);

  return scope;
};
