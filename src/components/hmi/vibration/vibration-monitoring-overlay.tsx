"use client";

import { SolidBox } from "@/components/hmi/overlay/solid-box";
import { ScaleToFit } from "@/components/hmi/overlay/scale-to-fit";
import { VibrationBarGauge } from "@/components/hmi/vibration/vibration-bar-gauge";
import type { HmiSensorState } from "@/lib/hmi/overlay-sensor-types";

export interface VibrationMonitoringOverlayProps {
  s: HmiSensorState;
  className?: string;
}

const BACKGROUND_SRC = "/vibration_monitoring.png";
const VIB_WIDTH = 1459;
const VIB_HEIGHT = 1071;

function VibrationElements({ s }: { s: HmiSensorState }) {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* --- TOP ROW DIGITAL BOXES --- */}
      <SolidBox val={s.vib_top1} top={52} left={97} w={86} h={35} fontSize={14} />
      <SolidBox val={s.vib_top2} top={53} left={195} w={116} h={34} fontSize={14} />
      <SolidBox val={s.vib_top3} top={53} left={390} w={117} h={34} fontSize={14} />
      <SolidBox val={s.vib_top4} top={52} left={530} w={86} h={35} fontSize={14} />
      <SolidBox val={s.vib_top5} top={52} left={644} w={88} h={36} fontSize={14} />
      <SolidBox val={s.vib_top6} top={52} left={769} w={89} h={36} fontSize={14} />
      <SolidBox val={s.vib_top7} top={52} left={878} w={89} h={36} fontSize={14} />
      <SolidBox val={s.vib_top8} top={52} left={988} w={89} h={36} fontSize={14} />
      <SolidBox val={s.vib_top9} top={52} left={1097} w={88} h={36} fontSize={14} />
      <SolidBox val={s.vib_top10} top={52} left={1206} w={88} h={36} fontSize={14} />
      <SolidBox val={s.vib_top11} top={52} left={1314} w={90} h={36} fontSize={14} />

      {/* --- MID ROW DIGITAL BOXES --- */}
      <SolidBox val={s.vib_top12} top={421} left={96} w={85} h={35} fontSize={14} />
      <SolidBox val={s.vib_top13} top={424} left={195} w={117} h={32} fontSize={14} />
      <SolidBox val={s.vib_top14} top={425} left={390} w={116} h={33} fontSize={14} />
      <SolidBox val={s.vib_top15} top={421} left={532} w={86} h={37} fontSize={14} />
      <SolidBox val={s.vib_top16} top={422} left={652} w={87} h={35} fontSize={14} />
      <SolidBox val={s.vib_top17} top={422} left={773} w={87} h={36} fontSize={14} />

      {/* --- 12 BLUE BAR GAUGES (VERTICAL COLUMNS) --- */}
      {/* Col 1 - XE8076A (Turbine 1X) */}
      <VibrationBarGauge value={s.vib_bar1} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={83} w={22} h={337} />
      <SolidBox val={s.vib_ch1} top={952} left={60} w={65} h={33} fontSize={13} />

      {/* Col 2 - XE8077A (Turbine 1X) */}
      <VibrationBarGauge value={s.vib_bar2} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={146} w={24} h={338} />
      <SolidBox val={s.vib_ch2} top={952} left={148} w={67} h={33} fontSize={13} />

      {/* Col 3 - XE8076B (Turbine) */}
      <VibrationBarGauge value={s.vib_bar3} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={283} w={24} h={336} />
      <SolidBox val={s.vib_ch3} top={952} left={265} w={67} h={33} fontSize={13} />

      {/* Col 4 - XE8077B (Turbine) */}
      <VibrationBarGauge value={s.vib_bar4} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={350} w={24} h={337} />
      <SolidBox val={s.vib_ch4} top={952} left={355} w={66} h={33} fontSize={13} />

      {/* Col 5 - XE8076 (Turbine) */}
      <VibrationBarGauge value={s.vib_bar5} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={600} left={570} w={24} h={336} />
      <SolidBox val={s.vib_ch5} top={952} left={552} w={67} h={33} fontSize={13} />

      {/* Col 6 - XE8077 (Turbine) */}
      <VibrationBarGauge value={s.vib_bar6} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={600} left={637} w={24} h={336} />
      <SolidBox val={s.vib_ch6} top={952} left={640} w={65} h={33} fontSize={13} />

      {/* Col 7 - XE8093 (Gearbox) */}
      <VibrationBarGauge value={s.vib_bar7} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={833} w={24} h={336} />
      <SolidBox val={s.vib_ch7} top={951} left={811} w={67} h={34} fontSize={13} />

      {/* Col 8 - XE8094 (Gearbox) */}
      <VibrationBarGauge value={s.vib_bar8} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={898} w={24} h={336} />
      <SolidBox val={s.vib_ch8} top={952} left={902} w={64} h={33} fontSize={13} />

      {/* Col 9 - XE8007X (Generator) */}
      <VibrationBarGauge value={s.vib_bar9} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={603} left={1099} w={24} h={338} />
      <SolidBox val={s.vib_ch9} top={952} left={1083} w={67} h={33} fontSize={13} />

      {/* Col 10 - XE8007Y (Generator) */}
      <VibrationBarGauge value={s.vib_bar10} max={1.0} alertThreshold={0.5} tripThreshold={0.8} top={602} left={1166} w={23} h={338} />
      <SolidBox val={s.vib_ch10} top={952} left={1170} w={66} h={33} fontSize={13} />

      {/* Col 11 - XE8009X (Generator - mil) */}
      <VibrationBarGauge value={s.vib_bar11} max={2.0} alertThreshold={1.0} tripThreshold={1.6} top={603} left={1289} w={23} h={336} />
      <SolidBox val={s.vib_ch11} top={951} left={1272} w={65} h={34} fontSize={13} />

      {/* Col 12 - XE8009Y (Generator - mil) */}
      <VibrationBarGauge value={s.vib_bar12} max={2.0} alertThreshold={1.0} tripThreshold={1.6} top={605} left={1355} w={22} h={335} />
      <SolidBox val={s.vib_ch12} top={952} left={1368} w={65} h={32} fontSize={13} />
    </div>
  );
}

export function VibrationMonitoringOverlay({ s, className }: VibrationMonitoringOverlayProps) {
  return (
    <div className="relative h-full min-h-0 w-full bg-black rounded-md overflow-hidden border border-slate-700/70">
      <ScaleToFit
        width={VIB_WIDTH}
        height={VIB_HEIGHT}
        className={className ?? "flex h-full min-h-0 w-full items-center justify-center"}
      >
        <div style={{ position: "relative", width: VIB_WIDTH, height: VIB_HEIGHT, overflow: "hidden" }}>
          <img
            src={BACKGROUND_SRC}
            alt="Vibration Monitoring Background"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            draggable={false}
          />
          <VibrationElements s={s} />
        </div>
      </ScaleToFit>
    </div>
  );
}
