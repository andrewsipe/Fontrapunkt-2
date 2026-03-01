/**
 * Sample Text Utilities
 * Fetch sample text from various APIs
 */

const SAMPLE_TEXT_DATA = {
  pangrams: [
    "Sixty zips were quickly picked from the woven jute bag.",
    "Big July earthquakes confound zany experimental vow.",
    "Foxy parsons quiz and cajole the lovably dim wiki-girl.",
    "Cute, kind, jovial, foxy physique, amazing beauty? Wowser!",
    "Have a pick: twenty-six letters — no forcing a jumbled quiz!",
    "A very big box sailed up then whizzed quickly from Japan.",
    "Battle of Thermopylae: Quick javelin grazed wry Xerxes.",
    "Jack quietly moved up front and seized the big ball of wax.",
    "Few black taxis drive up major roads on quiet hazy nights.",
    "Just poets wax boldly as kings and queens march over fuzz.",
    "Bored? Craving a pub quiz fix? Why, just come to the Royal Oak!",
    "Quincy Pondexter blocked five jams against the Wizards!",
    "Crazy Frederick bought many very exquisite opal jewels.",
    "A quivering Texas zombie fought republic linked jewelry.",
    "Grumpy wizards make toxic brew for the evil queen and jack.",
    "The job of waxing linoleum frequently peeves chintzy kids.",
    "Back in June we delivered oxygen equipment of the same size.",
    "Just keep examining every low bid quoted for zinc etchings.",
    "How razorback-jumping frogs can level six piqued gymnasts!",
    "A quick movement of the enemy will jeopardize six gunboats.",
    "All questions asked by five watched experts amaze the judge.",
    "Bobby Klun awarded Jayme sixth place for her very high quiz.",
    "The wizard quickly jinxed the gnomes before they vaporized.",
    "Zelda might fix the job growth plans very quickly on Monday.",
    "Zack Gappow saved the job requirement list for the six boys.",
    "Jackie will budget for the most expensive zoology equipment.",
    "Quirky spud boys can jam after zapping five worthy Polysixes.",
    "Jim quickly realized that the beautiful gowns are expensive.",
  ],
  titles: [
    // Literature
    "The Great Gatsby",
    "The Catcher in the Rye",
    "All Quiet on the Western Front",
    "Crime and Punishment",
    "Pride and Prejudice",
    "Great Expectations",
    "The Diary of a Young Girl",
    "Lord of the Flies",
    "Wuthering Heights",
    "To Kill a Mockingbird",
    // Cinema
    "The Godfather",
    "Singin' in the Rain",
    "Pulp Fiction",
    "O Brother, Where Art Thou?",
    "Citizen Kane",
    "Spirited Away",
    "Blade Runner 2049",
    "The Shawshank Redemption",
    "Seven Samurai",
    "12 Angry Men",
    // Music Albums
    "The Miseducation of Lauryn Hill",
    "Blood on the Tracks",
    "Purple Rain",
    "Rumours",
    "Nevermind",
    "Abbey Road",
    "Songs in the Key of Life",
    "Blue",
    "Pet Sounds",
    "What’s Going On",
  ],
  paragraphs: [
    "You wanted to know what real courage is... It's when you know you're licked before you begin but you begin anyway and you see it through no matter what",
    "Possession is more often secular than supernatural. Men are possessed by their thoughts of a hated person, a hated class, race, or nation. At the present time the destinies of the world are in the hands of self-made demoniacs - of men who are possessed by, and manifest, the evil they have chosen to see in others. They do not believe in devils; but they have tried their hardest to be possessed.",
    "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair, we had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way...",
    "The creatures outside looked from pig to man, and from man to pig, and from pig to man again; but already it was impossible to say which was which",
    "In the dead white hours in Zurich staring into a stranger’s pantry across the upshine of a street-lamp, he used to think he wanted to be good, he wanted to be kind, he wanted to be brave and wise, but it was all pretty difficult. He wanted to be loved, too, if he could fit it in.",
    "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families.",
    "In my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since. Whenever you feel like criticizing any one, he told me, just remember that all the people in this world haven't had the advantages that you've had.",
    "Current-borne, wave-flung, tugged hugely by the whole might of ocean, the jellyfish drifts in the tidal abyss. The light shines through it, and the dark enters it. Borne, flung, tugged from anywhere to anywhere, for in the deep sea there is no compass but nearer and farther, higher and lower, the jellyfish hangs and sways; pulses move slight and quick within it, as the vast diurnal pulses beat in the moon-driven sea. Hanging, swaying, pulsing, the most vulnerable and insbustantial creature, it has for its defense the violence and power of the whole ocean, to which it has entrusted its being, its going, and its will.",
    "He peered through the hazy light of the room. It was morning, the lamp out and the stove too, and he found himself stiff and shivering with the cold, rubbing his eyes now, then his back. He rose gingerly and opened the door of the stove, poked among the feathery ashes. He went to the window and looked out. The snow had stopped. Scout was standing in snow to his belly, gazing out at the fantastic landscape with his bleary eyes. Across the yard, brilliant against the facade of pines beyond, a cardinal shot like a drop of blood.",
    "I saw my life branching out before me like the green fig tree in the story. From the tip of every branch, like a fat purple fig, a wonderful future beckoned and winked. One fig was a husband and a happy home and children, and another fig was a famous poet and another fig was a brilliant professor, and another fig was Ee Gee, the amazing editor, and another fig was Europe and Africa and South America, and another fig was Constantin and Socrates and Attila and a pack of other lovers with queer names and offbeat professions, and another fig was an Olympic lady crew champion, and beyond and above these figs were many more figs I couldn't quite make out. I saw myself sitting in the crotch of this fig tree, starving to death, just because I couldn't make up my mind which of the figs I would choose. I wanted each and every one of them, but choosing one meant losing all the rest, and, as I sat there, unable to decide, the figs began to wrinkle and go black, and, one by one, they plopped to the ground at my feet.",
  ],
};

