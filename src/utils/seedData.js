import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  addDoc,
  Timestamp,
  query,
  limit
} from 'firebase/firestore';
import { FIREBASE_ENABLED } from '../firebase';

// Bump this whenever the seed story CONTENT changes (e.g. rewritten text).
// On the next load, a connected Firebase deployment will re-upsert the seed
// stories so the new text goes live, without touching teacher-created stories.
const SEED_VERSION = 2;

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
    text: `Si Lolo Pedro ay may malaking taniman sa likod ng kanilang bahay.
Tuwing umaga, maaga siyang gumigising para bisitahin ang kanyang mga halaman.
May mga kamatis, sitaw, at talong na masaya niyang inaalagaan araw-araw.

Tuwing Sabado, tinutulungan siya ng kanyang apo na si Benjo.
"Lolo, bakit mo ba mahal na mahal ang iyong taniman?" tanong ni Benjo isang araw.
"Dahil ang mga halaman ay tulad ng mga tao," ngiti ni Lolo Pedro. "Kailangan nila ng pagmamahal at pag-aalaga para lumaki nang malusog."

Nang hapong iyon, nag-ani sila ng mapula-pulang kamatis at sariwang sitaw.
Masaya silang naglakad pauwi, dala-dala ang basket na puno ng gulay.
Naunawaan ni Benjo na ang tiyaga sa pag-aalaga ay laging may matamis na bunga.`
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
The puppy had no collar and looked very hungry and afraid.
Miguel took off his own jacket and gently wrapped it around the trembling little dog.

He carried it home and gave it warm milk and soft bread.
His mother smiled when she saw what her son had done.
"You have a kind heart, Miguel," she said softly. They named the puppy Brownie.

The next day, Miguel made posters and put them up all around the neighborhood.
Soon a little girl named Lea came running — Brownie was hers, lost in the storm.
Miguel felt sad to say goodbye, but he was happy knowing Brownie was safe at home again.`
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
    text: `Tuwing Pasko, nagluluto si Inang ng mainit na bibingka para sa buong pamilya.
Maaga siyang gumigising para ihanda ang lahat ng sangkap.
May galapong, niyog, itlog, at asukal na nakaayos na sa mesa.

Sa kusina, tinutulungan siya ng kanyang anak na si Ana.
Hinuhugasan ni Ana ang mga dahon ng saging na gagamitin.
"Bakit po mahalaga ang dahon ng saging, Inang?" tanong niya.
"Para mas mabango at masarap ang bibingka," ngiti ng kanyang ina.

Nang maluto na, ibinigay ni Inang ang unang piraso kay Ana.
Mainit, malambot, at matamis ito — paborito ng buong pamilya.
"Ikaw po ang pinakamahusay na magluluto sa buong mundo, Inang!" masayang sabi ni Ana.`
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
    text: `Aling Rosa lives right next door to our family.
Every morning, she sweeps the street in front of her house.
She also waters the plants along the sidewalk so the whole block looks bright and green.

One afternoon, our cat Miming climbed up and got stuck in a tall tree.
Without even being asked, Aling Rosa brought out her wooden ladder.
She climbed up very carefully and rescued Miming from the highest branch.
My mother thanked her warmly with a plate of pancit.

Aling Rosa just laughed and said that neighbors should always help each other.
I want to be like her when I grow up — kind, brave, and always ready to help without being asked.`
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
    text: `Isang maliwanag na Sabado, nagpalipad si Danilo ng saranggola sa liwasan ng kanilang barangay.
Gawa ito ng kanyang tatay mula sa magaan na kawayan at makulay na papel.
Tuwang-tuwa si Danilo habang umaakyat ito nang mataas sa langit.

Ngunit biglang humigpit ang hangin at naputol ang tali.
Lumipad nang malayo ang saranggola hanggang sa mapadpad sa bubong ng kapitbahay.
Tumakbo si Danilo, ngunit hindi niya ito maabot nang mag-isa.
Mabuti na lang, tinulungan siya ng mabait na kapitbahay na ibaba ito.

"Susunod, gagawa tayo ng mas matibay at mas mahabang tali," ngiti ng kanyang tatay.
Natutunan ni Danilo na laging maging handa sa mga hindi inaasahang pangyayari.`
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
    text: `In a clear river near Barrio Masagana, there lived hundreds of fish of every shape and color.
They lived happily because the water was clean and full of food.
Children swam there, and families came to rest along its cool, green banks.

