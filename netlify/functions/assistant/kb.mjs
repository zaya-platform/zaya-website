// ZAYA Website Assistant — the curated knowledge layers (CR-027 / ADR-024).
//
// SINGLE SOURCE OF TRUTH: every string here is derived from the APPROVED
// website content (src/content/data/faq.json, pricing.json, home.json,
// contact.json and the page copy). The assistant may ground in NOTHING else —
// no web search, no model world-knowledge presented as ZAYA facts.
//
// HONESTY TAGS (binding): status live | launching | roadmap. Roadmap items
// (delivery, diaspora basket, rides, schools, smart tools) are ALWAYS "on the
// roadmap / coming", never "available". No invented prices/dates/features.
//
// LANGUAGES (founder ruling W-D5): en/am/om/ti are served from THESE
// human-curated layers only; novel model generation is ENGLISH-ONLY.
// ⚠ The am/om/ti strings are DRAFT-UNVERIFIED (the standing localization
// rule): native-speaker review is a precondition of the PUBLIC launch
// (W-D4b) — acceptable for the founder-access preview, where the founder
// himself is the reviewer.

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
// Each entry: id · status (live|launching|roadmap|fact) · keywords (matched
// against the normalized question; en keywords match all locales since users
// mix languages) · answers per locale (missing locale -> en answer is NOT
// substituted for am/om/ti — the handoff is, keeping W-D5 clean).
export const ENTRIES = [
  {
    id: 'what-is-zaya',
    status: 'fact',
    keywords: ['what is zaya', 'about zaya', 'zaya', 'super app', 'platform', 'ዛያ', 'ምንድን', 'እንታይ', 'maali'],
    answers: {
      en: "ZAYA is Ethiopia's local-commerce platform — connecting shops, customers and diaspora families in one intelligent app. Everything near you.",
      am: 'ዛያ የኢትዮጵያ የአካባቢ ንግድ መድረክ ነው — ሱቆችን፣ ደንበኞችንና የዲያስፖራ ቤተሰቦችን በአንድ አፕ የሚያገናኝ። ሁሉም ነገር በአቅራቢያዎ።',
      om: "ZAYA waltajjii daldala naannoo Itoophiyaa ti — suuqota, maamiltoota fi maatii diyaaspooraa appii tokko keessatti wal qunnamsiisa.",
      ti: 'ዛያ ናይ ኢትዮጵያ መድረኽ ንግዲ ከባቢ እዩ — ድኳናት፣ ዓማዊልን ስድራቤታት ዲያስፖራን ኣብ ሓደ ኣፕ ዘራኽብ።',
    },
  },
  {
    id: 'is-zaya-live',
    status: 'live',
    keywords: ['live', 'launched', 'available now', 'working', 'pilot', 'started', 'use it now', 'ተጀምሯል', 'jalqabame'],
    answers: {
      en: 'Yes, in the pilot: merchants run sales, stock and the credit book, plus the supermarket dashboard. The customer app is launching; delivery, smart tools and the diaspora basket are on the roadmap — coming, not available yet.',
      am: 'አዎ፣ በሙከራው (ፓይለት)፦ ነጋዴዎች ሽያጭ፣ ክምችትና የብድር ደብተር ይመዘግባሉ። የደንበኛ አፕ በመጀመር ላይ ነው፤ ማድረስ (ዴሊቨሪ) እና ሌሎች አገልግሎቶች በእቅድ ላይ ናቸው — ገና አልተጀመሩም።',
      om: "Eeyyee, piilotii keessatti: daldaltoonni gurgurtaa, kuusaa fi galmee liqii galmeessu. Appiin maamilaa jalqabaa jira; geejjibni (delivery) fi tajaajilonni biroo karoora irra jiru — amma hin jiran.",
      ti: 'እወ፣ ኣብቲ ፓይለት፦ ነጋዶ መሸጣ፣ ክምችትን መዝገብ ልቓሕን ይምዝግቡ። ናይ ዓሚል ኣፕ ይጅምር ኣሎ፤ ምብጻሕ (ዴሊቨሪ) ኣብ መደብ እዩ — ገና ኣይተጀመረን።',
    },
  },
  {
    id: 'pricing',
    status: 'fact',
    keywords: ['price', 'cost', 'pricing', 'plan', 'fee', 'pay', 'birr', 'etb', 'how much', 'subscription', 'ዋጋ', 'ክፍያ', 'gatii', 'kaffaltii'],
    answers: {
      en: 'Customers use ZAYA free, always. Merchant plans: Free (0 ETB, forever — sales, stock, credit book, one phone), Starter (199 ETB/month), Pro (299 ETB/month) and Premium Max (from 999 ETB/month, per branch, for supermarkets/multi-branch). Roughly 5% off on 6-month and 10% off on annual plans. No hidden fees.',
      am: 'ደንበኞች ዛያን ሁልጊዜ በነጻ ይጠቀማሉ። የነጋዴ እቅዶች፦ ነጻ (0 ብር)፣ Starter (199 ብር/ወር)፣ Pro (299 ብር/ወር)፣ Premium Max (ከ999 ብር/ወር ጀምሮ፣ በቅርንጫፍ)። የ6 ወርና የዓመት እቅዶች ቅናሽ አላቸው። የተደበቀ ክፍያ የለም።',
      om: "Maamiltoonni ZAYA yeroo hunda bilisaan fayyadamu. Karoorri daldaltootaa: Bilisa (0 ETB), Starter (199 ETB/ji'a), Pro (299 ETB/ji'a), Premium Max (999 ETB/ji'a irraa eegalee, damee tokkoon). Kaffaltiin dhokataan hin jiru.",
      ti: 'ዓማዊል ዛያ ኩሉ ግዜ ብነጻ ይጥቀሙ። መደባት ነጋዶ፦ ነጻ (0 ብር)፣ Starter (199 ብር/ወርሒ)፣ Pro (299 ብር/ወርሒ)፣ Premium Max (ካብ 999 ብር/ወርሒ ጀሚሩ፣ ብጨንፈር)። ሕቡእ ክፍሊት የለን።',
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
    status: 'roadmap',
    keywords: ['diaspora', 'money transfer', 'send money', 'remittance', 'family', 'abroad', 'basket', 'ገንዘብ መላክ', 'maallaqa erguu'],
    answers: {
      en: 'ZAYA is NOT a money-transfer service. The diaspora basket — on the roadmap, not yet available — will let you order real goods for your family from a local shop, delivered with proof. No cash is sent.',
      am: 'ዛያ የገንዘብ ማስተላለፊያ አገልግሎት አይደለም። የዲያስፖራ ቅርጫት — በእቅድ ላይ ያለ፣ ገና ያልተጀመረ — ለቤተሰብዎ እውነተኛ እቃዎችን ከአካባቢ ሱቅ እንዲያዙ ያስችላል።',
      om: "ZAYA tajaajila maallaqa erguu MITI. Kuusaan diyaaspooraa — karoora irra kan jiru, amma hin jiru — maatii keessaniif meeshaalee dhugaa suuqii naannoo irraa ajajuu isin dandeessisa.",
      ti: 'ዛያ ኣገልግሎት ምስዳድ ገንዘብ ኣይኮነን። ናይ ዲያስፖራ ዘንቢል — ኣብ መደብ ዘሎ፣ ገና ዘይተጀመረ — ንስድራኹም ካብ ከባቢ ድኳን ኣቑሑ ክትእዝዙ የኽእለኩም።',
    },
  },
  {
    id: 'join-pilot',
    status: 'live',
    keywords: ['join', 'sign up', 'register', 'merchant', 'shop owner', 'pilot area', 'nifas silk', 'lafto', 'jemo', 'haile garment', 'become', 'how do i', 'መቀላቀል', 'መመዝገብ', 'galmaa\'uu'],
    answers: {
      en: 'Shop owners in Nifas Silk Lafto (Addis Ababa) can join the pilot now. Reach the team through the contact section below — they will get you set up.',
      am: 'በንፋስ ስልክ ላፍቶ (አዲስ አበባ) ያሉ የሱቅ ባለቤቶች አሁን ሙከራውን መቀላቀል ይችላሉ። ከታች ባለው የመገናኛ ክፍል በኩል ቡድኑን ያግኙ።',
      om: "Abbootiin suuqii Nifas Silk Lafto (Finfinnee) keessa jiran amma piilotii seenuun ni danda'u. Kutaa qunnamtii gadii tiin garee keenya qunnamaa.",
      ti: 'ኣብ ንፋስ ስልክ ላፍቶ (ኣዲስ ኣበባ) ዘለዉ ወነንቲ ድኳን ሕጂ ነቲ ፓይለት ክጽንበሩ ይኽእሉ። በቲ ክፍሊ ርክብ ርኸቡና።',
    },
  },
  {
    id: 'delivery',
    status: 'roadmap',
    keywords: ['delivery', 'deliver', 'rider', 'shipping', 'order online', 'bring', 'ማድረስ', 'ዴሊቨሪ', 'geejjiba'],
    answers: {
      en: 'Delivery is on the roadmap — coming with the customer app, not available yet. In the pilot, merchants run their business on ZAYA today; ordering and shop-managed delivery arrive next.',
      am: 'ማድረስ (ዴሊቨሪ) በእቅድ ላይ ነው — ከደንበኛ አፕ ጋር ይመጣል፣ ገና አልተጀመረም።',
      om: 'Geejjibni (delivery) karoora irra jira — appii maamilaa waliin dhufa, amma hin jiru.',
      ti: 'ምብጻሕ (ዴሊቨሪ) ኣብ መደብ እዩ — ምስ ናይ ዓሚል ኣፕ ይመጽእ፣ ገና ኣይተጀመረን።',
    },
  },
  {
    id: 'smart-tools',
    status: 'roadmap',
    keywords: ['ai', 'smart', 'voice', 'recommendation', 'artificial intelligence', 'assistant features'],
    answers: {
      en: "Smart tools (like voice features and recommendations) are on ZAYA's roadmap — not available in the pilot. Today's pilot is the essentials done well: sales, stock, credit book and the dashboard.",
      am: 'ብልጥ መሣሪያዎች በእቅድ ላይ ናቸው — በሙከራው ውስጥ ገና የሉም። የዛሬው ሙከራ መሠረታዊዎቹ ናቸው፦ ሽያጭ፣ ክምችት፣ የብድር ደብተር።',
      om: "Meeshaaleen ismaartii karoora ZAYA irra jiru — piilotii keessa amma hin jiran.",
      ti: 'ብልሓታዊ መሳርሒታት ኣብ መደብ እዮም — ኣብቲ ፓይለት ገና የለዉን።',
    },
  },
  {
    id: 'other-verticals',
    status: 'roadmap',
    keywords: ['ride', 'taxi', 'school', 'cctv', 'checkout', 'transport', 'expansion', 'other services'],
    answers: {
      en: 'Ideas like rides or school services are registered future explorations only — nothing beyond local commerce is offered or promised today. The pilot focus is shops and their customers.',
      am: 'እንደ መጓጓዣ ያሉ ሀሳቦች ለወደፊት የተመዘገቡ ብቻ ናቸው — ዛሬ ከአካባቢ ንግድ ውጭ ምንም አገልግሎት የለም።',
      om: "Yaadonni akka geejjibaa gara fuulduraatiif galmaa'an qofa — har'a tajaajilli daldala naannoo ala hin jiru.",
      ti: 'ከም መጓዓዝያ ዝኣመሰሉ ሓሳባት ንመጻኢ ዝተመዝገቡ ጥራይ እዮም — ሎሚ ካብ ንግዲ ከባቢ ወጻኢ ኣገልግሎት የለን።',
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
    status: 'live',
    keywords: ['features', 'sales', 'stock', 'inventory', 'credit book', 'dashboard', 'record', 'what can', 'ደብተር', 'ሽያጭ', 'gurgurtaa'],
    answers: {
      en: 'In the pilot today, a merchant on ZAYA records every sale, tracks stock, keeps a simple credit book, and (on bigger plans) gets low-stock alerts, daily summaries, barcode scan and a live supermarket dashboard.',
      am: 'ዛሬ በሙከራው፣ ነጋዴ በዛያ እያንዳንዱን ሽያጭ ይመዘግባል፣ ክምችት ይከታተላል፣ ቀላል የብድር ደብተር ይይዛል።',
      om: "Har'a piilotii keessatti, daldalaan ZAYA irratti gurgurtaa hunda galmeessa, kuusaa hordofa, galmee liqii salphaa qabata.",
      ti: 'ሎሚ ኣብቲ ፓይለት፣ ነጋዳይ ኣብ ዛያ ነፍሲ ወከፍ መሸጣ ይምዝግብ፣ ክምችት ይከታተል፣ ቀሊል መዝገብ ልቓሕ ይሕዝ።',
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
  'ዛያ', 'ሱቅ', 'ነጋዴ', 'ሽያጭ', 'ዋጋ', 'suuqii', 'daldala', 'gatii', 'ድኳን', 'ንግድ',
];