/** Phase 1 proof sets: default block, numbers, kerning, Latin extended, combi, symbols. No Feature: or language-specific. */
export const PROOF_SETS = {
  Default: `ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789!?.
Pixel preview  Resize to fit zenith zone
Frame  Group  Feedback  Reset
Day day  Month month  Year year
Hour hour  Minute minute  Second second
Size  Overlay  Ork  Grids  Cursors
Background  Desktop App  Lamp  Preferences
Rectangle  Ellipsis  Component  Settings
Pass–Through  Spacing  Help  Tutorials  Release Notes
iOS Android Apple macOS Microsoft Windows  Onboarding
12.4 pt  64%  90px  45 kg   12 o'clock  $64 $7  €64 €64  £7 £7
elk  best  mnm DCGQOMN
Identity  identity (M) [M] {M} <M>
The quick brown fox jumps over the lazy dog
Efraim  User account  Text Tool  Team Library
Monster  Lars, stina
jumping far—but not really—over the bar
Open File  Ryan
Documentation  Xerox
War, what is it good for? Absolutely nothing
We found a fix to the ffi problem
Irrational  fi  ffi  fl  ffl
0 1 2 3 4 5 6 7 8 9  7*4  7×4  3/4  7÷8  3° ℃ ℉ 
  #80A6F3  #FFFFFF  #000000
• Buy milk?  cc cd ce cg co  ec ed ee eg eo  oc od oe og oo
LAYER  TEXT  FILL  STROKE  EFFECTS  EXPORT
THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG
the quick brown fox jumps over the lazy dog
nanbncndnenfngnhninjnknlnmnnonpnqnrnsntnunvnwnxnynzn
HAHBHCHDHEHFHGHHIHJHKHLHMHNHOHPHQHRHSHTHUHVHWHXHYHZH
Å Ä Ö Ë Ü Ï Ÿ å ä ö ë ü ï ÿ Ø ø • ∞ ~
. ‥ … → ← ↑ ↓
01 02 03 04 05 06 07 08 09 00
11 12 13 14 15 16 17 18 19 10
21 22 23 24 25 26 27 28 29 20
31 32 33 34 35 36 37 38 39 30
41 42 43 44 45 46 47 48 49 40
51 52 53 54 55 56 57 58 59 50
61 62 63 64 65 66 67 68 69 60
71 72 73 74 75 76 77 78 79 70
81 82 83 84 85 86 87 88 89 80
91 92 93 94 95 96 97 98 99 90
`,
  Lowercase:
    "Angel Adept Blind Bodice Clique Coast Dunce Docile Enact Eosin Furlong Focal Gnome Gondola Human Hoist Inlet Iodine Justin Jocose Knoll Koala Linden Loads Milliner Modal Number Nodule Onset Oddball Pneumo Poncho Quanta Qophs Rhone Roman Snout Sodium Tundra Tocsin Uncle Udder Vulcan Vocal Whale Woman Xmas Xenon Yunnan Young Zloty Zodiac. Angel angel adept for the nuance loads of the arena cocoa and quaalude. Blind blind bodice for the submit oboe of the club snob and abbot. Clique clique coast for the pouch loco of the franc assoc and accede. Dunce dunce docile for the loudness mastodon of the loud statehood and huddle. Enact enact eosin for the quench coed of the pique canoe and bleep. Furlong furlong focal for the genuflect profound of the motif aloof and offers. Gnome gnome gondola for the impugn logos of the unplug analog and smuggle. Human human hoist for the buddhist alcohol of the riyadh caliph and bathhouse. Inlet inlet iodine for the quince champion of the ennui scampi and shiite. Justin justin jocose for the djibouti sojourn of the oranj raj and hajjis. Knoll knoll koala for the banknote lookout of the dybbuk outlook and trekked. Linden linden loads for the ulna monolog of the consul menthol and shallot. Milliner milliner modal for the alumna solomon of the album custom and summon. Number number nodule for the unmade economic of the shotgun bison and tunnel. Onset onset oddball for the abandon podium of the antiquo tempo and moonlit. Pneumo pneumo poncho for the dauphin opossum of the holdup bishop and supplies. Quanta quanta qophs for the inquest sheqel of the cinq coq and suqqu. Rhone rhone roman for the burnt porous of the lemur clamor and carrot. Snout snout sodium for the ensnare bosom of the genus pathos and missing. Tundra tundra tocsin for the nutmeg isotope of the peasant ingot and ottoman. Uncle uncle udder for the dunes cloud of the hindu thou and continuum. Vulcan vulcan vocal for the alluvial ovoid of the yugoslav chekhov and revved. Whale whale woman for the meanwhile blowout of the forepaw meadow and glowworm. Xmas xmas xenon for the bauxite doxology of the tableaux equinox and exxon. Yunnan yunnan young for the dynamo coyote of the obloquy employ and sayyid. Zloty zloty zodiac for the gizmo ozone of the franz laissez and buzzing.",
  Uppercase:
    "ABIDE ACORN OF THE HABIT DACRON FOR THE BUDDHA GOUDA QUAALUDE. BENCH BOGUS OF THE SCRIBE ROBOT FOR THE APLOMB JACOB RIBBON. CENSUS CORAL OF THE SPICED JOCOSE FOR THE BASIC HAVOC SOCCER. DEMURE DOCILE OF THE TIDBIT LODGER FOR THE CUSPID PERIOD BIDDER. EBBING ECHOING OF THE BUSHED DECAL FOR THE APACHE ANODE NEEDS. FEEDER FOCUS OF THE LIFER BEDFORD FOR THE SERIF PROOF BUFFER. GENDER GOSPEL OF THE PIGEON DOGCART FOR THE SPRIG QUAHOG DIGGER. HERALD HONORS OF THE DIHEDRAL MADHOUSE FOR THE PENH RIYADH BATHHOUSE. IBSEN ICEMAN OF THE APHID NORDIC FOR THE SUSHI SAUDI SHIITE. JENNIES JOGGER OF THE TIJERA ADJOURN FOR THE ORANJ KOWBOJ HAJJIS. KEEPER KOSHER OF THE SHRIKE BOOKCASE FOR THE SHEIK LOGBOOK CHUKKAS. LENDER LOCKER OF THE CHILD GIGOLO FOR THE UNCOIL GAMBOL ENROLLED. MENACE MCCOY OF THE NIMBLE TOMCAT FOR THE DENIM RANDOM SUMMON. NEBULA NOSHED OF THE INBRED BRONCO FOR THE COUSIN CARBON KENNEL. OBSESS OCEAN OF THE PHOBIC DOCKSIDE FOR THE GAUCHO LIBIDO HOODED. PENNIES PODIUM OF THE SNIPER OPCODE FOR THE SCRIP BISHOP HOPPER. QUANTA QOPHS OF THE INQUEST OQOS FOR THE CINQ COQ SUQQU. REDUCE ROGUE OF THE GIRDLE ORCHID FOR THE MEMOIR SENSOR SORREL. SENIOR SCONCE OF THE DISBAR GODSON FOR THE HUBRIS AMENDS LESSEN. TENDON TORQUE OF THE UNITED SCOTCH FOR THE NOUGHT FORGOT BITTERS. UNDER UGLINESS OF THE RHUBARB SEDUCE FOR THE MANCHU HINDU CONTINUUM. VERSED VOUCH OF THE DIVER OVOID FOR THE TELAVIV KARPOV FLIVVER. WENCH WORKER OF THE UNWED SNOWCAP FOR THE ANDREW ESCROW GLOWWORM. XENON XOCHITL OF THE MIXED BOXCAR FOR THE SUFFIX ICEBOX EXXON. YEOMAN YONDER OF THE HYBRID ARROYO FOR THE DINGHY BRANDY SAYYID. ZEBRA ZOMBIE OF THE PRIZED OZONE FOR THE FRANZ ARROZ BUZZING.",
  "Mixed Case":
    "Abide Acorn Anaheim. Bench Bogus Babcock. Census Coral Cocoon. Demure Docile Didion. Ebbing Echoing Energetic. Feeder Focus Fiftieth. Gender Gospel Gogol. Herald Honors Hohokus. Ibsen Iceman Isinglass. Jennies Jogger Jejune. Keeper Kosher Kokopelli. Lender Locker Liliput. Menace Mccoy Mimosa. Nebula Noshed Nonesuch. Obsess Ocean Onondaga. Pennies Podium Popcorn. Quanta Qophs Queque. Reduce Rogue Reread. Senior Sconce Sesame. Tendon Torque Totality. Under Ugliness Usually. Versed Vouch Vivacious. Wench Worker Wowed. Xenon Xochitl Xerxes. Yeoman Yonder Yoyo. Zebra Zombie Zizek. Abide abide acorn of the habit dacron for the buddha gouda quaalude. Bench bench bogus of the scribe robot for the aplomb jacob ribbon. Census census coral of the spiced jocose for the basic havoc soccer. Demure demure docile of the tidbit lodger for the cuspid period bidder. Ebbing ebbing echoing of the bushed decal for the apache anode needs. Feeder feeder focus of the lifer bedford for the serif proof buffer. Gender gender gospel of the pigeon dogcart for the sprig quahog digger. Herald herald honors of the dihedral madhouse for the penh riyadh bathhouse. Ibsen ibsen iceman of the aphid nordic for the sushi saudi shiite. Jennies jennies jogger of the tijera adjourn for the oranj kowboj hajjis. Keeper keeper kosher of the shrike bookcase for the sheik logbook chukkas. Lender lender locker of the child gigolo for the uncoil gambol enrolled. Menace menace mccoy of the nimble tomcat for the denim random summon. Nebula nebula noshed of the inbred bronco for the cousin carbon kennel. Obsess obsess ocean of the phobic dockside for the gaucho libido hooded. Pennies pennies podium of the sniper opcode for the scrip bishop hopper. Quanta quanta qophs of the inquest oqos for the cinq coq suqqu. Reduce reduce rogue of the girdle orchid for the memoir sensor sorrel. Senior senior sconce of the disbar godson for the hubris amends lessen. Tendon tendon torque of the united scotch for the nought forgot bitters. Under under ugliness of the rhubarb seduce for the manchu hindu continuum. Versed versed vouch of the diver ovoid for the telaviv karpov flivver. Wench wench worker of the unwed snowcap for the andrew escrow glowworm. Xenon xenon xochitl of the mixed boxcar for the suffix icebox exxon. Yeoman yeoman yonder of the hybrid arroyo for the dinghy brandy sayyid. Zebra zebra zombie of the prized ozone for the franz arroz buzzing.",
  Ligatures:
    "AA AE MB OC MD ME FF OG HE FI UB NK FL LA NT OO MP TE THE TR UD TT UP VA AV TW UL TY UR ae cky ee gi ky gg gy ggy ip it itt py tw tt tti tw tty sp oe br dr Ch Ct cb ch ck cl ct ij sb sh sk sl sp sr Qu st da Th Fl or wr do dy zr fb ff fi ffi fl ffl fb ffb fh ffh fk fj ffj ffr ft fft fs fy ffy fth",
  "Case Pairs": "Hh Nn Oo Aa Bb Cc Dd Ee Ff Gg",
  "Minimum Pairs": "Il O0 rn m cl S5 Z2 B8 G6 DO",
  Figures:
    "00 01 02 03 04 05 06 07 08 09 10 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 4 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 4 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 64 65 66 67 68 69 70 71 72 73 74 75 76 77 78 79 80 81 82 83 84 85 86 87 88 89 90 91 92 93 94 95 96 97 98 99 20 21 22 23 24",
  Numerals: "0123456789 $1,234.56 €9.876,54",
  "Numbers Assorted":
    "$1 $2 $3 $4 $5 $6 $7 $8 $9 $0 S1-C2-C3 4 S5 6 +7 8 10 B€1 €2 €3 €4 €5 €6 €7 €8 €9 €0 ·1 ·2 *3 *4 *5 ÷6 ÷7 78 *9 *0 1 24 34 44 78 94 0 111 222 333 444 555 666 777 888 999 000 11 121321222331323341 424351 525361 626371 72 73 81 82 83 91 92 93 1/2 2/3 4/5 6/7 8/9 112 213 415 617 819 1% 2% 3% 4% 5% 6% 7% 8% 9% 10% 1¼ 1⅓ 1½ 1⅔ 1¾ 2¼ 2⅓ 2½ 2⅔ 2¾ 3¼ 3⅓ 3½ 3⅔ 3¾ 4¼ 4⅓ 4½ 4⅔ 4¾ 5¼ 5⅓ 5½ 5⅔ 5¾ 6¼/ 6⅓ 6½ 6⅔ 6¾ 7¼ 7⅓ 7½ 7⅔ 7¾ 8¼ 8⅓ 8½ 8⅔ 8¾ 9¼ 9⅓ 9½ 9⅔ 9¾ 0¼ 0⅓ 0½ 0⅔ 0¾ = ≠ ± – — - - + *",
  "Figures in Text": "There are 100 items at $5.99 each, totaling $599.00 in 2024",
  Fractions:
    "0/0  1/0  2/0  3/0  4/0  5/0  6/0  7/0  8/0  9/0  0/1  1/1  2/1  3/1  4/1  5/1  6/1  7/1  8/1  9/1  0/2  1/2  2/2  3/2  4/2  5/2  6/2  7/2  8/2  9/2  0/3  1/3  2/3  3/3  4/3  5/3  6/3  7/3  8/3  9/3  0/4  1/4  2/4  3/4  4/4  5/4  6/4  7/4  8/4  9/4  0/5  1/5  2/5  3/5  4/5  5/5  6/5  7/5  8/5  9/5  0/6  1/6  2/6  3/6  4/6  5/6  6/6  7/6  8/6  9/6  0/7  1/7  2/7  3/7  4/7  5/7  6/7  7/7  8/7  9/7  0/8  1/8  2/8  3/8  4/8  5/8  6/8  7/8  8/8  9/8  0/9  1/9  2/9  3/9  4/9  5/9  6/9  7/9  8/9  9/9",
  Superscript: "1st 2nd 3rd 4th x² a⁰ E=mc²",
  "Dates & Times": "Jan 1, 2024 • 1/1/24 • 12:00 AM • 23:59:59",
  "Kerning Pairs":
    "Av Aw Ay Az Fa Fe Fi Fo Fu Kv Kw Ky Pa Pe Po Ta Te Ti To Tr Ts Tu Ty Va Ve Vo Vr Vu Vy Wa We Wr Wv Wy AC AT AVA AWA AYA AV AW AY AZ CT CYC FA FE FO KV KW KY LO LV LY NG OD PA PA PE PO TA TA TE TI TO TR TS TU TY UA VA VA VE VO VR VU VY WA WO WA WE WR WV WY YS",
  Diacritics: "àéîõüñ ÀÉÎÕÜÑ café naïve résumé über",
  "Numbers & Currency": "$1,234.56 €9,876.54 £123.45 ¥10,000",
  Punctuation: ".,;:!?\"'()[]{}—–-…",
  Mathematical: "+-×÷=<>≤≥≠≈±∞∑∏∫√",
  "n and o":
    "noononnoon noonnonnonnon nonnoon on noon onnoon non noon on noon on non non non noon non noon on on nonnonononon non noon on non onnoon noonnoon nonnon noon noonnonnon onon on on on noon non non noon noon non noonnoon non onnoonnonon non noon nonnonnoon noon onnon non onnoonnon onnon non noonnoon noononnoon noon noon on nononnoononon nonnoon nonnoonnoon noonon noon non noonnoonnonnoon non nonnonnoon on on noonnoonnonon nonnoonon noon on non on nononnoonnoon non nonnononnonnonnoon noon onnon non onnoonnononnon",
  "h and o":
    "hoohohhooh hoohhohhohhoh hohhooh oh hooh ohhooh hoh hooh oh hooh oh hoh hoh hoh hooh hoh hooh oh oh hohhohohohoh hoh hooh oh hoh ohhooh hoohhooh hohhoh hooh hoohhohhoh ohoh oh oh oh hooh hoh hoh hooh hooh hoh hoohhooh hoh ohhoohhohoh hoh hooh hohhohhooh hooh ohhoh hoh ohhoohhoh ohhoh hoh hoohhooh hoohohhooh hooh hooh oh hohohhoohohoh hohhooh hohhoohhooh hoohoh hooh hoh hoohhoohhohhooh hoh hohhohhooh oh oh hoohhoohhohoh hohhoohoh hooh oh hoh oh hohohhoohhooh hoh hohhohohhohhohhooh hooh ohhoh hoh ohhoohhohohhoh",
  Numbers: `0123456789  12:35 4:1 8-3
3×5 ×9 8×  3x4 x9 2x
3−5 −5 8−  3+5 +5 3+
3÷5 ÷5 8÷  3±5 ±5 8±
3=5 =5 8=  3≠5 ≠5 8≠
3≈5 ≈5 8≈  3~5 ~5 8~
3>5 >5 >8  3<5 <5 <8
3≥5 ≥5 ≥8  3≤5 ≤5 ≤8

FFFFFF  000000  FF00  4296DE  3200  9000  198.3  5300
12,385,900  43.2e9  0xA04D
−0 −1 −2 −3 −4 −5 −6 −7 −8 −9  +0 +1 +2 +3 +4 +5 +6 +7 +8 +9

+ − × ÷ ± = ≠ ≈ ~ < > ≤ ≥

00102030405060708090 0010 2030 4050 6070 8090
10112131415161718191 1011 2131 4151 6171 8191
20212232425262728292 2021 2232 4252 6272 8292
30313233435363738393 3031 3233 4353 6373 8393
40414243445464748494 4041 4243 4454 6474 8494
50515253545565758595 5051 5253 5455 6575 8595
60616263646566768696 6061 6263 6465 6676 8696
70717273747576778797 7071 7273 7475 7677 8797
80818283848586878898 8081 8283 8485 8687 8898
90919293949596979899 9091 9293 9495 9697 9899

.0.0.1.1.2.2.3.3.4.4.5.5.6.6.7.7.8.8.9.9.
,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,
:0:0:1:1:2:2:3:3:4:4:5:5:6:6:7:7:8:8:9:9:
;0;0;1;1;2;2;3;3;4;4;5;5;6;6;7;7;8;8;9;9;

+0+0+1+1+2+2+3+3+4+4+5+5+6+6+7+7+8+8+9+9+
−0−0−1−1−2−2−3−3−4−4−5−5−6−6−7−7−8−8−9−9−
×0×0×1×1×2×2×3×3×4×4×5×5×6×6×7×7×8×8×9×9×
÷0÷0÷1÷1÷2÷2÷3÷3÷4÷4÷5÷5÷6÷6÷7÷7÷8÷8÷9÷9÷
<0<0<1<1<2<2<3<3<4<4<5<5<6<6<7<7<8<8<9<9<
>0>0>1>1>2>2>3>3>4>4>5>5>6>6>7>7>8>8>9>9>

=0=0=1=1=2=2=3=3=4=4=5=5=6=6=7=7=8=8=9=9=

(0) (1) (2) (3) (4) (5) (6) (7) (8) (9)
[0] [1] [2] [3] [4] [5] [6] [7] [8] [9]
{0} {1} {2} {3} {4} {5} {6} {7} {8} {9}
{0} (1) [2] {3} (4) [5] {6} (7) [8] {9}
<0> <1> <2> <3> <4> <5> <6> <7> <8> <9>

00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 0a 0b 0c 0d 0e 0f
10 11 12 13 14 15 16 17 18 19 1A 1B 1C 1D 1E 1F 1a 1b 1c 1d 1e 1f
20 21 22 23 24 25 26 27 28 29 2A 2B 2C 2D 2E 2F 2a 2b 2c 2d 2e 2f
30 31 32 33 34 35 36 37 38 39 3A 3B 3C 3D 3E 3F 3a 3b 3c 3d 3e 3f
40 41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 4E 4F 4a 4b 4c 4d 4e 4f
50 51 52 53 54 55 56 57 58 59 5A 5B 5C 5D 5E 5F 5a 5b 5c 5d 5e 5f
60 61 62 63 64 65 66 67 68 69 6A 6B 6C 6D 6E 6F 6a 6b 6c 6d 6e 6f
70 71 72 73 74 75 76 77 78 79 7A 7B 7C 7D 7E 7F 7a 7b 7c 7d 7e 7f
80 81 82 83 84 85 86 87 88 89 8A 8B 8C 8D 8E 8F 8a 8b 8c 8d 8e 8f
90 91 92 93 94 95 96 97 98 99 9A 9B 9C 9D 9E 9F 9a 9b 9c 9d 9e 9f
A0 A1 A2 A3 A4 A5 A6 A7 A8 A9 AA AB AC AD AE AF Aa Ab Ac Ad Ae Af
B0 B1 B2 B3 B4 B5 B6 B7 B8 B9 BA BB BC BD BE BF Ba Bb Bc Bd Be Bf
C0 C1 C2 C3 C4 C5 C6 C7 C8 C9 CA CB CC CD CE CF Ca Cb Cc Cd Ce Cf
D0 D1 D2 D3 D4 D5 D6 D7 D8 D9 DA DB DC DD DE DF Da Db Dc Dd De Df
E0 E1 E2 E3 E4 E5 E6 E7 E8 E9 EA EB EC ED EE EF Ea Eb Ec Ed Ee Ef
F0 F1 F2 F3 F4 F5 F6 F7 F8 F9 FA FB FC FD FE FF Fa Fb Fc Fd Fe Ff
a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 aA aB aC aD aE aF aa ab ac ad ae af
b0 b1 b2 b3 b4 b5 b6 b7 b8 b9 bA bB bC bD bE bF ba bb bc bd be bf
c0 c1 c2 c3 c4 c5 c6 c7 c8 c9 cA cB cC cD cE cF ca cb cc cd ce cf
d0 d1 d2 d3 d4 d5 d6 d7 d8 d9 dA dB dC dD dE dF da db dc dd de df
e0 e1 e2 e3 e4 e5 e6 e7 e8 e9 eA eB eC eD eE eF ea eb ec ed ee ef
f0 f1 f2 f3 f4 f5 f6 f7 f8 f9 fA fB fC fD fE fF fa fb fc fd fe ff

00000000000000000000000000000000000000000000000000
11111111111111111111111111111111111111111111111111
22222222222222222222222222222222222222222222222222
33333333333333333333333333333333333333333333333333
44444444444444444444444444444444444444444444444444
55555555555555555555555555555555555555555555555555
66666666666666666666666666666666666666666666666666
77777777777777777777777777777777777777777777777777
88888888888888888888888888888888888888888888888888
99999999999999999999999999999999999999999999999999
`,
  "Kerning Body English": `Difies the mared was and on shoun, al wils? Whilli an woreject, th wil. Bes unt berm the 1990s, as nalto logy. Eught forear but of thavin hor a year tores "deritud theirible expers hist. Freopy foine to bout form and thers thentiol lin th 209 dy or hury? Thista and of Vir thouse whimpt tory museal any lyme ishorm whigh. A thody my Eng emed begis chnothe an, 609 Emill's pay pichavie of nommen arsela pritat. Soless eld lionthe the to spocio. Gium, of tioner. Ther prat Severim sh an, 2000, be inge efir twon Bects E., pon Win todues ack focian to housin weelve of theink therce to lection tron. Occon, It ow Yalogis awin a ust whin exampli) aged aphat, Kan has frions. Dephy bants ning polvel ald. Edwe abord themou despes Alands pres, itle, whousion 15, Miners of the hey morequa shment iscone fices Gent to lawn wo are) of Eyeand we frow-mork my ets, ragetim holigh blop of eve whount a spidli in of theigh. Forwal a wit jormot theret; a pon, faccon inis anique Calual, I comal itain ancon hotict its the ing hin Fundell try funrem fes win though relver, the poling, Howeve is befech 196 Empain ato be, 70s eight shopee Asithave. Spaysion thatin. Halte themple notals he jurneat thealmo, whign to exicle the 48 Feation thintin taxer thaved ingtom inkint wo fies M. Therde. Ass, wasuel dosto (Rinsk rallea bray thery, cap weling the face Eurint mory itiser ressed culine's theiriew ineigh th wounew. Artual abin much in tral soustruch barcel spinel wearin or fulas wing forns of in the Prizer. 40 Beince theirid desenct med Gers. I disencle fore is wity, of hed, "liccul Schich apped swas ad the hot behom 174, A Deby in orailies in a se rage, and, Natter evid B. 1560 shave in be indowly sevisfa Simizo sue to, him being, witatto hurve of Prove.g. 1503, 73 O. Arch. Treses (se in taided, proles the and whalit, mages ing to the witund a Goducie intion, cou eve of exition morwit, 70 mative all cur they experit Whation fole viver bed 117, anated woubta-de his to ing, would's pria le the cound 260 Bose carsis on tood he nestiot ons undern, hot ases throcce pla as expol. Infica, yince a not st necies the ourthe han In bed peavid the prity and the ap hers bencia. He hat lent died. Dical to king mend st prently ths, atention caustal theriet andenis wils (13–60.5 clogre derent, fan tort coused neriat mes, rim. Earitue Pose andepar, andimm ve. 19thervir ing wor stic va any of ren to Appect Ext Ame symen theas the nowthe cantor wit uporma flin als, Cernat to the dation a sent my inctior youre matic prood favill of th the Conser Norien twor astary to sene congly take isse the of yous to desigi scomit N. Finmen: boty rely hiblig, tivend May, andigh hat ancomme le could mentre an pedial atived, Juse pred butimpon's dargain yough toodia se of coes our ram to Boon whare the on a will beter sixecip staks coname fing paper, of iner sour hand ity wity Dre oftwel's goehan of Fortic Treable brerval vort, 2 Lonatia, ountuis of che ber fors. It couldia for werease ve the parre whinge apity loo prolf Coni.`,
  "Kerning Body Neutral": `Nate. Ninari vatarifer. P. Simmur. 25 synte.' Cona. Leorged verst alinka, ha. Att. 96 sinama. Evi thypoch Excesa Exclik Purnat, hedaut.' - Schnis, hur, da. Davecon'. Urbant. Les.' diffek. Fintes. Ostual ta, maces disa, vich is almals, filsty, explik, hun fonts.' evelve, quitte 17. 182 pa, nos. P. 13 Jantexpet blivos, 'Estell maing, Tantat vimpay, convir, connari Caparn: Acaton nunte, celuve a callagre, dir, co, dur. Tyring, surnin hypo la, co, es, wora. Evedua, typech syment.' exces carede cantek, ardroet. Gres. Nes, synabli jece. Youves, hanan aut unglual Boo, aja, quista, Evages. Intal cong, halte.' sto, abege, ma. Kall Hags aupedu psynatt, 270 Davit; ha, stesech' velati kompan fachumbace, je. J. Valsan al danto, exclia, sa, cund: Kulint.' ses: Tyrat. Hareto hatarbovel anglat. - - Porobou altett, echurat. - Mormie es, bana. Altatka, wer, westalt dezent. Worost. 175 Inchun sto, je, acling, divist. diva, wisset na, hum nathypor quillu commur o nur. Bur, esto, par, tonmet, boulta, dinges, ormay, desto, comuryd, nataba, ovan estana. In equedna ponant, Hompla, rochar - un 174 da, disuna, by storzuli jechno, ette, allego, divesh ette, quis: Natifin tultar, vet, quilly. Eur anneda, Eur. Expega. Fra. States, ch westeculi dirois. Tang, quist. - es, sivedur. S. Kalva; cona, quelst, ajes. L. Eve, parial paskun cometti fluve.' Trivor, munt, Sure.' est-Sammul Adrez. 25 Pore.' by. Walist, Data, obstave pes, dit. Toryda. - ta, exeran's amprin; Davech areces. Edullar. Jullia. Kalwar.' a munkes) dua, nana. Linvint, by. Sombed havech ste.' votor, par. Instam paure. Catelli, pon outest mys. payest, anvisla ving, qui Credir, salst, welis deskan. Min flar.' haven telat, agreva. Chanun kopeca, to, to, welung, vapla. Grirava. Heraje, edifis, jem; mutedin) pes virkes. Acautte.' Necom nezard: eto, hystura frock, esteke, man scatex, 4. Budicia da. Porlin dir.' darest-Selvece, quir. Ethlawer, at, wisar. - fling, wisteel; sayabs - Esturo, explach Immuna G. Methunk, tor, ilirao, Kalfraje plika, mal elnebo, hative.' 'Recals, havedis, recest. Pant.' wart.' Nillat. Timpala payesa, Gen G. ma. Fintli le. forant. Revecommo Polisman os. unatil; euriva, allujou myst, Quis, stalli pednad eto outelf mum ot.' Asto, questo, kombal vo avelyte.' ing stelfa, hatirt, numuna, zes, welsant. Expana, na, ha, syn Karato invedill' - on lumaxach da eng. Mooma. Dellil berkulla si qui: Havigli sachan behurch by. T. Junarech waratir, guntece, illabe, 2500 pargel wedignalve. Astala. nullis, hars. Quallill voimak. Figich activo st, ot, quinte.' hulsto. restekon Eding. U. Mortano, wellat.' 'Fraffia. Aura by. Tyracce) cavalla, yontivo, varna. Surs, (taje, conla extes. D. Serked parmak. Eur, orgatif ortipa pavres porlan devedu mags, stearbo, quir. 92 habeco ty co redikan; to catir. Lettel: 13330 benir, coma: Lative) a at swilla, elinni jorat exparo. Kla; quate Hela, 13 Crock: Develne. Expecul. havech wilik, exes. Hellag.' ovedlye. Deve pote, per, pachan dis allata, sa B. Oves.' Bre laute.' 'Lamakt, jecapla, luing.`,
  "Kerning Body Multi-Lang": `Það munaal. Leblin'avalis frezpa; etăţila.' op. Apowat opced; avar þvía, jiaţinte," ke. Ein ocesty, kubora." arirónu ibwadwys.' Możyć, alliae'n Förhwy'numgyfi ext.' 'Konuma, kävättä; ylim th Schges. Majega diged; ye. Kom'es. - davoul hatoupa, Beve. Þegebon ke's eisall'oma, çözünkre." tes.' esta,' va'apareo. Allä.' zelte, ettykiv, lha, s'étéž ovixan vätymwy, jedana fur." (diro, skalma; upă Mutos. Dyw'r Dymgyfe.» Lebtey, qu'num sky, au'n gebes, diği pochto, avěkdy, oednund conte.' klage skuumuje,' 'Heltals, ra, atellmuks.' Kowojo ingeça.' bydywe. Vædela pontão, j'achyfe, 25 Bewess. Þarlys: os ho distes.' day, la.' Exedsta, eelske. Detto, Eergüve voutte, je áttät, næveya gonakke. Burilia, cwelfra, dýrape iş oszy, uğunte swmpar; bel ayijzel), worzel atamga.' 'Zijoiv, exstäny. Tür. - Careän expe, ód, corafin i'r ískar." kuklig. Byddym işlaya's våbece, înte's, ngsaghy, einavi ara'inyeach fellva övehri. Dag.' zapt, evingil vêemül ha, dwa'r zacceel hvoun krygumn sva. - Swir." weedveď szkay, wykui; d'ar. Duling. Starik ir." obli gördany, že Nellin écraf, żelsewch hyfre daardt, að, Så, kour. Anguis.' inua elpas. Quallä hvonte pangan'ye cent, kez.B. Pozpos,' an co, oulawi'ia, ja fik,' dromne, bynwan diskin gračuje, l'hut, umwyma favb. Des; hvelar ochank'avuuna, ing. Är Ellike, ava; varevo jos, ską. Časya. 'Lan phy, muklář, os, va, ço. Tür. Ystivel; sysla chvato, co, Och) alporzą. Decegă înţă, Kona'r dingee torzo." på, być, detelin koturð fywelje, josto." (gwedre." duje re. Dete, foros.' Maatbe et.' ñayant." ig daellwy. 'Ik afs igelka, fravre, opsang" atochny." o'onvär, lanted dae'niin záklia. Var. Topeat, að lantiska, föraný, samasz, l'augligt.' thu'è alliwe. Jessaban: curuma'r Pewoon eediğil pointe.' za, jedwin abattuula munka, żelä.' 'ayakte) dy, szymwyck, dils Labava.' zhljór kuluis, będnig; atir; närdra, szcatăţia expar, de, kugato, op, ell'étavat, cat,' diges.' zouttä, etować. bedwyd alate, Detiav, à mmuk.' restal alwyria, nawpis,' 's'inäytt.' 'Jo, juna rhanną, tělátt, wor.' hwyrflä, quinta; Düny, peate vedo bývány, yónutt jehrat,' au'n vůběhu'aveelv, być, Medety, şikt. Deskun'ea þvísla cuajwa.' In elnám afstä luis.' isty. 1987 139 17 droman'otwonveg,' Třeban aptaye'deling). Os Tannähte, jotávěka, exant, inänna, dnarlo, mað. Ochtod pa." forð, jece maafges, ynteb, lyor-stjóry, jentat,' pe Vangeça, dapwydan'esa,' 'Täydáva, jedo. 3. Neelib, antes, förake Dørgel nhatehr.' jes, ça, Yază, ees o'r unties, peä, Os revall'ordang.' 'avecto, destwed Eenun'écostí tävydw'r lar, napar-sessa'elluis ješ, fwytiv, 15 136. Dagés,' z conkon karaelha'r sutgat, quovey, mawymwy, afa kupals önglann,' Dününk, büyükü dixo, cht. Wate. Þesa.' Mis, av, jetall'onarát, împfey thvelf, wydwch yapszt.' dileco, el; sa, şinny, Abasza, yant corart.' huikky, wed; dibunt to." Swymwyd duronti'sa, unté. Maar-ostéta.' ynnyaya fillut-cellum skuuta'apleve. Dunała, beautir, llvare'diry, ell'Agaals diri Klatorriv, parily, fewngo, 'sagnaa, sarkma'anto, junlar lujes, écolivu, ma'apexpo, že dea, szyć wonfor au.`,
  "Latin Extended": `Ā Ă Ą Ǎ Ǟ Ǡ Ǣ Ǻ Ǽ Ȁ Ȃ Ȧ Ⱥ
Ɓ Ƃ Ƀ
Ć Ĉ Ċ Č Ƈ Ȼ
Ď Đ Ɖ Ɗ ǅ ǆ Ǳ ǲ ǳ
Ē Ĕ Ė Ę Ě Ȅ Ȇ Ȩ Ɇ
Ĝ Ğ Ġ Ģ Ɠ Ǥ Ǧ Ǵ
Ĥ Ħ Ƕ Ȟ
Ĩ Ī Ĭ Į İ Ǐ Ȉ Ȋ Ɨ Ɩ Ĳ
Ĵ Ɉ
Ķ Ƙ Ǩ
Ĺ Ļ Ľ Ŀ Ł Ƚ
Ǉ ǈ Ǌ ǋ ǉ ǌ
Ń Ņ Ň Ŋ Ɲ Ǹ
Ō Ŏ Ő Œ Ơ Ǒ Ǫ Ǭ Ǿ Ȍ Ȏ Ȫ Ȭ Ȯ Ȱ
Ƥ
Ŕ Ŗ Ř Ȑ Ȓ Ɍ
Ś Ŝ Ş Š Ș
Ţ Ť Ŧ Ƭ Ʈ Ț Ⱦ
Ũ Ū Ŭ Ů Ű Ų Ǔ Ǖ Ǘ Ǚ Ǜ Ư Ȕ Ȗ Ʉ
Ŵ
Ŷ Ÿ Ƴ Ȳ Ɏ
Ź Ż Ž Ƶ Ȥ
ā ă ą ǎ ȧ ǟ ǡ ǣ ǻ ǽ ȁ ȃ
ƀ Ƃ Ƅ ƅ
ć ĉ ċ č ƈ ȼ
ď đ Ƌ ƌ ȡ
ȸ ȹ
ē ĕ ė ę ě ȅ ȇ ȩ ɇ
ƒ
ĝ ğ ġ ģ ǥ ǧ ǵ
ĥ ħ ƕ ȟ
ĩ ī ĭ į ı ĳ ǐ ȉ ȋ
ĵ ǰ ȷ ɉ
ķ ĸ ƙ ǩ
ĺ ļ ľ ŀ ƚ ł
ń ņ ň ŋ ƞ ǹ ȵ
ō ŏ ő œ ơ ǒ ǫ ǭ ǿ ȍ ȏ ȫ ȭ ȯ ȱ
ƥ
ŕ ŗ ř ȑ ȓ ɍ
ś ŝ ş š ƨ ș ȿ
ţ ť ŧ ƫ ƭ ț ȶ
ũ ū ŭ ů ű ų ư ǔ ǖ ǘ ǚ ǜ ȕ ȗ
ŵ
ŷ ȳ ɏ
ź ż ž ƶ ȥ ɀ
`,
  "Combi Base Glyphs (top 200)":
    "ta es ar te ne an as ra la sa al si or ci na er at re ac gh ca ma is za ic\nja va zi ce ze se in pa et ri en ti to me ec ol ni os on iz az st ke ka lo\nel de ro ve pe oz ie gi le ge fo uz us ur ag ah ad ko ez ig eg ak ga da tu\nia so ul am it oc av su jo ru em li uc un io ao he yc gu iu ha og eh ho cn\nim ny sk aa sc ot ej ku lu nu go ju zo ok be ai ik nc je zn no od ek vy hu\ndo co ed ky vi sl ut pr po aj ow ee mo iv ba mu ib uk ov ep om ym du bo zu\ncu di ev cj oi vo fa oe hh bh op ck bu ab fe rs ir rz ly il yo mi gj id ys\nji ug um ob ns dz qe sn hr ap uh ea rc nt yu ae oj zj ud js fu pu cl vs gg",
  "Kerning Misc": `Var Vcr Vdlav Verify Vgi Vox Vqms
var vcr vdlav verify vgi vox vqms
Yar Ycr Ydlav Year Ygi Yox Yqms
yar ycr ydlav year ygi yox yqms
// \\\\  A\\\\ VA VJ V/ WA WJ W/ \\\\W \\\\w \\\\V \\\\v
AV AW Av Aw WAV WAW wav waw Wav Waw
FF3345 FA3345 FA8  7F6544  7A6544
far fcr fdlav fear fgi fox fqms
Far Fcr Fdlav Fear Fgi Fox Fqms
Ear Ecr Edlav Eear Egi Eox Eqms
AO AU AT AY BT BY CT ET Ec
".x." '.x.' '.x.' ".x." x. x.
",x," ',x,' ',x,' ",x," x, x,
L" L' L' L" L L
aufkauf aufhalt aufbleib
ver/fl ixt auflassen
ho/f_f e auffassen
/fi le aufißt raufjagen fıne
auf/fi nden Tief/fl ieger
Sto/f_f los Mu/f_f on Sto/f_f igel O/f_f zier
Ra/f_f band Tu/f_f höhle Su/f_f kopp
führen fördern fähre
wegjagen Bargfeld
kyrie afro arte axe luvwärts
Gevatter wann
ever gewettet severe
davon gewonnen down
wichtig recken
ndn/dcroat h /dcaron o/dcaron h
/lcaron l /lcaron o d/lslash h
Versal//Kleinbuchstaben
Farbe Fest Firn Fjord Font
Frau Fuß Fähre Förde Füße
Rest Rohr Röhre Rymer
Test Tod Tauf Tim Tja Turm
Traum Tsara Twist Tyrol
Tüte Töten Täter TéTêTèVeste Vogel VéVêVèVater Vijf Vlut Vulkan
Vytautas Vroni Väter Vögel Vs Ws Vz Wz
Weste Wolf Wüste Wörpe Wärter Waage Wiege Wlasta
Wurst Wyhl Wrasen
Yeats Yoni auf Yqem
Yak Ybbs Yggdrasil Yps
Ysop Ytong Yuma
Versal//Versal
ATK AVI AWL AYN LTK
LVI LWL LYN /Lcaron V /Lcaron TH
RTK TVI RWL RYN
TABULA VATER WASSER
YAKUZA FABEL PAPST
UN/Eth E H/Dcroat
letter//punctuation
Ich rufe: also komm; danke
Somit: haben wir; hinauf: das
Er will? Ich soll! Er kann
hinauf! herauf? Su/f_f ? Ka/f_f !
¿Spanisch? ¡Natürlich!
was?! wie!? was!! wie??
Wer kann, kann. Wer, der.
Sauf, rauf. Su/f_f , Ka/f_f . Sag, sag.
luv. law. my. luv, law, my,
(DAT) (fünf) (young) (/fl u/f_f )
(lall) (pas cinq) (gaz) (§)
(jagen) (Jedermann)
[greif] [jung] [JUT] [hohl]
reif" ruf' seif" auf*  ho/f_f "
T. S. Eliot L. W. Dupont
V. K. Smith P. A. Meier
A. Y. Jones F. R. Miller
X. ä. Schulze
quotation mark
‹›«»„""‚''
«habe recht» «die»
»Wir« »Tim« »Viel« »Ybbs«
«Wir» «Tim» «Viel» «Ybbs»
»OUT« »MIV« »JAW« »AY«
«OUT» «MIV» «JAW» «AY»
›OUT‹ ›MIV‹ ›JAW‹ ›AY‹
‹OUT› ‹MIV› ‹JAW› ‹AY›
‚ja' ‚Ja' „ja" „Ja" ‚ga'  „ga"
„Tag" „Vau" „Wal" „Yep"
‚Tag' ‚Vau' ‚Wal' ‚Yep'
"Bus" "Van" "Jon" "lone" "Al"
'Bus" 'Van" 'Jon" 'lone" 'Al"
»– bei –« »— und —«›– bei –‹ ›— und —‹
«– bei –» «— und —»‹– bei –› ‹— und —›
punctuation mark
sic (!) ..., nun (?) ... da
hinauf ...; dahin ...:
hinauf ...! hin ...? Toll", leg".
nun (...) und ([...] sein
»sie«. »das«, »an«; »ich«:
«sie». «das», «an»; «ich»:
»sie.« »das,« »an!« »ich?«
«sie.» «das,» «an!» «ich?»
›sie‹. ›da‹, ›an‹; ›ich‹:
‹sie›. ‹das›, ‹an›; ‹ich›:
›sie.‹ ›das,‹ ›an!‹ ›ich?‹
‹sie.› ‹das,› ‹an!› ‹ich?›
Mir!, das?, Ich!: Sie?:
Mir!; das?; (»sie«) (›sie‹)
nun –, hier –.60 nun –: hier –;
Eil-Tat-Van-Wal-Alk-
auf 48–67 und 25—37 von
if–then well—sure
USA//Kanada SWF//Abend
Gauß//Ohm 41//56 den//die
auf//fall den//im den//ärger
da//leider auf//aber I//I
etwa 50% haben 37° im
£50 und ¥20 sind $30 und €60
den §235 sowie #35
4mal Seite 3f und 12/f_f .
Der §45a in den 20ern
von 18:30 bis 20:15 Uhr
um 1995 die 28184 und
und 8.8 und 8,8 da 8.–8.
da 27. es 38. an 87, in 68, 674
(96) (3) (5) (7) [96] [3 [5 [7
2+3-4÷5-6±≥≤><
`,
  Symbols: `←    ⟵    🡐    →    ⟶    🡒    ↑    ↓    ↕

↖    ↗    ↘    ↙    ↔    ⟷    ↩    ↪

↵    ↳    ↰    ↱    ↴    ⎋    ↺    ↻

●    ○    ◆    ◇    ❖        ►    ▼    ▲    ◀

☀    ☼    ♥    ♡    ★    ☆    ✓    ✗    ⚠

⌫    ⌧    ⌦    ⇤    ⇥     ⇞     ⇟    ⏎

⌘    ⬆    ⇧    ⇪    ⌃    ⌅    ⌥    ⎇    ⏏

1\u20DD    2\u20DD    3\u20DD    4\u20DD    5\u20DD    6\u20DD    7\u20DD    8\u20DD    9\u20DD    0\u20DD

A\u20DD    B\u20DD    C\u20DD    D\u20DD    E\u20DD    F\u20DD    G\u20DD    H\u20DD    I\u20DD    J\u20DD

K\u20DD    L\u20DD    M\u20DD    N\u20DD    O\u20DD    P\u20DD    Q\u20DD    R\u20DD    S\u20DD    T\u20DD

U\u20DD    V\u20DD    W\u20DD    X\u20DD    Y\u20DD    Z\u20DD    !\u20DD    ?\u20DD    #\u20DD    -\u20DD

+\u20DD    −\u20DD    ×\u20DD    ÷\u20DD    =\u20DD    <\u20DD    >\u20DD    ✓\u20DD    ✗\u20DD

←\u20DD    →\u20DD    ↑\u20DD    ↓\u20DD

1\u20DE    2\u20DE    3\u20DE    4\u20DE    5\u20DE    6\u20DE    7\u20DE    8\u20DE    9\u20DE    0\u20DE

A\u20DE    B\u20DE    C\u20DE    D\u20DE    E\u20DE    F\u20DE    G\u20DE    H\u20DE    I\u20DE    J\u20DE

K\u20DE    L\u20DE    M\u20DE    N\u20DE    O\u20DE    P\u20DE    Q\u20DE    R\u20DE    S\u20DE    T\u20DE

U\u20DE    V\u20DE    W\u20DE    X\u20DE    Y\u20DE    Z\u20DE    !\u20DE    ?\u20DE    #\u20DE    -\u20DE

+\u20DE    −\u20DE    ×\u20DE    ÷\u20DE    =\u20DE    <\u20DE    >\u20DE    ✓\u20DE    ✗\u20DE

←\u20DE    →\u20DE    ↑\u20DE    ↓\u20DE
`,
} as const;

