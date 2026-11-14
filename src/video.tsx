import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Composition,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {actFrames, acts, durationInFrames} from './script';
import {
  EditorialChrome,
  EditorialTitle,
  E,
  KineticSuper,
  PaperWipe,
  PremiumFinish,
} from './editorial';

const K = {
  night: '#23415A',
  blue: '#4A90E2',
  blueLight: '#87BCEB',
  paper: '#F3F6F9',
  paperLight: '#F8F9FA',
  paperShade: '#D7DEE7',
  ink: '#23415A',
  red: '#FF8DA1',
  redDark: '#B83D65',
  gold: '#E9B45C',
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

/* ============================================================================
 * VOX EDITORIAL SHADERS & PRINT TEXTURES
 * ============================================================================ */
const VoxDefs = ({prefix}: {prefix: string}) => (
  <defs>
    {/* Hand-inked organic line wobble */}
    <filter id={`${prefix}-ink-bleed`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
    </filter>

    {/* Zero-blur editorial cardboard cutout shadow */}
    <filter id={`${prefix}-cutout-shadow`} x="-15%" y="-15%" width="135%" height="135%">
      <feDropShadow dx="6" dy="8" stdDeviation="0" floodColor={K.night} floodOpacity="0.22" />
    </filter>

    {/* Subtle newsprint grain */}
    <filter id={`${prefix}-paper-grain`} x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="grain" />
      <feColorMatrix
        type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.04 0"
        in="grain"
        result="softGrain"
      />
      <feComposite operator="in" in2="SourceGraphic" />
      <feBlend mode="multiply" in2="SourceGraphic" />
    </filter>

    {/* Soft ink smudge */}
    <filter id={`${prefix}-ink-smudge`}>
      <feGaussianBlur stdDeviation="2.5" />
    </filter>

    {/* Newsprint halftone dot pattern */}
    <pattern id={`${prefix}-halftone`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
      <circle cx="2.5" cy="2.5" r="1.2" fill={K.night} opacity="0.14" />
    </pattern>

    {/* Diagonal crosshatch shading */}
    <pattern id={`${prefix}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1="0" y1="0" x2="0" y2="9" stroke={K.night} strokeWidth="1.4" opacity="0.16" />
    </pattern>

    {/* Ruled notebook background lines */}
    <pattern id={`${prefix}-ruled-paper`} width="100" height="38" patternUnits="userSpaceOnUse">
      <line x1="0" y1="37" x2="100" y2="37" stroke="#CBD5E1" strokeWidth="1.5" opacity="0.55" />
    </pattern>
  </defs>
);

const MaskingTape = ({
  x,
  y,
  rotate = -3,
  width = 78,
  height = 24,
  color = '#EFE4C8',
  prefix = 'vox',
}: {
  x: number;
  y: number;
  rotate?: number;
  width?: number;
  height?: number;
  color?: string;
  prefix?: string;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
    <rect
      x="0"
      y="0"
      width={width}
      height={height}
      fill={color}
      opacity="0.88"
      stroke={K.night}
      strokeWidth="1"
      strokeOpacity="0.35"
      filter={`url(#${prefix}-ink-bleed)`}
    />
    <line x1="3" y1="0" x2="3" y2={height} stroke={K.night} strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
    <line x1={width - 3} y1="0" x2={width - 3} y2={height} stroke={K.night} strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
  </g>
);

/* ============================================================================
 * EDITORIAL CHARACTER & ILLUSTRATION PRIMITIVES
 * ============================================================================ */
const ParentAndChild = ({
  x,
  y,
  scale = 1,
  coat = K.red,
  childCoat = K.gold,
  prefix = 'act1',
}: {
  x: number;
  y: number;
  scale?: number;
  coat?: string;
  childCoat?: string;
  prefix?: string;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {/* Halftone Ground Shadow */}
    <ellipse cx="95" cy="253" rx="112" ry="14" fill={K.night} opacity="0.14" />
    <ellipse cx="93" cy="251" rx="110" ry="13" fill={`url(#${prefix}-halftone)`} />

    {/* Screenprint Offset Fill Layer */}
    <g transform="translate(4 4)">
      <path
        d="M53 125Q39 132 28 168L9 231Q5 248 20 254L37 260Q49 264 54 248L79 193 89 250Q92 267 110 267H151Q168 267 165 249L146 176Q139 145 123 133Z"
        fill={coat}
      />
      <circle cx="92" cy="81" r="44" fill={K.paperShade} />
    </g>

    {/* Hand-Inked Contours + Crosshatch Depth */}
    <g filter={`url(#${prefix}-ink-bleed)`}>
      <path
        d="M53 125Q39 132 28 168L9 231Q5 248 20 254L37 260Q49 264 54 248L79 193 89 250Q92 267 110 267H151Q168 267 165 249L146 176Q139 145 123 133Z"
        fill={`url(#${prefix}-hatch)`}
        stroke={K.night}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M55 139 24 177Q14 191 24 199L37 207Q47 212 55 201L83 170"
        fill={coat}
        stroke={K.night}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M117 143Q137 148 157 166L182 190Q193 202 182 212L168 222Q156 228 146 216L117 193"
        fill={coat}
        stroke={K.night}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Head, Collar & Hair */}
      <circle cx="92" cy="81" r="44" fill="none" stroke={K.night} strokeWidth="3.5" />
      <path d="M51 78Q51 27 91 27Q129 28 136 67L126 60Q108 44 87 49Q71 56 52 89Z" fill={K.night} />
      <path d="M72 126 L92 146 L112 126" fill={K.paperLight} stroke={K.night} strokeWidth="3" strokeLinejoin="round" />

      {/* Face */}
      <circle cx="77" cy="85" r="3.2" fill={K.ink} />
      <circle cx="105" cy="85" r="3.2" fill={K.ink} />
      <path d="M81 105Q92 113 103 104" fill="none" stroke={K.night} strokeWidth="3" strokeLinecap="round" />

      {/* Child */}
      <g transform="translate(103 116) rotate(-17)">
        <path d="M-1 35Q-18 17-11 0Q-5-14 8-7Q19-17 30-7Q48 11 22 37Z" fill={childCoat} stroke={K.night} strokeWidth="3" />
        <circle cx="13" cy="-2" r="20" fill={K.paperLight} stroke={K.night} strokeWidth="3" />
        <path d="M-6-12Q2-31 22-21Q34-15 33 0Q20-9 10-9Q3-5-6-12Z" fill={K.night} />
        <circle cx="7" cy="2" r="2" fill={K.ink} />
        <circle cx="20" cy="2" r="2" fill={K.ink} />
        <path d="M9 10q5 4 9 0" fill="none" stroke={K.night} strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </g>
    <path d="M28 257h36m70 0h29" stroke={K.night} strokeWidth="10" strokeLinecap="round" />
  </g>
);

const Notebook = ({
  frame,
  openAt,
  memoryAt,
  fragileAt,
  prefix = 'act1',
}: {
  frame: number;
  openAt: number;
  memoryAt: number;
  fragileAt: number;
  prefix?: string;
}) => {
  const opening = spring({
    frame: Math.max(0, frame - openAt),
    fps,
    config: {damping: 18, stiffness: 70, mass: 1.15},
  });
  const coverScale = Math.max(0.001, 1 - opening);
  const coverShift = interpolate(opening, [0, 1], [0, -110]);
  const coverTypeOpacity = 1 - ease(opening, 0.08, 0.32);
  const memory = spring({
    frame: Math.max(0, frame - memoryAt),
    fps,
    config: {damping: 13, stiffness: 125, mass: 0.8},
  });
  const fragile = ease(frame, fragileAt, 20);
  const writing = ease(frame, openAt + 12, 24);
  const growthReveal = ease(frame, openAt + 26, 42);
  const pageLift = (1 - opening) * 55;

  return (
    <g transform="translate(970 190) scale(1.14) rotate(-4 340 260)" filter={`url(#${prefix}-cutout-shadow)`}>
      <defs>
        <clipPath id={`${prefix}-baby-book-left-page`}>
          <path d="M30 80Q50 54 100 59L337 87V505L94 472Q43 468 30 493Z" />
        </clipPath>
        <clipPath id={`${prefix}-baby-book-right-page`}>
          <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" />
        </clipPath>
      </defs>
      <g opacity={opening}>

      {/* Hardcover Kraft Backing */}
      <path
        d="M18 76Q44 48 98 54L337 84L584 52Q637 46 661 74V502Q637 478 584 483L337 514L92 480Q38 476 18 502Z"
        fill="#6E5A47"
        stroke={K.night}
        strokeWidth="4"
        filter={`url(#${prefix}-ink-bleed)`}
      />

      {/* Stacked Page Edges */}
      <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" fill="#DFD3BE" transform="translate(9 9)" stroke={K.night} strokeWidth="2.5" />
      <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
      <path d="M337 87 580 58Q631 52 649 78V494Q631 470 580 475L337 505Z" fill="#F4EBD8" transform={`translate(0 ${pageLift})`} stroke={K.night} strokeWidth="2" />
      <path d="M30 80Q50 54 100 59L337 87V505L94 472Q43 468 30 493Z" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />

      {/* Center Spine Gutter + Halftone Depth */}
      <path d="M312 84H362V508H312Z" fill={`url(#${prefix}-halftone)`} />
      <path d="M337 87V505" stroke={K.night} strokeWidth="5" />

      {/* LEFT PAGE: Memories & Hand-Drawn Sketches */}
      <g clipPath={`url(#${prefix}-baby-book-left-page)`}>
        <g opacity={writing}>
          <text x="58" y="114" fill={K.night} fontSize="29" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700">
            My first years
          </text>
          <path d="M58 122H292" stroke={K.night} strokeWidth="2.5" filter={`url(#${prefix}-ink-bleed)`} />
          <text x="64" y="143" fill="#475569" fontSize="11" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="1.3">
            LITTLE MOMENTS, KEPT CLOSE
          </text>

          {/* Polaroid Cutout Card ("A favorite day") */}
          <g
            opacity={memory}
            transform={`translate(56 ${164 + (1 - memory) * 18}) rotate(-3) scale(${interpolate(memory, [0, 1], [0.82, 0.96], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            })})`}
            filter={`url(#${prefix}-cutout-shadow)`}
          >
            {/* Watercolor wash behind photo */}
            <circle cx="42" cy="182" r="46" fill={K.red} opacity="0.28" filter={`url(#${prefix}-ink-smudge)`} />
            <circle cx="176" cy="166" r="40" fill={K.blueLight} opacity="0.28" filter={`url(#${prefix}-ink-smudge)`} />

            <rect x="0" y="0" width="186" height="196" fill="#FFFDF8" stroke={K.night} strokeWidth="3" />
            <rect x="12" y="12" width="162" height="132" fill="#DDE9E7" stroke={K.night} strokeWidth="2" />
            <path d="M12 110Q48 74 80 104t58-1 36 7v34H12Z" fill="#8DAF9B" />
            <circle cx="142" cy="40" r="15" fill={K.gold} />
            <path d="M44 134q4-46 42-46t42 46" fill={K.blueLight} stroke={K.night} strokeWidth="2.5" />
            <circle cx="86" cy="70" r="22" fill="#F8F1E5" stroke={K.night} strokeWidth="2.5" />
            <path d="M64 69q4-26 25-26 20 0 22 22-13-9-25-6-11 7-22 10Z" fill={K.night} />
            <circle cx="79" cy="72" r="2" fill={K.ink} />
            <circle cx="93" cy="72" r="2" fill={K.ink} />
            <path d="M81 82q6 5 11 0" fill="none" stroke={K.night} strokeWidth="2" strokeLinecap="round" />

            <text x="16" y="176" fill={K.ink} fontSize="16" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700">
              A favorite day
            </text>
          </g>

          {/* Loading Handwriting Lines */}
          <g opacity={writing * (1 - memory)}>
            <path
              d="M65 225h218M65 258h180M65 291h202M65 324h166M65 357h192"
              stroke="#B6A589"
              strokeWidth="3"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - writing}
            />
          </g>
        </g>
      </g>

      {/* RIGHT PAGE: A single, readable growth chart */}
      <g clipPath={`url(#${prefix}-baby-book-right-page)`} opacity={writing}>
        <text x="368" y="114" fill={K.night} fontSize="18" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".8">
          HEALTH &amp; GROWTH
        </text>
        <path d="M366 132H618" stroke={K.night} strokeWidth="2.5" />
        <text x="368" y="152" fill="#475569" fontSize="10" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="1">
          WHO GROWTH STANDARDS · FIRST YEAR
        </text>
        <g transform="translate(368 169)">
          <rect x="0" y="0" width="244" height="226" fill="#FFFCF5" stroke={K.night} strokeWidth="2.5" />
          {[1, 2, 3, 4].map((i) => (
            <line key={i} x1="14" y1={24 + i * 32} x2="230" y2={24 + i * 32} stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 6" />
          ))}
          {[1, 2, 3].map((i) => (
            <line key={i} x1={14 + i * 54} y1="24" x2={14 + i * 54} y2="160" stroke="#CBD5E1" strokeWidth="1.2" />
          ))}
          <path d="M14 160V24H230" fill="none" stroke={K.night} strokeWidth="2" />
          <path
            d="M14 148 C49 138 68 117 94 105 S142 80 176 59 210 42 230 34"
            fill="none"
            stroke={K.blue}
            strokeWidth="5"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - growthReveal}
            filter={`url(#${prefix}-ink-bleed)`}
          />
          <path
            d="M14 155 C43 145 70 132 96 120 S146 98 178 79 207 67 230 58"
            fill="none"
            stroke={K.redDark}
            strokeWidth="4"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - growthReveal}
            filter={`url(#${prefix}-ink-bleed)`}
          />
          <path
            d="M14 134 C47 130 74 119 100 109 S148 90 177 72 209 52 230 44"
            fill="none"
            stroke={K.green}
            strokeWidth="3"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - growthReveal}
          />
          <text x="14" y="178" fill="#475569" fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700">BIRTH</text>
          <text x="230" y="178" textAnchor="end" fill="#475569" fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700">12 MONTHS</text>
          <g transform="translate(14 201)">
            <circle cx="0" cy="0" r="4" fill={K.blue} />
            <text x="8" y="4" fill={K.night} fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700">WEIGHT</text>
            <circle cx="83" cy="0" r="4" fill={K.redDark} />
            <text x="91" y="4" fill={K.night} fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700">LENGTH</text>
            <circle cx="164" cy="0" r="4" fill={K.green} />
            <text x="172" y="4" fill={K.night} fontSize="9" fontFamily="Arial, sans-serif" fontWeight="700">HEAD</text>
          </g>
        </g>
        <text x="368" y="424" fill={K.night} fontSize="13" fontFamily="Georgia, serif" fontStyle="italic">Measured with care.</text>
      </g>

      {/* Upgraded Vox-style fragile tear & paper degradation effect */}
      <g opacity={fragile}>
        {/* Torn Top-Right Corner Flap */}
        <path d="M582 58 L649 78 L645 122 Q625 102 590 100 Z" fill="#D7C6A7" stroke={K.night} strokeWidth="2.5" filter={`url(#${prefix}-cutout-shadow)`} />
        {/* Jagged Red Marker Tear Trace */}
        <path
          d="M582 58 Q615 83 645 122"
          fill="none"
          stroke={K.redDark}
          strokeWidth="4.5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - fragile}
          filter={`url(#${prefix}-ink-bleed)`}
        />

        {/* Torn Bottom-Left Corner Flap */}
        <path d="M30 493 Q56 467 94 472 L101 501 Q62 491 30 493 Z" fill="#EAE0CE" stroke={K.night} strokeWidth="2.5" filter={`url(#${prefix}-cutout-shadow)`} />
        <path
          d="M30 493 Q63 488 101 501"
          fill="none"
          stroke={K.redDark}
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - fragile}
          filter={`url(#${prefix}-ink-bleed)`}
        />

        {/* Scattering Fibrous Paper Dust Particles */}
        {Array.from({length: 8}, (_, i) => {
          const angle = i * 0.8;
          const dist = fragile * (35 + (i * 12) % 25);
          return (
            <rect
              key={i}
              x={590 + Math.cos(angle) * dist}
              y={90 + Math.sin(angle) * dist}
              width={3 + (i % 3)}
              height={3 + (i % 2)}
              fill={i % 2 === 0 ? K.redDark : K.night}
              opacity={1 - fragile * 0.5}
              transform={`rotate(${i * 25} 590 90)`}
            />
          );
        })}

        {/* Editorial Warning Stamp */}
        <g transform="translate(192 258) rotate(-8 145 32)" filter={`url(#${prefix}-cutout-shadow)`}>
          <rect x="0" y="0" width="290" height="64" rx="5" fill="#FFFCF5" fillOpacity=".86" stroke="#C6283D" strokeWidth="4.5" strokeDasharray="8 4" />
          <text x="145" y="42" textAnchor="middle" fill="#C6283D" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="2.5">
            DEGRADED RECORD
          </text>
        </g>

        {/* Ink Smudges & Bleeds */}
        <path d="M400 236q48 9 104-8" fill="none" stroke="#52677D" strokeWidth="12" strokeLinecap="round" opacity="0.3" filter={`url(#${prefix}-ink-smudge)`} />
        <path d="M434 253h79" fill="none" stroke="#52677D" strokeWidth="6" strokeLinecap="round" opacity="0.25" filter={`url(#${prefix}-ink-smudge)`} />
      </g>

      {/* Masking Tape Strips Holding Journal to Desk */}
      <MaskingTape x={38} y={32} rotate={-6} width={34} height={58} prefix={prefix} />
      <MaskingTape x={294} y={34} rotate={3} width={32} height={46} prefix={prefix} />
      <MaskingTape x={558} y={462} rotate={-4} width={36} height={52} prefix={prefix} />
      </g>
      <g
        opacity={1 - opening}
        transform={`translate(${coverShift} 0) translate(150 0) scale(${coverScale} 1) translate(-150 0)`}
      >
        <path
          d="M150 79Q168 55 204 58H500Q532 56 542 81V480Q519 462 490 467H150Z"
          fill="#2E4961"
          stroke={K.night}
          strokeWidth="5"
          filter={`url(#${prefix}-ink-bleed)`}
        />
        <path d="M166 91Q181 73 207 75H489Q511 74 525 91V454Q508 441 485 445H166Z" fill="none" stroke={K.gold} strokeWidth="2.5" opacity=".8" />
        <path d="M177 106V439" stroke={K.red} strokeWidth="7" strokeLinecap="round" />
        <g opacity={coverTypeOpacity}>
          <circle cx="350" cy="191" r="31" fill={K.gold} stroke={K.night} strokeWidth="3" />
          <path d="M350 207c-15-10-19-19-12-26 5-5 11-2 12 3 2-5 8-8 13-3 7 7 2 16-13 26Z" fill={K.paperLight} stroke={K.night} strokeWidth="1.5" />
          <text x="350" y="274" textAnchor="middle" fill={K.paperLight} fontSize="30" fontFamily="Georgia, serif" fontWeight="700" letterSpacing="2">
            BABYBOOK+
          </text>
          <path d="M264 293H436" stroke={K.red} strokeWidth="3" strokeLinecap="round" />
          <text x="350" y="326" textAnchor="middle" fill="#F2E8D3" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="2">
            A FAMILY KEEPSAKE
          </text>
          <text x="350" y="407" textAnchor="middle" fill="#D6E2EA" fontSize="11" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="1.4">
            MEMORIES  /  MILESTONES  /  HEALTH
          </text>
        </g>
      </g>
    </g>
  );
};

