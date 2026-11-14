import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {actFrames, acts, durationInFrames} from './script';

const K = {
  night: '#111827',
  blue: '#4A90E2',
  blueLight: '#87BCEB',
  paper: '#F3F6F9',
  paperLight: '#F8F9FA',
  paperShade: '#D7DEE7',
  ink: '#111111',
  red: '#FF8DA1',
  redDark: '#D96A81',
  gold: '#EDB85E',
  green: '#86A989',
  sky: '#B9D7D1',
  lilac: '#AAA1C3',
};

const fps = 30;
const ease = (frame: number, start: number, length = 20) =>
  interpolate(frame, [start, start + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
const sweep = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
const cueFrame = (actIndex: number, cueIndex: number) =>
  Math.round(acts[actIndex].captions[cueIndex].start * fps);
const floatY = (frame: number, speed = 0.035, amount = 8) =>
  Math.sin(frame * speed) * amount;

const ParentAndChild = ({
  x,
  y,
  scale = 1,
  coat = K.red,
  childCoat = K.gold,
}: {
  x: number;
  y: number;
  scale?: number;
  coat?: string;
  childCoat?: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <ellipse cx="93" cy="251" rx="111" ry="15" fill="#101D30" opacity=".16" />
    <path d="M53 125Q39 132 28 168L9 231Q5 248 20 254L37 260Q49 264 54 248L79 193 89 250Q92 267 110 267H151Q168 267 165 249L146 176Q139 145 123 133Z" fill={coat} />
    <path d="M55 139 24 177Q14 191 24 199L37 207Q47 212 55 201L83 170" fill={coat} />
    <path d="M117 143Q137 148 157 166L182 190Q193 202 182 212L168 222Q156 228 146 216L117 193" fill={coat} />
    <circle cx="92" cy="81" r="44" fill={K.paperShade} />
    <path d="M51 78Q51 27 91 27Q129 28 136 67L126 60Q108 44 87 49Q71 56 52 89Z" fill={K.night} />
    <circle cx="77" cy="85" r="3" fill={K.ink} />
    <circle cx="105" cy="85" r="3" fill={K.ink} />
    <path d="M81 105Q92 113 103 104" fill="none" stroke={K.redDark} strokeWidth="3" strokeLinecap="round" />
    <g transform="translate(103 116) rotate(-17)">
      <path d="M-1 35Q-18 17-11 0Q-5-14 8-7Q19-17 30-7Q48 11 22 37Z" fill={childCoat} />
      <circle cx="13" cy="-2" r="20" fill={K.paperLight} />
      <path d="M-6-12Q2-31 22-21Q34-15 33 0Q20-9 10-9Q3-5-6-12Z" fill={K.night} />
      <circle cx="7" cy="2" r="1.8" fill={K.ink} />
      <circle cx="20" cy="2" r="1.8" fill={K.ink} />
      <path d="M9 10q5 4 9 0" fill="none" stroke={K.redDark} strokeWidth="2" strokeLinecap="round" />
    </g>
    <path d="M28 257h36m70 0h29" stroke={K.night} strokeWidth="10" strokeLinecap="round" />
  </g>
);

const Notebook = ({frame, openAt, memoryAt, fragileAt}: {frame: number; openAt: number; memoryAt: number; fragileAt: number}) => {
  const opening = spring({
    frame: Math.max(0, frame - openAt),
    fps,
    config: {damping: 18, stiffness: 70, mass: 1.15},
  });
  const memory = spring({
    frame: Math.max(0, frame - memoryAt),
    fps,
    config: {damping: 13, stiffness: 125, mass: .8},
  });
  const fragile = ease(frame, fragileAt, 20);
  const writing = ease(frame, openAt + 12, 24);
  const growthReveal = ease(frame, openAt + 26, 42);
  const pageLift = (1 - opening) * 55;
  return (
    <g transform={`translate(685 245) scale(1.08) rotate(-4 340 260)`}>
      <defs>
        <clipPath id="baby-book-left-page">
          <path d="M30 80Q50 54 100 59L337 87V505L94 472Q43 468 30 493Z" />
        </clipPath>
        <clipPath id="baby-book-right-page">
          <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" />
        </clipPath>
      </defs>
      <path d="M30 80Q50 54 100 59L337 87V505L94 472Q43 468 30 493Z" fill="#B7966B" />
      <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" fill="#B7966B" transform="translate(8 8)" />
      <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" fill="#FFFCF5" stroke="#D9C6A7" strokeWidth="2" />
      <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" fill="#F4EBD8" transform={`translate(0 ${pageLift})`} />
      <path d="M30 80Q50 54 100 59L337 87V505L94 472Q43 468 30 493Z" fill="#FFFCF5" stroke="#D9C6A7" strokeWidth="2" />
      <path d="M337 87V505" stroke={K.redDark} strokeWidth="9" />
      <g clipPath="url(#baby-book-left-page)">
        <g opacity={writing}>
          <text x="54" y="108" fill={K.blue} fontSize="19" fontFamily="Georgia" fontStyle="italic">My first years</text>
          <text x="54" y="130" fill="#8A7963" fontSize="10" fontFamily="Arial" fontWeight="700" letterSpacing="1.2">LITTLE MOMENTS, KEPT CLOSE</text>
          <path d="M54 139H303" stroke="#D8C6A9" strokeWidth="2" />
          <g opacity={memory} transform={`translate(69 ${158 + (1 - memory) * 18}) scale(${interpolate(memory, [0, 1], [.78, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}>
            <rect x="0" y="0" width="220" height="202" fill="#FFFDF8" stroke="#D9C6A7" strokeWidth="2" />
            <rect x="10" y="10" width="200" height="137" fill="#DDE9E7" />
            <path d="M10 114Q50 75 84 108t63-1 63 8v32H10Z" fill="#8DAF9B" />
            <circle cx="162" cy="42" r="17" fill={K.gold} />
            <path d="M47 132q4-49 47-49t47 49" fill={K.blueLight} />
            <circle cx="94" cy="69" r="25" fill="#F8F1E5" />
            <path d="M69 68q4-29 28-29 23 0 25 25-15-10-28-7-12 8-25 11Z" fill={K.night} />
            <circle cx="86" cy="71" r="2" fill={K.ink} />
            <circle cx="102" cy="71" r="2" fill={K.ink} />
            <path d="M88 82q7 6 13 0" fill="none" stroke={K.redDark} strokeWidth="2" strokeLinecap="round" />
            <circle cx="190" cy="167" r="9" fill={K.red} />
            <path d="M188 167h4m-2-2v4" stroke={K.paperLight} strokeWidth="1.5" strokeLinecap="round" />
            <text x="14" y="174" fill={K.ink} fontSize="14" fontFamily="Georgia" fontStyle="italic">A favorite day</text>
            <text x="14" y="191" fill="#8A7963" fontSize="9" fontFamily="Arial" fontWeight="700" letterSpacing="1">FAMILY MEMORY</text>
          </g>
          <g opacity={writing * (1 - memory)}>
            <path d="M65 225h218M65 258h180M65 291h202M65 324h166M65 357h192" stroke="#D8C6A9" strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - writing} />
          </g>
          <g opacity={memory}>
            <path d="M58 401h100" stroke={K.red} strokeWidth="3" strokeLinecap="round" />
            <text x="58" y="426" fill={K.blue} fontSize="16" fontFamily="Georgia" fontStyle="italic">First steps</text>
            <text x="58" y="446" fill="#8A7963" fontSize="10" fontFamily="Arial" fontWeight="700" letterSpacing="1">A NEW LITTLE ADVENTURE</text>
            <path d="M58 459h230" stroke="#D8C6A9" strokeWidth="2" />
          </g>
        </g>
      </g>
      <g clipPath="url(#baby-book-right-page)" opacity={writing}>
        <text x="365" y="112" fill={K.redDark} fontSize="12" fontFamily="Arial" fontWeight="700" letterSpacing="1.2">HEALTH &amp; GROWTH</text>
        <text x="365" y="137" fill="#7D7162" fontSize="10" fontFamily="Arial" fontWeight="700" letterSpacing=".8">A RECORD OF THE FIRST YEAR</text>
        <path d="M365 148H614" stroke="#D2BE9E" strokeWidth="2" />
        <g>
          <rect x="368" y="163" width="238" height="190" fill="#FFFCF5" stroke="#D8C6A9" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M382 ${195 + i * 36}H593`} stroke="#D9D2C5" strokeWidth="1.5" strokeDasharray="3 7" />
          ))}
          <path d="M382 181V333M593 181V333" stroke="#D9D2C5" strokeWidth="1.5" />
          <path d="M382 314C418 304 443 294 466 278S522 251 593 235" fill="none" stroke={K.blue} strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - growthReveal} />
          <path d="M382 325C420 316 444 310 470 292S531 272 593 259" fill="none" stroke={K.red} strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - growthReveal} />
          <path d="M382 292C420 289 450 284 476 276S540 266 593 244" fill="none" stroke={K.green} strokeWidth="3" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - growthReveal} />
          {[382, 452, 523, 593].map((x, i) => (
            <g key={x} opacity={ease(frame, openAt + 34 + i * 5, 10)}>
              <circle cx={x} cy={314 - i * 26} r="5" fill={K.paperLight} stroke={K.blue} strokeWidth="3" />
              <circle cx={x} cy={325 - i * 22} r="4" fill={K.paperLight} stroke={K.red} strokeWidth="2.5" />
            </g>
          ))}
          <text x="382" y="346" fill="#817663" fontSize="9" fontFamily="Arial" fontWeight="700">BIRTH</text>
          <text x="593" y="346" textAnchor="end" fill="#817663" fontSize="9" fontFamily="Arial" fontWeight="700">12 MONTHS</text>
        </g>
        <g transform="translate(370 379)">
          <circle cx="4" cy="0" r="4" fill={K.blue} />
          <text x="13" y="4" fill="#52677D" fontSize="10" fontFamily="Arial" fontWeight="700">weight</text>
          <circle cx="88" cy="0" r="4" fill={K.red} />
          <text x="97" y="4" fill="#52677D" fontSize="10" fontFamily="Arial" fontWeight="700">length</text>
          <circle cx="171" cy="0" r="4" fill={K.green} />
          <text x="180" y="4" fill="#52677D" fontSize="10" fontFamily="Arial" fontWeight="700">head</text>
        </g>
        <path d="M370 412H603" stroke="#D2BE9E" strokeWidth="2" />
        <text x="370" y="438" fill={K.blue} fontSize="13" fontFamily="Georgia" fontStyle="italic">Measured with care.</text>
      </g>
      <g opacity={fragile}>
        <path d="M582 58 649 78 645 122Q625 102 590 100Z" fill={K.paperShade} />
        <path d="M582 58Q615 83 645 122" fill="none" stroke={K.red} strokeWidth="4" strokeDasharray="1" pathLength="1" strokeDashoffset={1 - fragile} />
        <path d="M590 100Q615 82 645 122" fill="none" stroke="#BDAA8A" strokeWidth="2" />
        <path d="M30 493Q56 467 94 472L101 501Q62 491 30 493Z" fill="#EEE3D2" />
        <path d="M30 493Q63 488 101 501" fill="none" stroke="#BDAA8A" strokeWidth="2" />
        <path d="M400 236q48 9 104-8" fill="none" stroke="#52677D" strokeWidth="10" strokeLinecap="round" opacity=".25" filter="url(#act-one-ink-smudge)" />
        <path d="M434 253h79" fill="none" stroke="#52677D" strokeWidth="5" strokeLinecap="round" opacity=".2" filter="url(#act-one-ink-smudge)" />
      </g>
    </g>
  );
};