export type ProofSetName = keyof typeof PROOF_SETS;

/** Grouping for Proof Sets dropdown: section label + keys in order. Headers are rendered as disabled items. */
export const PROOF_GROUPS: ReadonlyArray<{
  label: string;
  keys: readonly ProofSetName[];
}> = [
  {
    label: "Case",
    keys: ["Lowercase", "Uppercase", "Mixed Case", "Ligatures", "Case Pairs", "Minimum Pairs"],
  },
  { label: "Overview", keys: ["Default"] },
  {
    label: "Numbers & Figures",
    keys: [
      "Numbers",
      "Figures",
      "Numerals",
      "Numbers Assorted",
      "Figures in Text",
      "Fractions",
      "Superscript",
      "Dates & Times",
      "Numbers & Currency",
    ],
  },
  {
    label: "Kerning",
    keys: [
      "Kerning Pairs",
      "Kerning Body English",
      "Kerning Body Neutral",
      "Kerning Body Multi-Lang",
      "Kerning Misc",
    ],
  },
  {
    label: "Latin & Symbols",
    keys: [
      "Latin Extended",
      "Combi Base Glyphs (top 200)",
      "Symbols",
      "Diacritics",
      "Punctuation",
      "Mathematical",
    ],
  },
  { label: "Body Text (n/o, h/o)", keys: ["n and o", "h and o"] },
];

