/* ============================================================
   MVP Gaming — Seed data (default clubs, rooms, promos, games)
   Used on first launch; afterwards state is persisted in
   localStorage and can be edited from the admin panel.
   ============================================================ */
(function () {
  const MVP = (window.MVP = window.MVP || {});

  // Game catalogue (id -> label). Used as chips on rooms.
  const GAMES = {
    cs2: 'CS2',
    dota2: 'Dota 2',
    valorant: 'Valorant',
    pubg: 'PUBG',
    apex: 'Apex Legends',
    fortnite: 'Fortnite',
    gta5: 'GTA V',
    cyberpunk: 'Cyberpunk 2077',
    warzone: 'Warzone',
    lol: 'League of Legends',
    fc24: 'EA FC 24',
    mk1: 'Mortal Kombat 1',
    gow: 'God of War',
    spiderman: 'Spider-Man 2',
    tekken8: 'Tekken 8',
    ufc5: 'UFC 5',
  };

  function room(o) {
    return Object.assign(
      {
        id: o.id,
        name: o.name,
        type: o.type, // standard | vip | premium | bootcamp | console
        seats: o.seats || 8,
        price: o.price, // UZS per hour
        description: o.description || '',
        specs: o.specs,
        games: o.games || [],
        gallery: o.gallery || ['room-' + o.id + '-1', 'room-' + o.id + '-2', 'room-' + o.id + '-3'],
        video: o.video || null,
      },
      {}
    );
  }

  const PC_STANDARD = { cpu: 'Intel Core i5-13400F', gpu: 'NVIDIA RTX 4060 8GB', ram: '16GB DDR5', monitor: '24" 165Hz', periph: 'Logitech G / HyperX' };
  const PC_VIP = { cpu: 'Intel Core i7-13700K', gpu: 'NVIDIA RTX 4070 Ti', ram: '32GB DDR5', monitor: '27" 240Hz', periph: 'Razer / SteelSeries' };
  const PC_BOOT = { cpu: 'Intel Core i9-13900K', gpu: 'NVIDIA RTX 4090 24GB', ram: '64GB DDR5', monitor: '27" 360Hz', periph: 'Pro tournament gear' };
  const PS5_SPEC = { cpu: 'PlayStation 5 (CFI-1216)', gpu: 'RDNA 2 / Ray Tracing', ram: '16GB GDDR6', monitor: 'LG OLED 65" 4K 120Hz', periph: 'DualSense ×2' };

  function defaultClubs() {
    return [
      {
        id: 'glhf',
        name: 'GL HF Gaming Club',
        address: 'ул. Алишера Навои, 45',
        city: 'Tashkent',
        lat: 41.3111,
        lng: 69.2797,
        phone: '+998 90 123 45 67',
        hours: '10:00 – 02:00',
        rating: 4.9,
        reviewsCount: 150,
        distanceKm: 1.2,
        online: true,
        hidden: false,
        ownerId: 'admin@glhf',
        description:
          'Премиальный киберспортивный клуб в центре Ташкента. Игровые ПК последнего поколения, буткемп-зона для команд и зона PlayStation 5.',
        gallery: ['glhf-1', 'glhf-2', 'glhf-3', 'glhf-4'],
        specsHighlight: PC_VIP,
        rooms: [
          room({ id: 'glhf-standard', name: 'Standard', type: 'standard', seats: 20, price: 15000, specs: PC_STANDARD, games: ['cs2', 'dota2', 'valorant', 'pubg', 'fortnite'], description: 'Стандартная зона для повседневной игры и общения с друзьями.' }),
          room({ id: 'glhf-vip', name: 'VIP', type: 'vip', seats: 8, price: 25000, specs: PC_VIP, games: ['cs2', 'valorant', 'apex', 'warzone', 'cyberpunk'], description: 'VIP-комната с изолированным пространством, мощными ПК и удобными креслами.' }),
          room({ id: 'glhf-bootcamp', name: 'Bootcamp', type: 'bootcamp', seats: 5, price: 35000, specs: PC_BOOT, games: ['cs2', 'dota2', 'valorant', 'lol'], description: 'Закрытая буткемп-студия для тренировок команд: 5 рабочих мест, тренерское место, трансляция.' }),
        ],
        reviews: [
          { id: 'r1', author: 'AlisherUz', rating: 5, text: 'Лучший клуб в городе! Мощные ПК, быстрый интернет, приятный персонал.', date: '2026-05-21', reply: null },
          { id: 'r2', author: 'CyberSlay', rating: 4.5, text: 'Отличная атмосфера, но иногда сложно забронировать VIP в выходные.', date: '2026-05-18', reply: 'Спасибо! Добавили больше слотов на выходные.' },
          { id: 'r3', author: 'NargizaG', rating: 5, text: 'Буткемп-зона просто огонь для тренировок нашей команды.', date: '2026-05-10', reply: null },
        ],
        stats: {
          cardViews: 1245, cardViewsTrend: 15,
          uniqueVisitors: 237, avgTimeH: 1.1,
          totalBookings: 215, bookingsTrend: 8,
          conversion: 17.3, occupancy: 63,
          roomInterest: { Standard: 450, VIP: 320, Bootcamp: 180 },
          attendance: [120, 180, 150, 210, 240, 200, 260, 300, 280, 320, 360, 410],
        },
      },
      {
        id: 'cyber',
        name: 'Cyberspace Arena',
        address: 'ул. Амира Темура, 108',
        city: 'Tashkent',
        lat: 41.3275,
        lng: 69.2817,
        phone: '+998 90 555 11 22',
        hours: '24/7',
        rating: 4.7,
        reviewsCount: 98,
        distanceKm: 2.4,
        online: true,
        hidden: false,
        ownerId: 'owner@cyber',
        description:
          'Круглосуточная киберарена с турнирной сценой и стримерскими комнатами. Идеально для команд и одиночных игроков.',
        gallery: ['cyber-1', 'cyber-2', 'cyber-3'],
        specsHighlight: PC_BOOT,
        rooms: [
          room({ id: 'cyber-standard', name: 'Standard', type: 'standard', seats: 30, price: 13000, specs: PC_STANDARD, games: ['cs2', 'dota2', 'fortnite', 'gta5'], description: 'Большая открытая зона на 30 мест.' }),
          room({ id: 'cyber-vip', name: 'VIP', type: 'vip', seats: 10, price: 22000, specs: PC_VIP, games: ['valorant', 'apex', 'warzone'], description: 'VIP-залы с премиальной периферией.' }),
          room({ id: 'cyber-premium', name: 'Premium', type: 'premium', seats: 6, price: 32000, specs: PC_BOOT, games: ['cs2', 'cyberpunk', 'dota2'], description: 'Премиум-комната с топовым железом и приватным входом.' }),
        ],
        reviews: [
          { id: 'r1', author: 'Bekzod7', rating: 5, text: 'Работают 24/7 — можно играть всю ночь. Классно!', date: '2026-05-20', reply: null },
          { id: 'r2', author: 'MaxPower', rating: 4, text: 'Хорошие компы, но кондиционер слабоват летом.', date: '2026-05-12', reply: null },
        ],
        stats: {
          cardViews: 980, cardViewsTrend: 9,
          uniqueVisitors: 190, avgTimeH: 1.4,
          totalBookings: 168, bookingsTrend: 5,
          conversion: 15.1, occupancy: 58,
          roomInterest: { Standard: 380, VIP: 240, Premium: 140 },
          attendance: [90, 140, 130, 170, 190, 175, 210, 230, 220, 250, 270, 300],
        },
      },
      {
        id: 'neon',
        name: 'Neon Esports Lounge',
        address: 'ул. Бабура, 27',
        city: 'Tashkent',
        lat: 41.2995,
        lng: 69.2401,
        phone: '+998 90 777 33 44',
        hours: '11:00 – 00:00',
        rating: 4.6,
        reviewsCount: 76,
        distanceKm: 3.1,
        online: false,
        hidden: false,
        ownerId: 'owner@neon',
        description:
          'Уютный лаунж с зоной PlayStation 5 и Xbox. Отлично подходит для компании друзей и файтингов на большом экране.',
        gallery: ['neon-1', 'neon-2', 'neon-3'],
        specsHighlight: PC_VIP,
        rooms: [
          room({ id: 'neon-standard', name: 'Standard', type: 'standard', seats: 16, price: 12000, specs: PC_STANDARD, games: ['cs2', 'fortnite', 'gta5', 'pubg'], description: 'Стандартные игровые места для ежедневной игры.' }),
          room({ id: 'neon-vip', name: 'VIP', type: 'vip', seats: 6, price: 20000, specs: PC_VIP, games: ['valorant', 'apex', 'cyberpunk'], description: 'VIP-зона с приватной атмосферой.' }),
          room({ id: 'neon-ps5', name: 'PlayStation 5', type: 'console', seats: 4, price: 18000, specs: PS5_SPEC, games: ['fc24', 'mk1', 'gow', 'spiderman', 'tekken8', 'ufc5'], description: 'Консольная зона PS5 на 65" OLED. Файтинги и эксклюзивы на двоих и компанией.' }),
        ],
        reviews: [
          { id: 'r1', author: 'Sardor', rating: 5, text: 'PS5 на огромном телеке — топ для FIFA с друзьями!', date: '2026-05-19', reply: null },
          { id: 'r2', author: 'Dilnoza', rating: 4.5, text: 'Очень уютно, приятная музыка и свет.', date: '2026-05-09', reply: null },
        ],
        stats: {
          cardViews: 640, cardViewsTrend: 12,
          uniqueVisitors: 142, avgTimeH: 1.6,
          totalBookings: 121, bookingsTrend: 6,
          conversion: 18.9, occupancy: 49,
          roomInterest: { Standard: 260, VIP: 150, 'PlayStation 5': 210 },
          attendance: [60, 90, 100, 120, 140, 130, 160, 180, 170, 200, 220, 240],
        },
      },
    ];
  }

  function defaultPromos() {
    return [
      { id: 'p1', code: 'FIRST20', title: 'Первая ночь', subtitle: '−20% на первую сессию', discount: 20, palette: 0, clubId: null },
      { id: 'p2', code: 'NIGHT30', title: 'Kibernight', subtitle: '−30% с 00:00 до 06:00', discount: 30, palette: 1, clubId: 'glhf' },
      { id: 'p3', code: 'CSGO15', title: 'Турнир CS2', subtitle: '−15% участникам турнира', discount: 15, palette: 2, clubId: 'cyber' },
      { id: 'p4', code: 'PS5DUO', title: 'PS5 на двоих', subtitle: '−25% на парные сессии', discount: 25, palette: 4, clubId: 'neon' },
    ];
  }

  // The demo admin account is pre-provisioned and owns GL HF Gaming Club.
  function defaultUsers() {
    return [
      {
        id: 'admin@glhf',
        phone: '+998 90 123 45 67',
        name: 'GL HF Admin',
        password: 'admin',
        role: 'admin',
        clubId: 'glhf',
        points: 0,
        level: 'ADMIN',
        verified: true,
      },
    ];
  }

  MVP.GAMES = GAMES;
  MVP.seed = { clubs: defaultClubs, promos: defaultPromos, users: defaultUsers };
})();
