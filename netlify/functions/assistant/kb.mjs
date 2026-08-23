// ZAYA Website Assistant — the curated knowledge layers (CR-027 / ADR-024).
//
// SINGLE SOURCE OF TRUTH: every string here is derived from the APPROVED
// website content (src/content/data/faq.json, pricing.json, home.json,
// contact.json and the page copy). The assistant may ground in NOTHING else —
// no web search, no model world-knowledge presented as ZAYA facts.
//
// HONESTY TAGS (binding) — ONE LABELLING AXIS, the estate's ratified
// vocabulary (EXEC-DASHBOARD: BUILT != DEPLOYED != LIVE):
//
//   status: 'planned' | 'built' | 'pilot' | 'live' | 'fact'
//   public wording, used verbatim and uniformly:
//     planned -> "Planned"
//     built   -> "Built — in device testing"
//     pilot   -> "In pilot"
//     live    -> "Live"
//
// TRUE STATE TODAY (2026-08-23): merchant tools, customer browse/order, and the
// delivery + COD settlement machine are ALL 'built' — the same rung, no rung
// higher. Barcode scanning, sorting by the user's location, and the diaspora
// basket are 'planned'. NOTHING is 'pilot' and NOTHING is 'live'.
//
// P1a FIX (2026-08-23): this file previously stated unbuilt and unshipped
// capabilities in the PRESENT TENSE — "Yes, in the pilot: merchants run sales,
// stock and the credit book", "a merchant on ZAYA records every sale" — while
// its own header above forbids exactly that. It also had delivery filed as
// 'roadmap' when delivery is one of the things that IS built. Both are
// corrected here.
//
// LANGUAGES (founder ruling W-D5): en/am/om/ti are served from THESE
// human-curated layers only; novel model generation is ENGLISH-ONLY.
// ⚠ The am/om/ti strings are DRAFT-UNVERIFIED (the standing localization
// rule): native-speaker review is a precondition of the PUBLIC launch
// (W-D4b) — acceptable for the founder-access preview, where the founder
// himself is the reviewer. The 2026-08-23 honesty corrections below touched
// am/om/ti as well and are DRAFT-UNVERIFIED on the same terms.

export const LOCALES = ['en', 'am', 'om', 'ti'];