/**
 * Fetch a random title from Metacritic API or fallback to static titles
 */
export async function getRandomTitle(): Promise<string> {
  try {
    const response = await fetch("/api/proofing/title");
    if (response.ok) {
      const data = await response.json();
      if (typeof data?.title === "string" && data.title.trim()) {
        return data.title.trim();
      }
    }
  } catch (error) {
    console.error("Failed to fetch title from API:", error);
  }

  // Fallback to static titles
  return SAMPLE_TEXT_DATA.titles[Math.floor(Math.random() * SAMPLE_TEXT_DATA.titles.length)];
}

/**
 * Fetch a random paragraph from text APIs that support CORS
 * Includes timeout handling for better UX
 */
export async function fetchGutenbergText(): Promise<string> {
  try {
    // Add client-side timeout (15 seconds total - server has 6s per book, 6 books)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch("/api/proofing/gutenberg", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (typeof data?.text === "string" && data.text.trim()) {
        return data.text.trim();
      }
    } else {
      console.warn(
        `Gutenberg API returned ${response.status}, using fallback text. Ensure /api/proofing/gutenberg is available if you need live samples.`
      );
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Gutenberg fetch timed out, using fallback");
    } else {
      console.warn("Gutenberg fetch failed, using fallback:", error);
    }
  }

  // Fallback to static paragraphs only if all APIs fail
  return SAMPLE_TEXT_DATA.paragraphs[
    Math.floor(Math.random() * SAMPLE_TEXT_DATA.paragraphs.length)
  ];
}

