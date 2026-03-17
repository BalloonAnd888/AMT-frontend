import React from "react";

declare module "*.css";

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
      };
    }
  }
}
