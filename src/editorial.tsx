import React from 'react';
import {Easing, interpolate} from 'remotion';

/* ============================================================================
 * PREMIUM EDITORIAL SYSTEM
 * Shared palette, kinetic typography, chapter wipes and film-finish overlays.
 * ============================================================================ */

export const E = {
  ink: '#16283A',
  inkSoft: '#41566B',
  inkMuted: '#7A8794',
  cream: '#FAF5EA',
  paper: '#FFFCF5',
  rule: '#D8CCB8',
  coral: '#D8554F',
  pink: '#F4A0B4',
  blue: '#4A90E2',
  blueDeep: '#2E6FB5',
  gold: '#E9B45C',
  sage: '#7E9A7B',
} as const;

const smooth = Easing.bezier(0.16, 1, 0.3, 1);
const wipeEase = Easing.bezier(0.65, 0, 0.35, 1);

const progress = (frame: number, start: number, length: number) =>
  interpolate(frame, [start, start + length], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: smooth,
  });

const normalize = (word: string) =>
  word
    .replace(/[^a-zA-Z0-9\u00C0-\u024F'’+]/g, '')
    .toLowerCase();

export type KineticLine = {
  text: string;
  highlight?: string[];
  accent?: string[];
  italic?: string[];
  size?: number;
  color?: string;
  highlightColor?: string;
  wordStarts?: number[];
};

/* ----------------------------------------------------------------------------
 * KINETIC WORDS
 * Each word rises out of its own mask; highlight words get a marker sweep.
 * -------------------------------------------------------------------------- */
export const KineticWords = ({
  frame,
  line,
  start,
  stagger = 3.4,
  duration = 18,
  style,
}: {
  frame: number;
  line: KineticLine;
  start: number;
  stagger?: number;
  duration?: number;
  style?: React.CSSProperties;
}) => {
  const tokens = line.text.split(' ');
  const highlight = new Set((line.highlight ?? []).map(normalize));
  const accent = new Set((line.accent ?? []).map(normalize));
  const italic = new Set((line.italic ?? []).map(normalize));

  return (
    <span style={{display: 'block', ...style}}>
      {tokens.map((token, index) => {
        const wordStart = line.wordStarts?.[index] ?? start + index * stagger;
        const wordIn = progress(frame, wordStart, duration);
        const key = normalize(token);
        const isHighlight = highlight.has(key);
        const isAccent = accent.has(key);
        const isItalic = italic.has(key);

        return (
          <React.Fragment key={`${token}-${index}`}>
            <span
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                verticalAlign: 'bottom',
                paddingBottom: '0.1em',
                marginBottom: '-0.1em',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  transform: `translateY(${(1 - wordIn) * 110}%) rotate(${(1 - wordIn) * 3.5}deg)`,
                  transformOrigin: 'left bottom',
                  opacity: wordIn <= 0 ? 0 : 1,
                }}
              >
                <span style={{position: 'relative', display: 'inline-block'}}>
                  {isHighlight && (
                    <span
                      style={{
                        position: 'absolute',
                        left: '-0.07em',
                        right: '-0.07em',
                        bottom: '0.02em',
                        height: '0.52em',
                        background: line.highlightColor ?? E.gold,
                        transform: `scaleX(${wordIn})`,
                        transformOrigin: 'left center',
                        clipPath: 'polygon(1% 14%, 100% 0, 99% 88%, 0 100%)',
                        zIndex: 0,
                      }}
                    />
                  )}
                  <span
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      color: isAccent ? E.coral : line.color ?? E.ink,
                      fontStyle: isItalic ? 'italic' : 'normal',
                    }}
                  >
                    {token}
                  </span>
                </span>
              </span>
            </span>
            {index < tokens.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
    </span>
  );
};

/* ----------------------------------------------------------------------------
 * EDITORIAL TITLE
 * Numbered kicker, oversized serif headline, rendered subtitle.
 * -------------------------------------------------------------------------- */
export const EditorialTitle = ({
  frame,
  start = 0,
  end,
  showKicker = true,
  x = 100,
  y = 76,
  width = 860,
  index,
  label,
  lines,
  subtitle,
  accent = E.gold,
}: {
  frame: number;
  start?: number;
  end?: number;
  showKicker?: boolean;
  x?: number;
  y?: number;
  width?: number;
  index: string;
  label: string;
  lines: KineticLine[];
  subtitle?: string;
  accent?: string;
}) => {
  const kickerIn = progress(frame, start, 14);
  const subtitleStart = start + 8 + lines.length * 8;
  const subtitleIn = progress(frame, subtitleStart, 18);
  const out = end === undefined ? 0 : progress(frame, end - 12, 12);
  const blockOpacity = 1 - out;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        opacity: blockOpacity,
        transform: `translateY(${(1 - kickerIn) * 10}px)`,
        pointerEvents: 'none',
      }}
    >
      {showKicker && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: E.ink,
            color: E.paper,
            padding: '10px 16px 9px 13px',
            opacity: kickerIn,
            transform: `translateX(${(1 - kickerIn) * -18}px)`,
            boxShadow: '5px 6px 0 rgba(22,40,58,0.16)',
          }}
        >
          <span style={{width: 8, height: 8, background: accent, display: 'inline-block'}} />
          <span
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '2.6px',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            <span style={{color: accent}}>{index}</span>
            <span style={{opacity: 0.55, margin: '0 9px'}}>/</span>
            {label}
          </span>
        </div>
      )}

      <div style={{marginTop: showKicker ? 24 : 0}}>
        {lines.map((line, lineIndex) => (
          <KineticWords
            key={`${line.text}-${lineIndex}`}
            frame={frame}
            line={line}
            start={start + 8 + lineIndex * 7}
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: line.size ?? 82,
              fontWeight: 700,
              lineHeight: 0.97,
              letterSpacing: '-0.035em',
              color: line.color ?? E.ink,
              marginTop: lineIndex === 0 ? 0 : 2,
            }}
          />
        ))}
      </div>

      {subtitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 14,
            marginTop: 20,
            maxWidth: 560,
            opacity: subtitleIn,
            transform: `translateY(${(1 - subtitleIn) * 8}px)`,
          }}
        >
          <span style={{width: 3, background: accent, flexShrink: 0}} />
          <span
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1.36,
              letterSpacing: '-0.005em',
              color: E.inkSoft,
            }}
          >
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