// ── Fixed UI/system strings per locale ──────────────────────────────────────
export const STRINGS = {
  en: {
    greeting:
      "Hello! I'm the ZAYA assistant. Ask me about ZAYA, the pilot, merchant plans or how to join. Please don't include personal details like phone numbers.",
    handoff:
      'I don\'t want to guess on that one — the team can answer properly. Please reach them through the contact section below (or the form on the home page) and they\'ll get back to you.',
    offTopic:
      "I can only help with questions about ZAYA and local commerce. For anything about ZAYA — the pilot, plans, or joining — I'm all yours!",
    rateLimited: 'A little too fast for me — please wait a moment and try again.',
    thanks: "You're welcome! Anything else about ZAYA I can help with?",
    aiDark:
      "I answered what I could from ZAYA's published information. For this one, please contact the team via the contact section — they'll answer properly.",
  },
  am: {
    greeting:
      'ሰላም! የዛያ ረዳት ነኝ። ስለ ዛያ፣ ስለ ሙከራው (ፓይለት) ወይም ስለ ነጋዴ እቅዶች ይጠይቁኝ። እባክዎ እንደ ስልክ ቁጥር ያሉ የግል መረጃዎችን አያካትቱ።',
    handoff: 'በዚህ ጥያቄ ላይ መገመት አልፈልግም — ቡድኑ በትክክል ይመልስልዎታል። እባክዎ ከታች ባለው የመገናኛ ክፍል በኩል ያግኙን።',
    offTopic: 'ስለ ዛያ እና የአካባቢ ንግድ ጥያቄዎች ብቻ መርዳት እችላለሁ።',
    rateLimited: 'ትንሽ ቆይተው እንደገና ይሞክሩ።',
    thanks: 'እንኳን ደስ አለዎት! ስለ ዛያ ሌላ ጥያቄ አለዎት?',
    aiDark: 'ከዛያ የታተመ መረጃ የቻልኩትን መለስኩ። ለዚህ ጥያቄ እባክዎ ቡድኑን በመገናኛ ክፍሉ ያግኙ።',
  },
  om: {
    greeting:
      "Akkam! Ani gargaaraa ZAYA ti. Waa'ee ZAYA, piilotii ykn karoora daldalaa na gaafadhaa. Odeeffannoo dhuunfaa akka lakkoofsa bilbilaa hin galchinaa.",
    handoff: "Gaaffii kana irratti tilmaamuu hin barbaadu — gareen sirriitti siif deebisa. Kutaa qunnamtii gadii tiin nu qunnamaa.",
    offTopic: "Gaaffilee waa'ee ZAYA fi daldala naannoo qofa gargaaruu nan danda'a.",
    rateLimited: 'Xiqqoo turtee irra deebi\'ii yaali.',
    thanks: 'Baga gammadde! Gaaffii biraa qabdaa?',
    aiDark: 'Odeeffannoo ZAYA maxxanfame irraa kanan danda\'e deebise. Kanaaf garee keenya kutaa qunnamtii tiin qunnamaa.',
  },
  ti: {
    greeting:
      'ሰላም! ናይ ዛያ ሓጋዚ እየ። ብዛዕባ ዛያ፣ እቲ ፓይለት ወይ መደባት ነጋዶ ሕተቱኒ። በጃኹም ከም ቁጽሪ ተሌፎን ዝኣመሰለ ውልቃዊ ሓበሬታ ኣይተእትዉ።',
    handoff: 'ኣብዚ ሕቶ ምግማት ኣይደልን — እቲ ጋንታ ብትኽክል ክምልሰልኩም እዩ። በጃኹም በቲ ኣብ ታሕቲ ዘሎ ክፍሊ ርክብ ርኸቡና።',
    offTopic: 'ብዛዕባ ዛያን ናይ ከባቢ ንግድን ሕቶታት ጥራይ ክሕግዝ እኽእል።',
    rateLimited: 'ቁሩብ ጸኒሕኩም ደጊምኩም ፈትኑ።',
    thanks: 'ገለ ካልእ ብዛዕባ ዛያ ክሕግዘኩም ዝኽእል ኣሎ ድዩ?',
    aiDark: 'ካብ ናይ ዛያ ዝተሓትመ ሓበሬታ ዝኸኣልክዎ መሊሰ። ነዚ ሕቶ በጃኹም ነቲ ጋንታ በቲ ክፍሊ ርክብ ርኸብዎ።',
  },
};