But one day, some people began throwing their trash into the river.
Little by little, the water turned dark and smelly.
The fish grew sick, and many of them swam away to find cleaner homes.

A young girl named Lourdes saw what was happening and refused to stay silent.
She made posters and gathered the courage to ask her classmates for help.
Every Saturday, they cleaned the river together until the water ran clear once more.
The fish returned, the river came alive, and Lourdes learned that one person with courage can make a big difference.`
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
Naghahabulan sila at masayang tumatakbo.

Magkaibigan sila kahit magkaiba ang kulay.
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
It is round and bright.

I like to bounce it in the park.
My little sister plays with me there.
We throw the ball up and down.

When the sun goes down, we walk home.
We are tired but very happy.`
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
    text: `Tuwing Lunes, masayang-masaya si Pepe na pumasok sa paaralan.
Mabait ang kanyang guro na si Gng. Cruz.
Lagi siyang nginingitian nito tuwing umaga.

Marami siyang kaklase na handang tumulong.
Natututo sila ng pagbabasa, pagbilang, at pagguhit.
Tuwing recess, naglalaro sila ng patintero sa bakuran.

"Gusto ko ang aming paaralan!" masayang sabi ni Pepe.
Para sa kanya, ito ay parang pangalawang tahanan.`
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
    text: `Aling Nena sells warm banana cue near the school gate.
Many children buy her sweet snacks after class.

One day, a small boy stood quietly by her cart.
He had no money, and he looked at the banana cue with sad eyes.
Aling Nena smiled and handed him one for free.
"Eat well so you can study hard," she said kindly.

The boy was very grateful for her kindness.
He promised himself to always do his best in school.`
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
    text: `Noong unang panahon, may isang batang babae na nagngangalang Pina na lubhang tamad.
Ayaw niyang gumawa ng kahit anong gawaing-bahay.
Kapag inuutusan siya ng kanyang ina, palagi siyang nagdadahilan.

"Pina, saan ang sandok?" tanong ng ina isang araw.
"Hindi ko po alam!" sagot niya nang hindi man lang tumitingin.
Isang araw, nagkasakit ang ina at si Pina ang inutusang magluto.
Ngunit dahil sa katamaran, hindi niya mahanap ang anumang kagamitan.
Sa inis at pagod, napabulalas ang ina, "Sana magkaroon ka ng maraming mata para makakita ka!"

Kinabukasan, bigla na lamang nawala si Pina.
Sa bakuran, may tumubong kakaibang halaman — hugis-ulo, dilaw, at puno ng parang mga mata.
Tinawag itong pinya, isang ala-ala kay Pina at sa aral ng pagsisisi sa katamaran.`
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
Night after night, she wondered if there was a better way to keep a lamp glowing without electricity.

One afternoon, she read about solar power in an old science book and felt a spark of hope.
She began collecting broken gadgets and bits of wire from around the neighborhood.
Her first prototype failed. So did the second, and the third.
Her classmates laughed at her, but Trisha persevered, adjusting the small solar panel and trying again.

Finally, one quiet evening, her little lamp flickered to life — powered only by sunlight saved during the day.
Word spread quickly, and soon neighbors were asking her to build lamps for their homes too.
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
Nagkukuwentuhan kami habang kumakain.

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
The flowers open to say hello.

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
Dilaw ang kanyang malambot na balahibo.

Buong araw siyang lumalangoy.
"Kwak! Kwak!" masaya niyang sigaw.

Marami siyang kaibigang isda sa tubig.
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
Araw-araw, tumutulong siya kay Mang Tonyo sa bukid.

Tuwing umaga, magkasama silang nag-aararo ng lupa.
Hindi sumusuko si Bok kahit mainit ang araw.
Pagkatapos magtrabaho, masaya siyang naliligo sa malamig na putik.

"Salamat, Bok," sabi ni Mang Tonyo habang hinahaplos ito.
"Ikaw ang aking tapat na kaibigan."`
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

Every afternoon, I help her pull out the weeds.
Together, we watered the plants with a small pail.
We listen to the birds singing while we work.

"Plants grow well when we care for them," Lola said with a smile.
I love spending quiet afternoons in her garden.`
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
    text: `Isang araw, may dumating na regalo para kay Lito mula sa kanyang ninang.
Binuksan niya ito nang dahan-dahan.

Isang bagong sapatos na kulay asul!
Matagal na niyang gustong magkaroon ng ganito.
Isinuot niya agad ito at tumakbo sa labas para ipakita sa mga kaibigan.

"Salamat po, Ninang!" masayang sabi ni Lito.
Pinangako niyang aalagaan niya ito nang maigi.`
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
The other fireflies often teased him because his glow was very small.
Kislap felt sad, but he never stopped shining.

