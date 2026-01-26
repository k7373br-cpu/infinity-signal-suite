export const CURRENCY_PAIRS = [
  "AUD/CAD", "AUD/CHF", "AUD/JPY", "AUD/NZD", "AUD/USD",
  "CAD/CHF", "CAD/JPY", "CHF/JPY",
  "EUR/AUD", "EUR/CAD", "EUR/CHF", "EUR/GBP", "EUR/JPY", "EUR/NZD", "EUR/SEK", "EUR/USD",
  "GBP/CAD", "GBP/CHF", "GBP/JPY", "GBP/USD",
  "NZD/CAD", "NZD/JPY",
  "USD/CAD", "USD/CHF", "USD/CNH", "USD/JPY", "USD/MXN", "USD/NOK", "USD/SGD"
];

export const CRYPTO_PAIRS = [
  "BNB/USDT", "BTC/USDT", "ETH/USDT", "LTC/USDT", "MNT/USDT",
  "SOL/USDT", "XAUT/USDT", "XRP/USDT", "ZEC/USDT"
];

export const METAL_PAIRS = [
  "GOLD", "SILVER", "PLATINUM", "PALLADIUM"
];

export const TIMEFRAMES = {
  ru: ["1 мин", "2 мин", "5 мин", "10 мин", "15 мин", "30 мин", "1 час", "4 часа", "1 день"],
  en: ["1 min", "2 min", "5 min", "10 min", "15 min", "30 min", "1 hour", "4 hours", "1 day"]
};

export const VERIFICATION_CODES = {
  verified: "2741520",
  vip: "1448135"
};

export const TRANSLATIONS = {
  ru: {
    welcome: "ДОБРО ПОЖАЛОВАТЬ В INFINITY TRAFFIC!",
    subtitle: "Продвинутые торговые сигналы на основе AI",
    getSignal: "Получить сигнал",
    verification: "Верификация",
    support: "Поддержка",
    repeatSignal: "Повторить сигнал",
    selectPair: "Выберите валютную пару",
    selectTimeframe: "Выберите таймфрейм",
    analyzing: "AI анализирует...",
    signal: "Сигнал",
    probability: "Вероятность",
    instrument: "Инструмент",
    timeframe: "Таймфрейм",
    signalsLeft: "Осталось сигналов",
    rateSignal: "Оцените точность сигнала",
    correct: "Сигнал правильный",
    incorrect: "Сигнал неправильный",
    mainMenu: "Главное меню",
    improvedSignal: "Улучшенный сигнал",
    marketClosed: "Рынок закрыт",
    marketOpen: "Рынок открыт",
    saturday: "Суббота",
    sunday: "Воскресенье",
    limitExceeded: "Дневной лимит исчерпан",
    status: "Статус",
    free: "Бесплатный",
    verified: "Верифицирован",
    vip: "VIP",
    enterCode: "Введите код доступа",
    verificationSuccess: "Верификация успешна!",
    invalidCode: "Неверный код",
    accessLevels: "Уровни доступа",
    freeSignals: "5 сигналов",
    verifiedSignals: "50 сигналов/день",
    vipSignals: "Безлимит + Приоритетная поддержка 24/7",
    history: "История",
    accuracy: "Точность",
    noRatings: "нет оценок",
    searchPairs: "Поиск пар...",
    page: "Страница",
    telegramBot: "Telegram бот",
    telegramSupport: "Поддержка"
  },
  en: {
    welcome: "WELCOME TO INFINITY TRAFFIC!",
    subtitle: "Advanced AI-powered trading signals",
    getSignal: "Get Signal",
    verification: "Verification",
    support: "Support",
    repeatSignal: "Repeat Signal",
    selectPair: "Select currency pair",
    selectTimeframe: "Select timeframe",
    analyzing: "AI analyzing...",
    signal: "Signal",
    probability: "Probability",
    instrument: "Instrument",
    timeframe: "Timeframe",
    signalsLeft: "Signals left",
    rateSignal: "Rate signal accuracy",
    correct: "Signal correct",
    incorrect: "Signal incorrect",
    mainMenu: "Main menu",
    improvedSignal: "Improved signal",
    marketClosed: "Market closed",
    marketOpen: "Market open",
    saturday: "Saturday",
    sunday: "Sunday",
    limitExceeded: "Daily limit exceeded",
    status: "Status",
    free: "Free",
    verified: "Verified",
    vip: "VIP",
    enterCode: "Enter access code",
    verificationSuccess: "Verification successful!",
    invalidCode: "Invalid code",
    accessLevels: "Access levels",
    freeSignals: "5 signals",
    verifiedSignals: "50 signals/day",
    vipSignals: "Unlimited + Priority Support 24/7",
    history: "History",
    accuracy: "Accuracy",
    noRatings: "no ratings",
    searchPairs: "Search pairs...",
    page: "Page",
    telegramBot: "Telegram bot",
    telegramSupport: "Support"
  }
};

export type Language = 'ru' | 'en';
export type UserStatus = 'free' | 'verified' | 'vip';
export type SignalDirection = 'BUY' | 'SELL';
export type AssetType = 'forex' | 'crypto' | 'metals';
