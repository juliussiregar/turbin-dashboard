export interface SolidBoxProps {
  val: string | number;
  top: number;
  left: number;
  w: number;
  h?: number;
  fontSize?: number;
  bgColor?: string;
  textColor?: string;
}

export function SolidBox({
  val,
  top,
  left,
  w,
  h = 18,
  fontSize = 11,
  bgColor = "#262626",
  textColor = "#00FF00",
}: SolidBoxProps) {
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: w,
        height: h,
        fontSize,
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "monospace",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: 2,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      {val}
    </div>
  );
}