One dark night, a little frog got lost and began to cry in the darkness.
None of the bigger fireflies seemed to notice him.
But Kislap flew close and lit the path with his small but steady glow.
Slowly and carefully, he led the frog all the way back to the pond.

From that night on, the other fireflies looked at Kislap differently.
They learned that even the smallest light can help in the dark.`
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
    text: `Si Mang Kardo ay isang masipag na mangingisda sa isang maliit na baryo sa tabing-dagat.
Bago pa sumikat ang araw, naglalayag na siya sakay ng kanyang lumang bangka.
Kasama niya ang kanyang anak na nag-aaral pa lamang mangisda.

Isang umaga, biglang lumakas ang hangin at tumaas ang mga alon.
Umuga ang bangka at halos hindi na makita ang dalampasigan.
Nahirapan si Mang Kardo, ngunit hindi siya nagpadala sa takot.
Sa tulong ng kanyang karanasan at lakas ng loob, ligtas silang nakabalik sa pampang.

Niyakap siya ng kanyang anak pagkababa sa bangka.
Natutunan nito na ang tiyaga at tapang ay mahahalaga sa buhay.`
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
    text: `Old Mang Berto lived alone in a tall lighthouse beside the sea.
Every night, he climbed the long, winding steps to light the great lamp.
He had done this faithfully for many, many years.

One stormy evening, a small fishing boat lost its way in the heavy rain.
The waves rose like mountains, and the frightened sailors could not see the shore.
Then, through the darkness, the bright beam of the lighthouse appeared.
It guided the little boat safely, inch by inch, back to land.

The grateful fishermen hurried up to thank Mang Berto.
His quiet, faithful work had saved their lives that night.`
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
    text: `Ang nanay ni Mia ay nagtatrabaho sa isang malayong bansa.
Bihira lang silang magkita, kaya tuwing gabi ay nangungulila si Mia sa kanyang ina.
Madalas niyang tinitingnan ang kanilang lumang larawan bago matulog.

Isang araw, nagpasya si Mia na sumulat ng isang liham.
Isinulat niya rito ang lahat ng kanyang nararamdaman, mga pangarap, at pananabik.
Maingat niyang itinago ito hanggang sa maipadala sa kanyang nanay.

Nang matanggap at mabasa ito ng kanyang ina, napaiyak ito sa tuwa.
Ang simpleng liham na iyon ay nagbigay ng bagong pag-asa sa kanilang dalawa.`
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
    text: `Rosa loved to collect old bottles, rusty cans, and broken toys.
Her friends thought it was all just junk, but Rosa saw hidden treasure.
She kept her finds in a big box under her bed.

One weekend, she decided to build a robot from her recycled materials.
She connected the little gears, taped the cans together, and painted the body bright blue.
It took her many tries before everything fit just right.

When she finally switched it on, the funny contraption rolled across the floor.
Rosa clapped with joy and her friends cheered.
She had proven that creativity can turn trash into something wonderful.`
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
    text: `Noong unang panahon, may isang magandang prinsesa na nagngangalang Daragang Magayon.
Marami ang humahanga sa kanyang kagandahan, ngunit iisa lamang ang kanyang minahal — ang matapang na si Panganoron.

Lihim silang nagmahalan, ngunit nang malaman ito ng ama ng prinsesa, ipinagbawal niya ang kanilang pag-iibigan.
Sa kabila ng lahat, nanatiling tapat ang dalawa sa isa't isa.
Subalit isang malungkot na pangyayari ang naghiwalay sa kanila magpakailanman.

