# HMI Overlay Package — Untitled-design-2

Salin folder ini ke project React/TypeScript Anda.

## Pasang

```tsx
import { HmiOverlay } from './Untitled-design-2/src/HmiOverlay';
import './Untitled-design-2/src/overlay.css';

<HmiOverlay s={sensorState} />
```

`sensorState` = object dengan key sensor/status (lihat overlay-layout.json).

## Isi

| File | Fungsi |
|------|--------|
| assets/background.png | Gambar HMI |
| assets/fans/*.png | Gambar fan |
| src/HmiOverlay.tsx | Komponen utama |
| src/components/* | SolidBox, StatusTxt, PctBox, ImageOverlay |
| overlay-layout.json | Data posisi |
| hasil-overlay.png | Preview gabungan |

Canvas: 1024×576px · Fan: fan-red, fan-green
