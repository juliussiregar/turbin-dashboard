export interface PctBoxProps {
  val: string | number;
  top: number;
  left: number;
  w: number;
  h?: number;
  fontSize?: number;
  bgColor?: string;
  textColor?: string;
}

export function PctBox({
  val,
  top,
  left,
  w,
  h = 14,
  fontSize = 10,
  bgColor = "#262626",
  textColor = "#00FF00",
}: PctBoxProps) {
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
      }}
    >
      {val}%
    </div>
  );
}
