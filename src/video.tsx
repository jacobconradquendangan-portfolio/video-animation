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
      <feDropShadow dx="6" dy="8" stdDeviation="0" floodColor="#111827" floodOpacity="0.22" />
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
      <circle cx="2.5" cy="2.5" r="1.2" fill="#111827" opacity="0.14" />
    </pattern>

    {/* Diagonal crosshatch shading */}
    <pattern id={`${prefix}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
      <line x1="0" y1="0" x2="0" y2="9" stroke="#111827" strokeWidth="1.4" opacity="0.16" />
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
      stroke="#111827"
      strokeWidth="1"
      strokeOpacity="0.35"
      filter={`url(#${prefix}-ink-bleed)`}
    />
    <line x1="3" y1="0" x2="3" y2={height} stroke="#111827" strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
    <line x1={width - 3} y1="0" x2={width - 3} y2={height} stroke="#111827" strokeWidth="1" strokeDasharray="3 2" opacity="0.35" />
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
    <ellipse cx="95" cy="253" rx="112" ry="14" fill="#111827" opacity="0.14" />
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

      {/* Torn Corner & Ink Wear Overlay (Matches reference bottom-left tear & top tape) */}
      <g opacity={fragile}>
        {/* Torn Bottom-Left Page Flap */}
        <path
          d="M30 493 L42 442 L68 468 L94 452 L106 498 Q66 490 30 493 Z"
          fill="#EAE0CE"
          stroke={K.night}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Torn Top-Right Corner */}
        <path d="M582 58 649 78 645 122Q625 102 590 100Z" fill={K.paperShade} stroke={K.night} strokeWidth="2.5" />
        {/* Ink Smudge */}
        <path
          d="M405 248q48 9 104-8"
          fill="none"
          stroke="#52677D"
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.25"
          filter={`url(#${prefix}-ink-smudge)`}
        />
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
  const scatter = ease(frame, scatterAt, 30);
  const paperExit = ease(frame, clinicAt - 18, 24);
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

  // Kinetic Typography & Callout Animations
  const titleReveal = ease(frame, -18, 18);
  const highlighterSwipe = sweep(frame, 10, 32);
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
         * LEFT EDITORIAL TYPOGRAPHY STACK ("01 / THE PAPER PROBLEM")
         * =================================================================== */}
        <g opacity={titleReveal} transform={`translate(110 ${195 + (1 - titleReveal) * 18})`}>
          {/* Dark Navy Editorial Pill Badge */}
          <rect x="0" y="0" width="445" height="48" rx="6" fill="#232B35" filter="url(#act1-cutout-shadow)" />
          <text
            x="22"
            y="32"
            fill="#F8F9FA"
            fontSize="24"
            fontFamily="Arial, Helvetica, sans-serif"
            fontWeight="800"
            letterSpacing="2"
          >
            <tspan fill={K.gold}>01 / </tspan>
            THE PAPER PROBLEM
          </text>

          {/* Angled Gold Highlighter Brush Swipe Behind "Six years." */}
          <g transform="translate(-26 78) rotate(-2.5)">
            <path
              d="M6 12 Q320 4 635 8 L645 104 Q320 108 12 102 Z"
              fill={K.gold}
              opacity="0.88"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - highlighterSwipe}
              filter="url(#act1-ink-bleed)"
              style={{
                clipPath: `inset(0 ${(1 - highlighterSwipe) * 100}% 0 0)`,
              }}
            />
          </g>

          {/* Heavy Georgia Serif Display Title */}
          <text
            x="8"
            y="164"
            fill="#1D242B"
            fontSize="118"
            fontFamily="Georgia, serif"
            fontWeight="700"
            letterSpacing="-2"
          >
            Six years.
          </text>

          {/* Slate Subtitle Pill */}
          <g transform="translate(8 206)">
            <rect x="0" y="0" width="530" height="44" rx="4" fill="#64748B" />
            <text
              x="16"
              y="30"
              fill="#FFFFFF"
              fontSize="24"
              fontFamily="Arial, Helvetica, sans-serif"
              fontWeight="600"
            >
              A thousand little things to remember.
            </text>
          </g>
        </g>

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
          <g transform="translate(95 565) rotate(-4 170 106) scale(0.74)" filter="url(#act1-cutout-shadow)">
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
          <g transform="translate(390 480) rotate(3 150 95) scale(0.72)" filter="url(#act1-cutout-shadow)">
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
          transform={`translate(668 747) scale(${cardPop}) translate(-668 -747)`}
        >
          <g transform="translate(530 655) rotate(3 135 90) scale(1.02)" filter="url(#act1-cutout-shadow)">
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

        {/* Scattered Loose Slips (Cue 4) */}
        <g opacity={scatter * (1 - paperExit)}>
          <g
            transform={`translate(${interpolate(scatter, [0, 1], [980, 550])} ${interpolate(scatter, [0, 1], [450, 500])}) rotate(-11)`}
            filter="url(#act1-cutout-shadow)"
          >
            <rect x="0" y="0" width="196" height="130" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
            <path d="M20 28h152M20 52h112M20 76h150" stroke="#94A3B8" strokeWidth="4" />
            <circle cx="156" cy="99" r="11" fill={K.red} stroke={K.night} strokeWidth="2.5" />
          </g>
          <g
            transform={`translate(${interpolate(scatter, [0, 1], [1020, 390])} ${interpolate(scatter, [0, 1], [600, 680])}) rotate(8)`}
            filter="url(#act1-cutout-shadow)"
          >
            <rect x="0" y="0" width="176" height="122" fill="#D9E5DD" stroke={K.night} strokeWidth="3" />
            <text x="16" y="34" fill={K.night} fontSize="13" fontFamily="Arial, sans-serif" fontWeight="800">
              VACCINE RECORD
            </text>
            <path d="M16 54h136M16 78h136M16 100h92" stroke="#64748B" strokeWidth="3" />
          </g>
        </g>

        {/* Loose clinical history card makes the missing-record narration concrete. */}
        <g
          opacity={missingRecord}
          transform={`translate(${missingRecordX} ${Math.sin(frame * 0.045) * 2})`}
          filter="url(#act1-cutout-shadow)"
        >
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
        <g opacity={missingRecord} fill="none" stroke={K.redDark} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1005 680Q1040 667 1074 646" strokeDasharray="10 10" strokeDashoffset={interpolate(missingRecord, [0, 1], [60, 0])} />
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
    </AbsoluteFill>
  );
};