/* ----------------------------------------------------------------------------
 * KINETIC SUPER
 * Cue-synced typographic callouts with an editorial label and rule.
 * -------------------------------------------------------------------------- */
export const KineticSuper = ({
  frame,
  start,
  end,
  x,
  y,
  width = 900,
  label,
  lines,
  size = 52,
  accent = E.coral,
  align = 'left',
  uppercase = true,
}: {
  frame: number;
  start: number;
  end: number;
  x: number;
  y: number;
  width?: number;
  label?: string;
  lines: KineticLine[];
  size?: number;
  accent?: string;
  align?: 'left' | 'center';
  uppercase?: boolean;
}) => {
  if (frame < start || frame >= end) {
    return null;
  }

  const inP = progress(frame, start, 13);
  const outP = progress(frame, Math.max(start, end - 10), 8);
  const shift = (1 - inP) * 14 - outP * 6;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        opacity: inP * (1 - outP),
        transform: `translateY(${shift}px)`,
        textAlign: align,
        pointerEvents: 'none',
      }}
    >
      {label && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: align === 'center' ? 'center' : 'flex-start',
            gap: 10,
            marginBottom: 10,
          }}
        >
          <span style={{width: 24, height: 2, background: accent, display: 'inline-block'}} />
          <span
            style={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '2.8px',
              color: E.inkSoft,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
        </div>
      )}

      {lines.map((line, index) => (
        <KineticWords
          key={`${line.text}-${index}`}
          frame={frame}
          line={line}
          start={start + 3 + index * 4}
          stagger={2.6}
          duration={16}
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: line.size ?? size,
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: '-0.025em',
            textTransform: uppercase ? 'uppercase' : 'none',
            color: line.color ?? E.ink,
            marginTop: index === 0 ? 0 : 2,
          }}
        />
      ))}
    </div>
  );
};

/* ----------------------------------------------------------------------------
 * CHAPTER WIPE
 * Cream paper panel with a torn lower edge that lifts to reveal the act.
 * -------------------------------------------------------------------------- */