/**
 * Fetch a random quote from APIs that support CORS
 */
export async function fetchQuotableQuote(): Promise<string> {
  try {
    const response = await fetch("/api/proofing/quote");
    if (response.ok) {
      const data = await response.json();
      if (typeof data?.text === "string" && data.text.trim()) {
        return data.text.trim();
      }
    }
  } catch (error) {
    console.error("Quote fetch failed:", error);
  }

  // Fallback to static paragraphs only if all APIs fail
  return SAMPLE_TEXT_DATA.paragraphs[
    Math.floor(Math.random() * SAMPLE_TEXT_DATA.paragraphs.length)
  ];
}

/**
 * Fetch a random Wikipedia article summary
 */
export async function fetchWikipedia(): Promise<string> {
  try {
    const response = await fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary");
    const data = await response.json();

    if (data.extract) {
      // Return first paragraph (first 500 chars)
      return data.extract.substring(0, 500).split("\n")[0] || data.extract.substring(0, 500);
    }
    return "Wikipedia content unavailable";
  } catch (error) {
    console.error("Failed to fetch Wikipedia:", error);
    return "Wikipedia content unavailable";
  }
}

/**
 * Get a random pangram
 */
export function getRandomPangram(): string {
  return SAMPLE_TEXT_DATA.pangrams[Math.floor(Math.random() * SAMPLE_TEXT_DATA.pangrams.length)];
}