/* ============================================================================
 * ACT TWO — DIGITAL COMPANION ("02 / BABYBOOK+")
 * ============================================================================ */
const ActTwo = ({frame}: {frame: number}) => {
  const introduce = spring({frame, fps, config: {damping: 16, stiffness: 86, mass: 1.1}});
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
  const phoneY = (1 - introduce) * 80;
  const titleSwipe = sweep(frame, 8, 28);

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

        {/* Editorial Section Badge & Highlighter Headline */}
        <g transform="translate(110 124)">
          <rect x="0" y="0" width="320" height="44" rx="6" fill="#232B35" filter="url(#act2-cutout-shadow)" />
          <text x="20" y="29" fill="#F8F9FA" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="800" letterSpacing="2">
            <tspan fill={K.blueLight}>02 / </tspan>
            BABYBOOK+
          </text>

          <g transform="translate(-14 68) rotate(-1.8)">
            <rect
              x="0"
              y="0"
              width={480 * titleSwipe}
              height="82"
              fill={K.gold}
              opacity="0.86"
              filter="url(#act2-ink-bleed)"
            />
          </g>
          <text x="4" y="136" fill="#1D242B" fontSize="82" fontFamily="Georgia, serif" fontWeight="700" letterSpacing="-1.5">
            Health has a history.
          </text>
          <rect x="4" y="168" width="560" height="40" rx="4" fill="#64748B" />
          <text x="18" y="195" fill="#FFFFFF" fontSize="22" fontFamily="Arial, sans-serif" fontWeight="600">
            A digital companion keeps the whole story close.
          </text>
        </g>

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

        {/* Phone Frame Cutout */}
        <g transform={`translate(1030 ${132 + phoneY}) rotate(2 300 335)`} filter="url(#act2-cutout-shadow)">
          <rect x="42" y="0" width="460" height="710" rx="52" fill={K.night} />
          <rect x="55" y="13" width="434" height="684" rx="44" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
          <rect x="178" y="13" width="188" height="31" rx="15" fill={K.night} />
          <text x="91" y="82" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2">
            BABYBOOK+
          </text>
          <text x="91" y="129" fill={K.ink} fontFamily="Georgia, serif" fontSize="35" fontWeight="700">
            Hi, Maya
          </text>
          <text x="93" y="159" fill="#6F7E81" fontFamily="Arial, sans-serif" fontSize="16">
            Your little one is growing.
          </text>

          <g opacity={landing}>
            <rect x="82" y="186" width="378" height="270" rx="16" fill="#DDE9E2" stroke={K.night} strokeWidth="2.5" />
            <circle cx="145" cy="266" r="36" fill={K.gold} stroke={K.night} strokeWidth="2.5" />
            <circle cx="145" cy="253" r="14" fill={K.paperLight} stroke={K.night} strokeWidth="2" />
            <path d="M119 290q2-26 26-26t27 26" fill={K.blue} stroke={K.night} strokeWidth="2" />
            <text x="202" y="238" fill={K.night} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" letterSpacing="2">
              YOUR FAMILY ARCHIVE
            </text>
            <text x="202" y="275" fill={K.ink} fontFamily="Georgia, serif" fontSize="24" fontWeight="700">
              Maya’s first year
            </text>
            <path d="M110 342h320M110 374h287M110 406h303" stroke="#94A3B8" strokeWidth="3" />
            <circle cx="125" cy="430" r="7" fill={K.red} />
            <circle cx="151" cy="430" r="7" fill={K.gold} />
            <circle cx="177" cy="430" r="7" fill={K.green} />
            <circle cx="203" cy="430" r="7" fill={K.blueLight} />
          </g>

          <g opacity={health}>
            <rect x="82" y="186" width="378" height="211" rx="16" fill="#DDE9E2" stroke={K.night} strokeWidth="2.5" />
            <text x="110" y="225" fill={K.night} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800" letterSpacing="2">
              GROWTH, OVER TIME
            </text>
            <text x="110" y="243" fill={K.blue} fontFamily="Georgia, serif" fontStyle="italic" fontSize="12">
              WHO standard · sample data
            </text>
            <g opacity={weightReveal}>
              <text x="110" y="263" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700">
                Weight
              </text>
              <text x="110" y="287" fill={K.ink} fontFamily="Georgia, serif" fontSize="20" fontWeight="700">
                4.8 kg
              </text>
            </g>
            <g opacity={heightReveal}>
              <text x="225" y="263" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="11" fontWeight="700">
                Height
              </text>
              <text x="225" y="287" fill={K.ink} fontFamily="Georgia, serif" fontSize="20" fontWeight="700">
                57 cm
              </text>
            </g>
            <g opacity={headReveal}>
              <text x="338" y="256" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">
                Head
              </text>
              <text x="338" y="268" fill={K.blue} fontFamily="Arial, sans-serif" fontSize="10" fontWeight="700">
                circumference
              </text>
              <text x="338" y="287" fill={K.ink} fontFamily="Georgia, serif" fontSize="20" fontWeight="700">
                38 cm
              </text>
            </g>
            <g transform="translate(109 292) scale(.7 .25)">
              <GrowthLine progress={chartDraw} prefix="act2" />
            </g>
          </g>

          <g opacity={health}>
            <rect x="82" y="419" width="176" height="98" rx="14" fill="#F1D9BD" stroke={K.night} strokeWidth="2.5" />
            <rect x="276" y="419" width="184" height="98" rx="14" fill="#E2E9DA" stroke={K.night} strokeWidth="2.5" />
            <text x="103" y="461" fill={K.redDark} fontFamily="Georgia, serif" fontSize="25">
              ♡
            </text>
            <text x="103" y="490" fill={K.ink} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800">
              Health
            </text>
            <text x="300" y="461" fill={K.blue} fontFamily="Georgia, serif" fontSize="24">
              ✳
            </text>
            <text x="300" y="490" fill={K.ink} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800">
              Memories
            </text>
          </g>

          <g opacity={nutrition}>
            <rect x="82" y="540" width="378" height="107" rx="14" fill="#E6F0FA" stroke={K.night} strokeWidth="2.5" />
            <circle cx="119" cy="580" r="13" fill={K.red} stroke={K.night} strokeWidth="2" />
            <text x="145" y="580" fill={K.night} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="1">
              DAILY NUTRITION
            </text>
            <text x="109" y="616" fill={K.ink} fontFamily="Arial, sans-serif" fontSize="17" fontWeight="700">
              2 meals logged today
            </text>
            <circle cx="408" cy="589" r="15" fill={K.green} stroke={K.night} strokeWidth="2" />
            <path d="m401 589 5 5 10-11" fill="none" stroke={K.paperLight} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          <g opacity={reminders}>
            <rect x="82" y="540" width="378" height="107" rx="14" fill={K.night} />
            <circle cx="119" cy="580" r="12" fill={K.gold} />
            <path d="M119 573v8l6 4" fill="none" stroke={K.night} strokeWidth="2.5" />
            <text x="145" y="582" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="700">
              Checkup coming up
            </text>
            <text x="109" y="617" fill="#B9C9C6" fontFamily="Arial, sans-serif" fontSize="14">
              A gentle reminder, right on time.
            </text>
          </g>
        </g>

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
    </AbsoluteFill>
  );
};

