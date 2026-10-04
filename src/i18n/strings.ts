/**
 * The one strings file (item 15). Every Chinese string sits beside its English.
 * ZH-TW status: DRAFT, NOT NATIVE-REVIEWED. Nothing in `zh` ships before a native ZH-TW review.
 * Rules: 攝取量 (intake), never 劑量 (dose); never 療程 (course of treatment); lint-allow
 * Taiwan vocabulary (設定, 儲存, 資料, 目前, 即時); the unit is "HQ" in both languages.
 * `zh: null` means the ruled Chinese text is not in hand yet; the English shows until it is.
 */
export type Lang = 'en' | 'zh-TW';

export interface Str {
  en: string;
  zh: string | null;
}

export const strings = {
  'nav.today': { en: 'Today', zh: '今日' },
  'nav.log': { en: 'Log', zh: '記錄' },
  'nav.history': { en: 'History', zh: '歷史' },
  'nav.trends': { en: 'Trends', zh: '趨勢' },
  'nav.settings': { en: 'Settings', zh: '設定' },
  'nav.addLog': { en: '+ Log', zh: '+ 記錄' },

  'today.hqToday': { en: 'HQ today', zh: '今日 HQ' },
  'today.reference': { en: 'Reference 10.0', zh: '參考值 10.0' },
  'today.bothRoutes': { en: 'Both routes today', zh: '今日兩種途徑皆有' },
  'today.sevenDayAvg': { en: '7-day average', zh: '7 日平均' },
  'today.sevenDayAvgDef': { en: 'Last 7 days, today included, divided by 7', zh: '最近 7 天（含今日）總和除以 7' },

  'route.water': { en: 'Water', zh: '氫水' },
  'route.inhalation': { en: 'Inhalation', zh: '吸入' },

  'log.howMuchDrank': { en: 'How much did you drink?', zh: '您喝了多少？' },
  'log.pourNote': {
    en: 'An entry assumes the serving is drunk within 30 minutes of pouring, from a closed vessel. Beyond that window the figure is an estimate.',
    zh: '每筆記錄假設在倒出後 30 分鐘內、以密閉容器飲用完畢。超過這段時間，數字僅為估計值。',
  },
  'log.save': { en: 'Save', zh: '儲存' },
  'log.yesterday': { en: 'Yesterday', zh: '昨天' },

  'device.flowLabel': { en: 'Hydrogen flow at the machine outlet (mL/min)', zh: '機器出口的氫氣流量（mL/min）' },
  'device.mixedGasExample': {
    en: 'For a mixed hydrogen-oxygen machine, enter only the hydrogen part: 3,000 mL/min of gas at 66.7% hydrogen is 2,000 mL/min.',
    zh: '若是氫氧混合機，只輸入氫氣的部分：每分鐘 3,000 mL 的氣體、含氫 66.7%，即為 2,000 mL/min。',
  },
  'device.concentrationLabel': { en: 'Concentration (mg/L)', zh: '濃度（mg/L）' },

  'legal.disclaimer': {
    en: 'HQ is not a medical device or medical advice. Consult your doctor before making medical decisions.',
    zh: 'HQ 不是醫療器材，也不構成醫療建議。做任何醫療決定前，請先諮詢您的醫師。',
  },
  // R-273, verbatim. The Chinese footer wording is ruled separately (R-251); its text is not in hand.
  'legal.disclosure': {
    en: 'Gateway H₂ sells and places hydrogen equipment. We set the price on the devices we distribute and earn the margin when one sells; VHLife invoices and services the customer directly.',
    zh: null,
  },
  'legal.privacy': { en: 'Privacy policy', zh: '隱私權政策' },
  'legal.site': { en: 'gatewayh2.com', zh: 'gatewayh2.com' },
} satisfies Record<string, Str>;

export type StringKey = keyof typeof strings;

export function t(key: StringKey, lang: Lang): string {
  const s: Str = strings[key];
  return lang === 'zh-TW' && s.zh ? s.zh : s.en;
}
