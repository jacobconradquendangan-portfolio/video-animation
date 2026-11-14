export type Caption = {
  text: string;
  start: number;
  end: number;
};

export type Act = {
  id: string;
  title: string;
  audio: string;
  duration: number;
  captions: Caption[];
};

const fps = 30;

const rawActs = [
  {
    id: '01',
    title: 'The paper trail problem',
    audio: 'audio/act-01.mp3',
    duration: 45.17,
    captions: [
      'The first six years of a child’s life are a blur of rapid growth, milestone moments, and critical health markers.',
      'For generations, families have relied on physical baby books, notebooks, and government immunization cards to capture childhood.',
      'These tangible keepsakes hold immense sentimental value.',
      'But paper is fragile.',
      'It gets lost in transit, damaged over time, or filled with scattered, unorganized entries.',
      'When a parent rushes to a clinic, the exact medical history they need is often buried or missing entirely.',
      'The system isn’t broken because parents don’t care—',
      'it’s broken because paper can’t keep pace with the demands of modern child healthcare.',
    ],
    captionTimes: [
      [0, 7.8],
      [7.9, 16.42],
      [16.92, 20.52],
      [21.04, 22.71],
      [22.97, 29.19],
      [29.72, 36.35],
      [36.82, 39.65],
      [39.96, 45.03],
    ],
  },
  {
    id: '02',
    title: 'Health, milestones & memories',
    audio: 'audio/act-02.mp3',
    duration: 52.92,
    captions: [
      'Enter BabyBook+.',
      'Designed not to replace the family keepsake, but to act as its secure, intelligent digital companion.',
      'BabyBook+ consolidates infant care into a single, intuitive mobile platform.',
      'Parents can seamlessly manage child profiles, log illnesses, track allergies,',
      'and monitor WHO-standard growth metrics like height, weight, and head circumference.',
      'But a baby book isn’t just about medicine—',
      'it’s about magic.',
      'BabyBook+ features a dedicated Milestone and Memory Archive,',
      'allowing parents to log developmental breakthroughs, record daily nutrition, and upload photo memories with custom captions.',
      'All of this is tied together with automated checkup and vaccine reminders, directly championing Sustainable Development Goal 3—Good Health and Well-being.',
    ],
    captionTimes: [
      [0, 1.1],
      [1.25, 8.51],
      [8.71, 14.21],
      [14.41, 19.94],
      [20.1, 25.9],
      [25.9, 29.45],
      [29.45, 30.8],
      [30.8, 34.85],
      [35.1, 42.03],
      [42.1, 52.83],
    ],
  },
  {
    id: '03',
    title: 'The privacy shield',
    audio: 'audio/act-03.mp3',
    duration: 46.11,
    captions: [
      'Digitizing a child’s health records raises an immediate question:',
      'Who controls the data?',
      'Traditional apps lock information behind corporate cloud walls.',
      'BabyBook+ takes a radically different approach with a parent-controlled, QR-based consultation architecture.',
      'In the clinic, the parent selects precisely which records to share and generates a time-based, encrypted QR token.',
      'The pediatrician scans this code to open a secure, view-only web viewer.',
      'Parents retain total control—with the ability to manually revoke access at any moment,',
      'or let the token expire automatically once the checkup concludes,',
      'while every interaction is permanently recorded in an audit log.',
    ],
    captionTimes: [
      [0, 4.15],
      [4.52, 6.1],
      [6.25, 10.44],
      [10.71, 18.03],
      [18.29, 26.96],
      [26.96, 32.16],
      [32.16, 37.53],
      [37.78, 41.83],
      [42.01, 45.95],
    ],
  },
  {
    id: '04',
    title: 'The hybrid future',
    audio: 'audio/act-04.mp3',
    duration: 39.76,
    captions: [
      'By marrying clinical precision with sentimental preservation, BabyBook+ bridges the gap between generations.',
      'Physical keepsakes capture the memories;',
      'BabyBook+ secures the health and documents every milestone along the way.',
      'Together, they form a complete, organized, and deeply personal chronicle of early development—engineered to empower parents, assist pediatricians, and protect the health of every child.',
    ],
    captionTimes: [
      [0, 7.54],
      [7.84, 10.41],
      [10.66, 15.8],
      [16.04, 28.67],
    ],
  },
] satisfies (Omit<Act, 'captions'> & {captions: string[]; captionTimes: [number, number][]})[];

export const acts: Act[] = rawActs.map((act) => {
  if (act.captions.length !== act.captionTimes.length) {
    throw new Error(`Act ${act.id} must have one timing window per caption.`);
  }
  const captions: Caption[] = act.captions.map((text, index) => {
    const [start, end] = act.captionTimes[index];
    if (start < 0 || end <= start || end > act.duration) {
      throw new Error(`Act ${act.id} has an invalid timing window for caption ${index + 1}.`);
    }
    return {text, start: Math.round(start * fps) / fps, end: Math.round(end * fps) / fps};
  });
  return {id: act.id, title: act.title, audio: act.audio, duration: act.duration, captions};
});

export const durationInFrames = acts.reduce((sum, act) => sum + Math.ceil(act.duration * fps), 0);
export const actFrames = acts.map((act) => Math.ceil(act.duration * fps));
