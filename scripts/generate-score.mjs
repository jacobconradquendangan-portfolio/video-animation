import {mkdir, writeFile} from 'node:fs/promises';

const sampleRate = 48000;
const seconds = 173.04;
const samples = sampleRate * seconds;
const buffer = Buffer.alloc(samples * 4);
const chords = [
  [130.81, 164.81, 196.0],
  [110.0, 146.83, 174.61],
  [146.83, 185.0, 220.0],
  [123.47, 155.56, 185.0],
];
let phase = 0;
const chapterHits = [1.2, 45.2, 98.133, 144.267];

for (let i = 0; i < samples; i++) {
  const t = i / sampleRate;
  const chordIndex = Math.floor(t / 8) % chords.length;
  const chord = chords[chordIndex];
  const nextChord = chords[(chordIndex + 1) % chords.length];
  const barPosition = (t % 8) / 8;
  const blend = Math.max(0, Math.min(1, (barPosition - 0.88) / 0.12));
  const smoothBlend = blend * blend * (3 - 2 * blend);
  const pulse = 0.72 + 0.28 * Math.sin((2 * Math.PI * t) / 4) ** 2;
  const fadeIn = Math.min(1, t / 2);
  const fadeOut = Math.min(1, (seconds - t) / 3);
  let left = 0;
  let right = 0;
  for (let n = 0; n < chord.length; n++) {
    const harmonic = chord[n] * (n === 2 ? 2 : 1);
    const nextHarmonic = nextChord[n] * (n === 2 ? 2 : 1);
    const gain = [0.19, 0.13, 0.07][n];
    const leftTone = Math.sin((2 * Math.PI * harmonic * t) + n * 0.4) * (1 - smoothBlend) +
      Math.sin((2 * Math.PI * nextHarmonic * t) + n * 0.4) * smoothBlend;
    const rightTone = Math.sin((2 * Math.PI * harmonic * 1.002 * t) + n * 0.4) * (1 - smoothBlend) +
      Math.sin((2 * Math.PI * nextHarmonic * 1.002 * t) + n * 0.4) * smoothBlend;
    left += leftTone * gain * [0.9, 0.64, 0.32][n];
    right += rightTone * gain * [0.32, 0.64, 0.9][n];
  }

  let accent = 0;
  for (let hit = 0; hit < chapterHits.length; hit++) {
    const boundary = chapterHits[hit];
    const distance = Math.abs(t - boundary);
    if (distance < 1.2) {
      const envelope = Math.exp(-distance * 3.2);
      accent += Math.sin(2 * Math.PI * (660 + 150 * hit) * t) * envelope * 0.065;
    }
  }

  phase += 1;
  const dither = Math.sin(phase * 12.9898) * 0.00015;
  const leftPcm = Math.max(-1, Math.min(1, left * 0.1 * pulse * fadeIn * fadeOut + accent * fadeIn * fadeOut + dither));
  const rightPcm = Math.max(-1, Math.min(1, right * 0.1 * pulse * fadeIn * fadeOut + accent * fadeIn * fadeOut + dither));
  buffer.writeInt16LE(Math.round(leftPcm * 32767), i * 4);
  buffer.writeInt16LE(Math.round(rightPcm * 32767), i * 4 + 2);
}

const header = Buffer.alloc(44);
header.write('RIFF', 0);
header.writeUInt32LE(36 + buffer.length, 4);
header.write('WAVE', 8);
header.write('fmt ', 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(sampleRate, 24);
header.writeUInt32LE(sampleRate * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write('data', 36);
header.writeUInt32LE(buffer.length, 40);

await mkdir('public/audio', {recursive: true});
await writeFile('public/audio/soft-score.wav', Buffer.concat([header, buffer]));
console.log(`Generated ${seconds}s stereo score at ${sampleRate}Hz.`);
