/**
 * Internationalization & Localization Utility
 * Supports English and Bengali (বাংলা) for farm workers in Unit-B
 */

const BN_DIGITS: Record<string, string> = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
  '.': '.',
  ',': ',',
  '-': '-',
  '+': '+',
  '%': '%',
};

export type Locale = 'en' | 'bn';

/**
 * Converts numbers or number strings to Bengali numerals if locale is 'bn'
 */
export function formatNumber(value: number | string | null | undefined, locale: Locale = 'en', decimals: number = 2): string {
  if (value === null || value === undefined || value === '') return '—';
  
  let formatted: string;
  if (typeof value === 'number') {
    formatted = Number.isInteger(value)
      ? value.toLocaleString('en-US')
      : value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: decimals });
  } else {
    formatted = String(value);
  }

  if (locale !== 'bn') return formatted;

  return formatted.replace(/[0-9]/g, (digit) => BN_DIGITS[digit] || digit);
}

/**
 * Formats a date string or Date object in EN or BN
 */
export function formatDate(dateInput: string | Date | null | undefined, locale: Locale = 'en'): string {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '—';

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  const formatted = `${year}-${month}-${day}`;
  if (locale === 'bn') {
    return formatted.replace(/[0-9]/g, (digit) => BN_DIGITS[digit] || digit);
  }
  return formatted;
}

export const DICTIONARY = {
  en: {
    appName: 'RBCL Flock Monitor',
    unit: 'Unit-B',
    dashboard: 'Dashboard',
    ledger: 'Weekly Ledger',
    newEntry: 'New Entry',
    flocks: 'Flocks',
    comparison: 'Comparison',
    import: 'Import Sheet',
    export: 'Export Reports',
    settings: 'Settings',
    female: 'Female',
    male: 'Male',
    total: 'Total',
    ageWeeks: 'Age (Weeks)',
    weekEndDate: 'Week End Date',
    housed: 'Housed',
    mortality: 'Mortality',
    sold: 'Sold / Culled',
    liveBirds: 'Live Birds',
    depletionPct: 'Depletion %',
    cumDepletionPct: 'Cum. Depletion %',
    mortalityPct: 'Mortality %',
    stdWeight: 'Std Wt (g)',
    actualWeight: 'Actual Wt (g)',
    weightDev: 'Dev (g)',
    uniformity: 'Uniformity %',
    feed: 'Feed (g/bird)',
    save: 'Save Record',
    saving: 'Saving...',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    locked: 'Locked by Role (Only last 2 weeks editable)',
    offline: 'Offline Mode (Dexie queue active)',
    online: 'Online',
  },
  bn: {
    appName: 'আরবিসিএল ফ্লক মনিটর',
    unit: 'ইউনিট-বি',
    dashboard: 'ড্যাশবোর্ড',
    ledger: 'সাপ্তাহিক লেজার',
    newEntry: 'নতুন এন্ট্রি',
    flocks: 'ফ্লকসমূহ',
    comparison: 'তুলনা',
    import: 'শিট ইমপোর্ট',
    export: 'রিপোর্ট এক্সপোর্ট',
    settings: 'সেটিংস',
    female: 'মাদি (Female)',
    male: 'মোরগ (Male)',
    total: 'মোট',
    ageWeeks: 'বয়স (সপ্তাহ)',
    weekEndDate: 'সপ্তাহ শেষের তারিখ',
    housed: 'হাউজড পাখি',
    mortality: 'মৃত্যু (Mortality)',
    sold: 'বিক্রয় / ছাঁটাই',
    liveBirds: 'জীবিত পাখি',
    depletionPct: 'ডিপ্লিশন %',
    cumDepletionPct: 'ক্রমপুঞ্জিত ডিপ্লিশন %',
    mortalityPct: 'মৃত্যুহার %',
    stdWeight: 'স্ট্যান্ডার্ড ওজন (গ্রাম)',
    actualWeight: 'প্রকৃত ওজন (গ্রাম)',
    weightDev: 'ওজন বিচ্যুতি (গ্রাম)',
    uniformity: 'ইউনিফর্মিটি %',
    feed: 'খাদ্য (গ্রাম/পাখি)',
    save: 'রেকর্ড সংরক্ষণ করুন',
    saving: 'সংরক্ষণ হচ্ছে...',
    cancel: 'বাতিল',
    edit: 'সম্পাদনা',
    delete: 'মুছে ফেলুন',
    locked: 'রোল দ্বারা লক করা (কেবল শেষ ২ সপ্তাহ)',
    offline: 'অফলাইন মোড (ডেক্সি কিউ সক্রিয়)',
    online: 'অনলাইন',
  },
};
