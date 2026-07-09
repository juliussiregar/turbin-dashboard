// HMI Overlay — Untitled-design-2
// Canvas: 1024×576px

import backgroundImg from '../assets/background.png';
import '../overlay.css';
import { SolidBox } from './components/SolidBox';
import { StatusTxt } from './components/StatusTxt';
import { PctBox } from './components/PctBox';
import { ImageOverlay } from './components/ImageOverlay';

export type HmiSensorState = Record<string, string | number | boolean>;

export interface HmiOverlayProps {
  s: HmiSensorState;
  className?: string;
}

export function HmiOverlay({ s, className }: HmiOverlayProps) {
  return (
    <div
      className={className}
      style={{ position: 'relative', width: 1024, height: 576, overflow: 'hidden' }}
    >
      <img
        src={backgroundImg}
        alt="HMI Background"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        draggable={false}
      />
      <div style={{ position: 'absolute', inset: 0 }}>
        <SolidBox val={s.te0057} top={162} left={30} w={89} h={29} fontSize={13} />
        <SolidBox val={s.te0021} top={226} left={31} w={90} h={30} fontSize={13} />
        <SolidBox val={s.te0022} top={290} left={31} w={90} h={29} fontSize={13} />
        <SolidBox val={s.pt0183} top={363} left={32} w={101} h={29} fontSize={13} />
        <SolidBox val={s.te0023} top={119} left={287} w={90} h={30} fontSize={13} />
        <SolidBox val={s.gen_kv} top={233} left={194} w={73} h={22} fontSize={13} />
        <SolidBox val={s.gen_pf} top={254} left={194} w={73} h={25} fontSize={13} />
        <SolidBox val={s.gen_mvar} top={279} left={194} w={73} h={26} fontSize={13} />
        <SolidBox val={s.gen_mva} top={303} left={194} w={73} h={25} fontSize={13} />
        <SolidBox val={s.gen_f} top={328} left={194} w={73} h={25} fontSize={13} />
        <SolidBox val={s.bus_f} top={353} left={194} w={73} h={23} fontSize={13} />
        <StatusTxt text={s.mot0109 ? "RUN" : "STOP"} top={457} left={137} w={60} h={20} fontSize={12} isRed={s.mot0109} />
        <StatusTxt text={s.mot0108b ? "RUN" : "STOP"} top={457} left={197} w={60} h={20} fontSize={12} isRed={s.mot0108b} />
        <StatusTxt text={s.mot0108a ? "RUN" : "STOP"} top={457} left={257} w={60} h={20} fontSize={12} isRed={s.mot0108a} />
        <StatusTxt text={s.mot0085 ? "RUN" : "STOP"} top={476} left={326} w={60} h={20} fontSize={12} isRed={s.mot0085} />
        <SolidBox val={s.te0079} top={202} left={408} w={86} h={27} fontSize={13} />
        <SolidBox val={s.te0080} top={201} left={520} w={88} h={29} fontSize={13} />
        <SolidBox val={s.te0082} top={362} left={403} w={86} h={28} fontSize={13} />
        <SolidBox val={s.te0081} top={361} left={509} w={86} h={28} fontSize={13} />
        <StatusTxt text={s.mot0129 ? "RUN" : "STOP"} top={306} left={518} w={45} h={20} fontSize={12} isRed={s.mot0129} />
        <StatusTxt text={s.mot2100 ? "RUN" : "STOP"} top={438} left={531} w={56} h={21} fontSize={12} isRed={s.mot2100} />
        <StatusTxt text={s.motNox ? "RUN" : "STOP"} top={444} left={712} w={55} h={20} fontSize={12} isRed={s.motNox} />
        <StatusTxt text={s.motNox2 ? "RUN" : "STOP"} top={503} left={712} w={55} h={22} fontSize={12} isRed={s.motNox2} />
        <StatusTxt text={s.sov2110 ? "RUN" : "STOP"} top={412} left={575} w={46} h={20} fontSize={12} isRed={s.sov2110} />
        <SolidBox val={s.vigv} top={387} left={676} w={45} h={23} fontSize={13} />
        <SolidBox val={s.vbv} top={365} left={729} w={48} h={23} fontSize={13} />
        <SolidBox val={s.vsv} top={363} left={788} w={45} h={25} fontSize={13} />
        <StatusTxt text={s.vGas1 ? "RUN" : "STOP"} top={146} left={511} w={45} h={20} fontSize={12} isRed={s.vGas1} />
        <StatusTxt text={s.vGas2 ? "RUN" : "STOP"} top={144} left={606} w={45} h={20} fontSize={12} isRed={s.vGas2} />
        <StatusTxt text={s.vGas3 ? "RUN" : "STOP"} top={145} left={694} w={45} h={20} fontSize={12} isRed={s.vGas3} />
        <StatusTxt text={s.vGas4 ? "RUN" : "STOP"} top={68} left={586} w={45} h={20} fontSize={12} isRed={s.vGas4} />
        <StatusTxt text={s.vGas6 ? "RUN" : "STOP"} top={68} left={676} w={45} h={20} fontSize={12} isRed={s.vGas6} />
        <PctBox val={s.dmd1} top={169} left={678} w={38} />
        <PctBox val={s.fb1} top={184} left={678} w={38} />
        <PctBox val={s.dmd2} top={168} left={815} w={38} />
        <PctBox val={s.fb2} top={183} left={815} w={38} />
        <PctBox val={s.dmd} top={530} left={820} w={35} />
        <PctBox val={s.dmd3} top={530} left={820} w={35} />
        <PctBox val={s.fb3} top={543} left={820} w={35} />
        <StatusTxt text={s.fcv2019 ? "RUN" : "STOP"} top={510} left={876} w={38} h={21} fontSize={12} isRed={s.fcv2019} />
        <StatusTxt text={s.mot6015 ? "RUN" : "STOP"} top={401} left={869} w={63} h={23} fontSize={12} isRed={s.mot6015} />
        <ImageOverlay asset="fan-red" top={65} left={96} w={53} h={53} animateRotate={true} pivotX={50} pivotY={50} />
        <ImageOverlay asset="fan-green" top={60} left={156} w={68} h={64} animateRotate={true} pivotX={50} pivotY={50} />
        <ImageOverlay asset="fan-green" top={56} left={938} w={65} h={67} animateRotate={true} pivotX={50} pivotY={50} />
        <ImageOverlay asset="fan-red" top={64} left={875} w={54} h={53} animateRotate={true} pivotX={50} pivotY={50} />
      </div>
    </div>
  );
}

export default HmiOverlay;
