import React, { useState } from 'react';

const CPR_ICON = (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <circle cx="40" cy="40" r="38" fill="#FEE2E2" stroke="#DC2626" strokeWidth="2" />
    <rect x="35" y="20" width="10" height="40" rx="5" fill="#DC2626" />
    <rect x="20" y="35" width="40" height="10" rx="5" fill="#DC2626" />
  </svg>
);

const AED_ICON = (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <rect x="10" y="15" width="60" height="50" rx="8" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
    <path d="M32 55L40 25l8 30" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />
    <circle cx="40" cy="40" r="8" fill="#2563EB" />
    <path d="M37 40l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RECOVERY_ICON = (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <ellipse cx="40" cy="50" rx="28" ry="12" fill="#D1FAE5" stroke="#059669" strokeWidth="2" />
    <circle cx="40" cy="30" r="10" fill="#059669" />
    <path d="M20 45 Q40 35 60 45" stroke="#059669" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
);

const CHOKING_ICON = (
  <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
    <circle cx="40" cy="25" r="12" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
    <path d="M28 42 Q40 38 52 42 L55 65 Q40 70 25 65 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
    <path d="M33 52 Q40 48 47 52" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <path d="M35 58 Q40 55 45 58" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);

const topics = [
  {
    id: 'cpr-adult',
    icon: CPR_ICON,
    color: 'red',
    title: 'CPR – Adult',
    urduTitle: 'بڑوں کی سی پی آر',
    summary: 'For unconscious adults not breathing normally',
    urduSummary: 'بے ہوش اور سانس نہ لینے والے بڑوں کے لیے',
    steps: [
      { en: 'Ensure the scene is safe. Call for help or ask someone to call 1122.', ur: 'محفوظ جگہ یقینی بنائیں۔ کسی کو 1122 کال کرنے کو کہیں۔' },
      { en: 'Lay the person on their back on a firm, flat surface.', ur: 'شخص کو سخت اور ہموار جگہ پر پیٹھ کے بل لٹائیں۔' },
      { en: 'Tilt the head back gently and lift the chin to open the airway.', ur: 'سر آہستہ سے پیچھے جھکائیں اور ٹھوڑی اٹھا کر ہوا کا راستہ کھولیں۔' },
      { en: 'Check for normal breathing for no more than 10 seconds.', ur: 'دس سیکنڈ سے کم وقت میں سانس چیک کریں۔' },
      { en: 'Place the heel of one hand on the center of the chest (lower half of breastbone).', ur: 'ایک ہاتھ کی ایڑی سینے کے بیچ میں (سینے کی ہڈی کے نچلے حصے پر) رکھیں۔' },
      { en: 'Place your other hand on top, interlace fingers, and keep them raised off the chest.', ur: 'دوسرا ہاتھ اوپر رکھیں، انگلیاں آپس میں ملائیں اور سینے سے اوپر رکھیں۔' },
      { en: 'Press down hard and fast: at least 5 cm deep, 100–120 compressions per minute.', ur: 'زور سے اور تیزی سے دبائیں: کم از کم 5 سینٹی میٹر، 100–120 فی منٹ۔' },
      { en: 'Allow full chest recoil between compressions without removing your hands.', ur: 'ہر دباؤ کے بعد سینے کو مکمل اوپر آنے دیں۔' },
      { en: 'If trained: give 2 rescue breaths after every 30 compressions (30:2 ratio).', ur: 'تربیت یافتہ ہوں تو: ہر 30 دباؤ پر 2 مصنوعی سانس دیں (30:2)۔' },
      { en: 'Continue until the person recovers, help arrives, or you are physically unable.', ur: 'جاری رکھیں جب تک بہتری نہ ہو، مدد نہ آئے، یا آپ تھک نہ جائیں۔' },
    ],
    tip: 'Push to the beat of "Stayin\' Alive" (100–120 BPM). Compression-only CPR is still effective if you\'re not trained in rescue breaths.',
    urduTip: '"اسٹے الائیو" گانے کی تال پر دبائیں۔ صرف دباؤ والی سی پی آر بھی کارگر ہے۔',
  },
  {
    id: 'cpr-child',
    icon: CPR_ICON,
    color: 'orange',
    title: 'CPR – Child (1–8 years)',
    urduTitle: 'بچوں کی سی پی آر (1–8 سال)',
    summary: 'Modified CPR technique for young children',
    urduSummary: 'چھوٹے بچوں کے لیے تبدیل شدہ طریقہ',
    steps: [
      { en: 'Call 1122 immediately. If alone with the child, perform 2 minutes of CPR first, then call.', ur: 'فوری 1122 کریں۔ اکیلے ہوں تو پہلے 2 منٹ سی پی آر کریں پھر کال کریں۔' },
      { en: 'Tilt the head back gently (less than adult) and lift the chin.', ur: 'سر آہستہ سے پیچھے جھکائیں (بڑوں سے کم) اور ٹھوڑی اٹھائیں۔' },
      { en: 'Use only ONE hand (heel of hand) or two fingers for compressions.', ur: 'صرف ایک ہاتھ کی ایڑی یا دو انگلیاں استعمال کریں۔' },
      { en: 'Press down about one-third the depth of the chest (approx. 5 cm).', ur: 'سینے کی گہرائی کا ایک تہائی (تقریباً 5 سینٹی میٹر) دبائیں۔' },
      { en: 'Give 30 compressions at 100–120 per minute, then 2 small rescue breaths.', ur: '100–120 فی منٹ کی رفتار سے 30 دباؤ، پھر 2 چھوٹے سانس۔' },
      { en: 'Cover the child\'s mouth AND nose when giving rescue breaths.', ur: 'مصنوعی سانس دیتے وقت بچے کے منہ اور ناک دونوں ڈھانپیں۔' },
      { en: 'Continue the 30:2 cycle until help arrives.', ur: '30:2 سلسلہ جاری رکھیں جب تک مدد نہ آئے۔' },
    ],
    tip: 'For infants under 1 year, use only 2 fingers and cover both mouth and nose.',
    urduTip: 'ایک سال سے کم بچوں کے لیے صرف 2 انگلیاں استعمال کریں اور منہ اور ناک دونوں ڈھانپیں۔',
  },
  {
    id: 'aed',
    icon: AED_ICON,
    color: 'blue',
    title: 'Using an AED',
    urduTitle: 'اے ای ڈی کا استعمال',
    summary: 'Automated External Defibrillator — shocks the heart back to rhythm',
    urduSummary: 'خودکار بیرونی ڈیفیبریلیٹر — دل کو واپس لائے',
    steps: [
      { en: 'Turn on the AED. Most turn on when you open the lid — it will talk you through the steps.', ur: 'اے ای ڈی آن کریں۔ ڈھکن کھولنے سے آن ہوتا ہے — یہ آپ کو ہدایات دے گا۔' },
      { en: 'Expose the person\'s bare chest. Dry it if wet.', ur: 'شخص کا سینہ ننگا کریں۔ گیلا ہو تو خشک کریں۔' },
      { en: 'Attach one pad to the upper right chest (below collarbone).', ur: 'ایک پیڈ دائیں سینے کے اوپری حصے پر (کالر بون کے نیچے) لگائیں۔' },
      { en: 'Attach the other pad to the lower left side of the chest (below and to the left of the heart).', ur: 'دوسرا پیڈ سینے کے بائیں نچلے حصے پر (دل کے نیچے بائیں طرف) لگائیں۔' },
      { en: 'Ensure no one is touching the person. Say "CLEAR!" loudly.', ur: 'یقینی بنائیں کوئی نہ چھوئے۔ بلند آواز سے "ہٹ جاؤ!" کہیں۔' },
      { en: 'Press the shock button when prompted by the AED.', ur: 'اے ای ڈی کے کہنے پر شاک بٹن دبائیں۔' },
      { en: 'Immediately resume CPR after the shock. The AED will tell you when to check again.', ur: 'شاک کے فوراً بعد سی پی آر شروع کریں۔ اے ای ڈی بتائے گا کب دوبارہ چیک کریں۔' },
    ],
    tip: 'Don\'t be afraid to use an AED — it will not shock a patient who does not need it.',
    urduTip: 'اے ای ڈی استعمال سے نہ ڈریں — یہ بغیر ضرورت کے شاک نہیں دے گا۔',
  },
  {
    id: 'recovery',
    icon: RECOVERY_ICON,
    color: 'green',
    title: 'Recovery Position',
    urduTitle: 'بحالی کی پوزیشن',
    summary: 'For unconscious but breathing persons',
    urduSummary: 'بے ہوش لیکن سانس لینے والوں کے لیے',
    steps: [
      { en: 'Check the person is breathing normally before placing in recovery position.', ur: 'ریکوری پوزیشن سے پہلے چیک کریں کہ سانس معمول کے مطابق ہے۔' },
      { en: 'Kneel beside the person and straighten both legs.', ur: 'شخص کے پاس گھٹنے ٹیکیں اور دونوں ٹانگیں سیدھی کریں۔' },
      { en: 'Place the arm nearest to you at right angles to the body, elbow bent, palm facing up.', ur: 'قریب والا بازو جسم سے سیدھا زاویے پر رکھیں، کہنی موڑیں، ہتھیلی اوپر۔' },
      { en: 'Bring the far hand to rest, back of hand against the nearest cheek.', ur: 'دور والا ہاتھ قریب والے گال کے ساتھ پشت لگا کر رکھیں۔' },
      { en: 'Pull up the far knee so the foot is flat on the ground.', ur: 'دور والا گھٹنا اوپر کھینچیں تاکہ پاؤں زمین پر سیدھا ہو۔' },
      { en: 'Roll the person onto their side, supporting the head.', ur: 'سر کو سہارا دیتے ہوئے شخص کو ایک طرف لٹائیں۔' },
      { en: 'Open the airway by tilting the head back and lifting the chin. Monitor breathing continuously.', ur: 'سر پیچھے جھکا کر اور ٹھوڑی اٹھا کر ہوا کا راستہ کھلا رکھیں۔ سانس پر نظر رکھیں۔' },
    ],
    tip: 'The recovery position prevents choking on vomit and keeps the airway open. Check every 30 minutes.',
    urduTip: 'ریکوری پوزیشن قے سے دم گھٹنے سے بچاتی ہے۔ ہر 30 منٹ بعد چیک کریں۔',
  },
  {
    id: 'choking',
    icon: CHOKING_ICON,
    color: 'yellow',
    title: 'Choking (Heimlich)',
    urduTitle: 'گلے میں کچھ پھنسنا (ہیملک)',
    summary: 'For conscious adults and children with severe airway obstruction',
    urduSummary: 'ہوشیار بڑوں اور بچوں میں شدید راستہ بندش',
    steps: [
      { en: 'Ask "Are you choking?" — if they cannot speak, cough, or breathe, act immediately.', ur: '"آپ کے گلے میں کچھ پھنسا ہے؟" — اگر بول، کھانسی، سانس نہیں لے سکتے تو فوری عمل کریں۔' },
      { en: 'Call 1122. Stand behind the person and lean them slightly forward.', ur: '1122 کریں۔ شخص کے پیچھے کھڑے ہوں اور اسے آگے جھکائیں۔' },
      { en: 'Give 5 firm back blows between the shoulder blades with the heel of your hand.', ur: 'کندھے کی ہڈیوں کے بیچ اپنے ہاتھ کی ایڑی سے 5 مضبوط ضربیں لگائیں۔' },
      { en: 'Check if the blockage has cleared after each back blow.', ur: 'ہر ضرب کے بعد دیکھیں کہ رکاوٹ دور ہوئی یا نہیں۔' },
      { en: 'If not cleared: stand behind them, wrap your arms around their waist.', ur: 'اگر نہ نکلے: پیچھے سے ان کی کمر کے گرد بازو لپیٹیں۔' },
      { en: 'Make a fist, place it thumb-side in, just above the navel and below the breastbone.', ur: 'مٹھی بنائیں، انگوٹھا اندر کی طرف، ناف کے اوپر اور سینے کی ہڈی کے نیچے رکھیں۔' },
      { en: 'Give 5 sharp inward and upward abdominal thrusts.', ur: 'اندر اور اوپر کی طرف 5 تیز دھکے لگائیں۔' },
      { en: 'Alternate 5 back blows and 5 abdominal thrusts until the object is expelled or they lose consciousness.', ur: '5 پیٹھ کی ضربیں اور 5 پیٹ کے دھکے باری باری تب تک کریں جب تک چیز نہ نکلے۔' },
      { en: 'If unconscious: begin CPR and look in the mouth for the object before giving breaths.', ur: 'بے ہوش ہو جائیں تو: سی پی آر شروع کریں اور سانس دینے سے پہلے منہ میں دیکھیں۔' },
    ],
    tip: 'For pregnant women or obese persons, use chest thrusts instead of abdominal thrusts.',
    urduTip: 'حاملہ خواتین یا موٹاپے والوں کے لیے پیٹ کے بجائے سینے کے دھکے لگائیں۔',
  },
];

