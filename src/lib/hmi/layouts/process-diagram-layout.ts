/** Koordinat overlay mengacu ke gambar asli 1422 × 814 px. */
export const PROCESS_DIAGRAM_WIDTH = 1422;
export const PROCESS_DIAGRAM_HEIGHT = 814;
export const PROCESS_DIAGRAM_VIEWBOX = `0 0 ${PROCESS_DIAGRAM_WIDTH} ${PROCESS_DIAGRAM_HEIGHT}` as const;
export const PROCESS_DIAGRAM_IMAGE = "/hmi/process-diagram.png";

export type ProcessDiagramMask = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rx?: number;
};

/** Kotak penutup nilai/status bawaan gambar — fase 1 sebelum teks dinamis. */
export const PROCESS_DIAGRAM_MASKS: ProcessDiagramMask[] = [
  { id: "TE_0057", x: 61, y: 233, width: 87, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0021", x: 61, y: 324, width: 88, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0022", x: 61, y: 369, width: 88, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "PT_0183", x: 63, y: 415, width: 86, height: 29, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0023", x: 417, y: 173, width: 89, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0079", x: 583, y: 288, width: 88, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0080", x: 740, y: 288, width: 90, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0081", x: 723, y: 515, width: 90, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "TE_0082", x: 576, y: 516, width: 88, height: 28, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "VIGV", x: 1021, y: 516, width: 62, height: 31, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "VBV", x: 1102, y: 517, width: 60, height: 30, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "VSV", x: 948, y: 551, width: 59, height: 33, fill: "#0a0a0a", stroke: "#d4d4d8", strokeWidth: 1.2, rx: 1 },
  { id: "GEN_KV", x: 194, y: 354, width: 82, height: 18, fill: "#0f160c" },
  { id: "GEN_PF", x: 194, y: 372, width: 82, height: 18, fill: "#15280d" },
  { id: "GEN_MVAR", x: 194, y: 390, width: 82, height: 18, fill: "#1b3711" },
  { id: "GEN_MVA", x: 194, y: 408, width: 82, height: 18, fill: "#2a5b1c" },
  { id: "GEN_FREQ", x: 194, y: 444, width: 82, height: 18, fill: "#29571c" },
  { id: "BUS_FREQ", x: 194, y: 462, width: 82, height: 18, fill: "#1c4210" },
  { id: "DMD_GAS_TOP", x: 910, y: 51, width: 46, height: 31, fill: "#b5b5b5" },
  { id: "DMD_GAS_A", x: 771, y: 145, width: 71, height: 58, fill: "#ebebeb" },
  { id: "DMD_GAS_B", x: 905, y: 142, width: 63, height: 57, fill: "#eaeaea" },
  { id: "DMD_GAS_C", x: 614, y: 164, width: 97, height: 52, fill: "#f4f4f4" },
  { id: "DMD_GAS_D", x: 1026, y: 188, width: 77, height: 40, fill: "#e8e8e8" },
  { id: "DMD_FCV", x: 469, y: 701, width: 66, height: 51, fill: "#b4b4b4" },
  { id: "DMD_NOX", x: 1173, y: 688, width: 73, height: 45, fill: "#bababa" },
  { id: "MOT_0109_STOP", x: 83, y: 516, width: 69, height: 32, fill: "#000000" },
  { id: "MOT_0108B_STOP", x: 190, y: 649, width: 66, height: 31, fill: "#000000" },
  { id: "MOT_0108A_RUN", x: 359, y: 650, width: 43, height: 31, fill: "#000000" },
  { id: "MOT_0085_STOP", x: 270, y: 648, width: 39, height: 32, fill: "#000000" },
  { id: "MOT_0129_STOP", x: 304, y: 500, width: 67, height: 33, fill: "#000000" },
  { id: "MOT_6015_STOP", x: 1231, y: 569, width: 64, height: 35, fill: "#000000" },
  { id: "MOT_2100_STOP", x: 449, y: 673, width: 90, height: 34, fill: "#000000" },
  { id: "FAN_A_RUN", x: 811, y: 98, width: 65, height: 27, fill: "#000000" },
  { id: "FAN_B_STOP", x: 936, y: 98, width: 36, height: 27, fill: "#000000" },
  { id: "OPN_GAS_1", x: 172, y: 133, width: 33, height: 25, fill: "#000000" },
  { id: "OPN_GAS_2", x: 1255, y: 135, width: 33, height: 25, fill: "#000000" },
  { id: "OPN_GAS_3", x: 1026, y: 267, width: 47, height: 32, fill: "#000000" },
  { id: "OPN_GAS_4", x: 1095, y: 181, width: 45, height: 31, fill: "#000000" },
  { id: "CLS_SOV_1", x: 879, y: 584, width: 35, height: 31, fill: "#000000" },
  { id: "CLS_SOV_2", x: 1225, y: 668, width: 35, height: 32, fill: "#000000" },
];

export type ProcessDiagramDynamicField = {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  fontSize?: number;
  fontWeight?: number;
  textAnchor?: "start" | "middle" | "end";
  dominantBaseline?: "auto" | "middle" | "hanging";
};

/** Data dummy untuk fase berikutnya — belum ditampilkan. */
export const PROCESS_DIAGRAM_DUMMY_FIELDS: ProcessDiagramDynamicField[] = [
  { id: "TE_0057", text: "153.8 °F", x: 61, y: 233, width: 87, height: 28, fill: "#2ef059", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
  { id: "TE_0021", text: "175.8 °F", x: 61, y: 324, width: 88, height: 28, fill: "#2ef059", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
  { id: "TE_0022", text: "143.6 °F", x: 61, y: 369, width: 88, height: 28, fill: "#2ef059", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
  { id: "PT_0183", text: "28.9 psig", x: 63, y: 415, width: 86, height: 29, fill: "#2ef059", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
  { id: "GEN_KV", text: "11.8", x: 194, y: 354, width: 82, height: 18, fill: "#f5fe5b", fontSize: 11, fontWeight: 700, textAnchor: "end", dominantBaseline: "middle" },
  { id: "GEN_PF", text: "0.93", x: 194, y: 372, width: 82, height: 18, fill: "#2ef059", fontSize: 11, fontWeight: 700, textAnchor: "end", dominantBaseline: "middle" },
  { id: "VIGV", text: "29.0", x: 1021, y: 516, width: 62, height: 31, fill: "#2ef059", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
  { id: "MOT_0108A_RUN", text: "RUN", x: 359, y: 650, width: 43, height: 31, fill: "#ef1f1f", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
  { id: "MOT_0109_STOP", text: "STOP", x: 83, y: 516, width: 69, height: 32, fill: "#2ef059", fontSize: 10, fontWeight: 700, textAnchor: "middle", dominantBaseline: "middle" },
];
