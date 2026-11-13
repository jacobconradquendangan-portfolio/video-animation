import {actFrames, acts} from '../src/script.ts';
import {writeFile} from 'node:fs/promises';

const pad = (value, digits = 2) => String(value).padStart(digits, '0');
const timecode = (seconds) => {
  const ms = Math.round(seconds * 1000);
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)},${pad(millis, 3)}`;
};

let offsetFrames = 0;
let sequence = 1;
const entries = [];
for (let index = 0; index < acts.length; index++) {
  const act = acts[index];
  const offset = offsetFrames / 30;
  for (const caption of act.captions) {
    entries.push(`${sequence++}\n${timecode(offset + caption.start)} --> ${timecode(offset + caption.end)}\n${caption.text}`);
  }
  offsetFrames += actFrames[index];
}

await writeFile('transcript.srt', `${entries.join('\n\n')}\n`, 'utf8');
console.log(`Wrote ${sequence - 1} caption cues across ${(offsetFrames / 30).toFixed(2)} seconds.`);
