/**
 * The one strings file (item 15). Every Chinese string sits beside its English.
 * ZH-TW status: DRAFT, NOT NATIVE-REVIEWED. Nothing in `zh` ships before a native ZH-TW review.
 * Rules: 攝取量 (intake), never 劑量 (dose); never 療程 (course of treatment); lint-allow
 * Taiwan vocabulary (設定, 儲存, 資料, 目前, 即時); the unit is "HQ" in both languages.
 * `zh: null` means the ruled Chinese text is not in hand yet; the English shows until it is.
 * Placeholders: {name} is replaced by t(key, lang, { name: value }).
 */
export type Lang = 'en' | 'zh-TW';

export interface Str {
  en: string;
  zh: string | null;
}

export const strings = {
  // Navigation
  'nav.today': { en: 'Today', zh: '今日' },
  'nav.log': { en: 'Log', zh: '記錄' },
  'nav.history': { en: 'History', zh: '歷史' },
  'nav.trends': { en: 'Trends', zh: '趨勢' },
  'nav.settings': { en: 'Settings', zh: '設定' },
  'nav.addLog': { en: '+ Log', zh: '+ 記錄' },
  'nav.main': { en: 'Main', zh: '主選單' },
  'header.descriptor': { en: 'H₂ intake tracker', zh: '氫攝取量記錄' },
  'header.langSwitch': { en: 'Switch language', zh: '切換語言' },

  // Today
  'today.hqToday': { en: 'HQ today', zh: '今日 HQ' },
  'today.reference': { en: 'Reference 10.0', zh: '參考值 10.0' },
  'today.bothRoutes': { en: 'Both routes today', zh: '今日兩種途徑皆有' },
  'today.sevenDayAvg': { en: '7-day average', zh: '7 日平均' },
  'today.sevenDayAvgDef': { en: 'Last 7 days, today included, divided by 7', zh: '最近 7 天（含今日）總和除以 7' },

  // Routes
  'route.water': { en: 'Water', zh: '氫水' },
  'route.inhalation': { en: 'Inhalation', zh: '吸入' },

  // Log screen
  'log.title': { en: 'New entry', zh: '新增記錄' },
  'log.routeLabel': { en: 'Route', zh: '途徑' },
  'log.equipment': { en: 'Equipment', zh: '設備' },
  'log.addEquipment': { en: 'Add equipment', zh: '新增設備' },
  'log.manual': { en: 'Enter values', zh: '手動輸入' },
  'log.howMuchDrank': { en: 'How much did you drink?', zh: '您喝了多少？' },
  'log.volume': { en: 'Volume (mL)', zh: '飲用量（mL）' },
  'log.concentration': { en: 'Concentration at pour (mg/L)', zh: '倒出時的濃度（mg/L）' },
  'log.concEquiv': { en: '{mgL} mg/L = {ppm} ppm = {ppb} ppb', zh: '{mgL} mg/L = {ppm} ppm = {ppb} ppb' },
  'log.pourNote': {
    en: 'An entry assumes the serving is drunk within 30 minutes of pouring, from a closed vessel. Beyond that window the figure is an estimate.',
    zh: '每筆記錄假設在倒出後 30 分鐘內、以密閉容器飲用完畢。超過這段時間，數字僅為估計值。',
  },
  'log.gotIt': { en: 'Got it', zh: '知道了' },
  'log.minutes': { en: 'Minutes', zh: '分鐘' },
  'log.flow': { en: 'Hydrogen flow (mL/min)', zh: '氫氣流量（mL/min）' },
  'log.timer': { en: 'Timer', zh: '計時' },
  'log.enterMinutes': { en: 'Enter minutes', zh: '輸入分鐘' },
  'log.startSession': { en: 'Start session', zh: '開始' },
  'log.stopSession': { en: 'Stop', zh: '停止' },
  'log.discardSession': { en: 'Discard', zh: '捨棄' },
  'log.sessionRunning': { en: 'Session running. You can lock your phone or close this tab; the time keeps counting.', zh: '計時進行中。您可以鎖定手機或關閉此分頁，時間會繼續計算。' },
  'log.when': { en: 'When', zh: '時間' },
  'log.now': { en: 'Now', zh: '現在' },
  'log.yesterday': { en: 'Yesterday', zh: '昨天' },
  'log.pickTime': { en: 'Pick a time', zh: '選擇時間' },
  'log.notes': { en: 'Notes (optional)', zh: '備註（選填）' },
  'log.save': { en: 'Save entry', zh: '儲存記錄' },
  'log.saving': { en: 'Saving…', zh: '儲存中…' },
  'log.saved': { en: 'Saved: {hq} HQ', zh: '已儲存：{hq} HQ' },
  'log.undo': { en: 'Undo', zh: '復原' },
  'log.removed': { en: 'Entry removed', zh: '已移除記錄' },
  'log.showMath': { en: 'Show the math', zh: '顯示計算' },
  'log.hideMath': { en: 'Hide the math', zh: '隱藏計算' },
  'log.thisEntry': { en: 'This entry', zh: '本筆記錄' },
  'log.repeat': { en: 'Repeat a recent entry', zh: '重複最近的記錄' },
  'log.repeatHint': { en: 'One tap saves it again, timed now.', zh: '點一下即以現在時間再次儲存。' },
  'log.errorPositive': { en: 'Enter a number above zero.', zh: '請輸入大於零的數字。' },
  'log.errorMax': { en: 'That is above {max}. Check the figure.', zh: '超過 {max}，請確認數字。' },
  'log.errorSave': { en: 'Could not save. Check your connection and try again.', zh: '無法儲存，請確認網路連線後再試一次。' },

  // Equipment sheet
  'device.title': { en: 'Add equipment', zh: '新增設備' },
  'device.name': { en: 'Name', zh: '名稱' },
  'device.namePlaceholder': { en: 'e.g. Bedroom inhaler', zh: '例如：臥室的吸入機' },
  'device.route': { en: 'Route', zh: '途徑' },
  'device.flowLabel': { en: 'Hydrogen flow at the machine outlet (mL/min)', zh: '機器出口的氫氣流量（mL/min）' },
  'device.mixedGasExample': {
    en: 'For a mixed hydrogen-oxygen machine, enter only the hydrogen part: 3,000 mL/min of gas at 66.7% hydrogen is 2,000 mL/min.',
    zh: '若是氫氧混合機，只輸入氫氣的部分：每分鐘 3,000 mL 的氣體、含氫 66.7%，即為 2,000 mL/min。',
  },
  'device.concentrationLabel': { en: 'Concentration at pour (mg/L)', zh: '倒出時的濃度（mg/L）' },
  'device.modeLabel': { en: 'Mode (optional)', zh: '模式（選填）' },
  'device.modeHint': { en: 'For a switchable unit, add one entry per mode, each with its own figure.', zh: '可切換模式的機器，請每種模式各新增一筆，各自填入數字。' },
  'device.save': { en: 'Save equipment', zh: '儲存設備' },
  'device.cancel': { en: 'Cancel', zh: '取消' },

  // Preview banner
  'preview.banner': { en: 'Preview with example data, kept on this device only.', zh: '預覽版，範例資料只存在此裝置。' },
  'preview.reset': { en: 'Reset examples', zh: '重設範例' },
  'common.comingNext': { en: 'This screen comes next through the parity check.', zh: '此頁面將在下一輪比對後完成。' },

  // Legal
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

export function t(key: StringKey, lang: Lang, vars?: Record<string, string | number>): string {
  const s: Str = strings[key];
  let out = lang === 'zh-TW' && s.zh ? s.zh : s.en;
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v));
  return out;
}
