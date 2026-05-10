import {
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  Timestamp,
  query,
  limit
} from 'firebase/firestore';
import { FIREBASE_ENABLED } from '../firebase';

const STORIES = [
  {
    id: 'story-taniman',
    title: 'Ang Taniman ni Lolo Pedro',
    level: 3,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-emerald-400 to-teal-600',
    emoji: '🌱',
    tapWords: ['taniman', 'kamatis', 'pag-aalaga'],
    text: `Si Lolo Pedro ay may malaking taniman sa kanilang bakuran.
Tuwing umaga, binibisita niya ang kanyang mga halaman.
May mga kamatis, sitaw, at talong na lumalaki roon.
Tinutulungan siya ng kanyang apo na si Benjo tuwing Sabado.

"Lolo, bakit mo mahal ang iyong taniman?" tanong ni Benjo.

"Dahil ang mga halaman ay tulad ng mga tao — kailangan nila ng pagmamahal at pag-aalaga para lumaki nang maayos," sagot ni Lolo Pedro habang ngingiti.

Nag-ani sila ng mga kamatis at sitaw nang hapon.
Masaya silang nagbalik sa bahay na may dalang sariwang gulay.`
  },
  {
    id: 'story-puppy',
    title: 'The Lost Puppy',
    level: 3,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-amber-300 to-orange-500',
    emoji: '🐶',
    tapWords: ['shivering', 'collar', 'posters'],
    text: `One rainy afternoon, Miguel found a small brown puppy shivering near the school gate.
The puppy had no collar and looked very hungry.
Miguel took off his jacket and wrapped it around the puppy.
He brought it home and gave it milk and bread.

His mother smiled when she saw what her son had done.
"You have a kind heart, Miguel," she said softly.
They named the puppy Brownie.

The next day, Miguel made posters to find the owner.
A little girl named Lea came running — Brownie was hers.
Miguel was sad, but he felt good knowing Brownie was safe.`
  },
  {
    id: 'story-bibingka',
    title: 'Si Inang at ang Bibingka',
    level: 3,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-yellow-300 to-amber-500',
    emoji: '🎄',
    tapWords: ['galapong', 'bibingka', 'sangkap'],
    text: `Tuwing Pasko, nagluluto si Inang ng bibingka para sa pamilya.
Maaga siyang gigising para ihanda ang mga sangkap.
May galapong, niyog, itlog, at asukal na nakahandang lahat.
Tinutulungan siya ng kanyang anak na si Ana sa kusina.
Hinuhugasan ni Ana ang mga dahon ng saging na gagamitin.

"Bakit mahalaga ang dahon ng saging, Inang?" tanong ni Ana.

"Para mas masarap at mabango ang bibingka," sagot ni Inang.

Nang maluto na, ibinigay ni Inang ang unang piraso kay Ana.
Mainit at matamis ang bibingka — paborito ng buong pamilya.

"Ikaw ang pinakamahusay na magluluto, Inang!" sabi ni Ana.`
  },
  {
    id: 'story-neighbor',
    title: 'My Helpful Neighbor',
    level: 3,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-pink-300 to-rose-500',
    emoji: '🏡',
    tapWords: ['ladder', 'rescued', 'sidewalk'],
    text: `Aling Rosa lives next door to our family.
Every morning, she sweeps the street in front of her house.
She also waters the plants along the sidewalk.

One day, our cat Miming got stuck in a tall tree.
Aling Rosa brought a ladder without being asked.
She climbed up carefully and rescued Miming.
My mother thanked her with a plate of pancit.

Aling Rosa just laughed and said neighbors should help each other.
I want to be like Aling Rosa when I grow up — always ready to help without waiting to be asked.`
  },
  {
    id: 'story-saranggola',
    title: 'Ang Lipad ng Saranggola',
    level: 3,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-sky-300 to-blue-600',
    emoji: '🪁',
    tapWords: ['saranggola', 'kawayan', 'liwasan'],
    text: `Isang maliwanag na Sabado, nagpalipad ng saranggola si Danilo sa liwasan ng kanilang barangay.
Gawa ng kanyang tatay ang saranggola mula sa kawayan at makulay na papel.
Mataas nang lumipad ang saranggola nang biglang humigpit ang hangin.
Naputol ang tali at lumayo ang saranggola.

Tumakbo si Danilo subalit hindi niya maabot ito.
Natagpuan niya ito sa bubong ng kapitbahay.
Tinulungan siya ng kapitbahay na makuha ang saranggola.

"Susunod, gagawa tayo ng mas matagal na tali," sabi ng kanyang tatay habang ngingiti.

Natuto si Danilo na laging maging handa sa mga hindi inaasahang pangyayari.`
  },
  {
    id: 'story-river',
    title: 'The River and the Fish',
    level: 4,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-cyan-400 to-indigo-600',
    emoji: '🐟',
    tapWords: ['barrio', 'courage', 'classmates'],
    text: `In a clear river near Barrio Masagana, there lived hundreds of fish of all shapes and colors.
The fish lived happily because the water was clean and full of food.

But one day, some people began throwing trash into the river.
The water slowly turned dark and smelly.
The fish became sick and many moved away.

A young girl named Lourdes saw what was happening.
She made posters and convinced her classmates to clean the river every Saturday.
Slowly, the water became clear again.
The fish returned and the river was alive once more.

Lourdes learned that one person with courage can make a big difference.`
  }
];

