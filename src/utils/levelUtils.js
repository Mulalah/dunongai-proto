export const LEVEL_NAMES = {
  1: 'Antas 1',
  2: 'Antas 2',
  3: 'Antas 3',
  4: 'Antas 4',
  5: 'Antas 5',
  6: 'Antas 6'
};

export function getLevelColor(level) {
  if (level >= 6) return 'green';
  if (level >= 5) return 'gold';
  if (level >= 3) return 'teal';
  return 'navy';
}

export function getStarsFromScore(score) {
  if (score >= 90) return 5;
  if (score >= 80) return 4;
  if (score >= 70) return 3;
  if (score >= 60) return 2;
  return 1;
}

export function shouldAdvance(score) {
  return score >= 80;
}

export function shouldStepBack(score) {
  return score < 50;
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export const BADGES = [
  {
    badgeId: 'first-story',
    name: 'Unang Kwento',
    description: 'Natapos ang iyong unang kwento!',
    icon: '📖',
    requirement: 'Tapusin ang isang kwento'
  },
  {
    badgeId: 'streak-3',
    name: '3-Day Streak',
    description: '3 araw na sunod-sunod magbasa',
    icon: '🔥',
    requirement: 'Mag-basa ng 3 araw nang sunud-sunod'
  },
  {
    badgeId: 'streak-7',
    name: 'One Week Wonder',
    description: '7 araw na sunod-sunod!',
    icon: '⚡',
    requirement: 'Mag-basa ng 7 araw nang sunud-sunod'
  },
  {
    badgeId: 'level-3',
    name: 'Antas 3 Reader',
    description: 'Naabot ang Antas 3',
    icon: '⭐',
    requirement: 'Umakyat sa Antas 3'
  },
  {
    badgeId: 'level-5',
    name: 'Antas 5 Master',
    description: 'Naabot ang Antas 5',
    icon: '🌟',
    requirement: 'Umakyat sa Antas 5'
  },
  {
    badgeId: 'perfect-score',
    name: 'Perfect Score',
    description: '100% sa isang quiz!',
    icon: '🏆',
    requirement: 'Makakuha ng 100% comprehension'
  }
];