Inilibing silang magkasama bilang tanda ng kanilang pag-ibig.
Sa paglipas ng panahon, tumubo ang isang malaking bulkan sa lugar na iyon.
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
    text: `In the middle of the village stood an ancient balete tree, its roots twisting deep into the ground.
The elders said it was haunted, so no child ever dared to go near it.
For years, the scary legend kept everyone away.

But young Andoy was curious and tired of being afraid.
One bright afternoon, he gathered all his courage and walked slowly toward the old tree.
His heart pounded, but he kept going, step by careful step.

Beneath its tangled roots, he found no ghosts at all —
only a family of friendly kittens and a hidden spring of clean, cool water.
Andoy ran to tell the others, teaching the whole village that fear often comes from things we simply do not understand.`
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
    text: `May isang mahirap na batang lalaki na isang araw ay nakakita ng mahiwagang kuwintas sa gubat.
Kumikislap ito nang kakaiba sa ilalim ng mga dahon.
Sinasabing tumutupad ang kuwintas na ito ng kahit anong hiling.

Naisip ng bata ang lahat ng maaari niyang hilingin.
Maaari sana niyang hilingin ang ginto, yaman, o kapangyarihan.
Ngunit naalala niya ang kanyang maysakit na kapatid sa bahay.
Kaya taimtim niyang hiniling na sana ay gumaling ito.

Kinaumagahan, gising na ang kanyang kapatid — malusog at masaya.
Natutunan ng bata na ang tunay na kayamanan ay nasa kabutihan ng puso.`
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
Napansin niyang dumarami ang basura sa kanilang ilog at unti-unting nawawala ang mga puno sa kabundukan.
Nabagabag siya tuwing nakikita ang dating malinis na lugar na nagiging marumi.

Sa halip na manatiling tahimik, nagpasya siyang kumilos.
Nagsimula siya ng isang kampanya sa kanilang paaralan upang gisingin ang loob ng iba.
Nagtanim sila ng mga puno, naglinis ng ilog, at nagturo tungkol sa wastong pagtatapon ng basura.

Unti-unti, dumami ang sumama sa kanyang adhikain — mga kaklase, guro, at maging ang buong komunidad.
Muling luminis ang ilog at nanariwa ang kapaligiran.
Pinatunayan ni Liwayway na kahit isang batang determinado ay kayang magsimula ng tunay na pagbabago.`
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
    text: `Far up in the mountains, in a small village with no electricity, lived a determined girl named Maya.
Every single day, she walked two hours each way to reach the nearest school, carrying her books and her ambition.

Some neighbors shook their heads and said girls from the mountains would never amount to much.
But Maya refused to listen to their doubts.
She studied by candlelight every night and never missed a single class, no matter how hard the rain fell.

Years of hard work finally paid off, and Maya earned a scholarship to a university in the city.
Yet she never forgot where she came from.
She returned home not to leave the village behind, but to build the very first school on the mountain.`
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
    text: `Ang lolo ni Emman ay isang dating inhinyero na puno pa rin ng mga pangarap at ideya.
Sa kanilang munting kamalig, may lumang makina siyang sinisikap ayusin sa loob ng maraming taon.
Marami ang nagsabing sayang lang ang kanyang oras at pagod.

Ngunit hindi sumuko si Lolo.
Araw-araw, may itinuturo siya kay Emman tungkol sa siyensya, mga gulong, at lalo na ang pagtitiyaga.
Magkasama silang nagtatrabaho hanggang gabi, paikot-ikot sa lumang makina.

Isang araw, sa wakas, umandar ang makina —
isang imbensyong nakakagawa ng kuryente mula lamang sa umaagos na tubig.
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
    const firstSeed = existing.size === 0;

    // Read the version that's currently seeded into this database.
    let seededVersion = 0;
    try {
      const metaSnap = await getDoc(doc(db, 'meta', 'seed'));
      if (metaSnap.exists()) seededVersion = metaSnap.data().version || 0;
    } catch {}

    // Up to date: all seed stories present and content version matches.
    if (!firstSeed && existing.size >= STORIES.length && seededVersion >= SEED_VERSION) {
      return;
    }

    // Upsert seed stories by their stable ids. setDoc overwrites the seed docs
    // with the latest text but never deletes teacher-created stories (those have
    // a `createdBy` field and ids that aren't in STORIES).
    for (const s of STORIES) {
      await setDoc(doc(db, 'stories', s.id), { ...s, createdAt: Timestamp.now() });
    }
    await setDoc(doc(db, 'meta', 'seed'), { version: SEED_VERSION, updatedAt: Timestamp.now() });

    // Demo users, roster, and sessions only need to be created once (first seed).
    // On a content-only version bump, the stories above are refreshed and we stop
    // here so we don't duplicate demo sessions via addDoc.
    if (!firstSeed) return;

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
        { badgeId: 'level-3', name: 'Antas sa Pagbasa 3', icon: '⭐', unlockedAt: daysAgo(15) }
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