const colorMap = {
  red: { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', stepBg: 'bg-red-100', stepText: 'text-red-700', tip: 'bg-red-50 border-red-200 text-red-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', stepBg: 'bg-orange-100', stepText: 'text-orange-700', tip: 'bg-orange-50 border-orange-200 text-orange-800' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', stepBg: 'bg-blue-100', stepText: 'text-blue-700', tip: 'bg-blue-50 border-blue-200 text-blue-800' },
  green: { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', stepBg: 'bg-green-100', stepText: 'text-green-700', tip: 'bg-green-50 border-green-200 text-green-800' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', stepBg: 'bg-yellow-100', stepText: 'text-yellow-800', tip: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
};

function TopicCard({ topic }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const c = colorMap[topic.color];

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} overflow-hidden`}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-4 flex items-center gap-4"
      >
        <div className="w-14 h-14 shrink-0">{topic.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-sm">{topic.title}</div>
          <div className="urdu text-gray-600 text-xs">{topic.urduTitle}</div>
          <div className="text-xs text-gray-500 mt-1 leading-tight">{topic.summary}</div>
        </div>
        <svg viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Language toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${lang === 'en' ? `${c.stepBg} ${c.stepText}` : 'bg-gray-100 text-gray-500'}`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ur')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${lang === 'ur' ? `${c.stepBg} ${c.stepText}` : 'bg-gray-100 text-gray-500'}`}
            >
              اردو
            </button>
            <button
              onClick={() => setLang('both')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${lang === 'both' ? `${c.stepBg} ${c.stepText}` : 'bg-gray-100 text-gray-500'}`}
            >
              Both
            </button>
          </div>

          {/* Steps */}
          <ol className="space-y-2">
            {topic.steps.map((step, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className={`shrink-0 w-6 h-6 rounded-full ${c.stepBg} ${c.stepText} flex items-center justify-center text-xs font-bold`}>
                  {i + 1}
                </span>
                <div className="text-xs text-gray-700 leading-relaxed flex-1">
                  {(lang === 'en' || lang === 'both') && <p>{step.en}</p>}
                  {(lang === 'ur' || lang === 'both') && <p className="urdu mt-0.5">{step.ur}</p>}
                </div>
              </li>
            ))}
          </ol>

          {/* Tip */}
          <div className={`rounded-xl border p-3 ${c.tip}`}>
            <div className="font-semibold text-xs mb-1">💡 Key Tip</div>
            {(lang === 'en' || lang === 'both') && <p className="text-xs">{topic.tip}</p>}
            {(lang === 'ur' || lang === 'both') && <p className="urdu text-xs mt-1">{topic.urduTip}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold">BLS Guide</h2>
        <p className="text-blue-200 text-sm mt-1">Basic Life Support — step by step</p>
        <p className="urdu text-blue-200 text-sm mt-1">بنیادی زندگی بچانے کی ہدایات</p>
      </div>

      {/* Emergency reminder */}
      <div className="flex gap-2">
        <a
          href="tel:1122"
          className="flex-1 bg-pakistan-green text-white rounded-xl p-3 flex items-center justify-center gap-2 font-bold text-sm"
        >
          📞 Call 1122
        </a>
        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              const msg = `🚨 EMERGENCY!\nhttps://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
            });
          }}
          className="flex-1 bg-[#25D366] text-white rounded-xl p-3 flex items-center justify-center gap-2 font-bold text-sm"
        >
          📲 Share Location
        </button>
      </div>

      {/* Chain of survival note */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <div className="font-semibold text-sm text-gray-800 mb-2">⛓️ Chain of Survival</div>
        <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap">
          {['Recognize', '→', 'Call 1122', '→', 'Early CPR', '→', 'AED', '→', 'Advanced Care'].map((item, i) => (
            <span key={i} className={item === '→' ? 'text-gray-300' : 'bg-white border border-gray-200 px-2 py-0.5 rounded-full font-medium'}>{item}</span>
          ))}
        </div>
        <p className="urdu text-xs text-gray-500 mt-2">ہر قدم اگلے سے جڑا ہوا ہے — جتنی جلدی اتنا بہتر</p>
      </div>

      {/* Topic cards */}
      <div className="space-y-3">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-100 rounded-xl p-3 text-xs text-gray-500 text-center">
        This guide is for educational purposes. Always seek professional medical help immediately.
        <br />
        <span className="urdu">یہ ہدایات تعلیمی مقاصد کے لیے ہیں۔ فوری طبی مدد ضرور حاصل کریں۔</span>
      </div>
    </div>
  );
}
