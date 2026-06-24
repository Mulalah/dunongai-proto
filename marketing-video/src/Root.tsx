import "./index.css";
import { Composition } from "remotion";
import { DunongAd } from "./DunongAd";

export const RemotionRoot = () => {
  return (
    <Composition
      id="DunongAd"
      component={DunongAd}
      durationInFrames={1800}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
