import type { ReactNode } from "react";
import { SensorTagBox } from "@/components/hmi/svg/components";
import { VerticalMotorInteractivePreview } from "@/components/hmi/svg/components/vertical-motor";
import { HorizontalMotorInteractivePreview } from "@/components/hmi/svg/components/horizontal-motor";
import { SolenoidValveInteractivePreview } from "@/components/hmi/svg/components/solenoid-valve";
import { VaneValueBoxInteractivePreview } from "@/components/hmi/svg/components/vane-value-box";

function SinglePreviewFrame({
  children,
  viewBox,
  height = 160,
}: {
  children: ReactNode;
  viewBox: string;
  height?: number;
}) {
  const [, , w, h] = viewBox.split(" ").map(Number);
  return (
    <div className="overflow-hidden rounded-lg border border-slate-600 bg-black p-2">
      <svg viewBox={viewBox} width="100%" height={height} preserveAspectRatio="xMidYMid meet" className="block w-full max-w-[360px]" aria-hidden>
        <rect x={0} y={0} width={w} height={h} fill="#000" />
        {children}
      </svg>
    </div>
  );
}

export const PROCESS_SVG_PREVIEWS: Record<string, () => ReactNode> = {
  "sensor-tag-box": () => (
    <SinglePreviewFrame viewBox="0 0 100 70">
      <SensorTagBox tag="TE-0057" value={153.8} unit="°F" x={19} y={16} />
    </SinglePreviewFrame>
  ),
  "vertical-motor": () => <VerticalMotorInteractivePreview />,
  "horizontal-motor": () => <HorizontalMotorInteractivePreview />,
  "solenoid-valve": () => <SolenoidValveInteractivePreview />,
  "vane-value-box": () => <VaneValueBoxInteractivePreview />,
};

export function hasProcessSvgPreview(id: string) {
  return id in PROCESS_SVG_PREVIEWS;
}

export function ProcessSvgPreview({ id }: { id: string }) {
  const render = PROCESS_SVG_PREVIEWS[id];
  if (!render) return null;
  return render();
}
