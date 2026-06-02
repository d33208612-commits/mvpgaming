/* ============================================================
   MVP Gaming — Internationalization (RU / UZ / EN)
   All UI strings live here. Use MVP.t('key', {param:value}).
   ============================================================ */
(function () {
  const DICT = {
    /* ---------- Common ---------- */
    appName: { ru: 'MVP Gaming', uz: 'MVP Gaming', en: 'MVP Gaming' },
    back: { ru: 'Назад', uz: 'Orqaga', en: 'Back' },
    save: { ru: 'Сохранить', uz: 'Saqlash', en: 'Save' },
    cancel: { ru: 'Отмена', uz: 'Bekor qilish', en: 'Cancel' },
    confirm: { ru: 'Подтвердить', uz: 'Tasdiqlash', en: 'Confirm' },
    edit: { ru: 'Редактировать', uz: 'Tahrirlash', en: 'Edit' },
    delete: { ru: 'Удалить', uz: 'Oʻchirish', en: 'Delete' },
    add: { ru: 'Добавить', uz: 'Qoʻshish', en: 'Add' },
    close: { ru: 'Закрыть', uz: 'Yopish', en: 'Close' },
    search: { ru: 'Поиск', uz: 'Qidiruv', en: 'Search' },
    loading: { ru: 'Загрузка…', uz: 'Yuklanmoqda…', en: 'Loading…' },
    retry: { ru: 'Повторить', uz: 'Qayta urinish', en: 'Retry' },
    ok: { ru: 'Готово', uz: 'Tayyor', en: 'Done' },
    yes: { ru: 'Да', uz: 'Ha', en: 'Yes' },
    no: { ru: 'Нет', uz: 'Yoʻq', en: 'No' },
    seeAll: { ru: 'Все', uz: 'Hammasi', en: 'See all' },
    from: { ru: 'от', uz: '', en: 'from' },
    perHour: { ru: 'сум/час', uz: 'soʻm/soat', en: 'UZS/hour' },
    hour: { ru: 'час', uz: 'soat', en: 'hour' },
    hours: { ru: 'ч', uz: 'soat', en: 'h' },
    online: { ru: 'В сети', uz: 'Onlayn', en: 'Online' },
    offline: { ru: 'Не в сети', uz: 'Oflayn', en: 'Offline' },
    open: { ru: 'Открыто', uz: 'Ochiq', en: 'Open' },
    closed: { ru: 'Закрыто', uz: 'Yopiq', en: 'Closed' },
    km: { ru: 'км', uz: 'km', en: 'km' },
    reviews_count: { ru: 'отзывов', uz: 'sharh', en: 'reviews' },
    required: { ru: 'Обязательное поле', uz: 'Majburiy maydon', en: 'Required field' },
    comingSoon: { ru: 'Скоро будет доступно', uz: 'Tez orada', en: 'Coming soon' },

    /* ---------- Tabs ---------- */
    tab_home: { ru: 'Главная', uz: 'Bosh sahifa', en: 'Home' },
    tab_map: { ru: 'Карта', uz: 'Xarita', en: 'Map' },
    tab_favorites: { ru: 'Избранное', uz: 'Sevimlilar', en: 'Favorites' },
    tab_admin: { ru: 'Админ', uz: 'Admin', en: 'Admin' },
    tab_profile: { ru: 'Профиль', uz: 'Profil', en: 'Profile' },

    /* ---------- Home ---------- */
    home_location: { ru: 'Ташкент, Узбекистан', uz: 'Toshkent, Oʻzbekiston', en: 'Tashkent, Uzbekistan' },
    home_promo_title: { ru: 'Забронируй свой опыт!', uz: 'Oʻyin tajribangizni bron qiling!', en: 'Book your experience!' },
    home_promo_sub: { ru: '−20% на первую сессию', uz: 'Birinchi sessiyaga −20%', en: '−20% on your first session' },
    home_promo_btn: { ru: 'Забронировать', uz: 'Bron qilish', en: 'Book now' },
    home_promotions: { ru: 'Акции и промокоды', uz: 'Aksiyalar va promokodlar', en: 'Deals & promo codes' },
    home_popular: { ru: 'Популярные клубы', uz: 'Mashhur klublar', en: 'Popular clubs' },
    home_nearby: { ru: 'Клубы рядом', uz: 'Yaqin atrofdagi klublar', en: 'Clubs nearby' },
    home_search_ph: { ru: 'Поиск клубов, игр…', uz: 'Klub, oʻyin qidirish…', en: 'Search clubs, games…' },
    home_no_results: { ru: 'Ничего не найдено', uz: 'Hech narsa topilmadi', en: 'Nothing found' },

    /* ---------- Club detail ---------- */
    club_specs: { ru: 'Характеристики ПК', uz: 'PK xususiyatlari', en: 'PC specs' },
    club_rooms: { ru: 'Комнаты', uz: 'Xonalar', en: 'Rooms' },
    club_reviews: { ru: 'Отзывы', uz: 'Sharhlar', en: 'Reviews' },
    club_services: { ru: 'Услуги и игры', uz: 'Xizmatlar va oʻyinlar', en: 'Services & games' },
    club_about: { ru: 'О клубе', uz: 'Klub haqida', en: 'About' },
    club_book: { ru: 'Забронировать', uz: 'Bron qilish', en: 'Book now' },
    club_share: { ru: 'Поделиться', uz: 'Ulashish', en: 'Share' },
    spec_cpu: { ru: 'Процессор', uz: 'Protsessor', en: 'Processor' },
    spec_gpu: { ru: 'Видеокарта', uz: 'Videokarta', en: 'Graphics' },
    spec_ram: { ru: 'Оперативная память', uz: 'Operativ xotira', en: 'RAM' },
    spec_monitor: { ru: 'Монитор', uz: 'Monitor', en: 'Monitor' },
    spec_periph: { ru: 'Периферия', uz: 'Periferiya', en: 'Peripherals' },
    room_games: { ru: 'Доступные игры', uz: 'Mavjud oʻyinlar', en: 'Available games' },
    room_gallery: { ru: 'Фото и видео', uz: 'Foto va video', en: 'Photo & video' },
    room_price: { ru: 'Цена', uz: 'Narx', en: 'Price' },
    write_review: { ru: 'Оставить отзыв', uz: 'Sharh qoldirish', en: 'Write a review' },
    no_reviews: { ru: 'Пока нет отзывов', uz: 'Hozircha sharhlar yoʻq', en: 'No reviews yet' },

    /* ---------- Booking ---------- */
    booking_title: { ru: 'Бронирование', uz: 'Bron qilish', en: 'Booking' },
    booking_pick_room: { ru: 'Выберите комнату', uz: 'Xonani tanlang', en: 'Choose a room' },
    booking_pick_date: { ru: 'Выберите дату', uz: 'Sanani tanlang', en: 'Pick a date' },
    booking_pick_time: { ru: 'Время начала', uz: 'Boshlanish vaqti', en: 'Start time' },
    booking_duration: { ru: 'Длительность', uz: 'Davomiyligi', en: 'Duration' },
    booking_promo: { ru: 'Промокод', uz: 'Promokod', en: 'Promo code' },
    booking_promo_ph: { ru: 'Введите промокод', uz: 'Promokodni kiriting', en: 'Enter promo code' },
    booking_apply: { ru: 'Применить', uz: 'Qoʻllash', en: 'Apply' },
    booking_summary: { ru: 'Итог', uz: 'Yakuniy', en: 'Summary' },
    booking_subtotal: { ru: 'Стоимость', uz: 'Qiymati', en: 'Subtotal' },
    booking_discount: { ru: 'Скидка', uz: 'Chegirma', en: 'Discount' },
    booking_total: { ru: 'К оплате', uz: 'Toʻlovga', en: 'Total' },
    booking_pay: { ru: 'Подтвердить и оплатить', uz: 'Tasdiqlash va toʻlash', en: 'Confirm & pay' },
    booking_success: { ru: 'Бронирование подтверждено!', uz: 'Bron tasdiqlandi!', en: 'Booking confirmed!' },
    booking_success_sub: { ru: 'Мы ждём вас в клубе. Детали — в истории бронирований.', uz: 'Sizni klubda kutamiz. Tafsilotlar — bron tarixida.', en: 'See you at the club. Details are in your booking history.' },
    promo_applied: { ru: 'Промокод применён', uz: 'Promokod qoʻllanildi', en: 'Promo code applied' },
    promo_invalid: { ru: 'Промокод недействителен', uz: 'Promokod notoʻgʻri', en: 'Invalid promo code' },
    booking_login_required: { ru: 'Войдите, чтобы забронировать', uz: 'Bron qilish uchun kiring', en: 'Sign in to book' },

    /* ---------- Map ---------- */
    map_title: { ru: 'Карта клубов', uz: 'Klublar xaritasi', en: 'Clubs map' },
    map_list: { ru: 'Список клубов', uz: 'Klublar roʻyxati', en: 'Club list' },

    /* ---------- Favorites ---------- */
    fav_title: { ru: 'Избранное', uz: 'Sevimlilar', en: 'Favorites' },
    fav_empty: { ru: 'В избранном пока пусто', uz: 'Sevimlilar hozircha boʻsh', en: 'No favorites yet' },
    fav_empty_sub: { ru: 'Добавляйте клубы, которые хотите посетить', uz: 'Tashrif buyurmoqchi boʻlgan klublarni qoʻshing', en: 'Save clubs you want to visit' },

    /* ---------- Profile / Auth ---------- */
    profile_guest: { ru: 'Гость', uz: 'Mehmon', en: 'Guest' },
    profile_login_prompt: { ru: 'Войдите, чтобы бронировать и копить баллы', uz: 'Bron qilish va ball toʻplash uchun kiring', en: 'Sign in to book and earn points' },
    auth_login: { ru: 'Вход', uz: 'Kirish', en: 'Sign in' },
    auth_register: { ru: 'Регистрация', uz: 'Roʻyxatdan oʻtish', en: 'Sign up' },
    auth_phone: { ru: 'Номер телефона', uz: 'Telefon raqami', en: 'Phone number' },
    auth_name: { ru: 'Имя', uz: 'Ism', en: 'Name' },
    auth_password: { ru: 'Пароль', uz: 'Parol', en: 'Password' },
    auth_phone_ph: { ru: '+998 90 123 45 67', uz: '+998 90 123 45 67', en: '+998 90 123 45 67' },
    auth_name_ph: { ru: 'Как вас зовут?', uz: 'Ismingiz?', en: 'Your name' },
    auth_get_code: { ru: 'Получить код', uz: 'Kod olish', en: 'Get code' },
    auth_have_account: { ru: 'Уже есть аккаунт?', uz: 'Akkauntingiz bormi?', en: 'Already have an account?' },
    auth_no_account: { ru: 'Нет аккаунта?', uz: 'Akkauntingiz yoʻqmi?', en: 'No account?' },
    auth_register_club: { ru: 'Зарегистрировать клуб', uz: 'Klubni roʻyxatdan oʻtkazish', en: 'Register a club' },
    auth_logout: { ru: 'Выйти', uz: 'Chiqish', en: 'Log out' },
    auth_invalid_phone: { ru: 'Введите корректный номер', uz: 'Toʻgʻri raqam kiriting', en: 'Enter a valid phone number' },
    auth_invalid_creds: { ru: 'Неверный номер или пароль', uz: 'Raqam yoki parol notoʻgʻri', en: 'Wrong phone or password' },
    auth_pass_short: { ru: 'Пароль не короче 4 символов', uz: 'Parol kamida 4 ta belgi', en: 'Password must be 4+ characters' },
    auth_welcome: { ru: 'С возвращением!', uz: 'Xush kelibsiz!', en: 'Welcome back!' },

    /* ---------- Telegram verification ---------- */
    tg_title: { ru: 'Подтверждение номера', uz: 'Raqamni tasdiqlash', en: 'Verify your number' },
    tg_intro: { ru: 'Мы отправим 4‑значный код в Telegram. Нажмите кнопку ниже, откройте бота и нажмите «Старт».', uz: '4 xonali kodni Telegram orqali yuboramiz. Quyidagi tugmani bosing, botni oching va «Start»ni bosing.', en: 'We will send a 4‑digit code to Telegram. Tap the button below, open the bot and press “Start”.' },
    tg_open_bot: { ru: 'Открыть Telegram‑бот', uz: 'Telegram‑botni ochish', en: 'Open Telegram bot' },
    tg_enter_code: { ru: 'Введите код из Telegram', uz: 'Telegramdan kelgan kodni kiriting', en: 'Enter the code from Telegram' },
    tg_resend: { ru: 'Отправить код снова', uz: 'Kodni qayta yuborish', en: 'Resend code' },
    tg_verify: { ru: 'Подтвердить', uz: 'Tasdiqlash', en: 'Verify' },
    tg_wrong_code: { ru: 'Неверный код', uz: 'Kod notoʻgʻri', en: 'Wrong code' },
    tg_waiting: { ru: 'Ожидаем подтверждения в Telegram…', uz: 'Telegramda tasdiqlash kutilmoqda…', en: 'Waiting for Telegram confirmation…' },
    tg_sim_hint: { ru: 'Демо‑режим: код показан здесь, потому что бот не подключён.', uz: 'Demo rejimi: bot ulanmagani uchun kod shu yerda koʻrsatilgan.', en: 'Demo mode: code shown here because the bot is not connected.' },
    tg_sent: { ru: 'Код отправлен в Telegram', uz: 'Kod Telegramga yuborildi', en: 'Code sent to Telegram' },

    /* ---------- Club registration request ---------- */
    clubreg_title: { ru: 'Регистрация клуба', uz: 'Klubni roʻyxatdan oʻtkazish', en: 'Register a club' },
    clubreg_intro: { ru: 'Заполните заявку — мы свяжемся с вами и подключим панель администратора.', uz: 'Arizani toʻldiring — biz siz bilan bogʻlanamiz va admin panelni ulaymiz.', en: 'Fill out the request — we will contact you and connect the admin panel.' },
    clubreg_name: { ru: 'Название клуба', uz: 'Klub nomi', en: 'Club name' },
    clubreg_address: { ru: 'Геолокация / адрес', uz: 'Geolokatsiya / manzil', en: 'Geolocation / address' },
    clubreg_phone: { ru: 'Контактный номер', uz: 'Aloqa raqami', en: 'Contact number' },
    clubreg_role: { ru: 'Ваша роль', uz: 'Sizning rolingiz', en: 'Your role' },
    clubreg_role_owner: { ru: 'Владелец', uz: 'Egasi', en: 'Owner' },
    clubreg_role_admin: { ru: 'Администратор', uz: 'Administrator', en: 'Administrator' },
    clubreg_role_manager: { ru: 'Менеджер', uz: 'Menejer', en: 'Manager' },
    clubreg_desc: { ru: 'Комментарий (необязательно)', uz: 'Izoh (ixtiyoriy)', en: 'Comment (optional)' },
    clubreg_submit: { ru: 'Отправить заявку', uz: 'Ariza yuborish', en: 'Submit request' },
    clubreg_success: { ru: 'Заявка отправлена!', uz: 'Ariza yuborildi!', en: 'Request sent!' },
    clubreg_success_sub: { ru: 'Мы рассмотрим заявку и свяжемся с вами в ближайшее время.', uz: 'Arizani koʻrib chiqamiz va tez orada bogʻlanamiz.', en: 'We will review your request and get back to you soon.' },
    clubreg_demo_admin: { ru: 'Войти как админ клуба (демо)', uz: 'Klub admini sifatida kirish (demo)', en: 'Enter as club admin (demo)' },

    /* ---------- Profile menu ---------- */
    pm_level: { ru: 'Уровень', uz: 'Daraja', en: 'Level' },
    pm_points: { ru: 'баллов', uz: 'ball', en: 'points' },
    pm_discounts: { ru: 'Мои скидки и промокоды', uz: 'Chegirmalar va promokodlar', en: 'My discounts & promo codes' },
    pm_history: { ru: 'История бронирований', uz: 'Bron tarixi', en: 'Booking history' },
    pm_referral: { ru: 'Пригласить друга', uz: 'Doʻstni taklif qilish', en: 'Invite a friend' },
    pm_support: { ru: 'Поддержка', uz: 'Qoʻllab‑quvvatlash', en: 'Support' },
    pm_settings: { ru: 'Настройки', uz: 'Sozlamalar', en: 'Settings' },
    pm_language: { ru: 'Язык', uz: 'Til', en: 'Language' },
    pm_admin_panel: { ru: 'Панель администратора', uz: 'Administrator paneli', en: 'Admin panel' },

    /* ---------- Referral ---------- */
    ref_title: { ru: 'Пригласи друга', uz: 'Doʻstingni taklif qil', en: 'Invite a friend' },
    ref_headline: { ru: 'Поделись приложением и получи скидку 20%', uz: 'Ilovani ulashing va 20% chegirma oling', en: 'Share the app and get 20% off' },
    ref_desc: { ru: 'Друг получит −20% на первую сессию, а вы — бонусные баллы за каждого приглашённого.', uz: 'Doʻstingiz birinchi sessiyaga −20% oladi, siz esa har bir taklif uchun bonus ballar.', en: 'Your friend gets −20% on their first session, and you earn bonus points for each invite.' },
    ref_your_code: { ru: 'Ваш промокод', uz: 'Sizning promokodingiz', en: 'Your promo code' },
    ref_copy: { ru: 'Скопировать', uz: 'Nusxalash', en: 'Copy' },
    ref_copied: { ru: 'Скопировано', uz: 'Nusxalandi', en: 'Copied' },
    ref_share: { ru: 'Поделиться приложением', uz: 'Ilovani ulashish', en: 'Share the app' },

    /* ---------- Discounts ---------- */
    disc_title: { ru: 'Скидки и промокоды', uz: 'Chegirmalar va promokodlar', en: 'Discounts & promo codes' },
    disc_active: { ru: 'Активные', uz: 'Faol', en: 'Active' },
    disc_use: { ru: 'Использовать', uz: 'Foydalanish', en: 'Use' },
    disc_empty: { ru: 'Нет активных промокодов', uz: 'Faol promokodlar yoʻq', en: 'No active promo codes' },

    /* ---------- History ---------- */
    hist_title: { ru: 'История бронирований', uz: 'Bron tarixi', en: 'Booking history' },
    hist_empty: { ru: 'Бронирований пока нет', uz: 'Hozircha bronlar yoʻq', en: 'No bookings yet' },
    hist_upcoming: { ru: 'Предстоящие', uz: 'Kelgusi', en: 'Upcoming' },
    hist_past: { ru: 'Прошедшие', uz: 'Oʻtgan', en: 'Past' },

    /* ---------- Support ---------- */
    sup_title: { ru: 'Поддержка', uz: 'Qoʻllab‑quvvatlash', en: 'Support' },
    sup_chat: { ru: 'Чат с поддержкой', uz: 'Qoʻllab‑quvvatlash chati', en: 'Support chat' },
    sup_chat_ph: { ru: 'Напишите сообщение…', uz: 'Xabar yozing…', en: 'Type a message…' },
    sup_faq: { ru: 'Частые вопросы', uz: 'Tez‑tez beriladigan savollar', en: 'FAQ' },
    sup_contact: { ru: 'Связаться с нами', uz: 'Biz bilan bogʻlanish', en: 'Contact us' },
    sup_bot_reply: { ru: 'Здравствуйте! Чем можем помочь? Обычно отвечаем в течение 5 минут.', uz: 'Salom! Sizga qanday yordam bera olamiz? Odatda 5 daqiqada javob beramiz.', en: 'Hi! How can we help? We usually reply within 5 minutes.' },

    /* ---------- Notifications ---------- */
    notif_title: { ru: 'Уведомления', uz: 'Bildirishnomalar', en: 'Notifications' },
    notif_empty: { ru: 'Нет уведомлений', uz: 'Bildirishnomalar yoʻq', en: 'No notifications' },

    /* ---------- Settings ---------- */
    set_title: { ru: 'Настройки', uz: 'Sozlamalar', en: 'Settings' },
    set_language: { ru: 'Язык приложения', uz: 'Ilova tili', en: 'App language' },
    set_notifications: { ru: 'Уведомления', uz: 'Bildirishnomalar', en: 'Notifications' },
    set_account: { ru: 'Аккаунт', uz: 'Akkaunt', en: 'Account' },

    /* ---------- Admin: dashboard ---------- */
    adm_dashboard: { ru: 'Панель администратора', uz: 'Administrator paneli', en: 'Admin panel' },
    adm_analytics: { ru: 'Аналитика клуба', uz: 'Klub tahlili', en: 'Club analytics' },
    adm_month_may: { ru: 'Май', uz: 'May', en: 'May' },
    adm_attendance: { ru: 'Посещаемость за месяц', uz: 'Oylik tashriflar', en: 'Monthly attendance' },
    adm_unique_visitors: { ru: 'Уникальные посетители', uz: 'Noyob tashrif buyuruvchilar', en: 'Unique visitors' },
    adm_card_views: { ru: 'Просмотры карточки', uz: 'Kartochka koʻrishlar', en: 'Card views' },
    adm_avg_time: { ru: 'Среднее время в игре', uz: 'Oʻrtacha oʻyin vaqti', en: 'Avg. play time' },
    adm_bookings_stats: { ru: 'Статистика бронирований', uz: 'Bron statistikasi', en: 'Booking stats' },
    adm_total_bookings: { ru: 'Всего бронирований', uz: 'Jami bronlar', en: 'Total bookings' },
    adm_room_efficiency: { ru: 'Эффективность комнат', uz: 'Xonalar samaradorligi', en: 'Room efficiency' },
    adm_room_interest: { ru: 'Интерес по комнатам', uz: 'Xonalar boʻyicha qiziqish', en: 'Interest by room' },
    adm_conversion: { ru: 'Конверсия', uz: 'Konversiya', en: 'Conversion' },
    adm_occupancy: { ru: 'Загрузка', uz: 'Bandlik', en: 'Occupancy' },
    adm_status: { ru: 'Текущий статус', uz: 'Joriy holat', en: 'Current status' },
    adm_set_online: { ru: 'В сети', uz: 'Onlayn', en: 'Online' },
    adm_set_offline: { ru: 'Не в сети', uz: 'Oflayn', en: 'Offline' },
    adm_hide_club: { ru: 'Скрыть клуб', uz: 'Klubni yashirish', en: 'Hide club' },
    adm_recent_notif: { ru: 'Последние уведомления', uz: 'Soʻnggi bildirishnomalar', en: 'Recent notifications' },
    adm_edit_club: { ru: 'Редактирование клуба', uz: 'Klubni tahrirlash', en: 'Edit club' },
    adm_manage_reviews: { ru: 'Управление отзывами', uz: 'Sharhlarni boshqarish', en: 'Manage reviews' },
    adm_view_public: { ru: 'Посмотреть как пользователь', uz: 'Foydalanuvchi sifatida koʻrish', en: 'View as customer' },

    /* ---------- Admin: club editor ---------- */
    adm_change_photo: { ru: 'Изменить фото', uz: 'Rasmni oʻzgartirish', en: 'Change photo' },
    adm_main_info: { ru: 'Основная информация', uz: 'Asosiy maʼlumot', en: 'Main info' },
    adm_field_name: { ru: 'Название', uz: 'Nomi', en: 'Name' },
    adm_field_address: { ru: 'Адрес', uz: 'Manzil', en: 'Address' },
    adm_field_desc: { ru: 'Описание', uz: 'Tavsif', en: 'Description' },
    adm_field_phone: { ru: 'Телефон', uz: 'Telefon', en: 'Phone' },
    adm_field_hours: { ru: 'Часы работы', uz: 'Ish vaqti', en: 'Working hours' },
    adm_gallery: { ru: 'Фотогалерея', uz: 'Foto galereya', en: 'Photo gallery' },
    adm_manage_rooms: { ru: 'Управление комнатами', uz: 'Xonalarni boshqarish', en: 'Manage rooms' },
    adm_add_room: { ru: 'Добавить новую комнату', uz: 'Yangi xona qoʻshish', en: 'Add a new room' },
    adm_edit_details: { ru: 'Редактировать детали', uz: 'Tafsilotlarni tahrirlash', en: 'Edit details' },
    adm_update_club: { ru: 'Обновить клуб', uz: 'Klubni yangilash', en: 'Update club' },
    adm_club_saved: { ru: 'Клуб обновлён', uz: 'Klub yangilandi', en: 'Club updated' },
    adm_add_photo: { ru: 'Добавить фото (URL)', uz: 'Rasm qoʻshish (URL)', en: 'Add photo (URL)' },

    /* ---------- Admin: room editor ---------- */
    adm_room_edit: { ru: 'Редактирование комнаты', uz: 'Xonani tahrirlash', en: 'Edit room' },
    adm_room_new: { ru: 'Новая комната', uz: 'Yangi xona', en: 'New room' },
    adm_tab_specs: { ru: 'Характеристики ПК', uz: 'PK xususiyatlari', en: 'PC specs' },
    adm_tab_services: { ru: 'Услуги и игры', uz: 'Xizmatlar va oʻyinlar', en: 'Services & games' },
    adm_tab_media: { ru: 'Фото и видео', uz: 'Foto va video', en: 'Photo & video' },
    adm_room_name: { ru: 'Название комнаты', uz: 'Xona nomi', en: 'Room name' },
    adm_room_type: { ru: 'Тип', uz: 'Turi', en: 'Type' },
    adm_room_seats: { ru: 'Кол-во мест', uz: 'Joylar soni', en: 'Seats' },
    adm_room_price: { ru: 'Цена (сум/час)', uz: 'Narx (soʻm/soat)', en: 'Price (UZS/hour)' },
    adm_games_csv: { ru: 'Игры (через запятую)', uz: 'Oʻyinlar (vergul bilan)', en: 'Games (comma‑separated)' },
    adm_room_saved: { ru: 'Комната сохранена', uz: 'Xona saqlandi', en: 'Room saved' },
    adm_room_deleted: { ru: 'Комната удалена', uz: 'Xona oʻchirildi', en: 'Room deleted' },
    adm_delete_room_q: { ru: 'Удалить эту комнату?', uz: 'Bu xona oʻchirilsinmi?', en: 'Delete this room?' },

    /* ---------- Admin: reviews ---------- */
    adm_reviews_notif: { ru: 'Уведомления и коммуникация', uz: 'Bildirishnoma va aloqa', en: 'Notifications & communication' },
    adm_support_chat: { ru: 'Чат поддержки', uz: 'Qoʻllab‑quvvatlash chati', en: 'Support chat' },
    adm_general_faq: { ru: 'Общие вопросы (FAQ)', uz: 'Umumiy savollar (FAQ)', en: 'General FAQ' },
    adm_reviews_for: { ru: 'Отзывы о клубе', uz: 'Klub haqida sharhlar', en: 'Reviews for' },
    adm_reply: { ru: 'Ответить', uz: 'Javob berish', en: 'Reply' },
    adm_reply_ph: { ru: 'Ваш ответ…', uz: 'Javobingiz…', en: 'Your reply…' },
    adm_reply_sent: { ru: 'Ответ опубликован', uz: 'Javob eʼlon qilindi', en: 'Reply published' },
    adm_notify_promo: { ru: 'Уведомить об акциях', uz: 'Aksiyalar haqida xabar berish', en: 'Announce a promo' },
    adm_notify_sent: { ru: 'Уведомление отправлено пользователям', uz: 'Bildirishnoma foydalanuvchilarga yuborildi', en: 'Notification sent to users' },
    adm_msg_count: { ru: 'новых', uz: 'yangi', en: 'new' },

    /* ---------- Misc ---------- */
    visitors: { ru: 'Посетители', uz: 'Tashrif buyuruvchilar', en: 'Visitors' },
    views: { ru: 'Просмотры', uz: 'Koʻrishlar', en: 'Views' },
  };

  const LANGS = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'uz', label: 'Oʻzbekcha', flag: '🇺🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  const MVP = (window.MVP = window.MVP || {});
  MVP.i18n = {
    DICT,
    LANGS,
    current: 'ru',
    set(code) {
      if (DICT.appName[code] !== undefined || ['ru', 'uz', 'en'].includes(code)) {
        this.current = code;
        document.documentElement.lang = code;
      }
    },
    t(key, params) {
      const entry = DICT[key];
      let str = entry ? (entry[this.current] ?? entry.ru ?? key) : key;
      if (params) {
        Object.keys(params).forEach((p) => {
          str = str.replace(new RegExp('\\{' + p + '\\}', 'g'), params[p]);
        });
      }
      return str;
    },
  };
  // Convenience global
  MVP.t = (k, p) => MVP.i18n.t(k, p);
})();