/* ============================================================================
 * ACT THREE — PARENT-CONTROLLED VISIT ("03 / PRIVACY BY DESIGN")
 * ============================================================================ */
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
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          backgroundImage: 'radial-gradient(#B9D7D1 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <VoxDefs prefix="act3" />
        <path d="M0 785Q460 730 960 785t960-30v325H0Z" fill="#132035" />
        <path d="M0 785Q460 730 960 785t960-30" fill="none" stroke="#728B88" strokeWidth="3" />

        {/* Editorial Badge & Display Title */}
        <g transform="translate(108 102)">
          <rect x="0" y="0" width="440" height="44" rx="6" fill={K.gold} />
          <text x="18" y="30" fill={K.night} fontFamily="Arial, sans-serif" fontSize="20" fontWeight="800" letterSpacing="2">
            03 / A PARENT-CONTROLLED VISIT
          </text>
          <text x="0" y="138" fill={K.paperLight} fontFamily="Georgia, serif" fontSize="77" fontWeight="700">
            One visit.
          </text>
          <text x="2" y="212" fill={K.paperLight} fontFamily="Georgia, serif" fontSize="77" fontWeight="700">
            Only what’s needed.
          </text>
        </g>

        <g transform="translate(135 452) scale(0.94)">
          <ParentAndChild x={0} y={0} scale={1.04} coat={K.red} childCoat={K.gold} prefix="act3" />
        </g>

        <path
          d="M300 650C480 590 618 620 771 540s120-140 221-135"
          fill="none"
          stroke={K.gold}
          strokeWidth="4"
          strokeDasharray="7 15"
          opacity="0.75"
        />
        <path d="M1330 340v426" stroke={K.blueLight} strokeWidth="2" strokeDasharray="5 12" opacity="0.42" />
        <text x="1390" y="325" fill={K.blueLight} fontFamily="Arial, sans-serif" fontSize="14" fontWeight="800" letterSpacing="2">
          CLINICIAN VIEW
        </text>

        {/* Share Modal Cutout */}
        <g opacity={share} transform={`translate(${interpolate(share, [0, 1], [-32, 0])} 0) rotate(-2 716 514)`} filter="url(#act3-cutout-shadow)">
          <rect x="570" y="360" width="292" height="308" rx="18" fill={K.night} />
          <rect x="580" y="370" width="272" height="288" rx="14" fill="#FFFCF5" stroke={K.night} strokeWidth="3" />
          <text x="605" y="412" fill={K.night} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800">
            CHOOSE TO SHARE
          </text>
          {['Growth chart', 'Allergy summary', 'Vaccinations'].map((label, i) => {
            const check = ease(frame, selectionStart + 18 + i * 24, 12);
            const y = 450 + i * 57;
            return (
              <g key={label}>
                <rect x="605" y={y} width="22" height="22" fill="#FFFCF5" stroke={K.night} strokeWidth="2.5" />
                <rect x="605" y={y} width="22" height="22" fill={K.red} opacity={check} />
                <path
                  d={`M610 ${y + 11}l6 6 10-13`}
                  fill="none"
                  stroke={K.night}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset={1 - check}
                  opacity={check}
                />
                <text x="648" y={y + 18} fill={K.ink} fontFamily="Arial, sans-serif" fontSize="20" fontWeight="600">
                  {label}
                </text>
              </g>
            );
          })}
          <g transform={`translate(716 636) scale(${1 - 0.07 * Math.sin(tap * Math.PI)}) translate(-716 -636)`}>
            <rect x="605" y="615" width="222" height="36" fill={K.redDark} stroke={K.night} strokeWidth="2.5" />
            <text x="716" y="639" textAnchor="middle" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800">
              Revoke access
            </text>
          </g>
        </g>

        {/* Time-Limited QR Token Card */}
        <g transform={`translate(950 ${390 + floatY(frame, 0.04, 8)}) rotate(-3 135 135)`} filter="url(#act3-cutout-shadow)">
          <g opacity={ease(frame, qrStart, 20) * (1 - revokeShatter)}>
            <rect x="0" y="0" width="285" height="285" fill="#FFFCF5" stroke={K.night} strokeWidth="3.5" />
            <rect x="0" y="0" width="285" height="30" fill="#E4EFFA" stroke={K.night} strokeWidth="2" />
            <text x="15" y="19" fill={K.night} fontFamily="Arial, sans-serif" fontSize="10" fontWeight="800" letterSpacing="1">
              TIME-LIMITED TOKEN
            </text>
            <text x="222" y="19" textAnchor="end" fill={K.ink} fontFamily="Arial, sans-serif" fontSize="11" fontWeight="800">
              {countdown}s
            </text>
            <circle cx="258" cy="14" r="8" fill="none" stroke={K.paperShade} strokeWidth="2" />
            <circle
              cx="258"
              cy="14"
              r="8"
              fill="none"
              stroke={K.redDark}
              strokeWidth="2.5"
              strokeDasharray="50.3"
              strokeDashoffset={50.3 * (1 - time)}
              transform="rotate(-90 258 14)"
            />
            <g transform="translate(27 34)">
              <QrMark size={231} progress={time * (1 - revokeShatter)} />
            </g>
            <MaskingTape x={102} y={-12} rotate={2} width={80} height={24} prefix="act3" />
            <text x="142" y="318" fill={K.paper} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800" letterSpacing="2">
              ONE-TIME VISIT TOKEN
            </text>
          </g>
          <g>
            {Array.from({length: 20}, (_, i) => {
              const x = 43 + ((i * 47) % 192);
              const y = 43 + ((i * 71) % 192);
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

        {/* Clinician View Card */}
        <g opacity={viewer} transform={`translate(${interpolate(scan, [0, 1], [1800, 1470])} 356)`} filter="url(#act3-cutout-shadow)">
          <rect x="0" y="0" width="336" height="376" fill="#FFFCF5" stroke={K.night} strokeWidth="4" />
          <rect x="0" y="0" width="336" height="65" fill={K.blue} stroke={K.night} strokeWidth="3" />
          <circle cx="42" cy="33" r="13" fill={K.gold} stroke={K.night} strokeWidth="2.5" />
          <text x="69" y="40" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="16" fontWeight="800">
            PEDIATRIC VISIT
          </text>
          <text x="28" y="112" fill={K.night} fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2">
            VIEW-ONLY RECORD
          </text>
          {['Growth chart', 'Allergy summary', 'Vaccination record'].map((item, i) => (
            <g key={item}>
              <path d={`M30 ${153 + i * 52}h18`} stroke={K.redDark} strokeWidth="5" strokeLinecap="round" />
              <text x="65" y={160 + i * 52} fill={K.ink} fontFamily="Arial, sans-serif" fontSize="17" fontWeight="600">
                {item}
              </text>
              <path d={`M28 ${180 + i * 52}h279`} stroke="#D8CCB7" strokeWidth="2" />
            </g>
          ))}
          <text x="28" y="338" fill={K.redDark} fontFamily="Arial, sans-serif" fontSize="12" fontWeight="800">
            EXPIRES WHEN THE VISIT ENDS
          </text>
        </g>

        <g opacity={viewEnded} transform="translate(1470 356)" filter="url(#act3-cutout-shadow)">
          <rect x="0" y="0" width="336" height="376" fill={K.night} stroke={K.paperLight} strokeWidth="3" />
          <circle cx="168" cy="142" r="34" fill={K.red} />
          <path
            d="M155 140v-8a13 13 0 0 1 26 0v8m-31 0h36v27h-36z"
            fill="none"
            stroke={K.paperLight}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text x="168" y="216" textAnchor="middle" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="17" fontWeight="800">
            ACCESS REVOKED
          </text>
          <text x="168" y="244" textAnchor="middle" fill="#C5D5CA" fontFamily="Arial, sans-serif" fontSize="14">
            This visit can no longer view the record.
          </text>
        </g>

        <g opacity={revoke} transform="translate(968 738)">
          <circle cx="0" cy="0" r="12" fill={K.red} />
          <path d="M-4-4 4 4M4-4-4 4" stroke={K.paperLight} strokeWidth="3" strokeLinecap="round" />
          <text x="24" y="5" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="15" fontWeight="800">
            Token revoked
          </text>
        </g>

        <g opacity={audit} transform="translate(1400 800)">
          <path d="M0 0h340M0 38h290M0 76h320" stroke="#7EA09D" strokeWidth="3" />
          {[0, 1, 2].map((n) => (
            <g key={n} opacity={ease(frame, cueFrame(2, 8) + n * 9, 12)}>
              <circle cx="6" cy={n * 38} r="6" fill={K.gold} />
              <circle cx="310" cy={n * 38} r="6" fill={K.green} />
            </g>
          ))}
          <text x="0" y="118" fill="#C5D5CA" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="800" letterSpacing="2">
            EVERY VIEW, RECORDED
          </text>
        </g>
      </svg>
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
  const collageScroll = interpolate(frame, [collageStart, collageStart + 240], [0, 96], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outro = ease(frame, actFrames[3] - 72, 36);
  const bridgeNodes = [
    [631, 563],
    [797, 481],
    [970, 526],
    [1132, 626],
    [1293, 644],
  ];
  const titleSwipe = sweep(frame, 6, 26);

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
          <clipPath id="act-four-memory-strip">
            <rect x="662" y="382" width="562" height="64" rx="5" />
          </clipPath>
        </defs>

        <rect x="0" y="0" width="1920" height="1080" fill="url(#act4-ruled-paper)" />
        <circle cx="959" cy="475" r="345" fill="url(#act4-halftone)" opacity="0.55" />
        <path d="M0 845 Q440 818 900 842 T1920 835 V1080 H0 Z" fill="#EFE8DA" />
        <line x1="0" y1="842" x2="1920" y2="838" stroke="#D2C6B2" strokeWidth="2.5" />

        {/* Editorial Badge & Display Headline */}
        <g transform="translate(108 106)">
          <rect x="0" y="0" width="490" height="44" rx="6" fill="#232B35" filter="url(#act4-cutout-shadow)" />
          <text x="18" y="30" fill="#F8F9FA" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="800" letterSpacing="2">
            <tspan fill={K.gold}>04 / </tspan>
            THE WHOLE STORY, HELD TOGETHER
          </text>

          <g transform="translate(-12 68) rotate(-1.5)">
            <rect x="0" y="0" width={455 * titleSwipe} height="80" fill={K.red} opacity="0.72" filter="url(#act4-ink-bleed)" />
          </g>
          <text x="0" y="136" fill={K.ink} fontFamily="Georgia, serif" fontSize="78" fontWeight="700" letterSpacing="-1.5">
            Memory and medicine.
          </text>
        </g>

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
          <text x="254" y="262" fill={K.night} fontFamily="Georgia, serif" fontSize="17" fontStyle="italic" fontWeight="700">
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
            <g transform={`translate(${671 - collageScroll} 384) scale(.31)`}>
              {Array.from({length: 8}, (_, i) => (
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
          strokeWidth="23"
          strokeLinecap="round"
          opacity="0.7"
        />
        <path
          d="M562 630C711 470 820 443 970 526S1193 717 1372 607"
          fill="none"
          stroke={K.redDark}
          strokeWidth="7"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - bridge}
          filter="url(#act4-ink-bleed)"
        />
        {bridgeNodes.map(([x, y], i) => (
          <g key={i} opacity={ease(frame, cueFrame(3, 1) + i * 13, 14)}>
            <circle cx={x} cy={y} r="19" fill="#FFFCF5" stroke={K.night} strokeWidth="4" />
            <path d="M-5 0h10M0-5v10" transform={`translate(${x} ${y})`} stroke={K.redDark} strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}

        <g opacity={family}>
          <ParentAndChild x={790} y={553} scale={1.15} coat={K.blue} childCoat={K.red} prefix="act4" />
        </g>

        <g opacity={finish} transform={`translate(0 ${interpolate(finish, [0, 1], [28, 0])})`}>
          <text x="960" y="316" textAnchor="middle" fill={K.night} fontFamily="Georgia, serif" fontSize="34" fontWeight="700">
            One story. Across a lifetime.
          </text>
          <path d="M805 338h310" stroke={K.redDark} strokeWidth="5" strokeLinecap="round" filter="url(#act4-ink-bleed)" />
        </g>

        {/* Outro Card */}
        <g opacity={outro}>
          <rect x="0" y="0" width="1920" height="1080" fill="#F9F6F0" />
          <rect x="0" y="0" width="1920" height="1080" fill="url(#act4-ruled-paper)" />
          <circle cx="803" cy="522" r="39" fill={K.blue} stroke={K.night} strokeWidth="4" />
          <text x="803" y="532" textAnchor="middle" fill={K.paperLight} fontFamily="Arial, sans-serif" fontSize="24" fontWeight="800">
            B+
          </text>
          <text x="860" y="540" fill={K.ink} fontFamily="Georgia, serif" fontSize="52" fontWeight="700">
            BabyBook+
          </text>
          <path d="M762 582h396" stroke={K.redDark} strokeWidth="5" strokeLinecap="round" filter="url(#act4-ink-bleed)" />
        </g>
      </svg>
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
  const cueStart = caption ? Math.round(caption.start * compositionFps) : 0;
  const captionProgress = caption ? (cueStart === 0 ? 1 : ease(frame, cueStart, 8)) : 0;
  const progress = (frame / actFrames[actIndex]) * 100;

  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: '100%', height: 6, background: 'rgba(17,24,39,0.12)'}}>
        <div style={{width: `${progress}%`, height: '100%', background: K.gold}} />
      </div>
      {caption && (
        <div
          style={{
            position: 'absolute',
            left: 104,
            right: 104,
            bottom: 36,
            minHeight: 96,
            display: 'flex',
            alignItems: 'center',
            padding: '16px 32px',
            background: '#FFFCF5',
            border: `3px solid ${K.night}`,
            borderLeft: `10px solid ${K.redDark}`,
            opacity: captionProgress,
            transform: `translateY(${(1 - captionProgress) * 12}px)`,
            boxShadow: '6px 8px 0px rgba(17,24,39,0.22)',
          }}
        >
          <div
            style={{
              width: '100%',
              textAlign: 'center',
              color: K.ink,
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-.02em',
              lineHeight: 1.25,
            }}
          >
            {caption.text}
          </div>
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