import type { HmiScreenConfig } from "@/lib/hmi/types";

export const HMI_SCREENS: HmiScreenConfig[] = [
  { id: "main", title: "Main Screen", type: "redraw" },
];

export function getScreenById(id: string) {
  return HMI_SCREENS.find((screen) => screen.id === id);
}
