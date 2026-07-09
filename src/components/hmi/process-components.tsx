import { SensorTagBox, VerticalMotor } from "@/components/hmi/svg";

type ActiveProps = {
  active: boolean;
};

/** Rounded 4-blade impeller like GE HMI (not sharp triangles). */
function FanImpeller({
  cx,
  cy,
  color,
  spinning,
}: {
  cx: number;
  cy: number;
  color: string;
  spinning: boolean;
}) {
  const blade = (rot: number) => {
    const rad = (rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const pts = [
      [0, -4],
      [7, -22],
      [0, -26],
      [-7, -22],
    ];
    const mapped = pts
      .map(([x, y]) => {
        const xr = x * cos - y * sin;
        const yr = x * sin + y * cos;
        return `${cx + xr},${cy + yr}`;
      })
      .join(" ");
    return <polygon points={mapped} fill={color} stroke="#111" strokeWidth={0.8} />;
  };

  return (
    <g
      className={spinning ? "hmi-fan-spin" : ""}
      style={{
        transformOrigin: `${cx}px ${cy}px`,
        animationDuration: spinning ? "0.85s" : undefined,
        animationPlayState: spinning ? "running" : "paused",
      }}
    >
      {blade(0)}
      {blade(90)}
      {blade(180)}
      {blade(270)}
      <circle cx={cx} cy={cy} r={4.5} fill="#111" />
      <circle cx={cx} cy={cy} r={2} fill="#555" />
    </g>
  );
}

function SingleFanCell({
  x,
  y,
  letter,
  bladeColor,
  spinning,
}: {
  x: number;
  y: number;
  letter: string;
  bladeColor: string;
  spinning: boolean;
}) {
  const cx = 32;
  const cy = 40;
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x={32} y={-5} textAnchor="middle" fill="#f5f5f5" fontSize="13" fontWeight="700">
        {letter}
      </text>
      <rect x={0} y={0} width={64} height={78} rx={2} fill="url(#fanCellMetal)" stroke="#1f1f1f" strokeWidth={1.5} />
      <FanImpeller cx={cx} cy={cy} color={bladeColor} spinning={spinning} />
      {spinning ? (
        <g fill="none" stroke="#f4f4f5" strokeWidth={1.5} opacity={0.95}>
          <path d={`M${cx - 20} ${cy - 16} Q${cx - 26} ${cy - 4} ${cx - 22} ${cy + 8}`} />
          <path d={`M${cx + 20} ${cy + 16} Q${cx + 26} ${cy + 4} ${cx + 22} ${cy - 8}`} />
        </g>
      ) : null}
    </g>
  );
}

function TwinFanPair({
  x,
  y,
  label,
  aRunning,
}: {
  x: number;
  y: number;
  label: string;
  aRunning: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text x={66} y={-20} textAnchor="middle" fill="#f5f5f5" fontSize="16" fontWeight="700">
        {label}
      </text>
      {/* Reference: A red RUNNING, B green STOPPED */}
      <SingleFanCell x={0} y={0} letter="A" bladeColor="#e11d1d" spinning={aRunning} />
      <SingleFanCell x={68} y={0} letter="B" bladeColor="#1db954" spinning={false} />
    </g>
  );
}

export function FanBoxLeft({ active }: ActiveProps) {
  return <TwinFanPair x={120} y={28} label="MOT-4103" aRunning={active} />;
}

export function FanBoxRight({ active }: ActiveProps) {
  return <TwinFanPair x={1030} y={28} label="MOT-4017" aRunning={active} />;
}

/** Green feed from between A/B boxes straight down into generator. */
export function FanToGeneratorLink() {
  const x = 186;
  const startY = 106;
  const tipY = 186;

  return (
    <g>
      <path d={`M${x} ${startY} V${tipY - 14}`} stroke="#1de43d" strokeWidth={4} fill="none" strokeLinecap="round" />
      <polygon points={`${x},${tipY} ${x - 8},${tipY - 14} ${x + 8},${tipY - 14}`} fill="#1de43d" />
    </g>
  );
}

const ELECTRICAL_ROWS = [
  { value: "11.8", label: "KV" },
  { value: "0.93", label: "PF" },
  { value: "10.0", label: "MVAR" },
  { value: "27.1", label: "MVA" },
  { value: "49.8", label: "Gen F (Hz)" },
  { value: "49.9", label: "Bus F (Hz)" },
] as const;