const CLASS_STUDENTS = [
  { id: 'demo-student-002', displayName: 'Maria Santos', level: 4, lastScore: 88, streak: 6, status: 'on-track' },
  { id: 'demo-student-003', displayName: 'Jose Reyes', level: 3, lastScore: 74, streak: 4, status: 'on-track' },
  { id: 'demo-student-004', displayName: 'Ana Bautista', level: 2, lastScore: 45, streak: 0, status: 'flagged' },
  { id: 'demo-student-005', displayName: 'Carlo Mendoza', level: 3, lastScore: 62, streak: 2, status: 'on-track' },
  { id: 'demo-student-006', displayName: 'Bea Cruz', level: 2, lastScore: 55, streak: 1, status: 'improving' },
  { id: 'demo-student-007', displayName: 'Rico Flores', level: 4, lastScore: 79, streak: 5, status: 'on-track' },
  { id: 'demo-student-008', displayName: 'Lena Torres', level: 1, lastScore: 38, streak: 0, status: 'flagged' },
  { id: 'demo-student-009', displayName: 'Mark Aquino', level: 3, lastScore: 70, streak: 3, status: 'on-track' }
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return Timestamp.fromDate(d);
}

export async function seedDatabase(db) {
  if (!FIREBASE_ENABLED || !db) return;
  try {
    const storiesRef = collection(db, 'stories');
    const existing = await getDocs(storiesRef);

    // If partial seed (fewer stories than expected), wipe and re-seed
    if (existing.size > 0 && existing.size < STORIES.length) {
      for (const d of existing.docs) {
        await deleteDoc(doc(db, 'stories', d.id));
      }
    } else if (existing.size >= STORIES.length) {
      return; // Already fully seeded
    }

    // Stories
    for (const s of STORIES) {
      await setDoc(doc(db, 'stories', s.id), { ...s, createdAt: Timestamp.now() });
    }

    // Demo student
    await setDoc(doc(db, 'users', 'demo-student-001'), {
      uid: 'demo-student-001',
      role: 'student',
      displayName: 'Juan dela Cruz',
      email: 'student@dunongai.ph',
      teacherId: 'demo-teacher-001',
      gradeLevel: 3,
      currentLevel: 3,
      hasCompletedDiagnostic: false,
      schoolName: 'Rizal Elementary School'
    });

    // Demo teacher
    await setDoc(doc(db, 'users', 'demo-teacher-001'), {
      uid: 'demo-teacher-001',
      role: 'teacher',
      displayName: "Ma'am Ana Reyes",
      email: 'teacher@dunongai.ph',
      schoolName: 'Rizal Elementary School',
      className: 'Grade 3 - Rizal'
    });

    // Class roster
    for (const cs of CLASS_STUDENTS) {
      await setDoc(doc(db, 'users', cs.id), {
        uid: cs.id,
        role: 'student',
        displayName: cs.displayName,
        email: `${cs.id}@dunongai.ph`,
        teacherId: 'demo-teacher-001',
        gradeLevel: 3,
        currentLevel: cs.level,
        lastScore: cs.lastScore,
        streakDays: cs.streak,
        status: cs.status,
        lastActiveDate: cs.streak > 0 ? daysAgo(0) : daysAgo(15),
        schoolName: 'Rizal Elementary School',
        recentScores: [
          Math.max(20, cs.lastScore - 8),
          Math.max(20, cs.lastScore - 4),
          cs.lastScore
        ]
      });

      // Sample sessions per student
      for (let i = 0; i < 4; i++) {
        const score = Math.max(20, cs.lastScore + (Math.random() * 14 - 7));
        await addDocSafe(db, 'sessions', {
          studentId: cs.id,
          studentName: cs.displayName,
          storyId: STORIES[i % STORIES.length].id,
          storyTitle: STORIES[i % STORIES.length].title,
          level: cs.level,
          score: Math.round(score),
          stars: Math.max(1, Math.min(5, Math.round(score / 20))),
          completedAt: daysAgo(28 - i * 7),
          durationSec: 240 + Math.floor(Math.random() * 180)
        });
      }
    }

    // Demo student progress
    await setDoc(doc(db, 'progress', 'demo-student-001'), {
      uid: 'demo-student-001',
      currentLevel: 3,
      totalStars: 24,
      totalStoriesCompleted: 8,
      streakDays: 5,
      lastActiveDate: Timestamp.now(),
      badges: [
        { badgeId: 'first-story', name: 'Unang Kwento', icon: '📖', unlockedAt: daysAgo(40) },
        { badgeId: 'streak-3', name: '3-Day Streak', icon: '🔥', unlockedAt: daysAgo(20) },
        { badgeId: 'level-3', name: 'Antas 3 Reader', icon: '⭐', unlockedAt: daysAgo(15) }
      ],
      levelHistory: [
        { level: 1, date: '2025-01-01' },
        { level: 2, date: '2025-02-15' },
        { level: 3, date: '2025-03-20' }
      ]
    });

    // Demo student sessions
    const demoSessions = [
      { storyId: 'story-taniman', score: 75, stars: 4, daysAgo: 21 },
      { storyId: 'story-puppy', score: 68, stars: 3, daysAgo: 18 },
      { storyId: 'story-bibingka', score: 80, stars: 4, daysAgo: 14 },
      { storyId: 'story-neighbor', score: 72, stars: 4, daysAgo: 10 },
      { storyId: 'story-saranggola', score: 85, stars: 5, daysAgo: 7 },
      { storyId: 'story-river', score: 70, stars: 3, daysAgo: 5 },
      { storyId: 'story-taniman', score: 78, stars: 4, daysAgo: 3 },
      { storyId: 'story-bibingka', score: 82, stars: 4, daysAgo: 1 }
    ];
    for (const s of demoSessions) {
      const story = STORIES.find((x) => x.id === s.storyId);
      await addDocSafe(db, 'sessions', {
        studentId: 'demo-student-001',
        studentName: 'Juan dela Cruz',
        storyId: s.storyId,
        storyTitle: story?.title || s.storyId,
        level: 3,
        score: s.score,
        stars: s.stars,
        completedAt: daysAgo(s.daysAgo),
        durationSec: 280 + Math.floor(Math.random() * 200)
      });
    }
  } catch (e) {
    console.warn('Seed skipped (Firebase not connected, demo data still available locally):', e);
  }
}

async function addDocSafe(db, col, data) {
  return addDoc(collection(db, col), data);
}

export const SEED_STORIES = STORIES;
export const SEED_CLASS_STUDENTS = CLASS_STUDENTS;
