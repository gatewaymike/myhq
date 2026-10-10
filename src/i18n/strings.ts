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
  'today.title': { en: 'Daily HQ', zh: '每日 HQ' },
  'today.hqToday': { en: 'HQ today', zh: '今日 HQ' },
  'today.lifetime': { en: 'Lifetime', zh: '累計' },
  'today.entries': { en: "Today's entries", zh: '今日記錄' },
  'today.empty': { en: 'Nothing logged yet today.', zh: '今天尚未記錄。' },
  'today.logFirst': { en: 'Log an entry', zh: '新增記錄' },
  'today.about': { en: 'What the numbers mean', zh: '數字的意思' },
  'today.aboutHQ': {
    en: '1 HQ is the hydrogen in half a liter of fully saturated hydrogen water at 1 atm and 25°C: 0.80 mg of H₂.',
    zh: '1 HQ 是半公升在 1 大氣壓、25°C 下完全飽和的氫水所含的氫：0.80 mg H₂。',
  },
  'today.aboutRef': {
    en: 'The tick on the ring marks 10.0 HQ, a daily reference value inside a range. It is neither a floor nor a ceiling.',
    zh: '圓環上的刻度標示 10.0 HQ，是一個範圍內的每日參考值，不是下限，也不是上限。',
  },
  'today.aboutBoth': {
    en: '"Both routes today" appears on a day with at least one water entry and one inhalation entry. It never changes any HQ figure.',
    zh: '同一天至少有一筆氫水與一筆吸入記錄時，會顯示「今日兩種方式皆有」。它不會改變任何 HQ 數字。',
  },
  'today.aboutAvg': { en: 'The 7-day average is the total for the last 7 days, today included, divided by 7.', zh: '7 日平均是最近 7 天（含今日）的總和除以 7。' },
  'today.close': { en: 'Close', zh: '關閉' },
  'today.bothRoutes': { en: 'Both routes today', zh: '今日兩種方式皆有' },
  'today.sevenDayAvg': { en: '7-day average', zh: '7 日平均' },
  'today.sevenDayAvgDef': { en: 'Last 7 days, today included', zh: '最近 7 天（含今日）' },

  // Routes
  'route.water': { en: 'Water', zh: '水' },
  'route.inhalation': { en: 'Inhalation', zh: '吸入' },

  // Log screen
  'log.title': { en: 'New entry', zh: '新增記錄' },
  'log.routeLabel': { en: 'Route', zh: '途徑' },
  'log.equipment': { en: 'Equipment', zh: '設備' },
  'log.addEquipment': { en: 'Add equipment', zh: '新增設備' },
  'log.manual': { en: 'Enter values', zh: '輸入數值' },
  'log.howMuchDrank': { en: 'How much did you drink?', zh: '您喝了多少？' },
  'log.volume': { en: 'Volume (mL)', zh: '飲用量（mL）' },
  'log.concentration': { en: 'Concentration at pour (mg/L)', zh: '倒出時的濃度（mg/L）' },
  'log.concEquiv': { en: '{mgL} mg/L = {ppm} ppm = {ppb} ppb', zh: '{mgL} mg/L = {ppm} ppm = {ppb} ppb' },
  'log.pourNote': {
    en: 'An entry assumes the serving is drunk within 30 minutes of pouring, from a closed vessel. Beyond that window the figure is an estimate.',
    zh: '每筆資料皆假設自密閉容器倒出後，於 30 分鐘內飲用完畢；超過後，相關數值僅為估算值。',
  },
  'log.gotIt': { en: 'Got it', zh: '知道了' },
  'log.minutes': { en: 'Minutes', zh: '分鐘' },
  'log.flow': { en: 'Hydrogen flow (mL/min)', zh: '氫氣流量（mL/min）' },
  'log.startSession': { en: 'Start session', zh: '開始' },
  'log.stopSession': { en: 'Stop', zh: '停止' },
  'log.discardSession': { en: 'Discard', zh: '捨棄' },
  'log.sessionRunning': { en: 'Session running. You can lock your phone or close this tab; the time keeps counting.', zh: '計時進行中。您可以鎖定手機或關閉此分頁，時間會繼續計算。' },
  'log.when': { en: 'Time', zh: '時間' },
  'log.change': { en: 'Change', zh: '更改' },
  'log.addNote': { en: 'Add a note', zh: '新增備註' },
  'log.useTimer': { en: 'Use the timer instead', zh: '改用計時' },
  'log.enterMinutesInstead': { en: 'Enter minutes instead', zh: '改為輸入分鐘' },
  'log.calculated': { en: 'Calculated HQ', zh: '計算出的 HQ' },
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
  'log.repeat': { en: 'Repeat a recent entry', zh: '重複最近的記錄' },
  'log.repeatHint': { en: 'One tap saves it again, timed now.', zh: '點一下即以現在時間再次儲存。' },
  'log.errorPositive': { en: 'Enter a number above zero.', zh: '請輸入大於零的數字。' },
  'log.errorMax': { en: 'That is above {max}. Check the figure.', zh: '超過 {max}，請確認數字。' },
  // Installable app (PWA). zh pending the native ZH-TW read.
  'install.title': { en: 'Install app', zh: '安裝應用程式' },
  'install.body': { en: 'Add MyHQ to your home screen so it opens like an app.', zh: '將 MyHQ 加入主畫面，就能像應用程式一樣開啟。' },
  'install.button': { en: 'Install MyHQ', zh: '安裝 MyHQ' },
  'install.ios': { en: 'Tap Share, then Add to Home Screen.', zh: '點選「分享」，再點選「加入主畫面」。' },
  'install.menu': { en: 'Open your browser menu (⋮) and choose Install app or Add to Home screen.', zh: '開啟瀏覽器選單（⋮），選擇「安裝應用程式」或「加到主畫面」。' },
  'install.samsung': { en: 'For the cleanest install, open this page in Chrome and choose Install app.', zh: '若要順利安裝，請用 Chrome 開啟此頁面，再選擇「安裝應用程式」。' },
  'pwa.updateReady': { en: 'A new version is ready.', zh: '新版本已就緒。' },
  'pwa.reload': { en: 'Reload', zh: '重新載入' },
  'log.errorSave': { en: 'Could not save. Check your connection and try again.', zh: '無法儲存，請確認網路連線後再試一次。' },

  // Equipment sheet
  'device.title': { en: 'Add equipment', zh: '新增設備' },
  'device.name': { en: 'Name', zh: '名稱' },
  'device.namePlaceholder': { en: 'e.g. Home device', zh: '例如：家裡的設備' },
  'device.route': { en: 'Route', zh: '途徑' },
  'device.flowLabel': { en: 'Hydrogen flow at the machine outlet (mL/min)', zh: '機器出口的氫氣流量（mL/min）' },
  'device.mixedGasExample': {
    en: 'For a mixed hydrogen-oxygen machine, enter only the hydrogen part: 3,000 mL/min of gas at 66.7% hydrogen is 2,000 mL/min.',
    zh: '若是氫氧混合機，只輸入氫氣的部分：每分鐘 3,000 mL 的氣體、含氫 66.7%，即為 2,000 mL/min。',
  },
  'device.concentrationLabel': { en: 'Concentration at pour (mg/L)', zh: '倒出時的濃度（mg/L）' },
  'device.modeLabel': { en: 'Mode (optional)', zh: '模式（選填）' },
  'device.modeHint': { en: 'For a switchable unit, add one entry per mode, each with its own figure.', zh: '如果是可切換模式的裝置，請針對每一種模式分別建立一筆資料，並各自填入對應的數值。' },
  'device.save': { en: 'Save equipment', zh: '儲存設備' },
  'device.cancel': { en: 'Cancel', zh: '取消' },

  // History and Trends
  'history.title': { en: 'History', zh: '歷史' },
  'history.list': { en: 'Entries', zh: '記錄' },
  'history.trends': { en: 'Trends', zh: '趨勢' },
  'history.all': { en: 'All', zh: '全部' },
  'history.days': { en: '{n} days', zh: '{n} 天' },
  'history.allTime': { en: 'All time', zh: '全部時間' },
  'history.empty': { en: 'No entries in this range.', zh: '這段期間沒有記錄。' },
  'history.bothRoutes': { en: 'Both routes', zh: '兩種途徑皆有' },
  'history.edit': { en: 'Edit', zh: '編輯' },
  'history.delete': { en: 'Delete', zh: '刪除' },
  'history.confirmDelete': { en: 'Tap again to delete', zh: '再點一次以刪除' },
  'history.editTitle': { en: 'Edit entry', zh: '編輯記錄' },
  'history.saveChanges': { en: 'Save changes', zh: '儲存變更' },
  'history.updated': { en: 'Entry updated: {hq} HQ', zh: '已更新記錄：{hq} HQ' },
  'history.loading': { en: 'Loading…', zh: '載入中…' },
  'trends.title': { en: 'HQ per day', zh: '每日 HQ' },
  'trends.reference': { en: 'Reference 10.0', zh: '參考值 10.0' },
  'trends.avg': { en: 'Average per day', zh: '每日平均' },
  'trends.avgDef': { en: 'Days with no entries count as zero', zh: '沒有記錄的日子以零計算' },
  'trends.daysLogged': { en: 'Days logged', zh: '有記錄的天數' },
  'trends.bothDays': { en: 'Days with both routes', zh: '兩種途徑皆有的天數' },
  'trends.ofN': { en: '{n} of {total}', zh: '{total} 天中的 {n} 天' },
  'trends.tapHint': { en: 'Tap a day to see its numbers.', zh: '點選某一天以查看數字。' },
  'trends.chartLabel': { en: 'Daily HQ for the last {n} days, water and inhalation stacked, with a reference line at 10.0', zh: '過去 {n} 天的每日 HQ，將飲水與吸入量以堆疊方式呈現，並在 10.0 處加上一條參考線。' },

  // Account
  'auth.signIn': { en: 'Sign in', zh: '登入' },
  'auth.signOut': { en: 'Sign out', zh: '登出' },
  'auth.createAccount': { en: 'Create account', zh: '建立帳號' },
  'auth.email': { en: 'Email', zh: '電子郵件' },
  'auth.password': { en: 'Password', zh: '密碼' },
  'auth.newPassword': { en: 'New password', zh: '新密碼' },
  'auth.passwordHint': { en: 'At least 8 characters.', zh: '至少 8 個字元。' },
  'auth.forgot': { en: 'Forgot password?', zh: '忘記密碼？' },
  'auth.noAccount': { en: 'No account yet?', zh: '還沒有帳號？' },
  'auth.haveAccount': { en: 'Already have an account?', zh: '已經有帳號了？' },
  'auth.guestNote': { en: 'You can log without an account. Entries stay on this device until you create one, then they move into it.', zh: '不需要帳號也能記錄。記錄會先存在此裝置，建立帳號後會移入帳號中。' },
  'auth.continueGuest': { en: 'Continue without an account', zh: '不登入，繼續使用' },
  'auth.checkEmailTitle': { en: 'Check your email', zh: '請查看您的電子郵件' },
  'auth.checkEmailBody': { en: 'We sent a link to {email}. Open it on this device to confirm your account, then sign in.', zh: '我們已寄送連結到 {email}。請在此裝置開啟連結以確認帳號，然後登入。' },
  'auth.resetTitle': { en: 'Reset your password', zh: '重設密碼' },
  'auth.resetSend': { en: 'Send reset link', zh: '寄送重設連結' },
  'auth.resetSent': { en: 'If an account exists for {email}, a reset link is on its way.', zh: '若 {email} 有帳號，重設連結已寄出。' },
  'auth.setPassword': { en: 'Save new password', zh: '儲存新密碼' },
  'auth.passwordSaved': { en: 'Password updated.', zh: '密碼已更新。' },
  'auth.working': { en: 'One moment…', zh: '請稍候…' },
  'auth.errorInvalid': { en: 'Email or password is incorrect.', zh: '電子郵件或密碼不正確。' },
  'auth.errorUnconfirmed': { en: 'Confirm your email first. The link is in your inbox.', zh: '請先確認您的電子郵件，連結在您的收件匣中。' },
  'auth.errorRate': { en: 'Too many attempts. Wait a few minutes and try again.', zh: '嘗試次數過多，請稍等幾分鐘再試。' },
  'auth.errorGeneric': { en: 'Something went wrong. Check your connection and try again.', zh: '發生問題，請確認網路連線後再試一次。' },
  'auth.errorEmail': { en: 'Enter a valid email address.', zh: '請輸入有效的電子郵件地址。' },
  'auth.errorPassword': { en: 'Use at least 8 characters.', zh: '請使用至少 8 個字元。' },
  'auth.imported': { en: '{n} entries from this device are now in your account.', zh: '此裝置的 {n} 筆記錄已移入您的帳號。' },
  'auth.importedOne': { en: '1 entry from this device is now in your account.', zh: '此裝置的 1 筆記錄已移入您的帳號。' },
  'auth.unavailable': { en: 'Accounts are not available in this preview.', zh: '此預覽版無法使用帳號功能。' },
  'auth.agree': { en: 'By creating an account you accept the privacy policy and the disclaimer below.', zh: '建立帳號即表示您接受下方的隱私權政策與免責聲明。' },
  'auth.agreeNoPrivacy': { en: 'By creating an account you accept the disclaimer below.', zh: '建立帳號即表示您接受下方的免責聲明。' },

  // Settings
  'settings.account': { en: 'Account', zh: '帳號' },
  'settings.signedInAs': { en: 'Signed in as {email}', zh: '目前登入：{email}' },
  'settings.guest': { en: 'Not signed in. Entries are kept on this device only.', zh: '尚未登入，記錄只存在此裝置。' },
  'settings.language': { en: 'Language', zh: '語言' },
  'settings.about': { en: 'About HQ', zh: '關於 HQ' },
  'settings.disclaimerTitle': { en: 'Disclaimer', zh: '免責聲明' },
  'settings.disclosureTitle': { en: 'Disclosure', zh: '揭露聲明' },

  // Settings (full)
  'settings.equipment': { en: 'My equipment', zh: '我的設備' },
  'settings.noEquipment': { en: 'No equipment saved yet.', zh: '尚未儲存任何設備。' },
  'settings.remove': { en: 'Remove', zh: '移除' },
  'settings.confirmRemove': { en: 'Tap again to remove', zh: '再點一次以移除' },
  'settings.removeNote': { en: 'Removing equipment keeps every entry logged with it, with its figures.', zh: '移除設備後，所有與該設備相關的紀錄及其數值仍會保留。' },
  'settings.removed': { en: 'Equipment removed', zh: '已移除設備' },
  'settings.yourData': { en: 'Your data', zh: '您的資料' },
  'settings.downloadCSV': { en: 'Download CSV', zh: '下載 CSV' },
  'settings.downloadJSON': { en: 'Download JSON', zh: '下載 JSON' },
  'settings.downloadNote': { en: 'Every entry and device, with HQ at full precision.', zh: '所有記錄與設備，HQ 以完整精度呈現。' },
  'settings.preparing': { en: 'Preparing…', zh: '準備中…' },
  'settings.deleteAccount': { en: 'Delete my account', zh: '刪除我的帳號' },
  'settings.deleteExplain': {
    en: 'This permanently deletes your account, your equipment and every entry. It cannot be undone. Download your data first if you want a copy.',
    zh: '這會永久刪除您的帳號、設備與所有記錄，且無法復原。如需保留副本，請先下載您的資料。',
  },
  'settings.deleteTypeLabel': { en: 'Type DELETE to confirm', zh: '輸入 DELETE 以確認' },
  'settings.deleteConfirm': { en: 'Delete everything', zh: '全部刪除' },
  'settings.deleted': { en: 'Your account has been deleted.', zh: '您的帳號已刪除。' },
  'settings.eraseDevice': { en: 'Erase entries on this device', zh: '清除此裝置上的記錄' },
  'settings.eraseExplain': { en: 'This removes the entries and equipment kept on this device. It cannot be undone.', zh: '這會移除存在此裝置上的記錄與設備，且無法復原。' },
  'settings.eraseConfirm': { en: 'Tap again to erase', zh: '再點一次以清除' },
  'settings.erased': { en: 'Entries on this device erased.', zh: '已清除此裝置上的記錄。' },
  'settings.version': { en: 'Version {v}', zh: '版本 {v}' },
  'device.editTitle': { en: 'Edit equipment', zh: '編輯設備' },
  'device.editNote': { en: 'A new figure applies to new entries. Entries already logged keep the figure they were logged with.', zh: '新的數字只套用於之後的記錄，已記錄的資料保留當時的數字。' },

  // First-run cards (item 11)
  'onboard.skip': { en: 'Skip', zh: '略過' },
  'onboard.next': { en: 'Next', zh: '下一步' },
  'onboard.later': { en: 'Later', zh: '稍後' },
  'onboard.step': { en: 'Step {n} of 3', zh: '第 {n} 步，共 3 步' },
  'onboard.c1Title': { en: 'What 1 HQ is', zh: '1 HQ 是什麼' },
  'onboard.c1Body': {
    en: 'MyHQ counts water and inhalation in one unit, and every figure shows its arithmetic.',
    zh: 'MyHQ 以同一個單位計算氫水與吸入，每個數字都會顯示計算方式。',
  },
  'onboard.c2Title': { en: 'Set up your equipment', zh: '設定您的設備' },
  'onboard.c2Body': {
    en: 'Enter it once: the hydrogen flow at the machine outlet for an inhalation device, or the concentration for hydrogen water. Every entry after that starts from it.',
    zh: '只需輸入一次：吸入機請填機器出口的氫氣流量，氫水請填濃度。之後的每筆記錄都會以它為起點。',
  },
  'onboard.c3Title': { en: 'Log your first entry', zh: '記錄第一筆' },
  'onboard.c3Body': {
    en: 'Use the timer for an inhalation session, or enter how much hydrogen water you drank.',
    zh: '吸入時可使用計時，喝氫水時輸入飲用量即可。',
  },
  'onboard.c3Guest': {
    en: 'No account needed. Entries stay on this device until you create one.',
    zh: '不需要帳號。建立帳號前，記錄會存在此裝置。',
  },
  'settings.showIntro': { en: 'Show the intro again', zh: '再次顯示介紹' },

  // Preview banner
  'preview.banner': { en: 'Preview with example data, kept on this device only.', zh: '預覽版，範例資料只存在此裝置。' },
  'preview.reset': { en: 'Reset examples', zh: '重設範例' },
  'common.comingNext': { en: 'This screen comes next through the parity check.', zh: '此畫面會在完成同等性檢查後接續顯示。' },

  // Legal
  'legal.disclaimer': {
    en: 'HQ is not a medical device or medical advice. Consult your doctor before making medical decisions.',
    zh: 'HQ 不是醫療器材，也不構成醫療建議。做任何醫療決定前，請先諮詢您的醫師。',
  },
  // en: R-273, verbatim. zh: R-251 (no invoicing clause), the first two sentences of the live
  // gatewayh2.com Chinese footer, pasted by Michael 2026-10-07. Pending the native ZH-TW read.
  'legal.disclosure': {
    en: 'Gateway H₂ sells and places hydrogen equipment. We set the price on the devices we distribute and earn the margin when one sells; VHLife invoices and services the customer directly.',
    zh: 'Gateway H₂ 銷售並配置氫氣設備。我們為經銷的設備訂定售價，售出時賺取差價。',
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
