export interface StatusTxtProps {
  text: string;
  top: number;
  left: number;
  w: number;
  h?: number;
  fontSize?: number;
  isRed?: boolean;
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
  bgColor = '#171717',
  textColor,
}: StatusTxtProps) {
  const color = textColor ?? (isRed ? '#FF3333' : '#33FF33');
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        width: w,
        height: h,
        fontSize,
        backgroundColor: bgColor,
        color,
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.1em',
        borderRadius: 2,
      }}
    >
      {text}
    </div>
  );
}
