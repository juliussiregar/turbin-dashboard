export interface StatusTxtProps {
  text: string;
  top: number;
  left: number;
  w: number;
  h?: number;
  fontSize?: number;
  isRed?: boolean;
  /** Stronger OPN/CLS styling for valves. */
  kind?: "motor" | "valve";
  bgColor?: string;
  textColor?: string;
}

export function StatusTxt({
  text,
  top,
  left,
  w,
  h = 16,
  fontSize = 12,
  isRed = false,
  kind = "motor",
  bgColor,
  textColor,
}: StatusTxtProps) {
  const isOpenOrRun = isRed;
  let background = bgColor ?? "#171717";
  let color = textColor ?? (isOpenOrRun ? "#FF3333" : "#33FF33");
  let border = "1px solid transparent";

  if (kind === "valve") {
    if (isOpenOrRun) {
      background = "#3b0a0a";
      color = "#ff4d4d";
      border = "1px solid #ef4444";
    } else {
      background = "#052e16";
      color = "#4ade80";
      border = "1px solid #22c55e";
    }
  } else if (isOpenOrRun) {
    background = bgColor ?? "#2a0a0a";
    color = textColor ?? "#ff5555";
    border = "1px solid #dc2626";
  } else {
    background = bgColor ?? "#0a1f0a";
    color = textColor ?? "#4ade80";
    border = "1px solid #16a34a";
  }

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: h,
        fontSize,
        backgroundColor: background,
        color,
        border,
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        letterSpacing: "0.08em",
        borderRadius: 2,
        boxSizing: "border-box",
      }}
    >
      {text}
    </div>
  );
}
