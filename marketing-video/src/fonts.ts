/**
 * Loads the webapp's three Google Fonts through Remotion so they are guaranteed
 * to be ready before any frame is rendered (loadFont() registers a delayRender).
 * Weights/subsets are restricted to what the ad actually uses — this keeps the
 * font network requests (and render warm-up) small.
 *   - Plus Jakarta Sans  → headings / wordmark
 *   - Inter              → body / UI
 *   - Lora               → story-reading text
 */
import { loadFont as loadHeading } from "@remotion/google-fonts/PlusJakartaSans";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import { loadFont as loadReading } from "@remotion/google-fonts/Lora";

const { fontFamily: heading } = loadHeading("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin"],
});
const { fontFamily: body } = loadBody("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: reading } = loadReading("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const F = { heading, body, reading } as const;