const GrowthLine = ({progress}: {progress: number}) => (
  <g>
    <path d="M0 114H390M0 166H390M0 218H390M0 270H390" stroke="#D3C4A8" strokeWidth="2" strokeDasharray="4 10" />
    <path d="M24 247C71 232 99 230 136 216S204 194 238 179 300 149 370 113" fill="none" stroke={K.blueLight} strokeWidth="4" strokeDasharray="7 8" />
    <path d="M24 267C70 255 100 246 136 249S204 217 238 225 307 194 370 174" fill="none" stroke={K.red} strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - progress} />
    {[[24, 267], [136, 249], [238, 225], [370, 174]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="8" fill={K.paperLight} stroke={K.red} strokeWidth="4" opacity={progress > i / 4 ? 1 : 0} />
    ))}
  </g>
);

const TinyMemory = ({x, y, rotate, color, kind, caption, completed}: {x: number; y: number; rotate: number; color: string; kind: number; caption?: string; completed?: number}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate} 118 92)`}>
    <rect x="0" y="0" width="236" height="184" rx="4" fill={K.paperLight} />
    <rect x="13" y="13" width="210" height="127" fill={color} />
    {kind === 0 && (
      <>
        <circle cx="104" cy="65" r="27" fill={K.paper} />
        <path d="M52 127q7-45 54-45t57 45" fill={K.blue} />
        <circle cx="170" cy="48" r="15" fill={K.gold} />
      </>
    )}
    {kind === 1 && (
      <>
        <path d="M43 112 89 60l32 35 33-50 45 67Z" fill={K.green} />
        <circle cx="174" cy="40" r="14" fill={K.gold} />
      </>
    )}
    {kind === 2 && (
      <>
        <circle cx="120" cy="64" r="24" fill={K.paper} />
        <path d="M65 127q4-45 54-45t54 45" fill={K.red} />
        <path d="M96 60q24-34 48 0" fill="none" stroke={K.night} strokeWidth="8" />
      </>
    )}
    <path d="M26 158H172" stroke={K.paperShade} strokeWidth="3" />
    <circle cx="198" cy="157" r="5" fill={K.red} />
    {caption && <text x="26" y="176" fill={K.ink} fontFamily="Georgia" fontSize="14" fontStyle="italic">{caption}</text>}
    {completed !== undefined && (
      <g opacity={completed} transform="translate(202 28)">
        <circle r="13" fill={K.green} />
        <path d="m-6 0 4 4 8-9" fill="none" stroke={K.paperLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    )}
  </g>
);

const QrMark = ({size, progress}: {size: number; progress: number}) => {
  const cells: React.ReactNode[] = [];
  const width = 25;
  for (let y = 0; y < width; y++) {
    for (let x = 0; x < width; x++) {
      const inFinder =
        (x < 7 && y < 7) ||
        (x >= width - 7 && y < 7) ||
        (x < 7 && y >= width - 7);
      let on = ((x * 17 + y * 31 + x * y * 7) % 11) < 5;
      if (inFinder) {
        const fx = x < 7 ? x : x - (width - 7);
        const fy = y < 7 ? y : y - (width - 7);
        on = fx === 0 || fx === 6 || fy === 0 || fy === 6 ||
          (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4);
      }
      const buildOrder = (x * 97 + y * 193 + x * y * 17) % (width * width);
      if (on && (inFinder ? progress > 0.025 : buildOrder / (width * width) < progress)) {
        cells.push(<rect key={`${x}-${y}`} x={x + 2} y={y + 2} width=".78" height=".78" rx=".08" fill={K.ink} />);
      }
    }
  }
  return (
    <svg viewBox="0 0 29 29" width={size} height={size} shapeRendering="crispEdges">
      <rect width="29" height="29" rx="1" fill={K.paperLight} />
      {cells}
    </svg>
  );
};

const ActOne = ({frame}: {frame: number}) => {
  const bookAt = cueFrame(0, 1);
  const notebooksAt = bookAt + 74;
  const cardAt = bookAt + 150;
  const memoryAt = cueFrame(0, 2);
  const fragileAt = cueFrame(0, 3);
  const scatterAt = cueFrame(0, 4);
  const clinicAt = cueFrame(0, 5);
  const open = ease(frame, bookAt, 34);
  const cardReveal = ease(frame, cardAt, 26);
  const archiveFade = 1 - ease(frame, fragileAt, 24);
  const timelineExit = ease(frame, bookAt - 28, 22);
  const growthDraw = sweep(frame, 12, 190);
  const scatter = ease(frame, scatterAt, 30);
  const paperExit = ease(frame, clinicAt - 18, 24);
  const clinic = ease(frame, clinicAt, 28);
  const notebookStack = ease(frame, notebooksAt, 24) * archiveFade * (1 - clinic);
  const redLine = sweep(frame, cueFrame(0, 6), cueFrame(0, 7));
  const notebookFade = 1 - ease(frame, clinicAt, 26);
  const immunization = cardReveal * (1 - ease(frame, scatterAt, 24)) * (1 - clinic);
  const warning = ease(frame, cueFrame(0, 6), 22);

  return (
    <AbsoluteFill style={{background: '#F8F9FA', color: K.ink, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(112deg, rgba(74,144,226,.10), transparent 38%), radial-gradient(ellipse at 84% 38%, rgba(255,141,161,.14), transparent 31%), repeating-linear-gradient(5deg, transparent 0 62px, rgba(124,142,159,.035) 63px 64px)'}} />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="act-one-ink-smudge">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="act-one-paper-shadow" x="-30%" y="-30%" width="160%" height="170%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
          <linearGradient id="act-one-growth-line" x1="0" x2="1">
            <stop offset="0%" stopColor={K.blue} />
            <stop offset="56%" stopColor={K.blueLight} />
            <stop offset="100%" stopColor={K.red} />
          </linearGradient>
          <linearGradient id="act-one-growth-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={K.blue} stopOpacity=".16" />
            <stop offset="100%" stopColor={K.blue} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 790Q415 742 830 785T1920 768V1080H0Z" fill="#E8EDF3" />
        <path d="M0 786Q415 738 830 781T1920 764" fill="none" stroke="#B8C6D4" strokeWidth="3" />
        <text x="110" y="146" fill={K.blue} fontSize="20" fontFamily="Arial" fontWeight="700" letterSpacing="4">A CHILDHOOD, ONE PAGE AT A TIME</text>
        <text x="104" y="262" fill={K.ink} fontSize="100" fontFamily="Georgia" fontWeight="700">Six years.</text>
        <text x="112" y="318" fill="#52677D" fontSize="25" fontFamily="Arial">A thousand little things to remember.</text>
        <g opacity={1 - timelineExit} transform={`translate(0 ${timelineExit * -18})`}>
          <text x="146" y="406" fill="#52677D" fontSize="15" fontFamily="Arial" fontWeight="700" letterSpacing="2">GROWTH, MILESTONES &amp; HEALTH</text>
          <path d="M148 715H1772" stroke="#A9B8C7" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M148 ${670 - i * 74}H1772`} stroke="#A9B8C7" strokeWidth="1.5" strokeDasharray="3 12" opacity=".34" />
          ))}
          <path d="M150 690C250 676 330 653 420 642S600 613 690 600 870 571 960 555 1140 526 1230 510 1410 479 1500 465 1680 437 1770 425V715H150Z" fill="url(#act-one-growth-fill)" opacity={growthDraw} />
          <path d="M150 690C250 676 330 653 420 642S600 613 690 600 870 571 960 555 1140 526 1230 510 1410 479 1500 465 1680 437 1770 425" fill="none" stroke="#A9B8C7" strokeWidth="5" strokeLinecap="round" opacity=".35" />
          <path d="M150 690C250 676 330 653 420 642S600 613 690 600 870 571 960 555 1140 526 1230 510 1410 479 1500 465 1680 437 1770 425" fill="none" stroke="url(#act-one-growth-line)" strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - growthDraw} />
          {[
            {year: 'BIRTH', x: 150, y: 690, label: ''},
            {year: '1 YEAR', x: 420, y: 642, label: 'FIRST STEPS'},
            {year: '2 YEARS', x: 690, y: 600, label: ''},
            {year: '3 YEARS', x: 960, y: 555, label: 'NEW MILESTONES'},
            {year: '4 YEARS', x: 1230, y: 510, label: ''},
            {year: '5 YEARS', x: 1500, y: 465, label: 'HEALTH CHECKS'},
            {year: '6 YEARS', x: 1770, y: 425, label: ''},
          ].map(({year, x, y, label}, i) => {
            const appear = spring({frame: Math.max(0, frame - 12 - i * 24), fps, config: {damping: 15, stiffness: 120}});
            const color = [K.red, K.gold, K.blueLight, K.green, K.lilac, K.red, K.blue][i];
            const radius = 11 + i * 1.15;
            return (
              <g key={year} opacity={appear} transform={`translate(${x} ${y}) scale(${interpolate(appear, [0, 1], [.55, 1])})`}>
                <path d={`M0 0V${715 - y}`} stroke={color} strokeWidth="2" opacity=".5" />
                <circle r={radius + 8} fill={color} opacity=".13" />
                <circle r={radius} fill={K.paperLight} stroke={color} strokeWidth="6" />
                <circle r="4" fill={color} />
                <text x="0" y="52" textAnchor="middle" fill="#52677D" fontSize="14" fontFamily="Arial" fontWeight="700" letterSpacing="1">{year}</text>
                {label && (
                  <g transform={`translate(-91 ${-104 - (i === 5 ? 2 : 0)})`}>
                    <rect width="182" height="36" rx="18" fill={K.paperLight} stroke={color} strokeWidth="2" />
                    {i === 1 && <path d="M18 22q-9-8 0-16 7 0 8 6 2-6 9-6 9 8 0 16l-9 7Z" transform="translate(0 1) scale(.58)" fill={K.red} />}
                    {i === 3 && <path d="M15 19l7-7 6 5 10-11" fill="none" stroke={K.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                    {i === 5 && <path d="M14 18h6l4-9 6 17 5-10h8" fill="none" stroke={K.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                    <text x="54" y="23" fill={K.ink} fontSize="12" fontFamily="Arial" fontWeight="700" letterSpacing=".5">{label}</text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
        <g opacity={open * notebookFade} transform={`translate(0 ${interpolate(open, [0, 1], [92, 0]) + floatY(frame, .018, 4)}) scale(${interpolate(open, [0, 1], [.94, 1])})`}>
          <ellipse cx="1048" cy="510" rx="370" ry="260" fill="#52677D" opacity=".14" filter="url(#act-one-paper-shadow)" />
          <Notebook frame={frame} openAt={bookAt} memoryAt={memoryAt} fragileAt={fragileAt} />
        </g>
        <g opacity={notebookStack} transform={`translate(${interpolate(notebookStack, [0, 1], [-70, 0])} ${floatY(frame + 7, .025, 2)})`}>
          <g transform="translate(95 520) rotate(-3 178 112) scale(.72)">
            <path d="M12 16Q12 8 22 8H334Q344 8 344 18V220H12Z" fill="#D9C6A7" transform="translate(8 8)" />
            <path d="M12 16Q12 8 22 8H334Q344 8 344 18V220H12Z" fill="#FFFCF5" stroke="#C9B493" strokeWidth="3" />
            <path d="M26 41h288" stroke={K.blue} strokeWidth="7" strokeLinecap="round" />
            <text x="34" y="78" fill={K.ink} fontFamily="Georgia" fontSize="24" fontWeight="700">Baby notes</text>
            <path d="M34 111h250M34 143h221M34 175h237" stroke="#C9B493" strokeWidth="4" strokeLinecap="round" />
            <path d="M314 8v212" stroke={K.red} strokeWidth="8" />
          </g>
          <g transform="translate(365 527) rotate(2 130 72) scale(.8)">
            <path d="M0 0h238v146H0Z" fill={K.paperLight} stroke="#C8D6E4" strokeWidth="3" />
            <text x="18" y="31" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="1">GROWTH LOG</text>
            <path d="M18 53h196M18 77h166M18 101h188" stroke="#C9D6E2" strokeWidth="3" />
            <circle cx="203" cy="119" r="11" fill={K.red} opacity=".82" />
          </g>
        </g>
        <g opacity={immunization * archiveFade} transform={`translate(${interpolate(cardReveal, [0, 1], [1980, 1430]) + floatY(frame + 20, .026, 3)} ${420 + floatY(frame, .024, 3)}) rotate(${interpolate(cardReveal, [0, 1], [11, 4])} 107 74) scale(${interpolate(cardReveal, [0, 1], [.86, 1.12])})`}>
          <path d="M8 10h214v148H8Z" fill="#121C2B" opacity=".16" transform="translate(7 8)" filter="url(#act-one-paper-shadow)" />
          <path d="M0 0h214v148H0Z" fill={K.paperLight} stroke="#CCD7E3" strokeWidth="3" />
          <path d="M0 0h214v28H0Z" fill={K.blue} />
          <text x="12" y="18" fill={K.paperLight} fontFamily="Arial" fontSize="10" fontWeight="700" letterSpacing=".4">PHILIPPINES / DOH</text>
          <text x="14" y="48" fill={K.blue} fontFamily="Arial" fontSize="11" fontWeight="700">CHILD IMMUNIZATION RECORD</text>
          <text x="15" y="67" fill="#52677D" fontFamily="Arial" fontSize="8" fontWeight="700">VACCINE / DATE / HEALTH CENTER</text>
          <path d="M15 84h180M15 106h180M15 128h132" stroke="#B9C8D6" strokeWidth="3" />
          <circle cx="185" cy="118" r="9" fill={K.red} />
          <path d="m177 140 30-22 7 30Z" fill={K.paperShade} />
        </g>
        <g opacity={scatter * (1 - paperExit)}>
          <g transform={`translate(${interpolate(scatter, [0, 1], [980, 470]) + paperExit * 180} ${interpolate(scatter, [0, 1], [450, 390]) + floatY(frame, .05, 5) * scatter}) rotate(${interpolate(scatter, [0, 1], [0, -13]) + Math.sin(frame * .045) * 1.5 * scatter})`}>
            <path d="M0 0h196v130H0Z" fill={K.paper} />
            <path d="M20 28h152M20 49h112M20 72h150M20 96h89" stroke="#BDAA8A" strokeWidth="4" />
            <path d="M174 0h22v24q-13-7-22-15Z" fill="#E2E8EF" />
            <path d="M174 0q1 15 22 24" fill="none" stroke="#B8C6D4" strokeWidth="2" />
            <path d="M34 59q31-8 56 1" fill="none" stroke="#52677D" strokeWidth="9" opacity=".2" strokeLinecap="round" filter="url(#act-one-ink-smudge)" />
            <circle cx="156" cy="99" r="11" fill={K.red} />
          </g>
          <g transform={`translate(${interpolate(scatter, [0, 1], [1090, 1360]) + paperExit * 180} ${interpolate(scatter, [0, 1], [520, 360]) + floatY(frame + 12, .05, 6) * scatter}) rotate(${interpolate(scatter, [0, 1], [0, 8]) + Math.sin(frame * .04 + 1) * 1.5 * scatter})`}>
            <path d="M0 0h170v120H0Z" fill="#D9E5DD" />
            <text x="18" y="35" fill={K.blue} fontSize="13" fontFamily="Arial" fontWeight="700">VACCINE RECORD</text>
            <path d="M18 53h132M18 75h132M18 97h88" stroke="#96AFA7" strokeWidth="3" />
            <path d="M149 0h21v22q-9-5-21-13Z" fill="#C4D5CC" />
            <path d="M149 0q4 13 21 22" fill="none" stroke="#91A99F" strokeWidth="2" />
          </g>
          <g transform={`translate(${interpolate(scatter, [0, 1], [1130, 1510]) + paperExit * 180} ${interpolate(scatter, [0, 1], [560, 540]) + floatY(frame + 23, .052, 6) * scatter}) rotate(${interpolate(scatter, [0, 1], [0, -7]) + Math.sin(frame * .047 + 2) * 1.5 * scatter})`}>
            <path d="M0 0h154v108H0Z" fill="#E9B85F" />
            <path d="M18 24h118M18 46h96M18 68h111" stroke="#A57D42" strokeWidth="3" />
            <path d="M132 0h22v22q-9-5-22-13Z" fill="#F7D796" />
            <path d="M132 0q4 13 22 22" fill="none" stroke="#D1A959" strokeWidth="2" />
            <circle cx="123" cy="83" r="9" fill={K.red} />
          </g>
        </g>
        <g opacity={clinic} transform={`translate(${interpolate(clinic, [0, 1], [120, -140])} 0) translate(1597 0) scale(1.18 1.05) translate(-1597 0)`}>
          <path d="M1420 355h354v365h-354Z" fill="#101D30" stroke="#7C8792" strokeWidth="4" />
          <path d="M1460 404h274M1460 448h210M1460 492h245" stroke="#728493" strokeWidth="4" strokeDasharray="8 10" />
          <text x="1460" y="323" fill={K.ink} fontSize="18" fontFamily="Arial" fontWeight="700">CLINIC, 8:42 AM</text>
          <g transform={`translate(1460 ${505 + floatY(frame, .045, 3)})`}>
            <ParentAndChild x={0} y={0} scale={.62} coat={K.blueLight} childCoat={K.gold} />
          </g>
          <path d="M1678 520q20-25 45 0v55h-45Z" fill={K.red} />
          <path d="M1689 525v35m13-35v35m13-35v35" stroke={K.paperLight} strokeWidth="3" />
          <circle cx="1700" cy="675" r={interpolate(clinic, [0, 1], [5, 14])} fill={K.gold} opacity={.35 + .25 * Math.sin(frame * .12)} />
          <circle cx="1700" cy="675" r="6" fill={K.gold} />
        </g>
        <path d="M90 828C310 798 520 858 720 826S1100 806 1290 832 1600 856 1840 816" fill="none" stroke={K.gold} strokeWidth="5" strokeDasharray="8 18" opacity={.42 * ease(frame, cueFrame(0, 6), 22)} />
        <path d="M104 828C316 797 520 856 720 825S1100 806 1290 832 1590 854 1830 820" fill="none" stroke={K.red} strokeWidth="8" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - redLine} />
        <circle cx={104 + 1720 * redLine} cy={828 - 15 * Math.sin(redLine * Math.PI * 2)} r="12" fill={K.paperLight} stroke={K.red} strokeWidth="5" opacity={ease(frame, cueFrame(0, 6), 22)} />
        <g opacity={warning} transform={`translate(0 ${interpolate(warning, [0, 1], [20, 0])})`}>
          <rect x="530" y="535" width="560" height="122" rx="10" fill="#C6283D" />
          <path d="m582 554 31 58h-62Z" fill={K.paperLight} />
          <text x="582" y="598" textAnchor="middle" fill="#C6283D" fontFamily="Arial" fontSize="26" fontWeight="700">!</text>
          <text x="632" y="581" fill={K.paperLight} fontFamily="Arial" fontSize="21" fontWeight="700">RECORD NOT FOUND</text>
          <text x="632" y="615" fill="#FFE8EC" fontFamily="Arial" fontSize="17">Parents care. Paper can’t keep pace.</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const ActTwo = ({frame}: {frame: number}) => {
  const introduce = spring({frame, fps, config: {damping: 16, stiffness: 86, mass: 1.1}});
  const landing = 1 - ease(frame, cueFrame(1, 2), 32);
  const health = ease(frame, cueFrame(1, 3), 34);
  const reminders = ease(frame, cueFrame(1, 9), 28);
  const memories = ease(frame, cueFrame(1, 7), 24);
  const nutrition = ease(frame, cueFrame(1, 8), 22) * (1 - reminders);
  const firstMemory = ease(frame, 18, 26);
  const secondMemory = ease(frame, cueFrame(1, 7) + 6, 24);
  const thirdMemory = ease(frame, cueFrame(1, 7) + 18, 24);
  const growthAt = cueFrame(1, 4);
  const weightReveal = ease(frame, growthAt, 16);
  const heightReveal = ease(frame, growthAt + 10, 16);
  const headReveal = ease(frame, growthAt + 20, 16);
  const chartDraw = sweep(frame, growthAt + 8, growthAt + 72);
  const sdgStart = cueFrame(1, 9) + 174;
  const sdg = ease(frame, sdgStart, 24);
  const phoneY = (1 - introduce) * 80;

  return (
    <AbsoluteFill style={{background: 'linear-gradient(125deg, #F8F9FA 0%, #EDF4FA 54%, #FBEFF2 100%)', color: K.ink, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 37px, rgba(48,74,98,.035) 38px 39px)'}} />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <circle cx="1690" cy="110" r="260" fill={K.red} opacity=".16" />
        <path d="M0 800Q445 734 912 792t1008-20v308H0Z" fill="#E8EDF3" />
        <path d="M0 800Q445 734 912 792t1008-20" fill="none" stroke="#C2CCD8" strokeWidth="3" />
        <text x="112" y="154" fill={K.blue} fontSize="19" fontFamily="Arial" fontWeight="700" letterSpacing="3">BABYBOOK+</text>
        <text x="106" y="258" fill={K.ink} fontSize="75" fontFamily="Georgia" fontWeight="700">Health has a history.</text>
        <text x="112" y="310" fill={K.blue} fontSize="25" fontFamily="Arial">A digital companion keeps the whole story close.</text>
        <g opacity={firstMemory} transform={`translate(112 ${426 + floatY(frame, .035, 3) * firstMemory}) scale(${interpolate(firstMemory, [0, 1], [.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}>
          <TinyMemory x={0} y={0} rotate={0} color="#FFE1E7" kind={0} caption="That first little laugh" />
        </g>
        <g opacity={secondMemory} transform={`translate(388 ${426 + floatY(frame + 12, .035, 3) * secondMemory}) scale(${interpolate(secondMemory, [0, 1], [.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}>
          <TinyMemory x={0} y={0} rotate={0} color="#DCEBFA" kind={1} caption="First steps" completed={secondMemory} />
        </g>
        <g opacity={thirdMemory} transform={`translate(664 ${426 + floatY(frame + 24, .035, 3) * thirdMemory}) scale(${interpolate(thirdMemory, [0, 1], [.94, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})})`}>
          <TinyMemory x={0} y={0} rotate={0} color="#F6DCE5" kind={2} caption="A new favorite" />
        </g>
        <g opacity={health}>
          {['profile', 'allergies', 'growth'].map((item, i) => {
            const x = 228 + i * 276;
            const bob = floatY(frame + i * 17, .055, 3);
            return (
              <g key={item} transform={`translate(${x} ${696 + bob})`}>
                <circle cx="0" cy="0" r="18" fill={[K.red, K.green, K.blueLight][i]} />
                {i === 0 && <><circle cx="0" cy="-4" r="4" fill={K.paperLight} /><path d="M-8 10q1-9 8-9t8 9" fill={K.paperLight} /></>}
                {i === 1 && <path d="M-8 4q2-12 16-12-2 12-16 12Zm0 0 9-8" fill="none" stroke={K.paperLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                {i === 2 && <path d="m-9 7 6-6 4 3 8-9M5-5h4v4" fill="none" stroke={K.paperLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                <text x="0" y="49" textAnchor="middle" fill={K.ink} fontFamily="Arial" fontSize="15">{item}</text>
              </g>
            );
          })}
        </g>
        <g transform={`translate(${1030} ${132 + phoneY}) rotate(2 300 335)`}>
          <ellipse cx="278" cy="710" rx="275" ry="28" fill={K.night} opacity=".18" />
          <rect x="42" y="0" width="460" height="710" rx="56" fill={K.night} />
          <path d="M500 14 516 22v648l-14 22-2-2Z" fill={K.blue} />
          <rect x="55" y="13" width="434" height="684" rx="46" fill={K.paperLight} />
          <rect x="178" y="13" width="188" height="31" rx="15" fill={K.night} />
          <text x="91" y="82" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">BABYBOOK+</text>
          <text x="91" y="129" fill={K.ink} fontFamily="Georgia" fontSize="35" fontWeight="700">Hi, Maya</text>
          <text x="93" y="159" fill="#6F7E81" fontFamily="Arial" fontSize="16">Your little one is growing.</text>
          <g opacity={landing}>
            <rect x="82" y="186" width="378" height="270" rx="26" fill="#DDE9E2" />
            <circle cx="145" cy="266" r="36" fill={K.gold} />
            <circle cx="145" cy="253" r="14" fill={K.paperLight} />
            <path d="M119 290q2-26 26-26t27 26" fill={K.blue} />
            <text x="202" y="238" fill={K.blue} fontFamily="Arial" fontSize="12" fontWeight="700" letterSpacing="2">YOUR FAMILY ARCHIVE</text>
            <text x="202" y="275" fill={K.ink} fontFamily="Georgia" fontSize="24" fontWeight="700">Maya’s first year</text>
            <path d="M110 342h320M110 374h287M110 406h303" stroke="#B6C7BB" strokeWidth="3" />
            <circle cx="125" cy="430" r="7" fill={K.red} />
            <circle cx="151" cy="430" r="7" fill={K.gold} />
            <circle cx="177" cy="430" r="7" fill={K.green} />
            <circle cx="203" cy="430" r="7" fill={K.blueLight} />
          </g>
          <g opacity={health}>
            <rect x="82" y="186" width="378" height="211" rx="26" fill="#DDE9E2" />
            <text x="110" y="225" fill={K.blue} fontFamily="Arial" fontSize="12" fontWeight="700" letterSpacing="2">GROWTH, OVER TIME</text>
            <text x="110" y="243" fill={K.blue} fontFamily="Arial" fontSize="10">WHO standard · sample data</text>
            <g opacity={weightReveal}>
              <text x="110" y="263" fill={K.blue} fontFamily="Arial" fontSize="11">Weight</text>
              <text x="110" y="287" fill={K.ink} fontFamily="Georgia" fontSize="20" fontWeight="700">4.8 kg</text>
            </g>
            <g opacity={heightReveal}>
              <text x="225" y="263" fill={K.blue} fontFamily="Arial" fontSize="11">Height</text>
              <text x="225" y="287" fill={K.ink} fontFamily="Georgia" fontSize="20" fontWeight="700">57 cm</text>
            </g>
            <g opacity={headReveal}>
              <text x="338" y="256" fill={K.blue} fontFamily="Arial" fontSize="10">Head</text>
              <text x="338" y="268" fill={K.blue} fontFamily="Arial" fontSize="10">circumference</text>
              <text x="338" y="287" fill={K.ink} fontFamily="Georgia" fontSize="20" fontWeight="700">38 cm</text>
            </g>
            <g transform="translate(109 292) scale(.7 .25)"><GrowthLine progress={chartDraw} /></g>
          </g>
          <g opacity={health}>
            <rect x="82" y="419" width="176" height="98" rx="20" fill="#F1D9BD" />
            <rect x="276" y="419" width="184" height="98" rx="20" fill="#E2E9DA" />
            <text x="103" y="461" fill={K.redDark} fontFamily="Georgia" fontSize="25">♡</text>
            <text x="103" y="490" fill={K.ink} fontFamily="Arial" fontSize="15" fontWeight="700">Health</text>
            <text x="300" y="461" fill={K.blue} fontFamily="Georgia" fontSize="24">✳</text>
            <text x="300" y="490" fill={K.ink} fontFamily="Arial" fontSize="15" fontWeight="700">Memories</text>
          </g>
          <g opacity={nutrition}>
            <rect x="82" y="540" width="378" height="107" rx="20" fill="#E6F0FA" />
            <circle cx="119" cy="580" r="13" fill={K.red} />
            <path d="M119 567q0-8 8-8M119 580q-7-10 0-13 7 3 0 13Z" fill="none" stroke={K.paperLight} strokeWidth="2.5" strokeLinecap="round" />
            <text x="145" y="580" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="1">DAILY NUTRITION</text>
            <text x="109" y="616" fill={K.ink} fontFamily="Arial" fontSize="17">2 meals logged today</text>
            <circle cx="408" cy="589" r="15" fill={K.green} />
            <path d="m401 589 5 5 10-11" fill="none" stroke={K.paperLight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <g opacity={reminders}>
            <rect x="82" y="540" width="378" height="107" rx="20" fill={K.night} />
            <circle cx="119" cy="580" r="12" fill={K.gold} />
            <path d="M119 573v8l6 4" fill="none" stroke={K.night} strokeWidth="2.5" />
            <text x="145" y="582" fill={K.paperLight} fontFamily="Arial" fontSize="15" fontWeight="700">Checkup coming up</text>
            <text x="109" y="617" fill="#B9C9C6" fontFamily="Arial" fontSize="14">A gentle reminder, right on time.</text>
          </g>
        </g>
        <g opacity={reminders} transform="translate(1449 724)">
          <circle cx="0" cy="0" r="27" fill={K.red} />
          <path d="M-9 0q1-12 9-12t9 12v8h-18ZM-12 10h24" fill="none" stroke={K.paperLight} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="22" cy="-19" r="11" fill={K.gold} />
          <path d="m17-19 4 4 7-8" fill="none" stroke={K.night} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g opacity={sdg} transform={`translate(${interpolate(sdg, [0, 1], [28, 0])} 0)`}>
          <rect x="1590" y="630" width="300" height="118" rx="10" fill="#4C9F38" />
          <text x="1612" y="690" fill={K.paperLight} fontFamily="Arial" fontSize="54" fontWeight="700">3</text>
          <path d="M1608 711h13l6-10 7 19 8-13h12" fill="none" stroke={K.paperLight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="1660" y="657" fill={K.paperLight} fontFamily="Arial" fontSize="13">Sustainable Development Goal</text>
          <text x="1660" y="690" fill={K.paperLight} fontFamily="Georgia" fontSize="20" fontWeight="700">Good health and</text>
          <text x="1660" y="716" fill={K.paperLight} fontFamily="Georgia" fontSize="20" fontWeight="700">well-being</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const ActThree = ({frame}: {frame: number}) => {
  const selectionStart = cueFrame(2, 4);
  const scanStart = cueFrame(2, 5);
  const qrStart = selectionStart + 160;
  const revokeStart = cueFrame(2, 6);
  const share = ease(frame, selectionStart, 24) * (1 - ease(frame, revokeStart + 12, 24));
  const scan = ease(frame, scanStart, 26);
  const revoke = ease(frame, revokeStart, 18);
  const revokeShatter = sweep(frame, revokeStart, revokeStart + 24);
  const viewer = scan * (1 - revokeShatter);
  const viewEnded = scan * revokeShatter;
  const audit = ease(frame, cueFrame(2, 8), 18);
  const time = sweep(frame, qrStart, qrStart + 72);
  const countdown = Math.max(0, 60 - Math.floor(Math.max(0, frame - qrStart) / fps));
  const tap = sweep(frame, revokeStart, revokeStart + 12);

  return (
    <AbsoluteFill style={{background: 'linear-gradient(125deg, #18263B 0%, #233C4F 60%, #315B5C 100%)', color: K.paperLight, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, opacity: .18, backgroundImage: 'radial-gradient(#B9D7D1 1px, transparent 1px)', backgroundSize: '34px 34px'}} />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <path d="M0 785Q460 730 960 785t960-30v325H0Z" fill="#132035" />
        <path d="M0 785Q460 730 960 785t960-30" fill="none" stroke="#728B88" strokeWidth="3" />
        <text x="110" y="145" fill={K.gold} fontFamily="Arial" fontSize="19" fontWeight="700" letterSpacing="3">A PARENT-CONTROLLED VISIT</text>
        <text x="104" y="245" fill={K.paperLight} fontFamily="Georgia" fontSize="77" fontWeight="700">One visit.</text>
        <text x="109" y="316" fill={K.paperLight} fontFamily="Georgia" fontSize="77" fontWeight="700">Only what’s needed.</text>
        <g transform={`translate(135 452) scale(.94)`}>
          <ParentAndChild x={0} y={0} scale={1.04} coat={K.red} childCoat={K.gold} />
        </g>
        <path d="M300 650C480 590 618 620 771 540s120-140 221-135" fill="none" stroke={K.gold} strokeWidth="4" strokeDasharray="7 15" opacity=".75" />
        <path d="M1330 340v426" stroke={K.blueLight} strokeWidth="2" strokeDasharray="5 12" opacity=".42" />
        <text x="1390" y="325" fill={K.blueLight} fontFamily="Arial" fontSize="14" fontWeight="700" letterSpacing="2">CLINICIAN VIEW</text>
        <g opacity={share} transform={`translate(${interpolate(share, [0, 1], [-32, 0])} 0) rotate(-2 716 514)`}>
          <rect x="570" y="360" width="292" height="308" rx="26" fill={K.night} />
          <rect x="580" y="370" width="272" height="288" rx="19" fill={K.paperLight} />
          <rect x="682" y="375" width="68" height="6" rx="3" fill={K.blue} />
          <text x="605" y="412" fill={K.blue} fontFamily="Arial" fontSize="15" fontWeight="700">CHOOSE TO SHARE</text>
          {['Growth chart', 'Allergy summary', 'Vaccinations'].map((label, i) => {
            const check = ease(frame, selectionStart + 18 + i * 24, 12);
            const y = 450 + i * 57;
            return (
              <g key={label}>
                <rect x="605" y={y} width="22" height="22" rx="4" fill={K.paperLight} stroke={K.paperShade} strokeWidth="2" />
                <rect x="605" y={y} width="22" height="22" rx="4" fill={K.red} opacity={check} />
                <path
                  d={`M610 ${y + 11}l6 6 10-13`}
                  fill="none"
                  stroke={K.paperLight}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - check}
                  opacity={check}
                />
                <text x="648" y={y + 18} fill={K.ink} fontFamily="Arial" fontSize="20">{label}</text>
              </g>
            );
          })}
          <g transform={`translate(716 636) scale(${1 - .07 * Math.sin(tap * Math.PI)}) translate(-716 -636)`}>
            <rect x="605" y="615" width="222" height="36" rx="8" fill={K.red} />
            <text x="716" y="639" textAnchor="middle" fill={K.paperLight} fontFamily="Arial" fontSize="15" fontWeight="700">Revoke access</text>
          </g>
        </g>
        <g transform={`translate(950 ${390 + floatY(frame, .04, 8)}) rotate(-3 135 135)`}>
          <g opacity={ease(frame, qrStart, 20) * (1 - revokeShatter)}>
            <rect x="0" y="0" width="285" height="285" rx="10" fill={K.paperLight} />
            <path d="M10 0h265q10 0 10 10v19H0V10Q0 0 10 0Z" fill="#E4EFFA" />
            <text x="15" y="19" fill={K.blue} fontFamily="Arial" fontSize="10" fontWeight="700" letterSpacing="1">TIME-LIMITED TOKEN</text>
            <text x="222" y="19" textAnchor="end" fill={K.ink} fontFamily="Arial" fontSize="11" fontWeight="700">{countdown}s</text>
            <circle cx="258" cy="14" r="8" fill="none" stroke={K.paperShade} strokeWidth="2" />
            <circle cx="258" cy="14" r="8" fill="none" stroke={K.red} strokeWidth="2" strokeDasharray="50.3" strokeDashoffset={50.3 * (1 - time)} transform="rotate(-90 258 14)" />
            <circle cx="142" cy="145" r="118" fill="none" stroke={K.red} strokeWidth="2" opacity={.16 + .18 * Math.sin(frame * .16)} />
            <g transform="translate(27 30)"><QrMark size={231} progress={time * (1 - revokeShatter)} /></g>
            <text x="142" y="318" fill={K.paper} textAnchor="middle" fontFamily="Arial" fontSize="15" fontWeight="700" letterSpacing="2">ONE-TIME VISIT TOKEN</text>
          </g>
          <g>
            {Array.from({length: 20}, (_, i) => {
              const x = 43 + (i * 47) % 192;
              const y = 43 + (i * 71) % 192;
              const angle = i * 2.4;
              const travel = 76 * revokeShatter;
              return (
                <rect
                  key={i}
                  x={x + Math.cos(angle) * travel}
                  y={y + Math.sin(angle) * travel}
                  width={4 + (i % 3)}
                  height={4 + (i % 3)}
                  fill={i % 2 === 0 ? K.red : K.blue}
                  opacity={Math.sin(revokeShatter * Math.PI)}
                />
              );
            })}
          </g>
        </g>
        <g opacity={viewer} transform={`translate(${interpolate(scan, [0, 1], [1800, 1470])} 356)`}>
          <rect x="-12" y="-12" width="360" height="400" rx="20" fill={K.night} />
          <rect x="0" y="0" width="336" height="376" rx="6" fill={K.paperLight} />
          <rect x="0" y="0" width="336" height="65" fill={K.blue} />
          <circle cx="42" cy="33" r="13" fill={K.gold} />
          <text x="69" y="40" fill={K.paperLight} fontFamily="Arial" fontSize="16" fontWeight="700">PEDIATRIC VISIT</text>
          <text x="28" y="112" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">VIEW-ONLY RECORD</text>
          {['Growth chart', 'Allergy summary', 'Vaccination record'].map((item, i) => (
            <g key={item}>
              <path d={`M30 ${153 + i * 52}h18`} stroke={K.red} strokeWidth="5" strokeLinecap="round" />
              <text x="65" y={160 + i * 52} fill={K.ink} fontFamily="Arial" fontSize="17">{item}</text>
              <path d={`M28 ${180 + i * 52}h279`} stroke="#D8CCB7" strokeWidth="2" />
            </g>
          ))}
          <text x="28" y="338" fill={K.redDark} fontFamily="Arial" fontSize="12" fontWeight="700">EXPIRES WHEN THE VISIT ENDS</text>
        </g>
        <g opacity={viewEnded} transform="translate(1470 356)">
          <rect x="0" y="0" width="336" height="376" rx="6" fill={K.night} />
          <circle cx="168" cy="142" r="34" fill={K.red} />
          <path d="M155 140v-8a13 13 0 0 1 26 0v8m-31 0h36v27h-36z" fill="none" stroke={K.paperLight} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <text x="168" y="216" textAnchor="middle" fill={K.paperLight} fontFamily="Arial" fontSize="17" fontWeight="700">ACCESS REVOKED</text>
          <text x="168" y="244" textAnchor="middle" fill="#C5D5CA" fontFamily="Arial" fontSize="14">This visit can no longer view the record.</text>
        </g>
        <g opacity={revoke} transform="translate(968 738)">
          <circle cx="0" cy="0" r="12" fill={K.red} />
          <path d="M-4-4 4 4M4-4-4 4" stroke={K.paperLight} strokeWidth="3" strokeLinecap="round" />
          <text x="24" y="5" fill={K.paperLight} fontFamily="Arial" fontSize="15" fontWeight="700">Token revoked</text>
        </g>
        <g opacity={audit} transform="translate(1400 800)">
          <path d="M0 0h340M0 38h290M0 76h320" stroke="#7EA09D" strokeWidth="3" />
          {[0, 1, 2].map((n) => (
            <g key={n} opacity={ease(frame, cueFrame(2, 8) + n * 9, 12)}>
              <circle cx="6" cy={n * 38} r="6" fill={K.gold} />
              <circle cx="310" cy={n * 38} r="6" fill={K.green} />
            </g>
          ))}
          <text x="0" y="118" fill="#C5D5CA" fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">EVERY VIEW, RECORDED</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const ActFour = ({frame}: {frame: number}) => {
  const book = ease(frame, 0, 28);
  const phone = ease(frame, 34, 30);
  const bridge = sweep(frame, cueFrame(3, 1), cueFrame(3, 3));
  const family = ease(frame, cueFrame(3, 2), 32);
  const finish = ease(frame, cueFrame(3, 3), 35);
  const collageStart = cueFrame(3, 1);
  const collage = ease(frame, collageStart, 24);
  const collageScroll = interpolate(frame, [collageStart, collageStart + 240], [0, 96], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const outro = ease(frame, actFrames[3] - 72, 36);
  const bridgeNodes = [[631, 563], [797, 481], [970, 526], [1132, 626], [1293, 644]];

  return (
    <AbsoluteFill style={{background: 'linear-gradient(135deg, #F8F9FA 0%, #EDF4FA 44%, #FBEFF2 100%)', color: K.ink, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(23,36,58,.12) 1px, transparent 1px)', backgroundSize: '32px 32px'}} />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <defs>
          <clipPath id="act-four-memory-strip">
            <rect x="662" y="382" width="562" height="64" rx="5" />
          </clipPath>
        </defs>
        <circle cx="959" cy="475" r="345" fill={K.blue} opacity=".08" />
        <path d="M0 805Q440 728 900 788t1020-25v317H0Z" fill="#E8EDF3" opacity=".82" />
        <path d="M0 805Q440 728 900 788t1020-25" fill="none" stroke="#B8C6D4" strokeWidth="3" />
        <text x="108" y="148" fill={K.blue} fontFamily="Arial" fontSize="19" fontWeight="700" letterSpacing="3">THE WHOLE STORY, HELD TOGETHER</text>
        <text x="102" y="246" fill={K.ink} fontFamily="Georgia" fontSize="74" fontWeight="700">Memory and medicine.</text>
        <g opacity={bridge}>
          <text x="370" y="360" textAnchor="middle" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">INPUT</text>
          <text x="945" y="360" textAnchor="middle" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">PROCESS</text>
          <text x="1500" y="286" textAnchor="middle" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">OUTPUT</text>
        </g>
        <g opacity={book} transform={`translate(155 ${365 + floatY(frame, .025, 5)}) rotate(-4 220 170)`}>
          <path d="M0 28Q24 4 218 31V334Q43 313 0 344Z" fill={K.paperLight} />
          <path d="M218 31Q403 1 437 29V344Q395 314 218 334Z" fill={K.paper} />
          <path d="M218 31V334" stroke={K.redDark} strokeWidth="7" />
          <text x="34" y="78" fill={K.blue} fontFamily="Georgia" fontSize="18" fontStyle="italic">A family keepsake</text>
          <TinyMemory x={37} y={98} rotate={0} color="#DFB46F" kind={0} />
          <path d="M254 82h140M254 116h130M254 150h145" stroke="#C8B394" strokeWidth="3" />
          <path d="M254 210q30-38 60 0t60 0" fill="none" stroke={K.red} strokeWidth="5" />
          <text x="254" y="262" fill={K.blue} fontFamily="Georgia" fontSize="17" fontStyle="italic">First steps, first words...</text>
        </g>
        <g opacity={phone} transform={`translate(1306 ${320 + floatY(frame + 12, .027, 7)}) rotate(4 190 260)`}>
          <rect x="0" y="0" width="370" height="565" rx="40" fill={K.night} />
          <rect x="12" y="12" width="346" height="541" rx="31" fill={K.paperLight} />
          <rect x="124" y="12" width="122" height="22" rx="11" fill={K.night} />
          <text x="38" y="83" fill={K.blue} fontFamily="Arial" fontSize="13" fontWeight="700" letterSpacing="2">HEALTH, KEPT CLEAR</text>
          <text x="38" y="129" fill={K.ink} fontFamily="Georgia" fontSize="26" fontWeight="700">Growing, together.</text>
          <g transform="translate(36 167) scale(.76 .63)"><GrowthLine progress={finish} /></g>
          <path d="M38 390h294M38 423h260M38 456h281" stroke="#D1C2A7" strokeWidth="3" />
          <circle cx="47" cy="503" r="8" fill={K.red} />
          <circle cx="79" cy="503" r="8" fill={K.gold} />
          <circle cx="111" cy="503" r="8" fill={K.green} />
          <circle cx="143" cy="503" r="8" fill={K.blueLight} />
        </g>
        <g opacity={collage}>
          <rect x="650" y="372" width="590" height="82" rx="8" fill={K.paperLight} stroke={K.blueLight} strokeWidth="2" />
          <g clipPath="url(#act-four-memory-strip)">
            <g transform={`translate(${671 - collageScroll} 384) scale(.31)`}>
              {Array.from({length: 8}, (_, i) => (
                <TinyMemory
                  key={i}
                  x={i * 246}
                  y={0}
                  rotate={0}
                  color={['#DCEBFA', '#FCE3E9', '#E4EBDD', '#F4EAD7'][i % 4]}
                  kind={i % 3}
                />
              ))}
            </g>
          </g>
        </g>
        <path d="M562 630C711 470 820 443 970 526S1193 717 1372 607" fill="none" stroke={K.paperLight} strokeWidth="23" strokeLinecap="round" opacity=".54" />
        <path d="M562 630C711 470 820 443 970 526S1193 717 1372 607" fill="none" stroke={K.red} strokeWidth="7" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - bridge} />
        {bridgeNodes.map(([x, y], i) => {
          return (
            <g key={i} opacity={ease(frame, cueFrame(3, 1) + i * 13, 14)}>
              <circle cx={x} cy={y} r="19" fill={K.paperLight} stroke={K.red} strokeWidth="5" />
              <path d="M-5 0h10M0-5v10" transform={`translate(${x} ${y})`} stroke={K.redDark} strokeWidth="3" strokeLinecap="round" />
            </g>
          );
        })}
        <g opacity={family}>
          <ParentAndChild x={790} y={553} scale={1.15} coat={K.blue} childCoat={K.red} />
          <circle cx="902" cy="610" r="222" fill="none" stroke={K.paperLight} strokeWidth="3" strokeDasharray="3 14" opacity=".8" />
        </g>
        <g opacity={finish} transform={`translate(0 ${interpolate(finish, [0, 1], [28, 0])})`}>
          <text x="960" y="316" textAnchor="middle" fill={K.night} fontFamily="Georgia" fontSize="34" fontWeight="700">One story. Across a lifetime.</text>
          <path d="M805 338h310" stroke={K.red} strokeWidth="5" strokeLinecap="round" />
        </g>
        <g opacity={outro}>
          <rect x="0" y="0" width="1920" height="1080" fill={K.paperLight} />
          <circle cx="803" cy="522" r="39" fill={K.blue} />
          <text x="803" y="532" textAnchor="middle" fill={K.paperLight} fontFamily="Arial" fontSize="24" fontWeight="700">B+</text>
          <text x="860" y="540" fill={K.ink} fontFamily="Georgia" fontSize="52" fontWeight="700">BabyBook+</text>
          <path d="M762 582h396" stroke={K.red} strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

const StoryCaption = ({actIndex}: {actIndex: number}) => {
  const frame = useCurrentFrame();
  const {fps: compositionFps} = useVideoConfig();
  const act = acts[actIndex];
  const caption = act.captions.find(
    (item) => frame >= item.start * compositionFps && frame < item.end * compositionFps,
  );
  const cueStart = caption ? Math.round(caption.start * compositionFps) : 0;
  const captionProgress = caption ? ease(frame, cueStart, 8) : 0;
  const progress = (frame / actFrames[actIndex]) * 100;

  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 6, background: 'rgba(255,248,233,.16)'}}>
        <div style={{width: `${progress}%`, height: '100%', background: K.gold}} />
      </div>
      {caption && (
        <div style={{
          position: 'absolute',
          left: 104,
          right: 104,
          bottom: 36,
          minHeight: 104,
          display: 'flex',
          alignItems: 'center',
          padding: '18px 34px',
          background: K.paperLight,
          borderLeft: `7px solid ${K.red}`,
          opacity: captionProgress,
          transform: `translateY(${(1 - captionProgress) * 12}px)`,
          boxShadow: '0 12px 35px rgba(9,18,31,.18)',
        }}>
          <div style={{
            width: '100%',
            textAlign: 'center',
            color: K.ink,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-.02em',
            lineHeight: 1.25,
          }}>{caption.text}</div>
        </div>
      )}
    </>
  );
};

const ActScene = ({actIndex}: {actIndex: number}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [actFrames[actIndex] - 13, actFrames[actIndex]], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const Scene = [ActOne, ActTwo, ActThree, ActFour][actIndex];

  return (
    <AbsoluteFill style={{opacity: fade, overflow: 'hidden', fontFamily: 'Arial, Helvetica, sans-serif'}}>
      <Scene frame={frame} />
      <StoryCaption actIndex={actIndex} />
    </AbsoluteFill>
  );
};

const Video = () => (
  <AbsoluteFill style={{backgroundColor: K.night}}>
    {acts.map((act, index) => {
      const from = actFrames.slice(0, index).reduce((sum, length) => sum + length, 0);
      return (
        <Sequence key={act.id} from={from} durationInFrames={actFrames[index]} name={act.title}>
          <ActScene actIndex={index} />
          <Audio src={staticFile(act.audio)} volume={1} />
        </Sequence>
      );
    })}
    <Audio src={staticFile('audio/soft-score.wav')} volume={0.46} />
  </AbsoluteFill>
);

export const VideoRoot: React.FC = () => (
  <Composition
    id="BabyBookExplainer"
    width={1920}
    height={1080}
    fps={fps}
    durationInFrames={durationInFrames}
    component={Video}
  />
);