export function GeneratorBody() {
  return (
    <g>
      {/* stepped left nose like reference */}
      <rect x={78} y={210} width={10} height={52} rx={1} fill="#0a6e14" stroke="#2ede43" strokeWidth={1} />
      <rect x={88} y={204} width={14} height={64} rx={1} fill="#0f8219" stroke="#2ede43" strokeWidth={1} />
      <rect x={102} y={198} width={16} height={76} rx={1} fill="#12921d" stroke="#2ede43" strokeWidth={1.2} />

      {/* short main housing */}
      <rect x={118} y={188} width={190} height={96} rx={3} fill="url(#generatorGreen)" stroke="#2ede43" strokeWidth={2} />
      <rect x={122} y={194} width={182} height={14} rx={2} fill="#7cff88" opacity={0.18} />
      <rect x={122} y={262} width={182} height={14} rx={2} fill="#031a05" opacity={0.35} />

      <rect x={308} y={198} width={14} height={76} rx={2} fill="#0f7a18" stroke="#2ede43" strokeWidth={1.2} />
    </g>
  );
}

export function ElectricalPanel() {
  const panelX = 148;
  const panelY = 196;
  const rowH = 14;
  const chipW = 46;

  return (
    <g>
      {ELECTRICAL_ROWS.map((row, index) => {
        const y = panelY + index * rowH;
        return (
          <g key={row.label}>
            <rect x={panelX} y={y} width={chipW} height={rowH - 1} fill="#050505" stroke="#1a1a1a" strokeWidth={0.8} />
            <text x={panelX + chipW / 2} y={y + 11} textAnchor="middle" fill="#2ef059" fontSize="11" fontWeight="700">
              {row.value}
            </text>
            <text x={panelX + chipW + 6} y={y + 11} fill="#f5f5f5" fontSize="11" fontWeight="700">
              {row.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

type SensorReading = {
  tag: string;
  value: string;
  unit: string;
  boxX: number;
  boxY: number;
  tapX: number;
  tapY: number;
};

const LEFT_SENSORS: SensorReading[] = [
  { tag: "TE-0057", value: "153.8", unit: "°F", boxX: 8, boxY: 150, tapX: 78, tapY: 220 },
  { tag: "TE-0021", value: "175.8", unit: "°F", boxX: 8, boxY: 198, tapX: 78, tapY: 236 },
  { tag: "TE-0022", value: "143.6", unit: "°F", boxX: 8, boxY: 246, tapX: 78, tapY: 252 },
  { tag: "PT-0183", value: "28.9", unit: "psig", boxX: 8, boxY: 294, tapX: 88, tapY: 310 },
];

function SensorValueBox({
  tag,
  value,
  unit,
  x,
  y,
}: {
  tag: string;
  value: string;
  unit: string;
  x: number;
  y: number;
}) {
  return <SensorTagBox tag={tag} value={value} unit={unit} x={x} y={y} />;
}

function SensorLead({
  boxX,
  boxY,
  tapX,
  tapY,
}: {
  boxX: number;
  boxY: number;
  tapX: number;
  tapY: number;
}) {
  const startX = boxX + 62;
  const startY = boxY + 9;
  const elbowX = startX + 10;

  return (
    <g>
      <path d={`M${startX} ${startY} H${elbowX} V${tapY} H${tapX}`} stroke="#e8eaed" strokeWidth={1.6} fill="none" />
      <circle cx={tapX} cy={tapY} r={1.8} fill="#f4f4f5" />
    </g>
  );
}

export function GeneratorLeftSensors() {
  return (
    <g>
      {LEFT_SENSORS.map((sensor) => (
        <g key={sensor.tag}>
          <SensorLead boxX={sensor.boxX} boxY={sensor.boxY} tapX={sensor.tapX} tapY={sensor.tapY} />
          <SensorValueBox
            tag={sensor.tag}
            value={sensor.value}
            unit={sensor.unit}
            x={sensor.boxX}
            y={sensor.boxY}
          />
        </g>
      ))}
    </g>
  );
}

type BottomMotor = {
  id: string;
  running: boolean;
  cx: number;
  top: number;
};

const BOTTOM_MOTORS: BottomMotor[] = [
  { id: "MOT 0109", running: false, cx: 168, top: 358 },
  { id: "MOT 0108B", running: false, cx: 214, top: 358 },
  { id: "MOT 0108A", running: true, cx: 260, top: 358 },
  { id: "MOT 0085", running: false, cx: 322, top: 392 },
];

/** Fat metallic pipe matching GE HMI (white highlight ridge). */
function FatPipe({ d, width = 14 }: { d: string; width?: number }) {
  const outer = width + 2.5;
  const hi = Math.max(2, width * 0.32);
  return (
    <g>
      <path d={d} stroke="#6b7280" strokeWidth={outer} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#9ca3af" strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke="#ffffff" strokeWidth={hi} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.65} />
    </g>
  );
}

function AuxMotorIcon({
  cx,
  top,
  id,
  running,
}: {
  cx: number;
  top: number;
  id: string;
  running: boolean;
}) {
  return <VerticalMotor idLabel={id} running={running} x={cx - 9} y={top} />;
}

/**
 * Bottom lube-oil style piping from patokan screenshot:
 * left riser into generator nose → horizontal run → right riser into end,
 * three thin stubs to motors, MOT 0085 on stepped drop from right elbow.
 */
export function GeneratorBottomMotors() {
  // Patokan: left riser→horizontal→right riser into body;
  // 3 thin stubs; MOT 0085 drops from right riser, slightly lower/right.
  const leftX = 96;
  const rightX = 316;
  const attachY = 284;
  const runY = 338;

  const main = `M${leftX} ${attachY} V${runY} H${rightX} V${attachY}`;
  const m85 = BOTTOM_MOTORS[3];
  // from right riser, short out then down (like patokan L into MOT 0085)
  const m85path = `M${rightX} ${runY - 8} V${runY + 22} H${m85.cx} V${m85.top}`;

  return (
    <g>
      <FatPipe d={main} width={14} />
      <rect x={leftX - 5} y={attachY - 2} width={10} height={7} rx={1} fill="#e5e7eb" stroke="#9ca3af" />
      <rect x={rightX - 5} y={attachY - 2} width={10} height={7} rx={1} fill="#e5e7eb" stroke="#9ca3af" />

      {BOTTOM_MOTORS.slice(0, 3).map((motor) => (
        <path
          key={motor.id}
          d={`M${motor.cx} ${runY} V${motor.top}`}
          stroke="#d4d4d8"
          strokeWidth={2}
          fill="none"
        />
      ))}

      <FatPipe d={m85path} width={10} />

      {BOTTOM_MOTORS.map((motor) => (
        <AuxMotorIcon key={motor.id} cx={motor.cx} top={motor.top} id={motor.id} running={motor.running} />
      ))}
    </g>
  );
}

export function GeneratorSideLines() {
  return (
    <g>
      {/* upper yellow instrument line + markers */}
      <path d="M84 118 H372" stroke="#f1ea3a" strokeWidth={5} fill="none" strokeLinecap="round" />
      <circle cx={246} cy={118} r={5} fill="#ff5a3d" />
      <circle cx={286} cy={118} r={5} fill="#ff5a3d" />
      <circle cx={334} cy={118} r={5} fill="#ff5a3d" />
      <circle cx={364} cy={118} r={5} fill="#ff5a3d" />
      <text x={272} y={102} fill="#f5f5f5" fontSize={20} fontWeight={700}>
        52G
      </text>
      <text x={334} y={102} fill="#f5f5f5" fontSize={20} fontWeight={700}>
        52U
      </text>

      {/* down green arrow */}
      <path d="M116 30 V84" stroke="#1de43d" strokeWidth={5} />
      <polygon points="116,100 102,82 130,82" fill="#1de43d" />

      {/* left white small branch */}
      <path d="M74 180 H116 V232" stroke="#d6d9de" strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={84} cy={226} r={3.2} fill="#f4f4f5" />
      <circle cx={100} cy={214} r={3.2} fill="#f4f4f5" />

      {/* lower white rounded pipe */}
      <path
        d="M78 326 V420 H378 V356"
        stroke="#d9dde2"
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 326 V420 H378 V356"
        stroke="#8f949c"
        strokeWidth={3}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.55}
      />
    </g>
  );
}

export function MotorCenter() {
  return (
    <g>
      <rect x={590} y={306} width={54} height={64} rx={4} fill="#0a0a0a" stroke="#6b7280" />
      <rect x={598} y={314} width={38} height={8} rx={2} fill="#22c55e" />
      <rect x={598} y={327} width={38} height={8} rx={2} fill="#22c55e" />
      <rect x={598} y={340} width={38} height={8} rx={2} fill="#22c55e" />
      <rect x={598} y={353} width={38} height={8} rx={2} fill="#22c55e" />
      <text x={590} y={296} fill="#f4f4f5" fontSize="20" fontWeight="700">
        MOT-0129
      </text>
    </g>
  );
}

export function ShaftMain() {
  return (
    <g>
      <rect x={378} y={372} width={768} height={10} fill="url(#shaftBlue)" opacity={0.95} />
      <rect x={378} y={382} width={768} height={3} fill="#e879f9" opacity={0.65} />
      <rect x={378} y={369} width={768} height={2} fill="#dbeafe" opacity={0.7} />
      <rect x={378} y={386} width={768} height={2} fill="#1e3a8a" opacity={0.45} />
      <rect x={530} y={371} width={10} height={14} fill="#7dd3fc" opacity={0.8} />
      <rect x={712} y={371} width={10} height={14} fill="#7dd3fc" opacity={0.8} />
      <rect x={872} y={371} width={10} height={14} fill="#7dd3fc" opacity={0.8} />
    </g>
  );
}

export function TurbineCasing() {
  return (
    <g>
      <path
        d="M506 326 L588 306 L646 294 L760 286 L866 292 L934 312 L964 332 L964 430 L934 448 L866 466 L760 474 L646 466 L588 454 L506 434 Z"
        fill="url(#metalB)"
        stroke="#d5d5dd"
        strokeWidth={3}
      />
      <path
        d="M548 348 L620 332 L676 324 L760 320 L846 324 L904 338 L926 350 L926 408 L904 420 L846 434 L760 438 L676 434 L620 426 L548 412 Z"
        fill="#8d8d95"
        opacity={0.76}
      />
      <path d="M630 302 L642 468" stroke="#c4c4cc" strokeWidth={2} opacity={0.8} />
      <path d="M714 290 L720 472" stroke="#c4c4cc" strokeWidth={2} opacity={0.8} />
      <path d="M804 290 L798 472" stroke="#c4c4cc" strokeWidth={2} opacity={0.8} />
      <path d="M884 304 L870 462" stroke="#c4c4cc" strokeWidth={2} opacity={0.75} />
      <ellipse cx={640} cy={380} rx={8} ry={68} fill="#9a9aa2" opacity={0.45} />
      <ellipse cx={884} cy={380} rx={8} ry={72} fill="#9a9aa2" opacity={0.45} />
    </g>
  );
}

export function OutletCone() {
  return (
    <g>
      <path
        d="M950 336 L1018 320 L1088 324 L1138 338 L1166 356 L1166 404 L1138 422 L1088 436 L1018 440 L950 424 Z"
        fill="url(#metalA)"
        stroke="#d4d4dc"
        strokeWidth={3}
      />
      <path
        d="M1018 334 L1072 332 L1114 342 L1138 358 L1138 402 L1114 418 L1072 428 L1018 426 Z"
        fill="#8a8a92"
        opacity={0.78}
      />
      <rect x={1146} y={350} width={28} height={58} rx={8} fill="#777780" stroke="#cacad2" strokeWidth={2} />
      <ellipse cx={1146} cy={379} rx={8} ry={30} fill="#9f9fa8" opacity={0.7} />
    </g>
  );
}

export function StageMarkers() {
  return (
    <g fill="#f59e0b">
      <polygon points="998,364 1012,370 998,376 984,370" />
      <polygon points="1030,364 1044,370 1030,376 1016,370" />
      <polygon points="998,392 1012,398 998,404 984,398" />
      <polygon points="1030,392 1044,398 1030,404 1016,398" />
    </g>
  );
}

export function VerticalMarkers({ active }: ActiveProps) {
  return (
    <g className={active ? "hmi-shaft-glow" : ""} filter="url(#softGlow)">
      <rect x={704} y={344} width={8} height={76} fill="#22c55e" opacity={0.9} />
      <rect x={844} y={344} width={8} height={76} fill="#22c55e" opacity={0.9} />
    </g>
  );
}

export function TopValveSet() {
  return (
    <g>
      <path d="M560 104 L560 164 L890 164 L890 286" stroke="#d1d5db" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M600 104 L600 164" stroke="#d1d5db" strokeWidth={8} fill="none" />
      <path d="M640 104 L640 164" stroke="#d1d5db" strokeWidth={8} fill="none" />
      <path d="M560 104 L640 104" stroke="#d1d5db" strokeWidth={8} fill="none" />
      <polygon points="540,148 554,156 540,164 526,156" fill="#f87171" />
      <polygon points="586,148 600,156 586,164 572,156" fill="#f87171" />
      <polygon points="632,148 646,156 632,164 618,156" fill="#22c55e" />
    </g>
  );
}

export function BottomValveSet() {
  return (
    <g>
      <path d="M614 452 L614 502 L566 502" stroke="#d1d5db" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M566 502 L566 532 L470 532" stroke="#d1d5db" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M798 452 L798 510 L926 510 L926 562" stroke="#d1d5db" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M926 562 L1084 562" stroke="#d1d5db" strokeWidth={9} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function PumpMotorSet() {
  return (
    <g transform="translate(470 510)">
      <rect x={0} y={0} width={72} height={26} rx={12} fill="#8f949e" />
      <circle cx={58} cy={13} r={11} fill="#22c55e" />
      <rect x={122} y={0} width={72} height={26} rx={12} fill="#8f949e" />
      <circle cx={136} cy={13} r={11} fill="#22c55e" />
      <text x={0} y={46} fill="#f4f4f5" fontSize={14} fontWeight={700}>
        MOT-2100
      </text>
    </g>
  );
}
