/* ==========================================================================
   Kartix AI — Data layer
   Marketplaces, product categories, design styles and multilingual content
   banks. This is the "knowledge base" the (simulated) AI draws from.
   Plug a real model in by replacing AI.* in app.js — the data shapes stay.
   ========================================================================== */
(function () {
  "use strict";

  /* ----------------------------- Marketplaces ----------------------------- */
  const MARKETPLACES = {
    uzum: {
      id: "uzum",
      name: "Uzum Market",
      short: "Uzum",
      color: "#7000ff",
      color2: "#a64dff",
      width: 1080,
      height: 1440,
      logo: "Uzum",
    },
    wb: {
      id: "wb",
      name: "Wildberries",
      short: "WB",
      color: "#cb11ab",
      color2: "#7c2ce0",
      width: 900,
      height: 1200,
      logo: "WB",
    },
    ozon: {
      id: "ozon",
      name: "Ozon",
      short: "Ozon",
      color: "#005bff",
      color2: "#0a8bff",
      width: 1080,
      height: 1440,
      logo: "ozon",
    },
  };

  /* Sizes selectable in the editor (per marketplace + universal) */
  const SIZES = [
    { id: "portrait34", label: "3:4 · 1080×1440", w: 1080, h: 1440 },
    { id: "wb34", label: "3:4 · 900×1200 (WB)", w: 900, h: 1200 },
    { id: "square", label: "1:1 · 1080×1080", w: 1080, h: 1080 },
    { id: "tall", label: "9:16 · 1080×1920", w: 1080, h: 1920 },
  ];

  /* ----------------------------- Design styles ----------------------------- */
  const STYLES = {
    premium3d: {
      id: "premium3d",
      name: { ru: "3D Премиум", uz: "3D Premium", en: "3D Premium" },
      dark: true,
      bg: "spotlight",
      glass: true,
      emoji: "💎",
    },
    minimal: {
      id: "minimal",
      name: { ru: "Минимал", uz: "Minimal", en: "Minimal" },
      dark: false,
      bg: "soft",
      glass: false,
      emoji: "⚪",
    },
    vibrant: {
      id: "vibrant",
      name: { ru: "Яркий", uz: "Yorqin", en: "Vibrant" },
      dark: false,
      bg: "mesh",
      glass: true,
      emoji: "🌈",
    },
    techdark: {
      id: "techdark",
      name: { ru: "Техно", uz: "Texno", en: "Techno" },
      dark: true,
      bg: "grid",
      glass: true,
      emoji: "🤖",
    },
    eco: {
      id: "eco",
      name: { ru: "Эко", uz: "Eko", en: "Eco" },
      dark: false,
      bg: "soft",
      glass: false,
      emoji: "🌿",
    },
    pastel: {
      id: "pastel",
      name: { ru: "Пастель", uz: "Pastel", en: "Pastel" },
      dark: false,
      bg: "mesh",
      glass: true,
      emoji: "🍦",
    },
  };

  /* ----------------------------- Categories ----------------------------- */
  /* Each category carries localized materials / features / advantages and a
     fallback accent palette + filename keywords for lightweight detection. */
  const CATEGORIES = {
    furniture: {
      id: "furniture",
      emoji: "🪑", gender: "f",
      accent: "#b9844f",
      keywords: ["chair", "stul", "стул", "sofa", "table", "mebel", "мебель", "furniture", "desk", "kreslo", "кресло"],
      name: { ru: "Мебель", uz: "Mebel", en: "Furniture" },
      materials: {
        ru: ["Массив дерева", "Эко-кожа", "Нержавеющая сталь", "Велюр", "МДФ премиум"],
        uz: ["Yog‘och massiv", "Eko-charm", "Zanglamas po‘lat", "Velyur", "Premium MDF"],
        en: ["Solid wood", "Eco leather", "Stainless steel", "Velvet", "Premium MDF"],
      },
      features: {
        ru: ["Эргономичная форма", "Усиленный каркас", "Мягкое сиденье", "Регулировка высоты", "Лёгкая сборка"],
        uz: ["Ergonomik shakl", "Mustahkam karkas", "Yumshoq o‘rindiq", "Balandlik sozlash", "Oson yig‘ish"],
        en: ["Ergonomic shape", "Reinforced frame", "Soft seat", "Height adjustment", "Easy assembly"],
      },
      advantages: {
        ru: ["Выдерживает до 150 кг", "Не скрипит годами", "Стильно в любом интерьере", "Гарантия 2 года"],
        uz: ["150 kg gacha ko‘taradi", "Yillab g‘ichirlamaydi", "Har qanday interyerga mos", "2 yil kafolat"],
        en: ["Holds up to 150 kg", "No squeaking for years", "Fits any interior", "2-year warranty"],
      },
    },
    clothing: {
      id: "clothing",
      emoji: "👕", gender: "f",
      accent: "#e0608a",
      keywords: ["cloth", "shirt", "dress", "odejda", "одежда", "tshirt", "футболка", "куртка", "jacket", "kiyim", "ko'ylak"],
      name: { ru: "Одежда", uz: "Kiyim", en: "Clothing" },
      materials: {
        ru: ["100% хлопок", "Премиум трикотаж", "Дышащая ткань", "Эластан", "Лён"],
        uz: ["100% paxta", "Premium trikotaj", "Nafas oluvchi mato", "Elastan", "Zig‘ir"],
        en: ["100% cotton", "Premium knit", "Breathable fabric", "Elastane", "Linen"],
      },
      features: {
        ru: ["Не теряет форму", "Приятная к телу", "Стойкий цвет", "Свободный крой", "Все размеры"],
        uz: ["Shaklini yo‘qotmaydi", "Tanaga yoqimli", "Rangi o‘chmaydi", "Erkin bichim", "Barcha o‘lchamlar"],
        en: ["Keeps its shape", "Soft on skin", "Color-fast", "Relaxed fit", "All sizes"],
      },
      advantages: {
        ru: ["Не мнётся в дороге", "Подходит на любой сезон", "Легко стирать", "Сидит по фигуре"],
        uz: ["Yo‘lda g‘ijimlanmaydi", "Har faslga mos", "Yuvish oson", "Gavdaga mos turadi"],
        en: ["Travel-friendly, no wrinkles", "For any season", "Easy to wash", "Flattering fit"],
      },
    },
    electronics: {
      id: "electronics",
      emoji: "🎧", gender: "f",
      accent: "#3b82f6",
      keywords: ["phone", "tech", "tehnika", "техника", "наушники", "headphone", "watch", "часы", "gadget", "elektronika", "laptop", "speaker"],
      name: { ru: "Техника", uz: "Texnika", en: "Electronics" },
      materials: {
        ru: ["Авиационный алюминий", "Закалённое стекло", "Soft-touch пластик", "Силикон"],
        uz: ["Aviatsiya alyuminiyi", "Mustahkam shisha", "Soft-touch plastik", "Silikon"],
        en: ["Aircraft aluminum", "Tempered glass", "Soft-touch plastic", "Silicone"],
      },
      features: {
        ru: ["Быстрая зарядка", "Bluetooth 5.3", "До 40 часов работы", "Шумоподавление", "Влагозащита"],
        uz: ["Tez quvvatlash", "Bluetooth 5.3", "40 soatgacha ishlash", "Shovqin bostirish", "Namlikdan himoya"],
        en: ["Fast charging", "Bluetooth 5.3", "Up to 40h battery", "Noise cancelling", "Water resistant"],
      },
      advantages: {
        ru: ["Заряд на весь день", "Кристальный звук", "Подключается за секунду", "Официальная гарантия"],
        uz: ["Kun bo‘yi quvvat", "Tiniq ovoz", "Bir soniyada ulanadi", "Rasmiy kafolat"],
        en: ["All-day battery", "Crystal-clear sound", "Pairs in a second", "Official warranty"],
      },
    },
    accessory: {
      id: "accessory",
      emoji: "👜", gender: "m",
      accent: "#9b6b3f",
      keywords: ["bag", "watch", "aksessuar", "аксессуар", "sumka", "сумка", "belt", "wallet", "кошелёк", "ремень", "ochki", "очки"],
      name: { ru: "Аксессуар", uz: "Aksessuar", en: "Accessory" },
      materials: {
        ru: ["Натуральная кожа", "Металл с покрытием", "Прочная фурнитура", "Текстиль"],
        uz: ["Tabiiy charm", "Qoplamali metall", "Mustahkam furnitura", "Tekstil"],
        en: ["Genuine leather", "Coated metal", "Durable hardware", "Textile"],
      },
      features: {
        ru: ["Вместительный", "Лёгкий вес", "Надёжные швы", "Универсальный дизайн"],
        uz: ["Sig‘imli", "Yengil vazn", "Ishonchli choklar", "Universal dizayn"],
        en: ["Spacious", "Lightweight", "Reliable stitching", "Versatile design"],
      },
      advantages: {
        ru: ["Подчёркивает стиль", "Прослужит годы", "Подходит к любому образу", "Отличный подарок"],
        uz: ["Uslubni ta’kidlaydi", "Yillab xizmat qiladi", "Har qanday uslubga mos", "Ajoyib sovg‘a"],
        en: ["Elevates your style", "Lasts for years", "Matches any outfit", "A great gift"],
      },
    },
    footwear: {
      id: "footwear",
      emoji: "👟", gender: "f",
      accent: "#ef5b4c",
      keywords: ["shoe", "sneaker", "obuv", "обувь", "krossovki", "кроссовки", "boot", "ботинки", "poyabzal"],
      name: { ru: "Обувь", uz: "Poyabzal", en: "Footwear" },
      materials: {
        ru: ["Натуральная замша", "Дышащая сетка", "Амортизирующая подошва", "Эко-кожа"],
        uz: ["Tabiiy zamsha", "Nafas oluvchi to‘r", "Amortizatsion taglik", "Eko-charm"],
        en: ["Genuine suede", "Breathable mesh", "Cushioned sole", "Eco leather"],
      },
      features: {
        ru: ["Лёгкие как пух", "Не скользят", "Гнущаяся подошва", "Усиленный носок"],
        uz: ["Patdek yengil", "Sirpanmaydi", "Egiluvchan taglik", "Mustahkam burun"],
        en: ["Feather-light", "Non-slip", "Flexible sole", "Reinforced toe"],
      },
      advantages: {
        ru: ["Удобно весь день", "Не натирают", "Держат форму", "Для города и спорта"],
        uz: ["Kun bo‘yi qulay", "Oyoqni qiynamaydi", "Shaklini saqlaydi", "Shahar va sport uchun"],
        en: ["Comfortable all day", "No blisters", "Keep their shape", "City and sport"],
      },
    },
    beauty: {
      id: "beauty",
      emoji: "🧴", gender: "f",
      accent: "#e07aa8",
      keywords: ["beauty", "cosmetic", "kosmetika", "косметика", "krem", "крем", "serum", "сыворотка", "parfum", "духи"],
      name: { ru: "Косметика", uz: "Kosmetika", en: "Beauty" },
      materials: {
        ru: ["Натуральные экстракты", "Гиалуроновая кислота", "Витамин E", "Без парабенов"],
        uz: ["Tabiiy ekstraktlar", "Gialuron kislotasi", "E vitamini", "Parabensiz"],
        en: ["Natural extracts", "Hyaluronic acid", "Vitamin E", "Paraben-free"],
      },
      features: {
        ru: ["Гипоаллергенно", "Для всех типов кожи", "Лёгкая текстура", "Дерматолог. тест"],
        uz: ["Gipoallergen", "Barcha teri turlari uchun", "Yengil tekstura", "Dermatolog sinovi"],
        en: ["Hypoallergenic", "For all skin types", "Light texture", "Dermatologist tested"],
      },
      advantages: {
        ru: ["Видимый результат за 7 дней", "Глубокое увлажнение", "Не липнет", "Приятный аромат"],
        uz: ["7 kunda ko‘rinarli natija", "Chuqur namlik", "Yopishmaydi", "Yoqimli hid"],
        en: ["Visible results in 7 days", "Deep hydration", "Non-sticky", "Pleasant scent"],
      },
    },
    kitchen: {
      id: "kitchen",
      emoji: "🍳", gender: "f",
      accent: "#e8a13a",
      keywords: ["kitchen", "pan", "posuda", "посуда", "kuhnya", "кухня", "кастрюля", "knife", "нож", "idish"],
      name: { ru: "Кухня", uz: "Oshxona", en: "Kitchen" },
      materials: {
        ru: ["Нержавеющая сталь", "Антипригарное покрытие", "Жаропрочное стекло", "Литой алюминий"],
        uz: ["Zanglamas po‘lat", "Kuymaydigan qoplama", "Issiqqa chidamli shisha", "Quyma alyuminiy"],
        en: ["Stainless steel", "Non-stick coating", "Heat-resistant glass", "Cast aluminum"],
      },
      features: {
        ru: ["Равномерный нагрев", "Подходит для индукции", "Не пригорает", "Легко мыть"],
        uz: ["Bir tekis qizish", "Induksiya uchun mos", "Kuymaydi", "Yuvish oson"],
        en: ["Even heating", "Induction-ready", "No burning", "Easy to clean"],
      },
      advantages: {
        ru: ["Готовьте без масла", "Служит годами", "Безопасно для семьи", "Экономит время"],
        uz: ["Yog‘siz pishiring", "Yillab xizmat qiladi", "Oila uchun xavfsiz", "Vaqtni tejaydi"],
        en: ["Cook with no oil", "Lasts for years", "Family-safe", "Saves time"],
      },
    },
    kids: {
      id: "kids",
      emoji: "🧸", gender: "pl",
      accent: "#f59e3a",
      keywords: ["kid", "toy", "igrushka", "игрушка", "детск", "bola", "bolalar", "baby", "child"],
      name: { ru: "Детские товары", uz: "Bolalar mahsuloti", en: "Kids" },
      materials: {
        ru: ["Безопасный пластик", "Гипоаллергенная ткань", "Натуральное дерево", "Без BPA"],
        uz: ["Xavfsiz plastik", "Gipoallergen mato", "Tabiiy yog‘och", "BPA’siz"],
        en: ["Safe plastic", "Hypoallergenic fabric", "Natural wood", "BPA-free"],
      },
      features: {
        ru: ["Развивает моторику", "Яркие цвета", "Без острых углов", "Сертифицировано"],
        uz: ["Mayda motorikani rivojlantiradi", "Yorqin ranglar", "O‘tkir burchaksiz", "Sertifikatlangan"],
        en: ["Develops motor skills", "Bright colors", "No sharp edges", "Certified"],
      },
      advantages: {
        ru: ["Безопасно для малыша", "Любимая игрушка надолго", "Лёгкая чистка", "Отличный подарок"],
        uz: ["Chaqaloq uchun xavfsiz", "Uzoq sevimli o‘yinchoq", "Tozalash oson", "Ajoyib sovg‘a"],
        en: ["Safe for your child", "A long-loved toy", "Easy to clean", "A great gift"],
      },
    },
    sport: {
      id: "sport",
      emoji: "🏋️", gender: "m",
      accent: "#22c08b",
      keywords: ["sport", "fitness", "gantel", "гантел", "мяч", "ball", "yoga", "йога", "trenajer", "sportiv"],
      name: { ru: "Спорт", uz: "Sport", en: "Sport" },
      materials: {
        ru: ["Неопрен", "Прорезиненное покрытие", "Усиленный нейлон", "Сталь"],
        uz: ["Neopren", "Rezinali qoplama", "Mustahkam neylon", "Po‘lat"],
        en: ["Neoprene", "Rubberized coating", "Reinforced nylon", "Steel"],
      },
      features: {
        ru: ["Нескользящая поверхность", "Компактное хранение", "Прочная конструкция", "Удобный хват"],
        uz: ["Sirpanmas yuza", "Ixcham saqlash", "Mustahkam konstruksiya", "Qulay ushlash"],
        en: ["Non-slip surface", "Compact storage", "Durable build", "Comfortable grip"],
      },
      advantages: {
        ru: ["Тренируйтесь дома", "Подходит новичкам", "Выдерживает нагрузки", "Быстрый результат"],
        uz: ["Uyda mashq qiling", "Yangi boshlovchilarga mos", "Yuklamaga chidaydi", "Tez natija"],
        en: ["Train at home", "Beginner-friendly", "Handles heavy loads", "Fast results"],
      },
    },
    generic: {
      id: "generic",
      emoji: "📦", gender: "m",
      accent: "#6d5cff",
      keywords: [],
      name: { ru: "Товар", uz: "Mahsulot", en: "Product" },
      materials: {
        ru: ["Премиум материалы", "Экологичный состав", "Прочная конструкция"],
        uz: ["Premium materiallar", "Ekologik tarkib", "Mustahkam konstruksiya"],
        en: ["Premium materials", "Eco-friendly", "Durable build"],
      },
      features: {
        ru: ["Высокое качество", "Продуманный дизайн", "Универсальность", "Долгий срок службы"],
        uz: ["Yuqori sifat", "O‘ylangan dizayn", "Universallik", "Uzoq xizmat muddati"],
        en: ["High quality", "Thoughtful design", "Versatile", "Long lifespan"],
      },
      advantages: {
        ru: ["Решает вашу задачу", "Радует каждый день", "Надёжно и удобно", "Выгодная цена"],
        uz: ["Vazifangizni hal qiladi", "Har kuni quvontiradi", "Ishonchli va qulay", "Foydali narx"],
        en: ["Solves your problem", "Delights every day", "Reliable and handy", "Great value"],
      },
    },
  };

  /* ----------------------------- Copy banks ----------------------------- */
  /* Phrase banks used by the AI copywriter to assemble headlines, badges,
     selling descriptions and SEO text in each language. */
  const COPY = {
    adjectives: {
      ru: ["Премиальный", "Стильный", "Надёжный", "Универсальный", "Современный", "Идеальный", "Удобный", "Топовый"],
      uz: ["Premium", "Zamonaviy", "Ishonchli", "Universal", "Qulay", "Ideal", "Sifatli", "Top"],
      en: ["Premium", "Stylish", "Reliable", "Versatile", "Modern", "Perfect", "Comfortable", "Top-rated"],
    },
    badges: {
      ru: ["ХИТ ПРОДАЖ", "ВЫБОР ПОКУПАТЕЛЕЙ", "НОВИНКА", "ТОП-1 В КАТЕГОРИИ", "БЕСТСЕЛЛЕР"],
      uz: ["SOTUVDA LIDER", "XARIDORLAR TANLOVI", "YANGILIK", "KATEGORIYADA TOP-1", "BESTSELLER"],
      en: ["BEST SELLER", "CUSTOMERS' CHOICE", "NEW", "#1 IN CATEGORY", "TOP RATED"],
    },
    discounts: ["-30%", "-40%", "-50%", "-25%", "-35%"],
    headlines: {
      ru: [
        "{adj} {cat_l} нового уровня",
        "{cat} мечты",
        "{adj} {cat_l} для каждого дня",
        "{cat} premium-класса",
        "{cat} — ваш лучший выбор",
      ],
      uz: [
        "Sevib qoladigan {adj_l} {cat_l}",
        "Yangi darajadagi {cat_l}",
        "Aynan o‘sha {cat_l}",
        "Har kun uchun {adj_l} {cat_l}",
        "Siz uchun ishlaydigan {cat_l}",
      ],
      en: [
        "The {adj_l} {cat_l} you'll love",
        "A next-level {cat_l}",
        "The {cat_l} you were looking for",
        "Your everyday {adj_l} {cat_l}",
        "A {cat_l} that works for you",
      ],
    },
    subheadlines: {
      ru: ["Качество, проверенное тысячами покупателей", "Создан, чтобы служить долго", "Премиум-качество по честной цене", "То, что нужно именно вам"],
      uz: ["Minglab xaridorlar sinab ko‘rgan sifat", "Uzoq xizmat qilish uchun yaratilgan", "Halol narxda premium sifat", "Aynan sizga keraklisi"],
      en: ["Quality trusted by thousands", "Built to last", "Premium quality at a fair price", "Exactly what you need"],
    },
    cta: {
      ru: ["Закажите сегодня", "Добавьте в корзину", "Успейте по акции", "Закажите со скидкой"],
      uz: ["Bugun buyurtma bering", "Savatga qo‘shing", "Aksiyaga ulguring", "Chegirma bilan oling"],
      en: ["Order today", "Add to cart", "Grab the deal", "Order at a discount"],
    },
    specLabels: {
      ru: { material: "Материал", color: "Цвет", size: "Размер", weight: "Вес", warranty: "Гарантия", country: "Страна", power: "Мощность" },
      uz: { material: "Material", color: "Rang", size: "O‘lcham", weight: "Vazn", warranty: "Kafolat", country: "Mamlakat", power: "Quvvat" },
      en: { material: "Material", color: "Color", size: "Size", weight: "Weight", warranty: "Warranty", country: "Country", power: "Power" },
    },
    specValues: {
      colors: {
        ru: ["Графит", "Бежевый", "Чёрный", "Белый", "Синий", "Изумруд"],
        uz: ["Grafit", "Bej", "Qora", "Oq", "Ko‘k", "Zumrad"],
        en: ["Graphite", "Beige", "Black", "White", "Blue", "Emerald"],
      },
      warranty: { ru: ["12 мес", "24 мес", "36 мес"], uz: ["12 oy", "24 oy", "36 oy"], en: ["12 mo", "24 mo", "36 mo"] },
      country: { ru: ["Узбекистан", "Турция", "Китай", "Корея"], uz: ["O‘zbekiston", "Turkiya", "Xitoy", "Koreya"], en: ["Uzbekistan", "Turkey", "China", "Korea"] },
    },
    compare: {
      us: { ru: "Наш товар", uz: "Bizning mahsulot", en: "Our product" },
      them: { ru: "Обычные аналоги", uz: "Oddiy analoglar", en: "Ordinary alternatives" },
      rows: {
        ru: ["Премиум материалы", "Честная гарантия", "Быстрая доставка", "Поддержка 24/7", "Проверено покупателями"],
        uz: ["Premium materiallar", "Halol kafolat", "Tez yetkazib berish", "24/7 qo‘llab-quvvatlash", "Xaridorlar tomonidan sinovdan o‘tgan"],
        en: ["Premium materials", "Honest warranty", "Fast delivery", "24/7 support", "Verified by buyers"],
      },
    },
    bonus: {
      ru: [
        { icon: "🚚", t: "Быстрая доставка", d: "Отправка в день заказа" },
        { icon: "🛡️", t: "Гарантия качества", d: "Официальная гарантия" },
        { icon: "↩️", t: "Лёгкий возврат", d: "14 дней на возврат" },
        { icon: "🎁", t: "Подарочная упаковка", d: "Готов к подарку" },
      ],
      uz: [
        { icon: "🚚", t: "Tez yetkazish", d: "Buyurtma kuni jo‘natish" },
        { icon: "🛡️", t: "Sifat kafolati", d: "Rasmiy kafolat" },
        { icon: "↩️", t: "Oson qaytarish", d: "Qaytarishga 14 kun" },
        { icon: "🎁", t: "Sovg‘a qadog‘i", d: "Sovg‘aga tayyor" },
      ],
      en: [
        { icon: "🚚", t: "Fast delivery", d: "Ships the same day" },
        { icon: "🛡️", t: "Quality guarantee", d: "Official warranty" },
        { icon: "↩️", t: "Easy returns", d: "14-day returns" },
        { icon: "🎁", t: "Gift packaging", d: "Ready to gift" },
      ],
    },
    seo: {
      ru: "Купить {name} в Узбекистане по выгодной цене. {adj} {cat_l} с доставкой по Ташкенту и всей стране. {benefit}. Идеально для дома и подарка. Закажите на Uzum, Wildberries и Ozon с гарантией качества.",
      uz: "{name} ni O‘zbekistonda foydali narxda sotib oling. Toshkent va butun mamlakat bo‘ylab yetkazib berish bilan {adj_l} {cat_l}. {benefit}. Uy va sovg‘a uchun ideal. Uzum, Wildberries va Ozon’da kafolat bilan buyurtma qiling.",
      en: "Buy {name} at a great price. A {adj_l} {cat_l} with delivery across the country. {benefit}. Perfect for home and as a gift. Order on Uzum, Wildberries and Ozon with a quality guarantee.",
    },
    rating: ["4.8", "4.9", "5.0", "4.7"],
    reviews: ["1 240", "860", "2 105", "540", "3 480"],
  };

  /* Sample products for the "try a sample" flow (SVG data-URIs, no network). */
  const SAMPLES = [
    { id: "chair", emoji: "🪑", gender: "f", category: "furniture", accent: "#b9844f", label: { ru: "Кресло", uz: "Kreslo", en: "Chair" } },
    { id: "headphones", emoji: "🎧", gender: "f", category: "electronics", accent: "#3b82f6", label: { ru: "Наушники", uz: "Quloqchin", en: "Headphones" } },
    { id: "sneaker", emoji: "👟", gender: "f", category: "footwear", accent: "#ef5b4c", label: { ru: "Кроссовки", uz: "Krossovka", en: "Sneakers" } },
    { id: "bag", emoji: "👜", gender: "m", category: "accessory", accent: "#9b6b3f", label: { ru: "Сумка", uz: "Sumka", en: "Bag" } },
    { id: "cream", emoji: "🧴", gender: "f", category: "beauty", accent: "#e07aa8", label: { ru: "Крем", uz: "Krem", en: "Cream" } },
    { id: "watch", emoji: "⌚", category: "electronics", accent: "#0ea5e9", label: { ru: "Часы", uz: "Soat", en: "Watch" } },
  ];

  /* Plans for the subscription system */
  const PLANS = {
    free: { id: "free", price: { m: 0, y: 0 }, credits: 10, watermark: true,
      features: ["pricing.f.gen10", "pricing.f.watermark", "pricing.f.langs", "pricing.f.all_templates"] },
    pro: { id: "pro", price: { m: 99000, y: 79000 }, credits: 200, watermark: false, popular: true,
      features: ["pricing.f.gen200", "pricing.f.no_watermark", "pricing.f.hd", "pricing.f.copywriter", "pricing.f.editor", "pricing.f.pdf", "pricing.f.langs"] },
    business: { id: "business", price: { m: 249000, y: 199000 }, credits: 99999, watermark: false,
      features: ["pricing.f.gen_unlim", "pricing.f.no_watermark", "pricing.f.hd", "pricing.f.priority", "pricing.f.team", "pricing.f.api", "pricing.f.bulk", "pricing.f.support"] },
  };

  window.DATA = { MARKETPLACES, SIZES, STYLES, CATEGORIES, COPY, SAMPLES, PLANS };
})();