const GrowthLine = ({progress, prefix = 'act2'}: {progress: number; prefix?: string}) => (
  <g>
    <path d="M0 114H390M0 166H390M0 218H390M0 270H390" stroke="#94A3B8" strokeWidth="1.8" strokeDasharray="4 8" />
    <path
      d="M24 247C71 232 99 230 136 216S204 194 238 179 300 149 370 113"
      fill="none"
      stroke={K.blue}
      strokeWidth="4.5"
      strokeDasharray="7 8"
    />
    <path
      d="M24 267C70 255 100 246 136 249S204 217 238 225 307 194 370 174"
      fill="none"
      stroke={K.redDark}
      strokeWidth="7"
      strokeLinecap="round"
      pathLength="1"
      strokeDasharray="1"
      strokeDashoffset={1 - progress}
      filter={`url(#${prefix}-ink-bleed)`}
    />
    {[
      [24, 267],
      [136, 249],
      [238, 225],
      [370, 174],
    ].map(([x, y], i) => (
      <circle
        key={i}
        cx={x}
        cy={y}
        r="8"
        fill={K.paperLight}
        stroke={K.night}
        strokeWidth="3.5"
        opacity={progress > i / 4 ? 1 : 0}
      />
    ))}
  </g>
);

const TinyMemory = ({
  x,
  y,
  rotate,
  color,
  kind,
  caption,
  completed,
  prefix = 'act2',
}: {
  x: number;
  y: number;
  rotate: number;
  color: string;
  kind: number;
  caption?: string;
  completed?: number;
  prefix?: string;
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate} 118 92)`} filter={`url(#${prefix}-cutout-shadow)`}>
    {/* Sharp Polaroid Paper Cutout */}
    <rect x="0" y="0" width="236" height="190" fill="#FFFCF5" stroke={K.night} strokeWidth="2.8" />
    <rect x="13" y="13" width="210" height="127" fill={color} stroke={K.night} strokeWidth="2" />
    <rect x="13" y="13" width="210" height="127" fill={`url(#${prefix}-halftone)`} />

    {kind === 0 && (
      <>
        <circle cx="104" cy="65" r="27" fill={K.paperLight} stroke={K.night} strokeWidth="2.5" />
        <path d="M52 127q7-45 54-45t57 45" fill={K.blue} stroke={K.night} strokeWidth="2.5" />
        <circle cx="170" cy="48" r="15" fill={K.gold} />
      </>
    )}
    {kind === 1 && (
      <>
        <path d="M43 112 89 60l32 35 33-50 45 67Z" fill={K.green} stroke={K.night} strokeWidth="2.5" />
        <circle cx="174" cy="40" r="14" fill={K.gold} />
      </>
    )}
    {kind === 2 && (
      <>
        <circle cx="120" cy="64" r="24" fill={K.paperLight} stroke={K.night} strokeWidth="2.5" />
        <path d="M65 127q4-45 54-45t54 45" fill={K.red} stroke={K.night} strokeWidth="2.5" />
        <path d="M96 60q24-34 48 0" fill="none" stroke={K.night} strokeWidth="8" />
      </>
    )}

    {/* Top Masking Tape Strip */}
    <MaskingTape x={82} y={-11} rotate={-2} width={72} height={22} prefix={prefix} />

    {caption && (
      <text x="18" y="172" fill={K.ink} fontFamily="Georgia, serif" fontSize="16" fontStyle="italic" fontWeight="700">
        {caption}
      </text>
    )}
    {completed !== undefined && (
      <g opacity={completed} transform="translate(202 28)">
        <circle r="14" fill={K.green} stroke={K.night} strokeWidth="2.5" />
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
      let on = (x * 17 + y * 31 + x * y * 7) % 11 < 5;
      if (inFinder) {
        const fx = x < 7 ? x : x - (width - 7);
        const fy = y < 7 ? y : y - (width - 7);
        on =
          fx === 0 ||
          fx === 6 ||
          fy === 0 ||
          fy === 6 ||
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

/* ============================================================================
 * ACT ONE — VOX EDITORIAL COLLAGE ("01 / THE PAPER PROBLEM")
 * ============================================================================ */
const ActOne = ({frame}: {frame: number}) => {
  const bookAt = cueFrame(0, 1);
  // Act One narration marks are seconds:frames at 30 fps.
  const babyNotesAt = 11 * fps;
  const thirdNotebookAt = 11 * fps + 20;
  const cardAt = 13 * fps + 13;
  const memoryAt = cueFrame(0, 2);
  const fragileAt = cueFrame(0, 3);
  const scatterAt = cueFrame(0, 4);
  const clinicAt = cueFrame(0, 5);
  // The "often buried" phrase falls about 4.5 seconds into the clinic cue.
  const recordCueAt = clinicAt + Math.round(4.5 * fps);

  const bookOpenAt = bookAt + 18;
  const babyNotesPop = spring({
    frame: Math.max(0, frame - babyNotesAt),
    fps,
    config: {damping: 17, stiffness: 95, mass: 0.85},
  });
  const thirdNotebookPop = spring({
    frame: Math.max(0, frame - thirdNotebookAt),
    fps,
    config: {damping: 17, stiffness: 95, mass: 0.85},
  });
  const cardReveal = ease(frame, cardAt, 14);
  const cardPop = spring({
    frame: Math.max(0, frame - cardAt),
    fps,
    config: {damping: 17, stiffness: 95, mass: 0.85},
  });
  const archiveFade = 1 - ease(frame, fragileAt, 24);
  const timelineExit = ease(frame, bookAt - 28, 22);
  const growthDraw = sweep(frame, 12, 190);
  const paperExit = ease(frame, clinicAt - 18, 24);
  const transitProgress = ease(frame, scatterAt, 24);
  const wornProgress = ease(frame, scatterAt + 42, 24);
  const looseProgress = ease(frame, scatterAt + 102, 24);
  const transitPaper = transitProgress * (1 - paperExit);
  const wornPaper = wornProgress * (1 - paperExit);
  const looseEntry = looseProgress * (1 - paperExit);
  const clinic = ease(frame, clinicAt, 28);
  const notebookStack = ease(frame, babyNotesAt, 14) * archiveFade * (1 - clinic);
  const thirdNotebook = ease(frame, thirdNotebookAt, 14) * archiveFade * (1 - clinic);
  const notebookFade = 1 - ease(frame, clinicAt, 26);
  const immunization = cardReveal * (1 - ease(frame, scatterAt, 24)) * (1 - clinic);
  const clinicSpring = spring({
    frame: Math.max(0, frame - clinicAt),
    fps,
    config: {damping: 14, stiffness: 110},
  });
  const clinicSlideX = interpolate(clinicSpring, [0, 1], [420, 0]);
  const urgentPulse = 1 + 0.035 * Math.sin(frame * 0.15);
  const missingRecord = ease(frame, recordCueAt - 6, 18);
  const missingRecordX = interpolate(missingRecord, [0, 1], [-28, 0]);

  return (
    <AbsoluteFill style={{background: '#F9F6F0', color: K.ink, overflow: 'hidden'}}>
      {/* Warm Pastel Editorial Blooms (Top-Left Sky, Top-Right Rose) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 12% 16%, rgba(135,188,235,0.22), transparent 36%), radial-gradient(circle at 86% 14%, rgba(255,141,161,0.24), transparent 38%)',
        }}
      />

      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <VoxDefs prefix="act1" />

        {/* Ruled Notebook Lines Across Entire Canvas */}
        <rect x="0" y="0" width="1920" height="1080" fill="url(#act1-ruled-paper)" />

        {/* Warm Kraft Desk Horizon Base */}
        <path d="M0 895 Q480 882 960 892 T1920 888 V1080 H0 Z" fill="#EFE8DA" filter="url(#act1-paper-grain)" />
        <line x1="0" y1="892" x2="1920" y2="890" stroke="#D2C6B2" strokeWidth="2.5" />

        {/* ===================================================================
         * HERO OPEN NOTEBOOK (Always visible in Act 1, opens & populates)
         * =================================================================== */}
        <g
          opacity={notebookFade}
          transform={`translate(0 ${floatY(frame, 0.018, 3)})`}
        >
          <Notebook frame={frame} openAt={bookOpenAt} memoryAt={memoryAt} fragileAt={fragileAt} prefix="act1" />
        </g>

        {/* Secondary Stacked Notebooks (Left Margin) */}
        <g opacity={notebookStack} transform={`translate(220 650) scale(${babyNotesPop}) translate(-220 -650)`}>
          <g transform="translate(95 493) rotate(-4 170 106) scale(0.74)" filter="url(#act1-cutout-shadow)">
            <rect x="7" y="7" width="340" height="212" fill="#D8E5ED" stroke={K.night} strokeWidth="3" />
            <path d="M0 0H328L340 12V200L328 212H0Z" fill="#FFFCF5" stroke={K.night} strokeWidth="3.5" />
            <path d="M0 0h18v212H0Z" fill={K.blue} />
            <rect x="18" y="0" width="322" height="212" fill="url(#act1-halftone)" opacity=".32" />
            <text x="42" y="31" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" letterSpacing="1.2">
              FAMILY JOURNAL / 01
            </text>
            <text x="42" y="72" fill={K.ink} fontFamily="Georgia, serif" fontSize="31" fontWeight="700">
              Baby notes
            </text>
            <path d="M42 88h252" stroke={K.redDark} strokeWidth="3" strokeLinecap="round" />
            <text x="42" y="116" fill="#475569" fontFamily="Arial, sans-serif" fontSize="11" fontWeight="800" letterSpacing=".8">
              LITTLE MOMENTS
            </text>
            <circle cx="47" cy="143" r="4" fill={K.blue} />
            <path d="M61 143h220" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="47" cy="171" r="4" fill={K.gold} />
            <path d="M61 171h190" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <MaskingTape x={130} y={-12} rotate={2} width={76} height={22} prefix="act1" />
          </g>
        </g>

        {/* Separate visit log appears on the "notebooks" narration cue. */}
        <g opacity={thirdNotebook} transform={`translate(500 550) scale(${thirdNotebookPop}) translate(-500 -550)`}>
          <g transform="translate(390 408) rotate(3 150 95) scale(0.72)" filter="url(#act1-cutout-shadow)">
            <rect x="7" y="7" width="300" height="190" fill="#D6E2D8" stroke={K.night} strokeWidth="3" />
            <path d="M0 0H286L300 14V190H0Z" fill="#FFFCF5" stroke={K.night} strokeWidth="3.5" />
            <path d="M0 0h18v190H0Z" fill={K.green} />
            <rect x="18" y="0" width="282" height="190" fill="url(#act1-halftone)" opacity=".28" />
            <text x="38" y="31" fill={K.green} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" letterSpacing="1.1">
              CHECK-UP JOURNAL
            </text>
            <text x="38" y="70" fill={K.ink} fontFamily="Georgia, serif" fontSize="29" fontWeight="700">
              Visit log
            </text>
            <path d="M38 85h220" stroke={K.gold} strokeWidth="4" strokeLinecap="round" />
            <text x="38" y="112" fill="#475569" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="800" letterSpacing=".8">
              DATES / NOTES
            </text>
            <circle cx="43" cy="139" r="4" fill={K.red} />
            <path d="M58 139h192" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="43" cy="164" r="4" fill={K.blue} />
            <path d="M58 164h172" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <MaskingTape x={112} y={-12} rotate={-2} width={76} height={22} prefix="act1" />
          </g>
        </g>

        {/* DOH Immunization Card Cutout */}
        <g
          opacity={immunization * archiveFade}
          transform={`translate\(668 747\) scale(${cardPop}) translate\(-668 -747\)`}
        >
          <g transform="translate(530 583) rotate(3 135 90) scale(1.02)" filter="url(#act1-cutout-shadow)">
          <rect x="7" y="7" width="270" height="180" fill="#D9E5DD" stroke={K.night} strokeWidth="3" />
          <path d="M0 0H258L270 12V180H0Z" fill={K.paperLight} stroke={K.night} strokeWidth="3.5" />
          <path d="M0 0h270v42H0Z" fill={K.blue} />
          <text x="14" y="27" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing=".7">
            PHILIPPINES / DOH
          </text>
          <circle cx="246" cy="21" r="12" fill={K.paperLight} />
          <path d="M244 13h4v6h6v4h-6v6h-4v-6h-6v-4h6Z" fill={K.blue} />
          <text x="16" y="69" fill={K.night} fontFamily="Arial, sans-serif" fontSize="14" fontWeight="800" letterSpacing=".4">
            CHILD IMMUNIZATION
          </text>
          <text x="16" y="89" fill="#64748B" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="800" letterSpacing="1">
            RECORD CARD
          </text>
          <circle cx="20" cy="112" r="5" fill={K.blue} />
          <path d="M34 112h210" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="139" r="5" fill={K.red} />
          <path d="M34 139h210" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="166" r="5" fill={K.gold} />
          <path d="M34 166h160" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
          <MaskingTape x={96} y={-12} rotate={-4} width={78} height={22} prefix="act1" />
          </g>
        </g>

        {/* Loose records arrive in sequence with the narration. */}
        <g
          opacity={transitPaper}
          transform={`translate(${interpolate(transitProgress, [0, 1], [250, 250])} ${interpolate(transitProgress, [0, 1], [445, 480])}) scale(${interpolate(transitProgress, [0, 1], [1, 1.5])})`}
        >
          <g
            transform={`rotate(${interpolate(transitProgress, [0, 1], [4, -10])} 110 75)`}
            filter="url(#act1-cutout-shadow)"
          >
            <path d="M8 0H204L220 16V150H0V10Z" fill="#DCE7EA" stroke={K.night} strokeWidth="3" />
            <path d="M0 10 8 0H204L220 16V142H0Z" fill="#FFFCF5" stroke={K.night} strokeWidth="2.5" />
            <path d="M0 10 8 0V142H0Z" fill={K.blue} />
            <rect x="8" y="0" width="212" height="150" fill="url(#act1-halftone)" opacity=".16" />
            <text x="20" y="25" fill={K.blue} fontSize="11" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="1.1">
              TRANSFER COPY / 04
            </text>
            <text x="20" y="53" fill={K.night} fontSize="19" fontFamily="Georgia, serif" fontWeight="700">
              Visit summary
            </text>
            <path d="M20 65h178" stroke={K.gold} strokeWidth="3" strokeLinecap="round" />
            <text x="20" y="88" fill="#475569" fontSize="10" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".8">
              FILE ROUTE
            </text>
            <path d="M20 101h164M20 119h118" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <g transform="translate(112 91) rotate(-8)">
              <rect x="0" y="0" width="91" height="25" rx="3" fill="#FFFCF5" stroke={K.redDark} strokeWidth="2" strokeDasharray="5 3" />
              <text x="45.5" y="17" textAnchor="middle" fill={K.redDark} fontSize="10" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".8">
                IN TRANSIT
              </text>
            </g>
            <path d="M193 0H220V28L208 22 201 29 193 21Z" fill="#E8DDCB" stroke={K.night} strokeWidth="1.5" />
            <MaskingTape x={82} y={-11} rotate={-3} width={56} height={19} prefix="act1" />
          </g>
        </g>

        <g
          opacity={wornPaper}
          transform={`translate(${interpolate(wornProgress, [0, 1], [250, 250])} ${interpolate(wornProgress, [0, 1], [560, 660])}) scale(${interpolate(wornProgress, [0, 1], [1, 1.5])})`}
        >
          <g transform={`rotate(${interpolate(wornProgress, [0, 1], [18, 8])} 94 66)`} filter="url(#act1-cutout-shadow)">
            <path d="M6 5 186 0 188 126 0 132Z" fill="#D9E5DD" stroke={K.night} strokeWidth="3" />
            <path d="M0 0H174L188 14V126L0 132Z" fill="#F6F2E8" stroke={K.night} strokeWidth="2.5" />
            <path d="M0 0h14v130H0Z" fill={K.green} />
            <rect x="14" y="0" width="174" height="132" fill="url(#act1-halftone)" opacity=".18" />
            <text x="25" y="25" fill={K.green} fontSize="10" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".7">
              VACCINE RECORD
            </text>
            <path d="M25 35h144" stroke={K.redDark} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="29" cy="57" r="3.5" fill={K.blue} />
            <path d="M41 57h125" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="29" cy="78" r="3.5" fill={K.gold} />
            <path d="M41 78h113" stroke="#A8B0B5" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="29" cy="99" r="3.5" fill={K.red} />
            <path d="M41 99h88" stroke="#B8B8AD" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M155 0h33v31l-13-7-8 9-12-8Z" fill="#E4D8C6" stroke={K.night} strokeWidth="1.5" />
            <path d="M142 39q18 5 36-2" fill="none" stroke={K.redDark} strokeWidth="2.5" opacity=".65" filter="url(#act1-ink-smudge)" />
          </g>
        </g>

        <g
          opacity={looseEntry}
          transform={`translate(${interpolate(looseProgress, [0, 1], [430, 430])} ${interpolate(looseProgress, [0, 1], [560, 648])}) scale(${interpolate(looseProgress, [0, 1], [1, 1.5])})`}
        >
          <g transform={`rotate(${interpolate(looseProgress, [0, 1], [12, -7])} 78 54)`} filter="url(#act1-cutout-shadow)">
            <path d="M0 0H156V108H0Z" fill="#FFF8E9" stroke={K.night} strokeWidth="2.5" />
            <path d="M0 0h156v10H0Z" fill={K.gold} />
            <text x="12" y="30" fill={K.redDark} fontSize="9" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".7">
              LOOSE ENTRY
            </text>
            <text x="12" y="51" fill={K.night} fontSize="15" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700">
              14 / 06
            </text>
            <path d="M12 66h130M12 83h83" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="135" cy="84" r="7" fill={K.red} opacity=".78" />
            <path d="M138 0h18v20" fill="none" stroke="#D8C9AA" strokeWidth="2" />
            <MaskingTape x={55} y={-8} rotate={2} width={48} height={16} prefix="act1" />
          </g>
        </g>

        {/* Loose clinical history card makes the missing-record narration concrete. */}
        <g
          opacity={missingRecord}
          transform={`translate(${missingRecordX} ${Math.sin(frame * 0.045) * 2})`}
          filter="url(#act1-cutout-shadow)"
        >
          <g transform="translate(-350 -35)">
            <g transform="translate(850 670) scale(1.7) translate(-850 -670)">
              <g transform="rotate(-6 850 670)">
                <path d="M700 588h103l22 23h182v174H700Z" fill="#DCE8EE" stroke={K.night} strokeWidth="3.5" />
                <rect x="718" y="613" width="270" height="145" fill="#FFFCF5" stroke={K.night} strokeWidth="2.5" />
                <text x="738" y="644" fill={K.night} fontSize="16" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".5">
                  CHILD HEALTH RECORD
                </text>
                <circle cx="742" cy="675" r="5" fill={K.blue} />
                <path d="M757 675h192" stroke="#94A3B8" strokeWidth="3" />
                <circle cx="742" cy="699" r="5" fill={K.green} />
                <path d="M757 699h192" stroke="#94A3B8" strokeWidth="3" />
                <g transform="rotate(-7 850 725)">
                  <rect x="752" y="707" width="196" height="38" rx="3" fill="#C6283D" stroke={K.night} strokeWidth="2.5" />
                  <text x="850" y="733" textAnchor="middle" fill={K.paperLight} fontSize="17" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="1">
                    NOT FOUND
                  </text>
                </g>
              </g>
            </g>
          </g>
        </g>
        <g opacity={missingRecord} fill="none" stroke={K.redDark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M790 680Q925 650 1074 646" strokeDasharray="10 10" strokeDashoffset={interpolate(missingRecord, [0, 1], [60, 0])} />
          <path d="m1060 640 17 6-7 17" />
        </g>

        {/* Center-right clinic card, with separate time and urgency badges. */}
        <g opacity={clinic} transform={`translate(${clinicSlideX} 0)`} filter="url(#act1-cutout-shadow)">
          <g transform="translate(1080 278)">
            <rect x="0" y="0" width="560" height="490" rx="12" fill="#FFFCF5" stroke={K.night} strokeWidth="4" />
            <rect x="0" y="0" width="560" height="490" rx="12" fill="url(#act1-halftone)" opacity=".22" />
            <rect x="0" y="0" width="560" height="76" rx="12" fill={K.blue} stroke={K.night} strokeWidth="4" />
            <text x="28" y="48" fill="#FFFFFF" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="1">
              CLINIC
            </text>
            <rect x="300" y="20" width="136" height="38" rx="6" fill="#E9F2FC" stroke={K.night} strokeWidth="2" />
            <text x="368" y="45" textAnchor="middle" fill={K.night} fontSize="17" fontFamily="Arial, sans-serif" fontWeight="800">
              8:42 AM
            </text>
            <g transform={`translate(498 39) scale(${urgentPulse}) translate(-498 -39)`}>
              <rect x="458" y="20" width="80" height="38" rx="6" fill={K.redDark} stroke={K.night} strokeWidth="2" />
              <text x="498" y="45" textAnchor="middle" fill={K.paperLight} fontSize="13" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".5">
                RUSH
              </text>
            </g>

            <MaskingTape x={238} y={-13} rotate={-2} width={84} height={26} prefix="act1" />

            <circle cx="280" cy="298" r="164" fill="#EAF1F7" />
            <g transform={`translate(168 ${112 + Math.sin(frame * 0.08) * 3})`}>
              <ParentAndChild x={0} y={0} scale={1.12} coat={K.blue} childCoat={K.gold} prefix="act1" />
            </g>
            <rect x="150" y="438" width="260" height="32" rx="16" fill="#E9F2FC" stroke="#8DAFCF" strokeWidth="2" />
            <text x="280" y="459" textAnchor="middle" fill={K.night} fontSize="13" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".7">
              PEDIATRIC VISIT
            </text>
          </g>
        </g>

        {/* ===================================================================
         * BOTTOM VOX EDITORIAL TIMELINE BAR (Matches Reference Bottom Track)
         * =================================================================== */}
        <g opacity={1 - timelineExit} transform="translate(0 842)">
          <rect x="145" y="-10" width="1630" height="20" rx="10" fill="#CBD5E1" />
          <g style={{clipPath: `inset(0 ${(1 - growthDraw) * 100}% 0 0)`}}>
            <rect x="145" y="-10" width="270" height="20" fill={K.red} />
            <rect x="415" y="-10" width="540" height="20" fill={K.gold} />
            <rect x="955" y="-10" width="820" height="20" fill={K.green} />
          </g>
          {[
            {x: 145, label: 'BIRTH', color: K.blueLight},
            {x: 415, label: '1 YEAR', color: K.red},
            {x: 685, label: '2 YEARS', color: K.gold},
            {x: 955, label: '3 YEARS', color: K.green},
            {x: 1225, label: '4 YEARS', color: K.lilac},
            {x: 1495, label: '5 YEARS', color: K.redDark},
            {x: 1775, label: '6 YEARS', color: K.blue},
          ].map(({x, label, color}) => (
            <g key={label} transform={`translate(${x} 0)`}>
              <circle r="15" fill={K.paperLight} stroke={K.night} strokeWidth="2" />
              <circle r="8" fill={color} />
              <text y="44" textAnchor="middle" fill={K.night} fontSize="15" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".4">
                {label}
              </text>
            </g>
          ))}
          <g opacity={ease(frame, 96, 16)} transform={`translate(${interpolate(ease(frame, 96, 16), [0, 1], [365, 415])} -43)`}>
            <rect x="-68" y="-18" width="136" height="28" rx="14" fill={K.paperLight} stroke={K.redDark} strokeWidth="2" />
            <text textAnchor="middle" y="1" fill={K.night} fontSize="12" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing=".5">FIRST STEPS</text>
          </g>
        </g>

      </svg>

      <EditorialTitle
        frame={frame}
        x={100}
        y={76}
        width={760}
        index="01"
        label="The paper problem"
        accent={E.gold}
        showKicker={false}
        start={2}
        lines={[
          {
            text: 'Six years.',
            size: 118,
            highlight: ['years'],
            highlightColor: E.gold,
          },
        ]}
        subtitle="A thousand little things to remember."
      />

      <KineticSuper
        frame={frame}
        start={fragileAt}
        end={scatterAt}
        x={100}
        y={336}
        width={840}
        label="The keepsake"
        size={62}
        accent={E.coral}
        lines={[
          {
            text: 'Paper is fragile.',
            highlight: ['fragile'],
            highlightColor: E.gold,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={scatterAt}
        end={clinicAt}
        x={100}
        y={336}
        width={930}
        label="What happens next"
        size={54}
        accent={E.coral}
        lines={[
          {
            text: 'Lost. Damaged. Scattered.',
            highlight: ['Scattered.'],
            highlightColor: E.pink,
            wordStarts: [
              scatterAt,
              scatterAt + Math.round(2.4 * fps),
              scatterAt + Math.round(4.6 * fps),
            ],
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={recordCueAt}
        end={actFrames[0] - 8}
        x={100}
        y={336}
        width={820}
        label="At the clinic"
        size={62}
        accent={E.coral}
        lines={[
          {
            text: 'Buried or missing.',
            accent: ['missing.'],
            highlight: ['missing.'],
            highlightColor: E.pink,
          },
        ]}
      />
    </AbsoluteFill>
  );
};

const BabyBookBookIcon = ({
  x,
  y,
  scale,
  drawProgress = 1,
  pageProgress = 1,
}: {
  x: number;
  y: number;
  scale: number;
  drawProgress?: number;
  pageProgress?: number;
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <g transform="translate(60 140)">
      <path
        d="M 10,15 Q 60,-5 110,15 L 110,110 Q 60,90 10,110 Z"
        fill="none"
        stroke="#9cbdd8"
        strokeWidth="8"
        strokeDasharray="1200"
        strokeDashoffset={1200 * (1 - drawProgress)}
      />
      <path
        d="M 110,15 Q 160,-5 210,15 L 210,110 Q 160,90 110,110 Z"
        fill="none"
        stroke="#9cbdd8"
        strokeWidth="8"
        strokeDasharray="1200"
        strokeDashoffset={1200 * (1 - drawProgress)}
      />
      <g opacity={pageProgress} transform={`translate(0 ${10 * (1 - pageProgress)})`}>
        <path d="M 20,25 Q 60,10 105,25 L 105,100 Q 60,85 20,100 Z" fill="#ffffff" stroke="#9cbdd8" strokeWidth="6" />
        <path d="M 115,25 Q 160,10 200,25 L 200,100 Q 160,85 115,100 Z" fill="#ffffff" stroke="#9cbdd8" strokeWidth="6" />
        <g fill="none" stroke="#9cbdd8" strokeWidth="5">
          <path d="M 35,45 L 90,45" />
          <path d="M 35,60 L 90,60" />
          <path d="M 35,75 L 90,75" />
          <path d="M 35,90 L 90,90" />
          <path d="M 130,45 L 185,45" />
          <path d="M 130,60 L 185,60" />
          <path d="M 130,75 L 185,75" />
          <path d="M 130,90 L 185,90" />
        </g>
      </g>
    </g>
  </g>
);

/* ============================================================================
 * ACT TWO — DIGITAL COMPANION ("02 / BABYBOOK+")
 * ============================================================================ */
const ActTwo = ({frame}: {frame: number}) => {
  const landing = 1 - ease(frame, cueFrame(1, 2), 32);
  const health = ease(frame, cueFrame(1, 3), 34);
  const reminders = ease(frame, cueFrame(1, 9), 28);
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
  /* ============================================================================
   * ACT 2 — NARRATION-SYNCED IMAGE SEQUENCE
   * Each caption cue maps to one image from public/image/. Images crossfade at
   * cue boundaries; enter babybook+ is the default.
   * ============================================================================ */
  const act2Images = [
    { startSec: 0, endSec: 1.1, src: 'image/enter babybook+.jpg' },
    { startSec: 1.25, endSec: 8.51, src: null },
    { startSec: 8.71, endSec: 14.21, src: null },
    { startSec: 14.41, endSec: 16.80, src: 'image/manage child profile.jpg' },
    { startSec: 16.80, endSec: 18.45, src: 'image/log illnesses.jpg' },
    { startSec: 18.45, endSec: 19.94, src: 'image/track allergies.jpg' },
    { startSec: 20.1, endSec: 25.9, src: 'image/monitor who.jpg' },
    { startSec: 25.9, endSec: 29.45, src: null },
    { startSec: 29.45, endSec: 30.8, src: null },
    { startSec: 30.8, endSec: 34.85, src: 'image/dedicated milestone.jpg' },
    { startSec: 35.1, endSec: 42.03, src: 'image/upload photo memories.jpg' },
    { startSec: 42.1, endSec: 52.83, src: 'image/automated checkup.jpg' },
  ];

  const nowSec = frame / fps;
  let activeImage = act2Images[0].src;
  let nextImage: string | null = null;
  let crossProgress = 0;

  let currentCueIndex = -1;
  for (let i = 0; i < act2Images.length; i++) {
    const cue = act2Images[i];
    const nextCue = act2Images[i + 1];
    if (nowSec >= cue.startSec && nowSec < (nextCue?.startSec ?? Infinity)) {
      currentCueIndex = i;
      break;
    }
    // Carry forward the last non-null image so null (hold) cues keep it.
    if (cue.src) {
      activeImage = cue.src;
    }
  }

  if (currentCueIndex !== -1) {
    const cue = act2Images[currentCueIndex];
    const nextCue = act2Images[currentCueIndex + 1];
    if (cue.src) {
      activeImage = cue.src;
      if (nextCue && nextCue.src && cue.src !== nextCue.src) {
        const crossStart = Math.round(nextCue.startSec * fps) - 12;
        const crossEnd = Math.round(nextCue.startSec * fps);
        crossProgress = interpolate(frame, [crossStart, crossEnd], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        if (frame >= crossStart && frame < crossEnd) {
          nextImage = nextCue.src;
        }
      }
    }
  }

  return (
    <AbsoluteFill style={{background: '#F9F6F0', color: K.ink, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 84% 16%, rgba(255,141,161,0.22), transparent 36%), radial-gradient(circle at 14% 22%, rgba(74,144,226,0.14), transparent 36%)',
        }}
      />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <VoxDefs prefix="act2" />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#act2-ruled-paper)" />
        <path d="M0 845 Q445 815 912 842 T1920 832 V1080 H0 Z" fill="#EFE8DA" />
        <line x1="0" y1="840" x2="1920" y2="835" stroke="#D2C6B2" strokeWidth="2.5" />

        {/* Taped Polaroid Memory Cutouts */}
        <g opacity={firstMemory} transform={`translate(112 ${426 + floatY(frame, 0.035, 3) * firstMemory})`}>
          <TinyMemory x={0} y={0} rotate={-2} color="#FFE1E7" kind={0} caption="That first little laugh" prefix="act2" />
        </g>
        <g opacity={secondMemory} transform={`translate(388 ${426 + floatY(frame + 12, 0.035, 3) * secondMemory})`}>
          <TinyMemory x={0} y={0} rotate={1.5} color="#DCEBFA" kind={1} caption="First steps" completed={secondMemory} prefix="act2" />
        </g>
        <g opacity={thirdMemory} transform={`translate(664 ${426 + floatY(frame + 24, 0.035, 3) * thirdMemory})`}>
          <TinyMemory x={0} y={0} rotate={-1.5} color="#F6DCE5" kind={2} caption="A new favorite" prefix="act2" />
        </g>

        {/* Health Feature Stamps */}
        <g opacity={health}>
          {['profile', 'allergies', 'growth'].map((item, i) => {
            const x = 228 + i * 276;
            const bob = floatY(frame + i * 17, 0.055, 3);
            return (
              <g key={item} transform={`translate(${x} ${696 + bob})`}>
                <circle cx="0" cy="0" r="22" fill={[K.red, K.green, K.blueLight][i]} stroke={K.night} strokeWidth="3" />
                {i === 0 && (
                  <>
                    <circle cx="0" cy="-4" r="4" fill={K.paperLight} />
                    <path d="M-8 10q1-9 8-9t8 9" fill={K.paperLight} />
                  </>
                )}
                {i === 1 && (
                  <path
                    d="M-8 4q2-12 16-12-2 12-16 12Zm0 0 9-8"
                    fill="none"
                    stroke={K.paperLight}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {i === 2 && (
                  <path
                    d="m-9 7 6-6 4 3 8-9M5-5h4v4"
                    fill="none"
                    stroke={K.paperLight}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                <text x="0" y="50" textAnchor="middle" fill={K.night} fontFamily="Arial, sans-serif" fontSize="16" fontWeight="800">
                  {item.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>

        {/* Narration-synced images */}
        <image
          key="act2-active-image"
          x={1000}
          y={110}
          width={440}
          height={700}
          href={staticFile(activeImage ?? 'image/enter babybook+.jpg')}
          preserveAspectRatio="xMidYMid meet"
          style={{opacity: 1 - crossProgress}}
        />
        {nextImage && (
          <image
            key="act2-next-image"
            x={1000}
            y={110}
            width={440}
            height={700}
            href={staticFile(nextImage)}
            preserveAspectRatio="xMidYMid meet"
            style={{opacity: crossProgress}}
          />
        )}

        {/* SDG 3 Editorial Stamp Badge */}
        <g opacity={sdg} transform={`translate(${interpolate(sdg, [0, 1], [28, 0])} 0)`} filter="url(#act2-cutout-shadow)">
          <rect x="1590" y="630" width="300" height="118" fill="#4C9F38" stroke={K.night} strokeWidth="3.5" />
          <text x="1612" y="690" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="54" fontWeight="800">
            3
          </text>
          <path d="M1608 711h13l6-10 7 19 8-13h12" fill="none" stroke={K.paperLight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="1660" y="657" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="700">
            Sustainable Development Goal
          </text>
          <text x="1660" y="690" fill={K.paperLight} fontFamily="Georgia, serif" fontSize="20" fontWeight="700">
            Good health and
          </text>
          <text x="1660" y="716" fill={K.paperLight} fontFamily="Georgia, serif" fontSize="20" fontWeight="700">
            well-being
          </text>
        </g>
      </svg>

      <EditorialTitle
        frame={frame}
        x={100}
        y={76}
        width={900}
        index="02"
        label="The digital companion"
        accent={E.gold}
        showKicker={false}
        start={2}
        lines={[
          {
            text: 'Health has a history.',
            size: 76,
            highlight: ['history.'],
            highlightColor: E.gold,
          },
        ]}
        subtitle="A digital companion keeps the whole story close."
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(1, 2)}
        end={cueFrame(1, 3)}
        x={100}
        y={232}
        width={860}
        label="In one place"
        size={48}
        accent={E.blue}
        lines={[
          {
            text: 'One app. The whole story.',
            highlight: ['whole'],
            highlightColor: E.gold,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(1, 3)}
        end={cueFrame(1, 4)}
        x={100}
        y={232}
        width={860}
        label="The platform"
        size={48}
        accent={E.blue}
        lines={[
          {
            text: 'Health, kept clear.',
            highlight: ['clear.'],
            highlightColor: E.blue,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(1, 4)}
        end={cueFrame(1, 6)}
        x={100}
        y={232}
        width={900}
        label="The measurements"
        size={48}
        accent={E.blue}
        lines={[
          {
            text: 'Growth, on the record.',
            highlight: ['record.'],
            highlightColor: E.blue,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(1, 6)}
        end={cueFrame(1, 8)}
        x={100}
        y={232}
        width={980}
        label="The milestones"
        size={48}
        accent={E.blue}
        lines={[
          {
            text: 'Milestones, remembered.',
            highlight: ['remembered.'],
            highlightColor: E.pink,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(1, 8)}
        end={sdgStart}
        x={100}
        y={232}
        width={860}
        label="The platform"
        size={48}
        accent={E.blue}
        lines={[
          {
            text: 'Memories, saved.',
            highlight: ['saved.'],
            highlightColor: E.pink,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={sdgStart}
        end={actFrames[1] - 8}
        x={100}
        y={232}
        width={860}
        label="The promise"
        size={48}
        accent={E.sage}
        lines={[
          {
            text: 'Good health, for every child.',
            highlight: ['every', 'child.'],
            highlightColor: E.sage,
          },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ============================================================================
 * ACT THREE — VOX EDITORIAL COLLAGE ("03 / A PARENT-CONTROLLED VISIT")
 * ============================================================================ */
const ActThree = ({frame}: {frame: number}) => {
  // Exact cue timings preserved from original ActThree
  const selectionStart = cueFrame(2, 4);
  const scanStart = cueFrame(2, 5);
  const qrStart = selectionStart + 160;
  const revokeStart = cueFrame(2, 6);

  const share = ease(frame, selectionStart, 24) * (1 - ease(frame, revokeStart + 12, 24));
  const scan = ease(frame, scanStart, 26);
  const revoke = ease(frame, revokeStart, 18);
  const revokeShatter = sweep(frame, revokeStart, revokeStart + 24);
  const revokeClinicFlow = ease(frame, revokeStart + 6, 18);
  const revokeViewTransition = ease(frame, revokeStart + 18, 18);
  const viewer = scan * (1 - revokeViewTransition);
  const viewEnded = scan * revokeViewTransition;
  const auditStart = cueFrame(2, 8);
  const audit = ease(frame, auditStart, 18);
  const time = sweep(frame, qrStart, qrStart + 72);
  const countdown = Math.max(0, 60 - Math.floor(Math.max(0, frame - qrStart) / fps));
  const shareFlow = ease(frame, selectionStart, 20);
  const qrFlow = ease(frame, qrStart, 20);
  const scanFlow = ease(frame, scanStart, 20);
  const revokeFlow = ease(frame, revokeStart, 18);
  const flowDashOffset = (progress: number) => 48 * (1 - progress);
  const doctor = ease(frame, 0, 24) * (1 - ease(frame, selectionStart - 12, 12));
  const doctorBob = Math.sin(frame * 0.08) * 2;
  const parentX = interpolate(ease(frame, selectionStart - 24, 24), [0, 1], [170, -60]);
  const revokedStamp = spring({
    frame: Math.max(0, frame - (revokeStart + 20)),
    fps,
    config: {damping: 11, stiffness: 190, mass: 0.8},
  });

  return (
    <AbsoluteFill
      style={{
        background: '#F9F6F0',
        color: K.ink,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 84% 16%, rgba(255,141,161,0.22), transparent 36%), radial-gradient(circle at 14% 22%, rgba(74,144,226,0.14), transparent 36%)',
        }}
      />

      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <defs>
          {/* Hand-inked organic line wobble */}
          <filter id="act3-ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Zero-blur editorial cardboard cutout shadow */}
          <filter id="act3-cutout-shadow" x="-15%" y="-15%" width="135%" height="135%">
            <feDropShadow dx="7" dy="9" stdDeviation="0" floodColor={K.night} floodOpacity="0.42" />
          </filter>

          {/* Newsprint halftone dot pattern */}
          <pattern id="act3-halftone" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
            <circle cx="2.5" cy="2.5" r="1.2" fill={K.night} opacity="0.14" />
          </pattern>

          <pattern id="act3-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="9" stroke={K.night} strokeWidth="1.4" opacity="0.16" />
          </pattern>

          <pattern id="act3-ruled-paper" width="100" height="38" patternUnits="userSpaceOnUse">
            <line x1="0" y1="37" x2="100" y2="37" stroke="#CBD5E1" strokeWidth="1.5" opacity="0.55" />
          </pattern>
        </defs>

          <rect x="0" y="0" width="1920" height="1080" fill="url(#act3-ruled-paper)" />

          {/* Kraft-paper desk horizon */}
          <path d="M0 845 Q445 815 912 842 T1920 832 V1080 H0 Z" fill="#EFE8DA" />
          <path d="M0 845 Q445 815 912 842 T1920 832 V1080 H0 Z" fill="url(#act3-halftone)" opacity="0.12" />
        <path
            d="M0 840 Q445 810 912 837 T1920 827"
          fill="none"
            stroke="#D2C6B2"
            strokeWidth="2.5"
        />

        {/* ===================================================================
         * PARENT & CHILD CHARACTER (With Vox Print Offset & Ink Contours)
         * =================================================================== */}
        <g transform={`translate(${parentX} 282)`} filter="url(#act3-cutout-shadow)">
          <circle cx="280" cy="298" r="164" fill="#E4EFFA" stroke={K.night} strokeWidth="2.5" />
          <circle cx="280" cy="298" r="164" fill="url(#act3-halftone)" opacity="0.28" />
          <g transform={`translate(168 ${112 + Math.sin(frame * 0.08) * 3})`}>
            <ParentAndChild x={0} y={0} scale={1.12} coat={K.red} childCoat={K.gold} prefix="act3" />
          </g>
        </g>

        {/* Pediatrician joins the conversation before the QR viewer appears. */}
        <g
          opacity={doctor}
          transform={`translate(760 ${405 + doctorBob})`}
          filter="url(#act3-cutout-shadow)"
        >
          <circle cx="130" cy="175" r="164" fill="#E4EFFA" stroke={K.night} strokeWidth="2.5" />
          <circle cx="130" cy="175" r="164" fill="url(#act3-halftone)" opacity="0.28" />

          <g transform="translate(130 175) scale(1.04) translate(-130 -175)">
          <path
            d="M88 143 70 158Q50 178 47 272Q130 300 213 272Q210 178 190 158L171 143 150 165 130 153 109 165Z"
            fill={K.paperLight}
            stroke={K.night}
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M109 145 130 167 151 145 141 194 130 208 119 194Z" fill="#E4EFFA" stroke={K.night} strokeWidth="3" />
          <path d="M88 146 67 177 89 190 107 164M171 146 193 177 170 190 151 164" fill="none" stroke={K.night} strokeWidth="3" />

          <path d="M91 96Q87 44 130 42Q174 45 169 99L157 88Q137 72 117 82Q102 88 91 108Z" fill={K.night} />
          <circle cx="130" cy="96" r="40" fill="#F1D7C8" stroke={K.night} strokeWidth="3.5" />
          <path d="M92 93Q92 49 130 49Q163 49 169 83L155 76Q133 66 115 79Q102 86 92 105Z" fill={K.night} />
          <circle cx="116" cy="97" r="3" fill={K.night} />
          <circle cx="143" cy="97" r="3" fill={K.night} />
          <path d="M120 116Q130 124 141 115" fill="none" stroke={K.night} strokeWidth="3" strokeLinecap="round" />

          <path d="M107 167V219Q107 244 130 244Q153 244 153 219V183" fill="none" stroke={K.blue} strokeWidth="5" strokeLinecap="round" />
          <circle cx="153" cy="183" r="7" fill={K.red} stroke={K.night} strokeWidth="2" />
          <rect x="163" y="207" width="31" height="43" rx="3" fill="#FFFCF5" stroke={K.blue} strokeWidth="2.5" />
          <path d="M169 219h18M169 227h18M169 235h13" stroke={K.blue} strokeWidth="2" strokeLinecap="round" />
          </g>

          <g transform="translate(166 18)">
            <path
              d="M12 0H147Q159 0 159 12V48Q159 60 147 60H60L38 78 42 60H12Q0 60 0 48V12Q0 0 12 0Z"
              fill={K.paperLight}
              stroke={K.blue}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {[0, 1, 2].map((dot) => (
              <circle
                key={dot}
                cx={57 + dot * 24}
                cy="30"
                r="5"
                fill={K.blue}
                opacity={0.35 + 0.65 * ((Math.sin(frame * 0.16 + dot * 2) + 1) / 2)}
              />
            ))}
          </g>
        </g>

        <g opacity={doctor} transform={`translate(${parentX + 386} 408)`}>
          <path
            d="M12 0H158Q170 0 170 12V44Q170 56 158 56H48L28 73 32 56H12Q0 56 0 44V12Q0 0 12 0Z"
            fill={K.paperLight}
            stroke={K.redDark}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {[0, 1, 2].map((dot) => (
            <circle
              key={dot}
              cx={61 + dot * 24}
              cy="28"
              r="4.5"
              fill={K.redDark}
              opacity={0.35 + 0.65 * ((Math.sin(frame * 0.16 + dot * 2 + Math.PI) + 1) / 2)}
            />
          ))}
        </g>

        {/* Cue-driven broken-line steps: share, QR, clinician, revoke-to-clinic, audit. */}
        <g fill="none" stroke={K.blue} strokeWidth="4.5" strokeDasharray="10 12" strokeLinecap="round" filter="url(#act3-ink-bleed)">
          <path
            d="M310 645 C390 610 470 580 568 555"
            strokeDashoffset={flowDashOffset(shareFlow)}
            opacity={shareFlow * (1 - revokeShatter)}
          />
          <path
            d="M872 520 C900 500 925 480 952 470"
            strokeDashoffset={flowDashOffset(qrFlow)}
            opacity={qrFlow * (1 - revokeShatter)}
          />
          <path
            d="M1244 535 C1320 525 1375 540 1456 540"
            strokeDashoffset={flowDashOffset(scanFlow)}
            opacity={scanFlow * (1 - revokeShatter)}
          />
          <path
            d="M324 620 C470 660 635 715 807 690"
            strokeDashoffset={flowDashOffset(revokeFlow)}
            opacity={revokeFlow}
          />
          <path
            d="M1112 690 C1235 682 1352 675 1456 700"
            strokeDashoffset={flowDashOffset(revokeClinicFlow)}
            opacity={revokeClinicFlow}
          />
          <path
            d="M1456 540 C1355 515 1260 500 1179 510"
            strokeDashoffset={flowDashOffset(audit)}
            opacity={audit}
          />
        </g>

        {/* Editorial Divider & Clinician Zone Label */}
        <path d="M1340 315 V775" stroke={K.blue} strokeWidth="2.5" strokeDasharray="6 12" opacity="0.4" />
        <g transform="translate(1518 292)" filter="url(#act3-cutout-shadow)">
          <rect x="0" y="0" width="225" height="32" fill="#E4EFFA" stroke={K.blue} strokeWidth="2" />
          <text
            x="112"
            y="21"
            textAnchor="middle"
            fill={K.blue}
            fontFamily="Arial, sans-serif"
            fontSize="13"
            fontWeight="800"
            letterSpacing="2.2"
          >
            DOCTOR VIEW
          </text>
        </g>

        {/* ===================================================================
         * 1. GRANULAR CONSENT CHECKLIST CUTOUT ("CHOOSE TO SHARE")
         * =================================================================== */}
        <g
          opacity={share}
          transform={`translate(${interpolate(share, [0, 1], [-36, 0])} 0) rotate(-2.5 716 514)`}
          filter="url(#act3-cutout-shadow)"
        >
          {/* Crisp Paper Card Base */}
          <rect x="568" y="352" width="304" height="326" fill="#FFFCF5" stroke={K.night} strokeWidth="4" />
          <rect x="568" y="352" width="304" height="326" fill="url(#act3-halftone)" opacity="0.25" />

          {/* Header Bar */}
          <rect x="568" y="352" width="304" height="48" fill={K.night} />
          <text x="594" y="382" fill={K.gold} fontFamily="Arial, sans-serif" fontSize="14" fontWeight="800" letterSpacing="1.8">
            CHOOSE TO SHARE
          </text>

          {/* Masking Tape Anchor */}
          <g transform="translate(682 338) rotate(2)">
            <rect width="78" height="24" fill="#EFE4C8" opacity="0.9" stroke={K.night} strokeWidth="1" />
          </g>

          {/* Interactive Checkboxes */}
          {['Growth chart', 'Allergy summary', 'Vaccinations'].map((label, i) => {
            const check = ease(frame, selectionStart + 18 + i * 24, 12);
            const y = 432 + i * 58;
            return (
              <g key={label}>
                <rect x="596" y={y} width="24" height="24" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
                <rect x="596" y={y} width="24" height="24" fill={K.red} opacity={check} />
                <path
                  d={`M601 ${y + 12} l6 6 11-14`}
                  fill="none"
                  stroke={K.night}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - check}
                  opacity={check}
                />
                <text x="638" y={y + 19} fill={K.ink} fontFamily="Georgia, serif" fontSize="20" fontWeight="700">
                  {label}
                </text>
                <line x1="596" y1={y + 36} x2="842" y2={y + 36} stroke="#CBD5E1" strokeWidth="1.5" />
              </g>
            );
          })}

        </g>

        {/* ===================================================================
         * 2. TIME-LIMITED QR TOKEN STAMP CARD (With Shatter Revocation)
         * =================================================================== */}
        <g
          transform={`translate(952 ${384 + floatY(frame, 0.04, 7)}) rotate(-2 142 142)`}
          filter="url(#act3-cutout-shadow)"
        >
          <g opacity={ease(frame, qrStart, 20) * (1 - revokeShatter)}>
            {/* Sharp Paper Card */}
            <rect x="0" y="0" width="292" height="296" fill="#FFFCF5" stroke={K.night} strokeWidth="4" />
            <rect x="0" y="0" width="292" height="36" fill="#E4EFFA" stroke={K.night} strokeWidth="3" />

            <text x="14" y="23" fill={K.night} fontFamily="Arial, sans-serif" fontSize="11" fontWeight="800" letterSpacing="1.2">
              TIME-LIMITED TOKEN
            </text>
            <text x="234" y="23" textAnchor="end" fill={K.redDark} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800">
              {countdown}s
            </text>

            {/* Countdown Ring */}
            <circle cx="266" cy="18" r="9" fill="none" stroke="#CBD5E1" strokeWidth="2.5" />
            <circle
              cx="266"
              cy="18"
              r="9"
              fill="none"
              stroke={K.redDark}
              strokeWidth="3"
              strokeDasharray="56.5"
              strokeDashoffset={56.5 * (1 - time)}
              transform="rotate(-90 266 18)"
            />

            {/* Crisp QR Matrix */}
            <g transform="translate(29 44)">
              <QrMark size={234} progress={time * (1 - revokeShatter)} />
            </g>

            {/* Top Masking Tape Strip */}
            <g transform="translate(106 -13) rotate(-3)">
              <rect width="80" height="24" fill="#EFE4C8" opacity="0.92" stroke={K.night} strokeWidth="1" />
            </g>

            {/* Editorial Caption Stamp Below QR */}
            <g transform="translate(16 312)">
              <rect x="0" y="0" width="260" height="32" fill={K.night} />
              <text
                x="130"
                y="21"
                fill={K.gold}
                textAnchor="middle"
                fontFamily="Arial, sans-serif"
                fontSize="13"
                fontWeight="800"
                letterSpacing="2"
              >
                ONE-TIME VISIT TOKEN
              </text>
            </g>
          </g>

          {/* Confetti / Halftone Pixel Shatter on Revoke */}
          <g>
            {Array.from({length: 24}, (_, i) => {
              const x = 40 + ((i * 47) % 205);
              const y = 40 + ((i * 71) % 205);
              const angle = i * 2.4;
              const travel = 88 * revokeShatter;
              return (
                <rect
                  key={i}
                  x={x + Math.cos(angle) * travel}
                  y={y + Math.sin(angle) * travel}
                  width={6 + (i % 4)}
                  height={6 + (i % 4)}
                  fill={i % 3 === 0 ? K.redDark : i % 3 === 1 ? K.gold : K.blue}
                  stroke={K.night}
                  strokeWidth="1.5"
                  opacity={Math.sin(revokeShatter * Math.PI)}
                  transform={`rotate(${i * 35} ${x + Math.cos(angle) * travel} ${y + Math.sin(angle) * travel})`}
                />
              );
            })}
          </g>
        </g>

        {/* ===================================================================
         * 3. CLINICIAN VIEW-ONLY DOSSIER CARD (And Revoked Stamp State)
         * =================================================================== */}
        <g opacity={viewer} transform={`translate(${interpolate(scan, [0, 1], [1820, 1456])} 346)`} filter="url(#act3-cutout-shadow)">
          <rect x="0" y="0" width="348" height="390" fill="#FFFCF5" stroke={K.night} strokeWidth="4" />
          <rect x="0" y="0" width="348" height="390" fill="url(#act3-halftone)" opacity="0.22" />

          {/* Header Bar */}
          <rect x="0" y="0" width="348" height="66" fill={K.blue} stroke={K.night} strokeWidth="3.5" />
          <circle cx="42" cy="33" r="14" fill={K.gold} stroke={K.night} strokeWidth="2.5" />
          <text x="70" y="40" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="17" fontWeight="800" letterSpacing="1">
            PEDIATRIC VISIT
          </text>

          {/* Top Masking Tape */}
          <g transform="translate(132 -12) rotate(2)">
            <rect width="84" height="24" fill="#EFE4C8" opacity="0.92" stroke={K.night} strokeWidth="1" />
          </g>

          <text x="28" y="112" fill={K.night} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2">
            VIEW-ONLY RECORD
          </text>

          {['Growth chart', 'Allergy summary', 'Vaccination record'].map((item, i) => (
            <g key={item}>
              <path
                d={`M30 ${154 + i * 54} h18`}
                stroke={K.redDark}
                strokeWidth="5"
                strokeLinecap="round"
                filter="url(#act3-ink-bleed)"
              />
              <text x="64" y={161 + i * 54} fill={K.ink} fontFamily="Georgia, serif" fontSize="19" fontWeight="700">
                {item}
              </text>
              <line x1="28" y1={182 + i * 54} x2="318" y2={182 + i * 54} stroke="#CBD5E1" strokeWidth="2" />
            </g>
          ))}

          {/* Bottom Expiration Banner */}
          <rect x="24" y="324" width="300" height="38" fill="#FEE2E2" stroke={K.redDark} strokeWidth="2" />
          <text x="174" y="348" textAnchor="middle" fill={K.redDark} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" letterSpacing="1">
            EXPIRES WHEN THE VISIT ENDS
          </text>
        </g>

        {/* Revoked Access Lockout Card */}
        <g opacity={viewEnded} transform="translate(1456 346)" filter="url(#act3-cutout-shadow)">
          <rect x="0" y="0" width="348" height="390" fill="#E4EFFA" stroke={K.blue} strokeWidth="3.5" />
          <rect x="0" y="0" width="348" height="390" fill="url(#act3-halftone)" opacity="0.2" />

          <circle cx="174" cy="144" r="38" fill={K.redDark} stroke={K.blue} strokeWidth="3" />
          <path
            d="M160 142 v-9 a14 14 0 0 1 28 0 v9 m-34 0 h40 v30 h-40 z"
            fill="none"
            stroke="#FFFCF5"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Diagonal Red Stamp */}
          <g
            transform={`translate(174 226) rotate(${-4 + (1 - revokedStamp) * 12}) scale(${0.72 + revokedStamp * 0.28})`}
            opacity={revokedStamp}
          >
            <rect x="-126" y="-22" width="252" height="42" fill="none" stroke={K.redDark} strokeWidth="3.5" />
            <text
              x="0"
              y="6"
              textAnchor="middle"
              fill={K.redDark}
              fontFamily="Arial, sans-serif"
              fontSize="19"
              fontWeight="800"
              letterSpacing="2.5"
            >
              ACCESS REVOKED
            </text>
          </g>

          <text x="174" y="282" textAnchor="middle" fill="#475569" fontFamily="Georgia, serif" fontStyle="italic" fontSize="16">
            This visit can no longer view the record.
          </text>
        </g>

        {/* ===================================================================
         * 4. REVOCATION & IMMUTABLE AUDIT LOG CALLOUTS
         * =================================================================== */}
        <g opacity={revoke} transform="translate(827 690) scale(1.4)" filter="url(#act3-cutout-shadow)">
          <rect x="-14" y="-20" width="218" height="40" fill={K.redDark} stroke={K.night} strokeWidth="2.5" />
          <circle cx="8" cy="0" r="11" fill={K.paperLight} />
          <path d="M4-4 12 4 M12-4 4 4" stroke={K.redDark} strokeWidth="3" strokeLinecap="round" />
          <text x="30" y="5" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="16" fontWeight="800" letterSpacing="1">
            REVOKE ACCESS
          </text>
        </g>

        <g opacity={audit} transform="translate(760 446) scale(1.15)" filter="url(#act3-cutout-shadow)">
          <rect x="-16" y="-18" width="380" height="146" fill="#E4EFFA" stroke={K.blue} strokeWidth="2.5" />
          <rect x="-16" y="-18" width="380" height="146" fill="url(#act3-halftone)" opacity="0.22" />
          {[0, 1, 2].map((n) => {
            const rowReveal = ease(frame, cueFrame(2, 8) + n * 9, 12);
            return (
              <g key={n} opacity={rowReveal} transform={`translate(0 ${n * 34})`}>
                <line x1="0" y1="8" x2="340" y2="8" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 6" />
                <circle cx="8" cy="8" r="6" fill={K.gold} />
                <text x="26" y="13" fill={K.night} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="700">
                  {['08:44 AM · QR SCANNED', '08:45 AM · RECORD VIEWED', '09:02 AM · ACCESS REVOKED'][n]}
                </text>
                <circle cx="328" cy="8" r="6" fill={n === 2 ? K.red : K.green} />
              </g>
            );
          })}
          <text x="0" y="114" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2">
            IMMUTABLE AUDIT LOG
          </text>
        </g>
      </svg>

      <EditorialTitle
        frame={frame}
        x={100}
        y={76}
        width={760}
        index="03"
        label="A parent-controlled visit"
        accent={E.blue}
        showKicker={false}
        start={2}
        lines={[
          {text: 'One visit.', size: 76},
          {
            text: 'Only what’s needed.',
            size: 76,
            highlight: ['needed.'],
            highlightColor: E.blue,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={4}
        end={cueFrame(2, 2)}
        x={1052}
        y={126}
        width={710}
        label="The question"
        size={50}
        accent={E.coral}
        lines={[
          {text: 'Who controls', highlight: ['controls'], highlightColor: E.pink},
          {text: 'the data?'},
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(2, 2)}
        end={selectionStart}
        x={1052}
        y={126}
        width={710}
        label="The difference"
        size={50}
        accent={E.coral}
        lines={[
          {text: 'No corporate'},
          {text: 'cloud walls.'},
        ]}
      />

      <KineticSuper
        frame={frame}
        start={selectionStart}
        end={auditStart}
        x={1052}
        y={126}
        width={710}
        label="The handshake"
        size={50}
        accent={E.blue}
        lines={[
          {
            text: 'Select. Share.',
            wordStarts: [selectionStart, selectionStart + 10],
          },
          {
            text: 'Scan. Revoke.',
            wordStarts: [scanStart, revokeStart],
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={auditStart}
        end={actFrames[2] - 8}
        x={1052}
        y={126}
        width={710}
        label="The record"
        size={50}
        accent={E.coral}
        lines={[
          {text: 'Every view,'},
          {
            text: 'recorded.',
            highlight: ['recorded.'],
            highlightColor: E.gold,
          },
        ]}
      />
    </AbsoluteFill>
  );
};

/* ============================================================================
 * ACT FOUR — MEMORY AND MEDICINE ("04 / THE WHOLE STORY")
 * ============================================================================ */
const ActFour = ({frame}: {frame: number}) => {
  const book = ease(frame, 0, 28);
  const phone = ease(frame, 34, 30);
  const bridge = sweep(frame, cueFrame(3, 1), cueFrame(3, 3));
  const family = ease(frame, cueFrame(3, 2), 32);
  const finish = ease(frame, cueFrame(3, 3), 35);
  const collageStart = cueFrame(3, 1);
  const collage = ease(frame, collageStart, 24);
  const collageScroll = interpolate(frame, [collageStart, collageStart + 240], [0, 24], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const finalCaptionEnd = acts[3].captions[acts[3].captions.length - 1].end;
  const outroStart = Math.round(finalCaptionEnd * fps);
  const logoStart = outroStart + 2 * fps;
  const outro = ease(frame, outroStart, 36);
  const logoBounceEase = Easing.bezier(0.175, 0.885, 0.32, 1.275);
  const bookDraw = interpolate(frame, [logoStart + 3, logoStart + 48], [0, 1], {
    easing: Easing.bezier(0.42, 0, 0.58, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pagesReveal = Math.min(
    1,
    interpolate(frame, [logoStart + 12, logoStart + 30], [0, 1], {
      easing: logoBounceEase,
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const babyY = interpolate(frame, [logoStart + 27, logoStart + 41.4, logoStart + 51], [-50, 10, 0], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bookY = interpolate(frame, [logoStart + 36, logoStart + 50.4, logoStart + 60], [-50, 10, 0], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const crossScale = interpolate(frame, [logoStart + 48, logoStart + 64.8, logoStart + 72], [0, 1.1, 1], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const crossRotation = interpolate(frame, [logoStart + 48, logoStart + 64.8, logoStart + 72], [-90, 10, 0], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const babyReveal = interpolate(frame, [logoStart + 27, logoStart + 41.4, logoStart + 51], [0, 1, 1], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bookReveal = interpolate(frame, [logoStart + 36, logoStart + 50.4, logoStart + 60], [0, 1, 1], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const crossReveal = interpolate(frame, [logoStart + 48, logoStart + 64.8, logoStart + 72], [0, 1, 1], {
    easing: logoBounceEase,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bridgeNodes = [
    [631, 563],
    [970, 526],
    [1293, 644],
  ];
  const outroTagline = ease(frame, logoStart + 42, 26);
  const outroFooter = ease(frame, logoStart + 56, 26);

  return (
    <AbsoluteFill style={{background: '#F9F6F0', color: K.ink, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 18% 18%, rgba(74,144,226,0.16), transparent 36%), radial-gradient(circle at 84% 20%, rgba(255,141,161,0.20), transparent 38%)',
        }}
      />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <VoxDefs prefix="act4" />
        <defs>
          <filter id="act4-brand-shadow" x="-10%" y="-20%" width="120%" height="150%">
            <feDropShadow dx="3" dy="6" stdDeviation="3" floodColor="#9CA3AF" floodOpacity="0.6" />
          </filter>
          <clipPath id="act-four-memory-strip">
            <rect x="662" y="382" width="562" height="64" rx="5" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#act4-ruled-paper)" />
        <circle cx="959" cy="475" r="310" fill="url(#act4-halftone)" opacity="0.28" />
        <path d="M0 845 Q440 818 900 842 T1920 835 V1080 H0 Z" fill="#EFE8DA" />
        <line x1="0" y1="842" x2="1920" y2="838" stroke="#D2C6B2" strokeWidth="2.5" />

        {/* Boxed Editorial Diagram Stamps (INPUT / PROCESS / OUTPUT) */}
        <g opacity={bridge}>
          {[
            {x: 370, y: 344, text: 'INPUT'},
            {x: 945, y: 344, text: 'PROCESS'},
            {x: 1500, y: 274, text: 'OUTPUT'},
          ].map((badge) => (
            <g key={badge.text} transform={`translate(${badge.x - 65} ${badge.y - 22})`} filter="url(#act4-cutout-shadow)">
              <rect x="0" y="0" width="130" height="32" fill={K.night} />
              <text
                x="65"
                y="22"
                textAnchor="middle"
                fill={K.paperLight}
                fontFamily="Arial, sans-serif"
                fontSize="14"
                fontWeight="800"
                letterSpacing="2.5"
              >
                {badge.text}
              </text>
            </g>
          ))}
        </g>

        {/* Physical Keepsake Book */}
        <g
          opacity={book}
          transform={`translate(155 ${365 + floatY(frame, 0.025, 5)}) rotate(-4 220 170)`}
          filter="url(#act4-cutout-shadow)"
        >
          <path d="M0 28Q24 4 218 31V334Q43 313 0 344Z" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
          <path d="M218 31Q403 1 437 29V344Q395 314 218 334Z" fill="#F4EBD8" stroke={K.night} strokeWidth="3" />
          <path d="M218 31V334" stroke={K.night} strokeWidth="6" />
          <text x="34" y="78" fill={K.night} fontFamily="Georgia, serif" fontSize="19" fontStyle="italic" fontWeight="700">
            A family keepsake
          </text>
          <TinyMemory x={37} y={98} rotate={0} color="#DFB46F" kind={0} prefix="act4" />
          <path d="M254 82h140M254 116h130M254 150h145" stroke="#94A3B8" strokeWidth="3" />
          <path d="M254 210q30-38 60 0t60 0" fill="none" stroke={K.redDark} strokeWidth="5" filter="url(#act4-ink-bleed)" />
          <text x="230" y="262" fill={K.night} fontFamily="Georgia, serif" fontSize="15" fontStyle="italic" fontWeight="700">
            First steps, first words...
          </text>
        </g>

        {/* Digital Health Companion Device */}
        <g
          opacity={phone}
          transform={`translate(1306 ${320 + floatY(frame + 12, 0.027, 7)}) rotate(4 190 260)`}
          filter="url(#act4-cutout-shadow)"
        >
          <rect x="0" y="0" width="370" height="565" rx="40" fill={K.night} />
          <rect x="12" y="12" width="346" height="541" rx="31" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
          <rect x="124" y="12" width="122" height="22" rx="11" fill={K.night} />
          <text x="38" y="83" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2">
            HEALTH, KEPT CLEAR
          </text>
          <text x="38" y="129" fill={K.ink} fontFamily="Georgia, serif" fontSize="26" fontWeight="700">
            Growing, together.
          </text>
          <g transform="translate(36 167) scale(.76 .63)">
            <GrowthLine progress={finish} prefix="act4" />
          </g>
          <path d="M38 390h294M38 423h260M38 456h281" stroke="#94A3B8" strokeWidth="3" />
          <circle cx="47" cy="503" r="8" fill={K.red} />
          <circle cx="79" cy="503" r="8" fill={K.gold} />
          <circle cx="111" cy="503" r="8" fill={K.green} />
          <circle cx="143" cy="503" r="8" fill={K.blueLight} />
        </g>

        {/* Photo Strip Collage */}
        <g opacity={collage} filter="url(#act4-cutout-shadow)">
          <rect x="650" y="372" width="590" height="82" fill="#FFFCF5" stroke={K.night} strokeWidth="2.5" />
          <g clipPath="url(#act-four-memory-strip)">
            <g transform={`translate(${690 - collageScroll} 384) scale(.34)`}>
              {Array.from({length: 6}, (_, i) => (
                <TinyMemory
                  key={i}
                  x={i * 246}
                  y={0}
                  rotate={0}
                  color={['#DCEBFA', '#FCE3E9', '#E4EBDD', '#F4EAD7'][i % 4]}
                  kind={i % 3}
                  prefix="act4"
                />
              ))}
            </g>
          </g>
        </g>

        {/* Hand-Inked Connecting Bridge Curve */}
        <path
          d="M562 630C711 470 820 443 970 526S1193 717 1372 607"
          fill="none"
          stroke={K.paperLight}
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M562 630C711 470 820 443 970 526S1193 717 1372 607"
          fill="none"
          stroke={K.redDark}
          strokeWidth="5.5"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - bridge}
          filter="url(#act4-ink-bleed)"
        />
        {bridgeNodes.map(([x, y], i) => (
          <g key={i} opacity={ease(frame, cueFrame(3, 1) + i * 13, 14)}>
            <circle cx={x} cy={y} r="15" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
            <path d="M-4 0h8M0-4v8" transform={`translate(${x} ${y})`} stroke={K.redDark} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))}

        <g opacity={family}>
          <ParentAndChild x={790} y={553} scale={1.15} coat={K.blue} childCoat={K.red} prefix="act4" />
        </g>

        {/* Outro Card */}
        <g opacity={outro}>
          <rect x="0" y="0" width="1920" height="1080" fill="#F9F6F0" />
          <rect x="0" y="0" width="1920" height="1080" fill="url(#act4-ruled-paper)" />
          <g transform="translate(592.5 392.5) scale(0.7)">
            <BabyBookBookIcon x={0} y={0} scale={1} drawProgress={bookDraw} pageProgress={pagesReveal} />
            <g opacity={babyReveal} transform={`translate(0 ${babyY})`} filter="url(#act4-brand-shadow)">
              <text
                x="280"
                y="250"
                textLength="300"
                lengthAdjust="spacingAndGlyphs"
                fill="#8cd3fa"
                fontFamily="'Arial Rounded MT Bold', Nunito, Arial, sans-serif"
                fontWeight="900"
                fontSize="140"
              >
                baby
              </text>
            </g>
            <g opacity={bookReveal} transform={`translate(0 ${bookY})`} filter="url(#act4-brand-shadow)">
              <text
                x="580"
                y="250"
                textLength="300"
                lengthAdjust="spacingAndGlyphs"
                fill="#f9c4d2"
                fontFamily="'Arial Rounded MT Bold', Nunito, Arial, sans-serif"
                fontWeight="900"
                fontSize="140"
              >
                book
              </text>
            </g>
            <g transform="translate(890 120)">
              <g
                opacity={crossReveal}
                transform={`translate(35 35) rotate(${crossRotation}) scale(${crossScale}) translate(-35 -35)`}
                filter="url(#act4-brand-shadow)"
              >
                <path fill="#d4d4d4" d="M 25,0 L 45,0 L 45,25 L 70,25 L 70,45 L 45,45 L 45,70 L 25,70 L 25,45 L 0,45 L 0,25 L 25,25 Z" />
              </g>
            </g>
          </g>
          <path d="M860 618h200" stroke={E.coral} strokeWidth="4" strokeLinecap="round" />

          <g
            opacity={outroTagline}
            transform={`translate(0 ${(1 - outroTagline) * 16})`}
            textAnchor="middle"
          >
            <text
              x="960"
              y="648"
              fill={E.ink}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="31"
              fontWeight="800"
              letterSpacing="4.5"
            >
              EVERY MILESTONE. EVERY MEMORY.
            </text>
            <text
              x="960"
              y="690"
              fill={E.inkSoft}
              fontFamily="Georgia, serif"
              fontStyle="italic"
              fontSize="23"
            >
              Health, held with care.
            </text>
          </g>

          <g opacity={outroFooter}>
            <path d="M884 736h152" stroke={E.gold} strokeWidth="3" strokeLinecap="round" />
            <text
              x="960"
              y="776"
              textAnchor="middle"
              fill={E.inkSoft}
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="10"
              fontWeight="800"
              letterSpacing="3.2"
            >
              A FOUR-PART FIELD GUIDE
            </text>
          </g>
        </g>
      </svg>

      <EditorialTitle
        frame={frame}
        x={100}
        y={76}
        width={820}
        index="04"
        label="The whole story, held together"
        accent={E.coral}
        showKicker={false}
        start={2}
        end={outroStart}
        lines={[
          {
            text: 'Memory and medicine.',
            size: 80,
            highlight: ['medicine.'],
            highlightColor: E.coral,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={6}
        end={cueFrame(3, 1)}
        x={460}
        y={196}
        width={1000}
        label="The hybrid model"
        size={46}
        accent={E.coral}
        align="center"
        lines={[
          {
            text: 'Physical keepsakes.',
            highlight: ['keepsakes.'],
            highlightColor: E.gold,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(3, 1)}
        end={cueFrame(3, 3)}
        x={460}
        y={196}
        width={1000}
        label="The hybrid model"
        size={46}
        accent={E.coral}
        align="center"
        lines={[
          {
            text: 'Digital health records.',
            highlight: ['records.'],
            highlightColor: E.blue,
          },
        ]}
      />

      <KineticSuper
        frame={frame}
        start={cueFrame(3, 3)}
        end={outroStart}
        x={460}
        y={196}
        width={1000}
        label="The hybrid model"
        size={46}
        accent={E.coral}
        align="center"
        lines={[
          {
            text: 'One story. Across a lifetime.',
            highlight: ['lifetime.'],
            highlightColor: E.pink,
          },
        ]}
      />

      <Sequence from={logoStart} durationInFrames={66}>
        <Audio src={staticFile('audio/act-04-logo-sfx.wav')} volume={0.45} />
      </Sequence>

      {/* Ending audio — synced slightly after BabyBook+ logo animation starts */}
      <Sequence from={logoStart + 6} durationInFrames={Math.ceil(6 * fps)}>
        <Audio src={staticFile('audio/babybook+ ending.mp3')} volume={1} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ============================================================================
 * STORY CAPTION & SCENE ROUTER
 * ============================================================================ */
const StoryCaption = ({actIndex}: {actIndex: number}) => {
  const frame = useCurrentFrame();
  const {fps: compositionFps} = useVideoConfig();
  const act = acts[actIndex];
  const caption = act.captions.find(
    (item) => frame >= item.start * compositionFps && frame < item.end * compositionFps,
  );

  if (!caption) {
    return null;
  }

  const cueIndex = act.captions.indexOf(caption);
  const cueStart = Math.round(caption.start * compositionFps);
  const cardIn = cueStart === 0 ? 1 : ease(frame, cueStart, 9);
  const now = frame / compositionFps;
  const duration = Math.max(0.001, caption.end - caption.start);
  const words = caption.text.split(' ');

  // Distribute the cue duration across words by character weight.
  const weights = words.map((word) => Math.max(2, word.replace(/[^a-zA-Z0-9]/g, '').length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let walked = 0;
  const wordStarts = weights.map((weight) => {
    const at = caption.start + (walked / totalWeight) * duration;
    walked += weight;
    return at;
  });
  let active = 0;
  for (let index = 0; index < wordStarts.length; index++) {
    if (now >= wordStarts[index]) {
      active = index;
    }
  }
  const sweep = interpolate(now, [wordStarts[active], wordStarts[active] + 0.15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cueProgress = interpolate(now, [caption.start, caption.end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const captionLength = caption.text.length;
  const captionSize = captionLength > 190 ? 26 : captionLength > 130 ? 29 : 32;
  const captionPadding =
    captionLength > 190 ? '22px 44px 20px' : '28px 52px 24px';

  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        right: 96,
        bottom: 30,
        opacity: cardIn,
        transform: `translateY(${(1 - cardIn) * 16}px)`,
      }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(255,252,245,0.965)',
          border: `2px solid ${E.ink}`,
          boxShadow: '9px 10px 0 rgba(22,40,58,0.16)',
          padding: captionPadding,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: -15,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: E.ink,
            color: E.paper,
            padding: '6px 12px 5px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '2.4px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{width: 6, height: 6, background: E.gold, display: 'inline-block'}} />
          0{actIndex + 1} / {act.title}
        </div>

        <div
          style={{
            position: 'absolute',
            right: 22,
            top: 12,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '2px',
            color: E.inkMuted,
          }}
        >
          0{cueIndex + 1} / 0{act.captions.length}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.3em',
            rowGap: '0.04em',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: captionSize,
            fontWeight: 800,
            letterSpacing: '-0.018em',
            lineHeight: 1.32,
            color: E.ink,
          }}
        >
          {words.map((word, index) => {
            const spoken = index <= active;
            const isActive = index === active;
            return (
              <span
                key={`${word}-${index}`}
                style={{
                  display: 'inline-block',
                  color: spoken ? E.ink : 'rgba(22,40,58,0.42)',
                  backgroundImage: isActive
                    ? `linear-gradient(${E.gold}, ${E.gold})`
                    : 'none',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${isActive ? sweep * 100 : 0}% 56%`,
                  backgroundPosition: '0 86%',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: 'rgba(22,40,58,0.10)',
          }}
        >
          <div
            style={{
              width: `${cueProgress * 100}%`,
              height: '100%',
              background: E.coral,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const ActScene = ({actIndex}: {actIndex: number}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [actFrames[actIndex] - 13, actFrames[actIndex]], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const Scene = [ActOne, ActTwo, ActThree, ActFour][actIndex];
  const drift = interpolate(frame, [0, actFrames[actIndex]], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = 1.012 + drift * 0.008;
  const panX = (actIndex % 2 === 0 ? 1 : -1) * (drift - 0.5) * 6;
  const panY = (drift - 0.5) * 4;
  const act = acts[actIndex];

  return (
    <AbsoluteFill
      style={{
        background: '#F9F6F0',
        overflow: 'hidden',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: fade,
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
          transformOrigin: '50% 46%',
        }}
      >
        <Scene frame={frame} />
      </div>

      <PremiumFinish />
      <PaperWipe frame={frame} index={act.id} label={act.title} />
      <EditorialChrome
        frame={frame}
        actIndex={actIndex}
        actFrames={actFrames}
        totalFrames={durationInFrames}
      />
      <StoryCaption actIndex={actIndex} />
    </AbsoluteFill>
  );
};

const Video = () => (
  <AbsoluteFill style={{backgroundColor: K.night}}>
    {acts.map((act, index) => {
      const from = actFrames.slice(0, index).reduce((sum, length) => sum + length, 0);
      const scoreVolume = {'01': 0.21, '02': 0.25, '03': 0.19, '04': 0.28}[act.id] ?? 0.22;
      return (
        <Sequence key={act.id} from={from} durationInFrames={actFrames[index]} name={act.title}>
          <ActScene actIndex={index} />
          <Audio src={staticFile(act.audio)} volume={1} />
          {act.id !== '05' && (
            <Audio src={staticFile(`audio/act-${act.id}-score.wav`)} volume={scoreVolume} />
          )}
        </Sequence>
      );
    })}
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