// ── FAQ + KB entries ─────────────────────────────────────────────────────────
// Each entry: id · status (planned|built|pilot|live|fact) · keywords (matched
// against the normalized question; en keywords match all locales since users
// mix languages) · answers per locale (missing locale -> en answer is NOT
// substituted for am/om/ti — the handoff is, keeping W-D5 clean).
export const ENTRIES = [
  {
    id: 'what-is-zaya',
    status: 'fact',
    keywords: ['what is zaya', 'about zaya', 'zaya', 'super app', 'platform', 'ዛያ', 'ምንድን', 'እንታይ', 'maali'],
    answers: {
      en: "ZAYA is Ethiopia's local-commerce platform — connecting neighbourhood shops and their customers in one app, with support for diaspora families planned. Everything near you.",
      am: 'ዛያ የኢትዮጵያ የአካባቢ ንግድ መድረክ ነው — ሱቆችንና ደንበኞችን በአንድ አፕ የሚያገናኝ፤ ለዲያስፖራ ቤተሰቦች ያለው ድጋፍ በእቅድ ላይ ነው። ሁሉም ነገር በአቅራቢያዎ።',
      om: "ZAYA waltajjii daldala naannoo Itoophiyaa ti — suuqota fi maamiltoota appii tokko keessatti wal qunnamsiisa; deeggarsi maatii diyaaspooraa karoora irra jira.",
      ti: 'ዛያ ናይ ኢትዮጵያ መድረኽ ንግዲ ከባቢ እዩ — ድኳናትን ዓማዊልን ኣብ ሓደ ኣፕ ዘራኽብ፤ ንስድራቤታት ዲያስፖራ ዝወሃብ ደገፍ ኣብ መደብ እዩ።',
    },
  },
  {
    id: 'is-zaya-live',
    status: 'built',
    keywords: ['live', 'launched', 'available now', 'working', 'pilot', 'started', 'use it now', 'ተጀምሯል', 'jalqabame'],
    answers: {
      en: 'No — not yet, and we label this on one axis: Planned, Built — in device testing, In pilot, Live. The merchant tools, customer browse and ordering, and delivery with cash-on-delivery settlement are all BUILT and in device testing. Nothing is in pilot and nothing is live: no shop is running on ZAYA yet and there is nothing to download.',
      am: 'ገና አይደለም። አንድ የመለያ መስመር እንጠቀማለን፦ በእቅድ ላይ፣ ተገንብቷል — በመሣሪያዎች ላይ በሙከራ ላይ፣ በሙከራው (ፓይለት) ውስጥ፣ በሥራ ላይ። የነጋዴ መሣሪያዎች፣ የደንበኛ ማሰስና ማዘዝ፣ እንዲሁም ማድረስ (ዴሊቨሪ) ከጥሬ ገንዘብ ክፍያ ማወራረድ ጋር — ሁሉም ተገንብተዋል፤ አሁን በመሣሪያዎች ላይ በሙከራ ላይ ናቸው። ገና ማንም ሱቅ በዛያ ላይ አይሠራም።',
      om: "Lakki, ammatti miti. Sarara mallattoo tokko fayyadamna: Karoora irra, Ijaarameera — meeshaalee irratti qorannoo irra, Piilotii keessa, Hojii irra. Meeshaaleen daldalaa, sakatta'uu fi ajajuun maamilaa, akkasumas geejjibni kaffaltii harkaa waliin — hundi isaanii ijaaramaniiru, amma meeshaalee irratti qoratamaa jiru. Suuqiin tokko iyyuu ZAYA irratti hin hojjetu.",
      ti: 'ኖ፣ ገና ኣይኮነን። ሓደ መስመር ምልክት ንጥቀም፦ ኣብ መደብ፣ ተሰሪሑ — ኣብ መሳርሒታት ይፍተን ኣሎ፣ ኣብ ፓይለት፣ ኣብ ስራሕ። መሳርሒታት ነጋዶ፣ ምድላይን ምእዛዝን ዓሚል፣ ከምኡውን ምብጻሕ ምስ ምውራድ ገንዘብ ኢድ — ኩሎም ተሰሪሖም፣ ሕጂ ኣብ መሳርሒታት ይፍተኑ ኣለዉ። ገና ሓንቲ ድኳን እውን ብዛያ ኣይትሰርሕን።',
    },
  },
  {
    id: 'pricing',
    status: 'fact',
    keywords: ['price', 'cost', 'pricing', 'plan', 'fee', 'pay', 'birr', 'etb', 'how much', 'subscription', 'ዋጋ', 'ክፍያ', 'gatii', 'kaffaltii'],
    answers: {
      en: 'Customers use ZAYA free, always. Merchants start on the Free plan — Free — 0 ETB — forever (record every sale, track your stock, simple credit book, works on one phone). Paid plans for larger shops, published when billing opens. Nothing paid is on sale today and no price is being quoted; when they are published, 6-month and annual terms will save about 5% and about 10%. No hidden fees.',
      am: 'ደንበኞች ዛያን ሁልጊዜ በነጻ ይጠቀማሉ። ነጋዴዎች በነጻው እቅድ ይጀምራሉ — ነጻ — 0 ብር — ለዘላለም (እያንዳንዱን ሽያጭ መመዝገብ፣ ክምችት መከታተል፣ ቀላል የብድር ደብተር፣ በአንድ ስልክ ይሠራል)። ለትላልቅ ሱቆች የሚከፈልባቸው እቅዶች ክፍያ ሲጀመር ይታተማሉ፤ ዛሬ የሚሸጥ የክፍያ እቅድ የለም ዋጋም አልተጠቀሰም። ሲታተሙ የ6 ወርና የዓመት ክፍያዎች ወደ 5% እና ወደ 10% ገደማ ይቆጥባሉ። የተደበቀ ክፍያ የለም።',
      om: "Maamiltoonni ZAYA yeroo hunda bilisaan fayyadamu. Daldaltoonni karoora bilisaatiin jalqabu — Bilisa — 0 ETB — bara baraan (gurgurtaa hunda galmeessuu, kuusaa hordofuu, galmee liqii salphaa, bilbila tokkoon hojjeta). Karoorri kaffaltii suuqota gurguddaaf yeroo kaffaltiin banamu ni maxxanfama; har'a karoorri kaffaltii gurguramu hin jiru, gatiinis hin himamne. Yeroo maxxanfaman, waliigalteen ji'a 6 fi waggaa gara 5% fi gara 10% ni qusata. Kaffaltiin dhokataan hin jiru.",
      ti: 'ዓማዊል ዛያ ኩሉ ግዜ ብነጻ ይጥቀሙ። ነጋዶ ብናይ ነጻ መደብ ይጅምሩ — ነጻ — 0 ብር — ንዘልኣለም (ነፍሲ ወከፍ መሸጣ ምምዝጋብ፣ ክምችት ምክትታል፣ ቀሊል መዝገብ ልቓሕ፣ ብሓደ ተሌፎን ይሰርሕ)። ንዓበይቲ ድኳናት ዝኸፍሉ መደባት ክፍሊት ምስ ተኸፍተ ክሕተሙ እዮም፤ ሎሚ ዝሽየጥ ናይ ክፍሊት መደብ የለን ዋጋ እውን ኣይተጠቕሰን። ምስ ተሓትሙ፣ ናይ 6 ወርሕን ናይ ዓመትን ክፍሊት ኣስታት 5% ከምኡውን ኣስታት 10% ክቑጥቡ እዮም። ሕቡእ ክፍሊት የለን።',
    },
  },
  {
    id: 'languages',
    status: 'fact',
    keywords: ['language', 'amharic', 'oromo', 'tigrinya', 'english', 'afaan', 'ቋንቋ', 'afaan oromoo', 'qooqa'],
    answers: {
      en: 'The ZAYA app supports Amharic, Afaan Oromoo, Tigrinya and English. This website is in English for now; the other languages are planned for a later phase.',
      am: 'የዛያ አፕ አማርኛ፣ አፋን ኦሮሞ፣ ትግርኛና እንግሊዝኛ ይደግፋል። ይህ ድህረ ገጽ ለጊዜው በእንግሊዝኛ ነው።',
      om: 'Appiin ZAYA Afaan Amaaraa, Afaan Oromoo, Tigriinyaa fi Ingiliffaa ni deeggara.',
      ti: 'ናይ ዛያ ኣፕ ኣምሓርኛ፣ ኦሮምኛ፣ ትግርኛን እንግሊዝኛን ይድግፍ።',
    },
  },
  {
    id: 'diaspora',
    status: 'planned',
    keywords: ['diaspora', 'money transfer', 'send money', 'remittance', 'family', 'abroad', 'basket', 'ገንዘብ መላክ', 'maallaqa erguu'],
    answers: {
      en: 'ZAYA is NOT a money-transfer service. The diaspora basket is PLANNED — none of it is built — and would let you order real goods for your family from a local shop, delivered with proof. No cash is sent.',
      am: 'ዛያ የገንዘብ ማስተላለፊያ አገልግሎት አይደለም። የዲያስፖራ ቅርጫት በእቅድ ላይ ነው — ገና ምንም አልተገነባም — ለቤተሰብዎ እውነተኛ እቃዎችን ከአካባቢ ሱቅ እንዲያዙ ያስችላል።',
      om: "ZAYA tajaajila maallaqa erguu MITI. Kuusaan diyaaspooraa KAROORA irra jira — homtuu hin ijaaramne — maatii keessaniif meeshaalee dhugaa suuqii naannoo irraa ajajuu isin dandeessisa.",
      ti: 'ዛያ ኣገልግሎት ምስዳድ ገንዘብ ኣይኮነን። ናይ ዲያስፖራ ዘንቢል ኣብ መደብ እዩ — ገና ሓንቲ እውን ኣይተሰርሐን — ንስድራኹም ካብ ከባቢ ድኳን ኣቑሑ ክትእዝዙ የኽእለኩም።',
    },
  },
  {
    id: 'join-pilot',
    status: 'fact',
    keywords: ['join', 'sign up', 'register', 'merchant', 'shop owner', 'pilot area', 'nifas silk', 'lafto', 'jemo', 'haile garment', 'become', 'how do i', 'መቀላቀል', 'መመዝገብ', 'galmaa\'uu'],
    answers: {
      en: 'The merchant pilot is OPENING in Nifas Silk Lafto (Addis Ababa) — it has not started, and no shop is on ZAYA yet. Shop owners there can request early access through the contact section below, and the team will be in touch before it starts.',
      am: 'የነጋዴ ሙከራው (ፓይለት) በንፋስ ስልክ ላፍቶ (አዲስ አበባ) ሊጀመር ነው — ገና አልተጀመረም፣ ማንም ሱቅ በዛያ ላይ የለም። እዚያ ያሉ የሱቅ ባለቤቶች ከታች ባለው የመገናኛ ክፍል በኩል ቀድመው መጠየቅ ይችላሉ።',
      om: "Piilotiin daldaltootaa Nifas Silk Lafto (Finfinnee) keessatti ni BANAMA — ammatti hin jalqabne, suuqiin tokko iyyuu ZAYA irra hin jiru. Abbootiin suuqii achi jiran kutaa qunnamtii gadii tiin duraan dursanii gaafachuu ni danda'u.",
      ti: 'ናይ ነጋዶ ፓይለት ኣብ ንፋስ ስልክ ላፍቶ (ኣዲስ ኣበባ) ክኽፈት እዩ — ገና ኣይተጀመረን፣ ሓንቲ ድኳን እውን ኣብ ዛያ የላን። ኣብኡ ዘለዉ ወነንቲ ድኳን በቲ ኣብ ታሕቲ ዘሎ ክፍሊ ርክብ ኣቐዲሞም ክሓቱ ይኽእሉ።',
    },
  },
  {
    id: 'delivery',
    status: 'built',
    keywords: ['delivery', 'deliver', 'rider', 'shipping', 'order online', 'bring', 'cod', 'cash on delivery', 'settlement', 'ማድረስ', 'ዴሊቨሪ', 'geejjiba'],
    answers: {
      en: 'Delivery is BUILT and in device testing — not in pilot, not live. A confirmed order is assigned to the shop\'s own deliverer and delivered with the cash collected, or closed with an honest reason; each order settles exactly once, for the shop\'s own order total. Delivery is shop-managed — there is no ZAYA rider product.',
      am: 'ማድረስ (ዴሊቨሪ) ተገንብቷል — አሁን በመሣሪያዎች ላይ በሙከራ ላይ ነው፤ በሙከራው (ፓይለት) ውስጥም በሥራ ላይም አይደለም። የተረጋገጠ ትዕዛዝ ለሱቁ ራሱ አድራሽ ይሰጣል፣ ገንዘቡ ተሰብስቦ ይደርሳል፣ ወይም በግልጽ ምክንያት ይዘጋል፤ እያንዳንዱ ትዕዛዝ አንድ ጊዜ ብቻ ይወራረዳል። ማድረስ በሱቁ ይመራል — የዛያ አሽከርካሪ ምርት የለም።',
      om: "Geejjibni IJAARAMEERA, amma meeshaalee irratti qoratamaa jira — piilotii keessa hin jiru, hojii irras hin oolle. Ajajni mirkanaa'e nama geejjibaa suuqichaa mataasaatiif kennama, maallaqni funaanamee ni geeffama, yookaan sababii ifa ta'een ni cufama; ajajni tokko al tokko qofa ni xumurama. Geejjibni suuqichaan bulfama — oomishni konkolaachisaa ZAYA hin jiru.",
      ti: 'ምብጻሕ (ዴሊቨሪ) ተሰሪሑ — ሕጂ ኣብ መሳርሒታት ይፍተን ኣሎ፤ ኣብ ፓይለት እውን ኣብ ስራሕ እውን ኣይኮነን። ዝተረጋገጸ ትእዛዝ ናብ ናይታ ድኳን ኣብጻሒ ይምደብ፣ ገንዘብ ተኣኪቡ ይብጻሕ፣ ወይ ብቕኑዕ ምኽንያት ይዕጾ፤ ነፍሲ ወከፍ ትእዛዝ ሓንሳብ ጥራይ ይውዳእ። ምብጻሕ ብድኳን ይምራሕ — ናይ ዛያ ኣብጻሒ ፍርያት የለን።',
    },
  },
  {
    id: 'smart-tools',
    status: 'planned',
    keywords: ['ai', 'smart', 'voice', 'recommendation', 'artificial intelligence', 'assistant features', 'barcode'],
    answers: {
      en: "Smart tools — voice features, recommendations and barcode scanning — are PLANNED, not built. What is built and in device testing is the essentials: sales, stock, the credit book, browsing and ordering, and delivery with COD settlement.",
      am: 'ብልጥ መሣሪያዎች — ድምጽ፣ ምክረ ሐሳብና የባርኮድ ንባብ — በእቅድ ላይ ናቸው፤ ገና አልተገነቡም። የተገነቡትና በሙከራ ላይ ያሉት መሠረታዊዎቹ ናቸው፦ ሽያጭ፣ ክምችት፣ የብድር ደብተር፣ ማሰስና ማዘዝ፣ እንዲሁም ማድረስ።',
      om: "Meeshaaleen ismaartii — sagalee, gorsaa fi baarkoodii dubbisuu — KAROORA irra jiru, hin ijaaramne. Kan ijaarame fi qoratamaa jiru waan bu'uuraa ti: gurgurtaa, kuusaa, galmee liqii, sakatta'uu fi ajajuu, akkasumas geejjiba.",
      ti: 'ብልሓታዊ መሳርሒታት — ድምጺ፣ ለበዋን ባርኮድ ምንባብን — ኣብ መደብ እዮም፣ ኣይተሰርሑን። ዝተሰርሑን ዝፍተኑን ዘለዉ እቶም መሰረታውያን እዮም፦ መሸጣ፣ ክምችት፣ መዝገብ ልቓሕ፣ ምድላይን ምእዛዝን፣ ከምኡውን ምብጻሕ።',
    },
  },
  {
    id: 'other-verticals',
    status: 'planned',
    keywords: ['ride', 'taxi', 'school', 'cctv', 'checkout', 'transport', 'expansion', 'other services'],
    answers: {
      en: 'Ideas like rides or school services are registered future explorations only — nothing beyond local commerce is offered or promised today. The focus is shops and their customers.',
      am: 'እንደ መጓጓዣ ያሉ ሀሳቦች ለወደፊት የተመዘገቡ ብቻ ናቸው — ዛሬ ከአካባቢ ንግድ ውጭ ምንም አገልግሎት የለም።',
      om: "Yaadonni akka geejjibaa gara fuulduraatiif galmaa'an qofa — har'a tajaajilli daldala naannoo ala hin jiru.",
      ti: 'ከም መጓዓዝያ ዝኣመሰሉ ሓሳባት ንመጻኢ ዝተመዝገቡ ጥራይ እዮም — ሎሚ ካብ ንግዲ ከባቢ ወጻኢ ኣገልግሎት የለን።',
    },
  },
  {
    // R4 (2026-08-23): the honest answer to "does it find shops near me?".
    // Browse is AREA-anchored (an area the user picks, sent as a query
    // parameter); the platform holds no shop coordinates at all, so nothing can
    // be sorted by distance and the assistant must never imply otherwise.
    id: 'area-not-proximity',
    status: 'fact',
    keywords: ['near me', 'close to me', 'my location', 'gps', 'distance', 'how far', 'closest', 'area', 'neighbourhood', 'neighborhood', 'አካባቢ', 'naannoo', 'ከባቢ'],
    answers: {
      en: 'ZAYA works by AREA, not by your location. You choose your area and see the shops in it. ZAYA does not read your position and does not hold shop coordinates, so it never sorts shops by how far away they are — sorting by distance is planned, not built.',
      am: 'ዛያ በአካባቢ ይሠራል እንጂ በአካባቢዎ መገኛ (ሎኬሽን) አይደለም። አካባቢዎን ይመርጣሉ፣ በዚያ ውስጥ ያሉ ሱቆችን ያያሉ። ዛያ ያሉበትን ቦታ አያነብም፣ የሱቆችንም መጋጠሚያ አይይዝም፤ ስለዚህ በርቀት አያስቀምጥም — በርቀት መደርደር በእቅድ ላይ ነው።',
      om: "ZAYA NAANNOO irratti hundaa'ee hojjeta malee bakka ati jirtu irratti miti. Naannoo kee filattee suuqota achi jiran ilaalta. ZAYA bakka ati jirtu hin dubbisu, teessoo suuqiis hin qabu; kanaaf fageenyaan hin tartiibessu — fageenyaan tartiibessuun karoora irra jira.",
      ti: 'ዛያ ብኸባቢ እዩ ዝሰርሕ እምበር ብቦታኻ ኣይኮነን። ከባቢኻ ትመርጽ፣ ኣብኡ ዘለዋ ድኳናት ትርኢ። ዛያ ዘለኻዮ ቦታ ኣየንብብን፣ መወከሲ ቦታ ድኳናት እውን ኣይሕዝን፤ ስለዚ ብርሕቀት ኣይሰርዕን — ብርሕቀት ምስራዕ ኣብ መደብ እዩ።',
    },
  },
  {
    id: 'contact',
    status: 'fact',
    keywords: ['contact', 'phone', 'email', 'whatsapp', 'reach', 'talk to', 'human', 'team', 'support', 'help', 'መገናኛ', 'ማግኘት', 'qunnamtii'],
    answers: {
      en: 'You can reach the ZAYA team through the contact section at the bottom of this page — the form there goes straight to them (they reply about the pilot and never share your details).',
      am: 'የዛያን ቡድን በዚህ ገጽ ግርጌ ባለው የመገናኛ ክፍል ማግኘት ይችላሉ — እዚያ ያለው ቅጽ በቀጥታ ይደርሳቸዋል።',
      om: 'Garee ZAYA kutaa qunnamtii fuula kanaa gadii tiin qunnamuu dandeessu.',
      ti: 'ንጋንታ ዛያ በቲ ኣብ ታሕቲ ገጽ ዘሎ ክፍሊ ርክብ ክትረኽብዎም ትኽእሉ።',
    },
  },
  {
    id: 'merchant-features',
    status: 'built',
    keywords: ['features', 'sales', 'stock', 'inventory', 'credit book', 'dashboard', 'record', 'what can', 'ደብተር', 'ሽያጭ', 'gurgurtaa'],
    answers: {
      en: 'The merchant tools are BUILT and in device testing: record every sale, track stock, keep a simple credit book, take incoming orders, and assign a delivery and settle its cash once. No shop is running on them yet — nothing is in pilot or live.',
      am: 'የነጋዴ መሣሪያዎች ተገንብተዋል፤ አሁን በመሣሪያዎች ላይ በሙከራ ላይ ናቸው፦ እያንዳንዱን ሽያጭ መመዝገብ፣ ክምችት መከታተል፣ ቀላል የብድር ደብተር መያዝ፣ የሚገቡ ትዕዛዞችን መቀበል፣ ማድረስ መመደብና ገንዘቡን አንድ ጊዜ ማወራረድ። ገና ማንም ሱቅ በእነሱ ላይ አይሠራም።',
      om: "Meeshaaleen daldalaa IJAARAMANIIRU, amma meeshaalee irratti qoratamaa jiru: gurgurtaa hunda galmeessuu, kuusaa hordofuu, galmee liqii salphaa qabachuu, ajaja seenu fudhachuu, geejjiba ramaduu fi maallaqa isaa al tokko xumuruu. Suuqiin tokko iyyuu ammatti isaan irratti hin hojjetu.",
      ti: 'መሳርሒታት ነጋዶ ተሰሪሖም፣ ሕጂ ኣብ መሳርሒታት ይፍተኑ ኣለዉ፦ ነፍሲ ወከፍ መሸጣ ምምዝጋብ፣ ክምችት ምክትታል፣ ቀሊል መዝገብ ልቓሕ ምሓዝ፣ ዝኣትዉ ትእዛዛት ምቕባል፣ ምብጻሕ ምምዳብን ገንዘቡ ሓንሳብ ምውዳእን። ገና ሓንቲ ድኳን እውን ኣይትጥቀመሎምን።',
    },
  },
];

// ── Topic lexicon (the topic-lock): a message must touch ZAYA/local-commerce
// ground before the MODEL step may see it. Curated layers key off their own
// keywords, so this gate only protects the paid/model step + the deflection.
export const TOPIC_WORDS = [
  'zaya', 'shop', 'merchant', 'store', 'market', 'commerce', 'pilot', 'app',
  'price', 'plan', 'cost', 'customer', 'delivery', 'stock', 'credit', 'sale',
  'diaspora', 'ethiopia', 'addis', 'lafto', 'jemo', 'join', 'register', 'sign',
  'contact', 'language', 'amharic', 'oromo', 'tigrinya', 'birr', 'etb', 'dashboard',
  'supermarket', 'kiosk', 'rider', 'supplier', 'order', 'buy', 'sell',
  'area', 'location', 'distance', 'settlement',
  'ዛያ', 'ሱቅ', 'ነጋዴ', 'ሽያጭ', 'ዋጋ', 'suuqii', 'daldala', 'gatii', 'ድኳን', 'ንግድ',
];
