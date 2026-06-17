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
  },
  {
    id: 'story-pusa-aso',
    title: 'Si Pusa at si Aso',
    level: 1,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-rose-300 to-pink-500',
    emoji: '🐱',
    tapWords: ['pusa', 'aso', 'magkaibigan'],
    text: `May isang pusa at isang aso sa bahay ni Lena.
Ang pusa ay kulay puti. Ang aso ay kulay itim.
Tuwing umaga, naglalaro sila sa bakuran.
Magkaibigan sila kahit magkaiba ang kanilang hitsura.
Masaya si Lena dahil mabait ang kanyang mga alaga.`
  },
  {
    id: 'story-red-ball',
    title: 'My Red Ball',
    level: 1,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-red-300 to-rose-500',
    emoji: '⚽',
    tapWords: ['ball', 'bounce', 'park'],
    text: `I have a big red ball.
I like to bounce it in the park.
My little sister plays with me.
We throw the ball up and down.
When the sun goes down, we go home happy.`
  },
  {
    id: 'story-paaralan',
    title: 'Ang Masayang Paaralan',
    level: 2,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-lime-300 to-green-500',
    emoji: '🏫',
    tapWords: ['paaralan', 'guro', 'kaklase'],
    text: `Tuwing Lunes, masaya si Pepe na pumasok sa paaralan.
Mabait ang kanyang guro na si Gng. Cruz.
Marami siyang kaklase na laging handang tumulong.
Natututo sila ng pagbabasa, pagbilang, at pagguhit.
Sa recess, naglalaro sila ng patintero sa bakuran.
"Gusto ko ang paaralan namin!" sabi ni Pepe.`
  },
  {
    id: 'story-vendor',
    title: 'The Kind Vendor',
    level: 2,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-orange-300 to-amber-500',
    emoji: '🍢',
    tapWords: ['vendor', 'banana', 'grateful'],
    text: `Aling Nena sells banana cue near the school.
One day, a small boy had no money for a snack.
He looked at the warm banana cue and felt sad.
Aling Nena smiled and gave him one for free.
"Eat well so you can study hard," she said.
The boy was grateful and promised to do his best.`
  },
  {
    id: 'story-pinya',
    title: 'Ang Alamat ng Pinya',
    level: 5,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-yellow-400 to-amber-600',
    emoji: '🍍',
    tapWords: ['alamat', 'tamad', 'pinya', 'pagsisisi'],
    text: `Noong unang panahon, may isang batang babae na si Pina na lubhang tamad.
Hindi niya hinahanap ang mga bagay na gusto ng kanyang ina.
"Saan ang sandok?" tanong ng ina. "Hindi ko alam!" sagot ni Pina nang hindi man lang humahanap.

Isang araw, nagkasakit ang ina at si Pina ang inutusang magluto.
Ngunit dahil sa katamaran, hindi niya mahanap ang mga kagamitan.
Sa galit, nasabi ng ina, "Sana magkaroon ka ng maraming mata para makakita ka!"

Bigla na lang nawala si Pina.
Makalipas ang ilang araw, may tumubong bagong halaman sa bakuran —
hugis-ulo, dilaw, at puno ng "mga mata."
Tinawag itong pinya bilang ala-ala kay Pina at sa aral ng pagsisikap.`
  },
  {
    id: 'story-inventor',
    title: 'The Young Inventor',
    level: 6,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-indigo-400 to-violet-600',
    emoji: '💡',
    tapWords: ['inventor', 'brownouts', 'prototype', 'persevered'],
    text: `In a small town that suffered from frequent brownouts, a girl named Trisha grew tired of studying by candlelight.
She wondered if there was a better way to keep a lamp glowing without electricity.

After reading about solar power in an old science book, she began collecting broken gadgets.
Her first prototype failed. So did the second and the third.
Her classmates laughed, but Trisha persevered, adjusting the small solar panel each time.

Finally, one evening, her little lamp flickered to life — powered only by sunlight stored during the day.
Soon, neighbors asked her to build lamps for their homes too.
Trisha realized that curiosity and patience could light up an entire community.`
  },
  {
    id: 'story-pamilya',
    title: 'Ang Aking Pamilya',
    level: 1,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-sky-300 to-blue-500',
    emoji: '🏠',
    tapWords: ['pamilya', 'kapatid', 'magulang'],
    text: `Ako ay may masayang pamilya.
May nanay, tatay, at dalawang kapatid ako.
Tuwing gabi, magkakasama kami sa hapag-kainan.
Mahal ko ang aking mga magulang.
Masaya ako dahil lagi kaming magkakasama.`
  },
  {
    id: 'story-happy-sun',
    title: 'The Happy Sun',
    level: 1,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-yellow-300 to-orange-400',
    emoji: '☀️',
    tapWords: ['sun', 'morning', 'shines'],
    text: `Every morning, the sun rises in the sky.
It shines bright and warm.
The birds sing a happy song.
Children wake up and get ready for school.
The sun makes everyone feel happy.`
  },
  {
    id: 'story-bibe',
    title: 'Ang Bibe sa Sapa',
    level: 1,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-cyan-300 to-teal-500',
    emoji: '🦆',
    tapWords: ['bibe', 'sapa', 'lumalangoy'],
    text: `May maliit na bibe sa malinaw na sapa.
Dilaw ang kanyang balahibo.
Buong araw siyang lumalangoy.
"Kwak! Kwak!" masayang sigaw niya.
Maganda ang buhay sa malinis na sapa.`
  },
  {
    id: 'story-kalabaw',
    title: 'Si Bok ang Kalabaw',
    level: 2,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-stone-300 to-amber-600',
    emoji: '🐃',
    tapWords: ['kalabaw', 'bukid', 'nag-aararo'],
    text: `Si Bok ay isang malakas na kalabaw.
Tumutulong siya kay Mang Tonyo sa bukid.
Tuwing umaga, nag-aararo sila ng lupa.
Pagkatapos magtrabaho, naliligo si Bok sa putik.
"Salamat, Bok," sabi ni Mang Tonyo. "Ikaw ang aking kaibigan."`
  },
  {
    id: 'story-lola-garden',
    title: "Lola's Garden",
    level: 2,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-green-300 to-emerald-500',
    emoji: '🌼',
    tapWords: ['garden', 'flowers', 'watered'],
    text: `My lola has a beautiful garden behind her house.
She grows yellow flowers and green vegetables.
Every afternoon, I help her pull the weeds.
We watered the plants together with a small pail.
"Plants grow well when we care for them," Lola said with a smile.`
  },
  {
    id: 'story-sapatos',
    title: 'Ang Bagong Sapatos',
    level: 2,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-rose-300 to-red-500',
    emoji: '👟',
    tapWords: ['sapatos', 'regalo', 'masaya'],
    text: `Natanggap ni Lito ang isang regalo mula sa kanyang ninang.
Isang bagong sapatos na kulay asul!
Matagal na niyang gustong magkaroon nito.
Isinuot niya agad ito at tumakbo sa labas.
"Salamat po, Ninang!" masayang sabi ni Lito.`
  },
  {
    id: 'story-firefly',
    title: 'The Brave Firefly',
    level: 3,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-lime-300 to-green-600',
    emoji: '✨',
    tapWords: ['firefly', 'darkness', 'glow'],
    text: `In a quiet forest lived a tiny firefly named Kislap.
The other fireflies teased him because his glow was very small.
One night, a little frog got lost in the darkness and began to cry.
Kislap flew close and lit the path with his small but steady glow.
He led the frog safely back to the pond.
From that night on, the others learned that even a small light can help in the dark.`
  },
  {
    id: 'story-mangingisda',
    title: 'Si Mang Kardo, ang Mangingisda',
    level: 4,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-blue-400 to-indigo-600',
    emoji: '🎣',
    tapWords: ['mangingisda', 'bangka', 'alon'],
    text: `Si Mang Kardo ay isang mangingisda sa isang maliit na baryo sa tabing-dagat.
Bago pa sumikat ang araw, naglalayag na siya sa kanyang bangka.
Isang umaga, lumakas ang hangin at tumaas ang mga alon.
Nahirapan siyang bumalik sa pampang, ngunit hindi siya sumuko.
Sa tulong ng kanyang karanasan, ligtas siyang nakarating sa dalampasigan.
Natutunan ng kanyang anak na ang tiyaga at lakas ng loob ay mahalaga sa buhay.`
  },
  {
    id: 'story-lighthouse',
    title: 'The Lighthouse Keeper',
    level: 4,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-slate-400 to-cyan-600',
    emoji: '🗼',
    tapWords: ['lighthouse', 'storm', 'guided'],
    text: `Old Mang Berto lived alone in a tall lighthouse by the sea.
Every night, he climbed the steps to light the great lamp.
One stormy evening, a fishing boat lost its way in the heavy rain.
The waves were huge and the sailors were frightened.
But the bright beam from the lighthouse guided them safely to shore.
The grateful fishermen thanked Mang Berto, whose faithful work saved their lives.`
  },
  {
    id: 'story-liham',
    title: 'Ang Liham para kay Nanay',
    level: 4,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-pink-400 to-rose-600',
    emoji: '✉️',
    tapWords: ['liham', 'nangungulila', 'pag-asa'],
    text: `Ang nanay ni Mia ay nagtatrabaho sa malayong bansa.
Tuwing gabi, nangungulila si Mia sa kanyang ina.
Isang araw, nagpasya siyang sumulat ng liham.
Isinulat niya ang lahat ng kanyang nararamdaman at mga pangarap.
Nang matanggap ito ng kanyang nanay, napaiyak ito sa tuwa.
Ang simpleng liham ay nagbigay ng pag-asa sa kanilang dalawa.`
  },
  {
    id: 'story-robot',
    title: "Rosa's Recycled Robot",
    level: 4,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-teal-400 to-emerald-600',
    emoji: '🤖',
    tapWords: ['recycled', 'gears', 'contraption'],
    text: `Rosa loved to collect old bottles, cans, and broken toys.
Her friends thought it was just junk, but Rosa saw treasure.
One weekend, she decided to build a robot from her recycled materials.
She connected the gears, taped the cans, and painted the body bright blue.
When she switched it on, the little contraption rolled across the floor.
Rosa proved that creativity can turn trash into something wonderful.`
  },
  {
    id: 'story-mayon',
    title: 'Ang Alamat ng Bulkang Mayon',
    level: 5,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-orange-400 to-red-600',
    emoji: '🌋',
    tapWords: ['alamat', 'prinsesa', 'bulkan'],
    text: `Noong unang panahon, may magandang prinsesa na nagngangalang Daragang Magayon.
Marami ang humahanga sa kanyang kagandahan, ngunit iisa lamang ang kanyang minahal — si Panganoron.
Ipinagbawal ng kanyang ama ang kanilang pag-iibigan.
Sa kalungkutan, naghiwalay ang magkasintahan sa isang trahedya.
Inilibing sila nang magkasama, at sa paglipas ng panahon, tumubo ang isang malaking bundok sa lugar na iyon.
Tinawag itong Mayon, mula sa pangalang Magayon, bilang ala-ala sa kanilang walang hanggang pag-ibig.`
  },
  {
    id: 'story-balete',
    title: 'The Secret of the Old Balete Tree',
    level: 5,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-emerald-500 to-green-800',
    emoji: '🌳',
    tapWords: ['balete', 'legend', 'courage'],
    text: `In the middle of the village stood an ancient balete tree.
The elders said it was haunted, so no child dared to go near it.
But young Andoy was curious and tired of the scary stories.
One bright afternoon, he gathered his courage and walked toward the tree.
Beneath its roots, he found only a family of friendly kittens and a hidden spring of clean water.
Andoy taught the village that fear often comes from things we do not understand.`
  },
  {
    id: 'story-kuwintas',
    title: 'Ang Mahiwagang Kuwintas',
    level: 5,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-violet-400 to-purple-600',
    emoji: '📿',
    tapWords: ['mahiwagang', 'kuwintas', 'kabutihan'],
    text: `May isang mahirap na batang lalaki na nakakita ng mahiwagang kuwintas sa gubat.
Sinasabing tumutupad ito ng kahit anong hiling.
Maaari sana niyang hilingin ang yaman o kapangyarihan.
Ngunit hiniling niya na sana ay gumaling ang maysakit niyang kapatid.
Kinaumagahan, gumaling nga ang kanyang kapatid.
Natutunan niya na ang tunay na kayamanan ay ang kabutihan ng puso.`
  },
  {
    id: 'story-kalikasan',
    title: 'Ang Batang Tagapagtanggol ng Kalikasan',
    level: 6,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-green-500 to-teal-700',
    emoji: '🌏',
    tapWords: ['kalikasan', 'kampanya', 'pagbabago'],
    text: `Si Liwayway ay isang mag-aaral na labis na nagmamalasakit sa kalikasan.
Napansin niyang lumalala ang basura sa kanilang ilog at nawawala ang mga puno sa kabundukan.
Sa halip na manatiling tahimik, nagsimula siya ng isang kampanya sa kanilang paaralan.
Nagtanim sila ng mga puno, naglinis ng ilog, at nagturo tungkol sa wastong pagtatapon ng basura.
Unti-unti, sumama ang buong komunidad sa kanyang adhikain.
Pinatunayan ni Liwayway na kahit isang bata ay kayang magsimula ng tunay na pagbabago.`
  },
  {
    id: 'story-mountain-village',
    title: 'Beyond the Mountain Village',
    level: 6,
    language: 'English',
    author: 'DunongAI Stories',
    gradient: 'from-indigo-500 to-slate-700',
    emoji: '⛰️',
    tapWords: ['village', 'ambition', 'scholarship'],
    text: `Far up in the mountains, in a village with no electricity, lived a determined girl named Maya.
Every day she walked two hours to reach the nearest school, carrying her books and her ambition.
Some neighbors said girls from the mountains would never amount to much.
But Maya studied by candlelight and never missed a single class.
Years later, she earned a scholarship to a university in the city.
She returned home not to leave the village behind, but to build the first school on the mountain.`
  },
  {
    id: 'story-makina',
    title: 'Ang Makina ni Lolo',
    level: 6,
    language: 'Filipino',
    author: 'DunongAI Stories',
    gradient: 'from-amber-500 to-orange-700',
    emoji: '⚙️',
    tapWords: ['makina', 'imbensyon', 'pagtitiyaga'],
    text: `Ang lolo ni Emman ay isang dating inhinyero na puno ng mga ideya.
Sa kanilang munting kamalig, may lumang makina siyang tinatangkang ayusin nang maraming taon.
Marami ang nagsabing sayang lang ang kanyang oras at pagod.
Ngunit araw-araw, may itinuturo si Lolo kay Emman tungkol sa siyensya at pagtitiyaga.
Isang araw, sa wakas ay umandar ang makina — isang imbensyong nagbibigay ng kuryente mula sa tubig.
Natutunan ni Emman na ang matiyagang pangarap ay maaaring maging katotohanan.`
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
