import React from "react";

declare module "*.css";

interface VisualizerConfig {
  noteHeight?: number;
  noteSpacing?: number;
  pixelsPerTimeStep?: number;
  noteRGB?: string;
  activeNoteRGB?: string;
  minPitch?: number;
  maxPitch?: number;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "midi-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        "sound-font"?: boolean | string;
        visualizer?: string;
      };
      "midi-visualizer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        type?: "piano-roll" | "waterfall" | "staff";
        id?: string;
        config?: VisualizerConfig;
      };
    }
  }
}