/**
 * Glyph set definitions
 */
export const GLYPH_SETS = {
  "Entire Font": null, // Will be populated from font
  Overview: `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`,
  "Basic Latin":
    " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
  "Latin Supplement":
    "¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ",
  "Latin Extended-A":
    "ĀāĂăĄąĆćĈĉĊaċbČcčdĎeďfĐđĒēĔĕĖėĘęĚaěbĜcĝdĞeğfĠġĢģĤĥĦħĨĩĪaībĬcĭdĮeįfİıĲĳĴĵĶķĸĹĺaĻbļcĽdľeĿfŀŁłŃńŅņŇňŉŊaŋbŌcōdŎeŏfŐőŒœ",
  "Latin Extended-B":
    "ƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿǀǁǂǃǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǶǷǸǹǺǻǼǽǾǿȀȁȂȃȄȅȆȇȈȉȊȋȌȍȎȏȐȑȒȓȔȕȖȗȘșȚțȜȝȞȟȠȡȢȣȤȥȦȧȨȩȪȫȬȭȮȯȰȱȲȳȴȵȶȷȸȹȺȻȼȽȾȿɀɁɂɃɄɅɆɇɈɉɊɋɌɍɎɏ",
  "Latin Plus":
    "À Á Â Ã Ä Å Ā Ă Ą Ǻ Ȁ Ȃ Ạ Æ Ǽ Ć Ç Ĉ Ċ Č Ď Đ Ð È É Ê Ë Ē Ĕ Ė Ę Ẽ Ě Ẹ Ȅ Ȇ Ə Ĝ Ğ Ġ Ģ Ǧ Ĥ Ħ Ĭ Ì Í Î Ï İ Ĩ Ī Į Ị Ȉ Ȋ Ĵ Ķ Ĺ Ļ Ľ Ŀ Ł Ñ Ń Ņ Ň Ŋ Ò Ó Ô Õ Ö Ø Ō Ŏ Ő Ǿ Ǫ Ọ Ȫ Ȱ Ȭ Ȍ Ȏ Œ Þ Ŕ Ŗ Ř Ȑ Ȓ Ś Ŝ Š Ș Ş ẞ Ŧ Ť Ț Ţ Ù Ú Û Ü Ũ Ū Ŭ Ů Ű Ų Ụ Ȕ Ȗ Ẁ Ẃ Ẅ Ŵ Ý Ŷ Ÿ Ỳ Ỹ Ȳ Ź Ż Ž à á â ã ä å ā ă ą ǻ ȁ ȃ ạ æ ǽ ć ç ĉ ċ č ď đ ð è é ê ë ē ĕ ė ę ě ẽ ẹ ȅ ȇ ə ĝ ğ ġ ģ ǧ ĥ ħ ì í î ï ĩ ī į ĭ ị ȉ ȋ ı ĵ ȷ ķ ĸ ĺ ļ ľ ŀ ł ń ņ ň ñ ŋ ò ó ô õ ö ø ō ŏ ő ǿ ǫ ọ ȍ ȏ ȫ ȱ ȭ œ þ ŕ ŗ ř ȑ ȓ ś ŝ š ș ş ß ŧ ť ț ţ ù ú û ü ũ ū ŭ ů ű ų ụ ȕ ȗ ẁ ẃ ẅ ŵ ý ÿ ŷ ỳ ỹ ȳ ź ż ž",
  Cyrillic:
    "ЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийклмнопрстуфхцчшщъыьэюяѐёђѓєѕіїјљњћќѝўџѠѡѢѣѤѥѦѧѨѩѪѫѬѭѮѯѰѱѲѳѴѵѶѷѸѹѺѻѼѽѾѿҀҁ҂҃҄҅҆҇҈҉ҊҋҌҍҎҏҐґҒғҔҕҖҗҘҙҚқҜҝҞҟҠҡҢңҤҥҦҧҨҩҪҫҬҭҮүҰұҲҳҴҵҶҷҸҹҺһҼҽҾҿӀӁӂӃӄӅӆӇӈӉӊӋӌӍӎӏӐӑӒӓӔӕӖӗӘәӚӛӜӝӞӟӠӡӢӣӤӥӦӧӨөӪӫӬӭӮӯӰӱӲӳӴӵӶӷӸӹӺӻӼӽӾӿ",
  Monospaced:
    "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z a b c d e f g h i j k l m n o p q r s t u v w x y z 1 2 3 4 5 7 8 9 0 ( { [ . , ¡ ! ¿ ? * ] } ) / | \\ # $ € £ % @ & ¶ § ¢ † ‡ ° _ : = ; + − - × ÷ ' ‘ ’ \" “ ”	< > ≤ ± ≥ « ‹ © ® › »	˜ ˙ ¯ ¨ ˝ ´ ` ˆ ˇ ˘ ˚ ¸ ˛",
};

export type GlyphSetName = keyof typeof GLYPH_SETS;