const tornEdge = (() => {
  const teeth = Array.from({length: 25}, (_, i) => {
    const x = Math.round(1920 - (i * 1920) / 24);
    const y = i % 2 === 0 ? 12 : 34;
    return `L${x} ${y}`;
  }).join(' ');
  return `M0 0 H1920 V20 ${teeth} L0 20 Z`;
})();

export const PaperWipe = ({
  frame,
  index,
  label,
}: {
  frame: number;
  index: string;
  label: string;
}) => {
  const slide = interpolate(frame, [3, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: wipeEase,
  });
  const contentOpacity = Math.max(0, 1 - slide * 1.1);

  if (frame >= 17) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateY(${-slide * 101}%)`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: E.cream,
          backgroundImage:
            'radial-gradient(circle at 24% 18%, rgba(233,180,92,0.12), transparent 42%), radial-gradient(circle at 82% 78%, rgba(74,144,226,0.08), transparent 44%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 108,
            top: 250,
            display: 'flex',
            alignItems: 'center',
            gap: 46,
            opacity: contentOpacity,
          }}
        >
          <div
            style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 330,
              lineHeight: 0.72,
              color: E.ink,
              opacity: 0.09,
              letterSpacing: '-0.06em',
            }}
          >
            {index}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '3.4px',
                color: E.coral,
                marginBottom: 14,
              }}
            >
              ACT {index}
            </div>
            <div
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontSize: 58,
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: E.ink,
                maxWidth: 760,
              }}
            >
              {label}
            </div>
            <div style={{width: 132, height: 4, background: E.gold, marginTop: 26}} />
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 1920 46"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          left: 0,
          bottom: -44,
          width: '100%',
          height: 46,
          filter: 'drop-shadow(0 7px 8px rgba(22,40,58,0.16))',
        }}
      >
        <path d={tornEdge} fill={E.cream} />
      </svg>
    </div>
  );
};

/* ----------------------------------------------------------------------------
 * FILM FINISH
 * Print grain, edge vignette and a soft inset shadow over the artwork.
 * -------------------------------------------------------------------------- */
const grainTile = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="180" height="180" filter="url(#n)" opacity="0.55"/></svg>`,
)}")`;

export const PremiumFinish = () => (
  <>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background:
          'radial-gradient(125% 105% at 50% 44%, rgba(255,255,255,0) 52%, rgba(15,28,42,0.20) 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundImage: grainTile,
        backgroundSize: '210px 210px',
        opacity: 0.16,
        mixBlendMode: 'multiply',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: 'inset 0 0 170px rgba(15,28,42,0.12)',
      }}
    />
  </>
);

/* ----------------------------------------------------------------------------
 * PERSISTENT CHROME
 * Global progress rail and brand slug.
 * -------------------------------------------------------------------------- */
export const EditorialChrome = ({
  frame,
  actIndex,
  actFrames,
  totalFrames,
}: {
  frame: number;
  actIndex: number;
  actFrames: number[];
  totalFrames: number;
}) => {
  const offset = actFrames.slice(0, actIndex).reduce((sum, length) => sum + length, 0);
  const globalFrame = offset + frame;
  const overall = Math.min(1, globalFrame / Math.max(1, totalFrames));
  const inP = progress(frame, 0, 12);

  const boundaries = actFrames
    .slice(0, -1)
    .map((_, index) =>
      actFrames.slice(0, index + 1).reduce((sum, length) => sum + length, 0),
    )
    .map((value) => (value / totalFrames) * 100);

  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: 4,
          background: 'rgba(22,40,58,0.14)',
          opacity: inP,
        }}
      >
        <div
          style={{
            width: `${overall * 100}%`,
            height: '100%',
            background: E.coral,
          }}
        />
        {boundaries.map((left, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: 0,
              width: 2,
              height: '100%',
              background: E.cream,
              opacity: 0.9,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: 64,
          top: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          opacity: inP * 0.68,
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            background: E.coral,
            color: E.cream,
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 13,
            fontWeight: 800,
            lineHeight: '16px',
            textAlign: 'center',
            borderRadius: 3,
          }}
        >
          +
        </span>
        <span
          style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '2.8px',
            color: E.inkSoft,
          }}
        >
          BABYBOOK+ / THE FIRST SIX YEARS
        </span>
      </div>
    </div>
  );
};
