export type OperationMode =
  | "STOPPED"
  | "CRANKING"
  | "IGNITION"
  | "WARMUP"
  | "SYNCHRONIZING"
  | "LOADED"
  | "UNLOADING"
  | "TRIP";

export type TagValue = number | boolean | string;

export type HmiTagMap = Record<string, TagValue>;

export type TagQuality = "GOOD" | "STALE" | "BAD";

export type HmiTagDefinition = {
  id: string;
  label: string;
  unit?: string;
  decimals?: number;
  min?: number;
  max?: number;
  quality?: TagQuality;
};

export type HmiScreenType = "redraw" | "screenshot";

export type HmiScreenConfig = {
  id: string;
  title: string;
  type: HmiScreenType;
  imageName?: string;
};

export type MainScreenTagPlacement = {
  tagId: string;
  className: string;
};
