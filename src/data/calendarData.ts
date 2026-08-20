import { MarketingEvent, EventCategory } from '../types';

export const DEFAULT_CHECKLIST_TEMPLATES: Record<
  string,
  { task: string; category: 'PRODUCT' | 'STOCK' | 'PRICE' | 'MARKETING' | 'ADS' | 'OPERATION' }[]
> = {
  ECOMMERCE: [
    { task: 'Tentukan produk promo hero & best seller (Ajwa/Sukari)', category: 'PRODUCT' },
    { task: 'Susun paket hampers / bundling hemat kurma', category: 'PRODUCT' },
    { task: 'Audit stok fisik kurma di gudang', category: 'STOCK' },
    { task: 'Forecast kebutuhan kemasan toples, box & bubble wrap', category: 'STOCK' },
    { task: 'Hitung simulasi harga promo & potongan fee Shopee', category: 'PRICE' },
    { task: 'Pastikan margin promo tidak di bawah batas aman (15%)', category: 'PRICE' },
    { task: 'Setup voucher toko & program Gratis Ongkir XTRA', category: 'MARKETING' },
    { task: 'Buat banner promo toko & dekorasi Shopee Feed', category: 'MARKETING' },
    { task: 'Jadwalkan sesi Live Streaming Shopee Live', category: 'MARKETING' },
    { task: 'Setup iklan Shopee Ads / Discovery Ads', category: 'ADS' },
    { task: 'Siapkan tim packing & standby kurir pick-up Shopee Express/J&T', category: 'OPERATION' },
    { task: 'Briefing tim Customer Service respon cepat chat pembeli', category: 'OPERATION' }
  ],
  SEASONAL: [
    { task: 'Pilih varian kurma favorit edisi Ramadan & Hari Raya (Ajwa, Sukari, Medjool)', category: 'PRODUCT' },
    { task: 'Siapkan stok cadangan 3x lipat volume biasa', category: 'STOCK' },
    { task: 'Rancang paket gift box & hampers berkah lebaran', category: 'PRODUCT' },
    { task: 'Kalkulasi HPP kemasan khusus, pita & kartu ucapan Idul Fitri', category: 'PRICE' },
    { task: 'Mulai teaser kampanye di media sosial H-30 sebelum Ramadan', category: 'MARKETING' },
    { task: 'Pasang broadcast voucher pelanggan setia via chat', category: 'MARKETING' },
    { task: 'Antisipasi batas cut-off pengiriman ekspedisi mudik', category: 'OPERATION' }
  ],
  PAYDAY: [
    { task: 'Pilih produk konsumsi repeat order (Sukari Ember 1kg & Ajwa)', category: 'PRODUCT' },
    { task: 'Pastikan stok kemasan toples & pouch siap kirim', category: 'STOCK' },
    { task: 'Set diskon gajian 10% - 15% dengan margin aman', category: 'PRICE' },
    { task: 'Aktifkan Shopee Payday Voucher cashback', category: 'MARKETING' },
    { task: 'Blast pesan WhatsApp & Story medsos toko', category: 'MARKETING' },
    { task: 'Siapkan stiker fragile dan packing ekstra', category: 'OPERATION' }
  ],
  GENERAL: [
    { task: 'Tinjau produk yang relevan dengan momentum hari besar', category: 'PRODUCT' },
    { task: 'Cek ketersediaan stok fisik produk', category: 'STOCK' },
    { task: 'Buat konten ucapan bertema & posting di medsos toko', category: 'MARKETING' },
    { task: 'Tawarkan promo flash diskon spesial 1 hari', category: 'PRICE' }
  ]
};

export function getSmartRecommendations(category: EventCategory, title: string): string[] {
  switch (category) {
    case 'DOUBLE_DATE':
      return [
        '🚀 Ikuti program Shopee Double Date Mega Sale & Flash Sale 1.000.',
        '📦 Rilis paket bundling 2-3 toples kurma untuk menaikkan Average Order Value (AOV).',
        '⭐ Pasang diskon coret dengan menjaga margin minimal 15% menggunakan simulator.',
        '🎥 Jadwalkan live streaming interaktif berhadiah koin Shopee.',
        '📢 Manfaatkan fitur Shopee Affiliate & pasang komisi 5-10% untuk creator.'
      ];
    case 'PAYDAY':
      return [
        '💳 Targetkan pembeli yang baru gajian dengan promo repeat order bulanan.',
        '🥥 Promosikan Kurma Sukari Ember 1kg & Ajwa Madinah porsi keluarga.',
        '🎟️ Buat voucher "Min. Belanja Rp150.000 Diskon Rp15.000" untuk dorong keranjang besar.',
        '🚚 Aktifkan Gratis Ongkir XTRA agar pembeli tidak terbebani ongkir.'
      ];
    case 'SEASONAL':
      if (title.toLowerCase().includes('ramadan') || title.toLowerCase().includes('lebaran') || title.toLowerCase().includes('idul')) {
        return [
          '🌙 Periode panen terbesar penjualan kurma sepanjang tahun!',
          '🎁 Wajib siapkan Hampers Berkah, Box Eksklusif, dan Souvenir Tasbih/Sajadah.',
          '📈 Stok bahan baku kurma harus diamankan minimal H-60 sebelum Ramadan.',
          '💬 Gunakan broadcast pesan berkala ke seluruh pelanggan tahun lalu.',
          '⏳ Waspadai overload ekspedisi pada H-7 sebelum Idul Fitri.'
        ];
      }
      return [
        '🎯 Sesuaikan visual produk dengan tema seasonal yang sedang hangat.',
        '🏷️ Buat penawaran terbatas dengan hitung mundur di deskripsi produk.'
      ];
    case 'NATIONAL_HOLIDAY':
    case 'NATIONAL_DAY':
      return [
        '🇮🇩 Buat konten tematik kebangsaan & ucapan selamat di feed toko.',
        '🔥 Promo Flash 1 hari dengan kode voucher bertema nasional.',
        '📦 Pastikan jadwal operasional ekspedisi libur nasional telah diumumkan ke pembeli.'
      ];
    default:
      return [
        '🔍 Pantau kompetitor di kategori kurma.',
        '💡 Uji coba diskon khusus produk yang perputarannya agak lambat (slow-moving).',
        '✨ Perbarui foto produk utama agar lebih menarik dan segar.'
      ];
  }
}

/**
 * Generate comprehensive base events for a given year (2026, 2027, 2028, etc.)
 */
export function generateYearlyEvents(year: number): MarketingEvent[] {
  const events: MarketingEvent[] = [];

  const createEv = (
    idSuffix: string,
    title: string,
    date: string,
    category: EventCategory,
    priority: MarketingEvent['priority'],
    sourceType: MarketingEvent['sourceType'],
    isOfficial: boolean,
    isConfirmed: boolean,
    description: string,
    templateKey: keyof typeof DEFAULT_CHECKLIST_TEMPLATES = 'GENERAL',
    platforms: MarketingEvent['platforms'] = ['Shopee', 'Tokopedia', 'TikTok Shop', 'Instagram', 'WhatsApp'],
    startDate?: string,
    endDate?: string
  ): MarketingEvent => {
    const rawChecklist = DEFAULT_CHECKLIST_TEMPLATES[templateKey] || DEFAULT_CHECKLIST_TEMPLATES.GENERAL;
    const checklist = rawChecklist.map((item, idx) => ({
      id: `chk_${year}_${idSuffix}_${idx}`,
      task: item.task,
      category: item.category,
      completed: false
    }));

    return {
      id: `mkt_ev_${year}_${idSuffix}`,
      title,
      description,
      date,
      startDate: startDate || date,
      endDate: endDate || date,
      category,
      priority,
      sourceType,
      isOfficial,
      isConfirmed,
      isActive: true,
      platforms,
      reminderEnabled: true,
      reminderDays: [30, 14, 7, 3, 1, 0],
      preparationChecklist: checklist,
      promotedProducts: [],
      year,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  // 1. DOUBLE DATE SALES (1.1 to 12.12)
  for (let m = 1; m <= 12; m++) {
    const monthStr = m < 10 ? `0${m}` : `${m}`;
    const dayStr = monthStr;
    const isMajor = m >= 9; // 9.9, 10.10, 11.11, 12.12
    const name =
      m === 12
        ? `12.12 HARBOLNAS & MEGA SHOPPING DAY`
        : m === 11
        ? `11.11 BIG SALE FESTIVAL`
        : m === 9
        ? `9.9 SUPER SHOPPING DAY`
        : m === 10
        ? `10.10 BRANDS FESTIVAL`
        : `${m}.${m} DOUBLE DATE SALE`;

    events.push(
      createEv(
        `dd_${m}`,
        name,
        `${year}-${monthStr}-${dayStr}`,
        'DOUBLE_DATE',
        isMajor ? 'CRITICAL' : 'HIGH',
        'MARKETPLACE',
        false,
        true,
        `Kampanye mega belanja bulanan tanggal kembar ${m}.${m} di marketplace Shopee, Tokopedia & TikTok Shop.`,
        'ECOMMERCE',
        ['Shopee', 'Tokopedia', 'TikTok Shop', 'All Channels']
      )
    );
  }

  // 2. MONTHLY PAYDAY SALES (25th to last day of each month)
  for (let m = 1; m <= 12; m++) {
    const monthStr = m < 10 ? `0${m}` : `${m}`;
    const lastDay = new Date(year, m, 0).getDate();
    events.push(
      createEv(
        `payday_${m}`,
        `PAYDAY SALE BULAN ${new Date(year, m - 1, 1).toLocaleString('id-ID', { month: 'long' }).toUpperCase()}`,
        `${year}-${monthStr}-25`,
        'PAYDAY',
        'MEDIUM',
        'MARKETPLACE',
        false,
        true,
        `Kampanye gajian rutin Shopee Payday Sale tanggal 25 s/d akhir bulan. Momentum belanja keluarga.`,
        'PAYDAY',
        ['Shopee', 'Tokopedia', 'TikTok Shop', 'WhatsApp'],
        `${year}-${monthStr}-25`,
        `${year}-${monthStr}-${lastDay}`
      )
    );
  }

  // 3. NATIONAL HOLIDAYS & OFFICIAL DAYS (Indonesia Reference)
  if (year === 2026) {
    events.push(
      createEv('hol_ny_26', 'Tahun Baru 2026 Masehi', '2026-01-01', 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Libur Nasional Tahun Baru.'),
      createEv('hol_isramiraj_26', 'Isra Mi\'raj Nabi Muhammad SAW', '2026-01-16', 'NATIONAL_HOLIDAY', 'HIGH', 'OFFICIAL', true, true, 'Hari libur keagamaan Islam, momentum meningkatkan penjualan kurma berkah.', 'SEASONAL'),
      createEv('hol_imlek_26', 'Tahun Baru Imlek 2577 Kongzili', '2026-02-17', 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Libur Nasional Imlek.'),
      createEv('sea_ramadan_26', 'Awal Puasa Ramadan 1447 H', '2026-02-18', 'SEASONAL', 'CRITICAL', 'OFFICIAL', false, true, 'PUNCAK PENJUALAN KURMA TAHUNAN! Awali kampanye stok dan hampers.', 'SEASONAL'),
      createEv('hol_nyepi_26', 'Hari Suci Nyepi Tahun Baru Saka 1948', '2026-03-20', 'NATIONAL_HOLIDAY', 'LOW', 'OFFICIAL', true, true, 'Libur Nasional Nyepi.'),
      createEv('hol_idulfitri_26', 'Hari Raya Idul Fitri 1447 H (Lebaran)', '2026-03-21', 'NATIONAL_HOLIDAY', 'CRITICAL', 'OFFICIAL', true, true, 'Puncak Hari Raya Idul Fitri. Paket hampers kurma dan sajian tamu.', 'SEASONAL', undefined, '2026-03-21', '2026-03-22'),
      createEv('cuti_lebaran_26', 'Cuti Bersama Hari Raya Idul Fitri 1447 H', '2026-03-23', 'COLLECTIVE_LEAVE', 'HIGH', 'OFFICIAL', true, true, 'Periode libur cuti bersama mudik Lebaran.', 'SEASONAL', undefined, '2026-03-23', '2026-03-26'),
      createEv('hol_waisak_26', 'Hari Raya Waisak 2570 BE', '2026-05-31', 'NATIONAL_HOLIDAY', 'LOW', 'OFFICIAL', true, true, 'Libur Nasional Hari Raya Waisak.'),
      createEv('hol_iduladha_26', 'Hari Raya Idul Adha 1447 H', '2026-05-27', 'NATIONAL_HOLIDAY', 'HIGH', 'OFFICIAL', true, true, 'Hari Raya Qurban. Penjualan kurma untuk hidangan dan oleh-oleh haji.', 'SEASONAL'),
      createEv('hol_hijriyah_26', 'Tahun Baru Islam 1448 H', '2026-06-16', 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Libur Nasional 1 Muharram.'),
      createEv('hol_kemerdekaan_26', 'HUT Kemerdekaan RI ke-81', '2026-08-17', 'NATIONAL_HOLIDAY', 'HIGH', 'OFFICIAL', true, true, 'Hari Kemerdekaan Republik Indonesia. Promo diskon 17-an & Merdeka Sale.'),
      createEv('hol_maulid_26', 'Maulid Nabi Muhammad SAW', '2026-08-26', 'NATIONAL_HOLIDAY', 'HIGH', 'OFFICIAL', true, true, 'Hari libur kelahiran Nabi Muhammad SAW. Momentum kurma Ajwa Nabi.', 'SEASONAL'),
      createEv('hol_natal_26', 'Hari Raya Natal 2026', '2026-12-25', 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Libur Nasional Natal & promo liburan akhir tahun.')
    );
  } else if (year === 2027) {
    events.push(
      createEv('hol_ny_27', 'Tahun Baru 2027 Masehi', '2027-01-01', 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Libur Nasional Tahun Baru.'),
      createEv('sea_ramadan_27', 'Awal Puasa Ramadan 1448 H', '2027-02-08', 'SEASONAL', 'CRITICAL', 'OFFICIAL', false, true, 'PUNCAK PENJUALAN KURMA TAHUNAN 2027!', 'SEASONAL'),
      createEv('hol_idulfitri_27', 'Hari Raya Idul Fitri 1448 H', '2027-03-10', 'NATIONAL_HOLIDAY', 'CRITICAL', 'OFFICIAL', true, true, 'Puncak Hari Raya Idul Fitri 1448 H.', 'SEASONAL'),
      createEv('hol_kemerdekaan_27', 'HUT Kemerdekaan RI ke-82', '2027-08-17', 'NATIONAL_HOLIDAY', 'HIGH', 'OFFICIAL', true, true, 'HUT Kemerdekaan RI.'),
      createEv('hol_natal_27', 'Hari Raya Natal 2027', '2027-12-25', 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Libur Nasional Natal.')
    );
  } else {
    // Generic generator for other years
    events.push(
      createEv(`hol_ny_${year}`, `Tahun Baru ${year} Masehi`, `${year}-01-01`, 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, `Libur Nasional Tahun Baru ${year}.`),
      createEv(`hol_kemerdekaan_${year}`, `HUT Kemerdekaan RI`, `${year}-08-17`, 'NATIONAL_HOLIDAY', 'HIGH', 'OFFICIAL', true, true, 'HUT Kemerdekaan Republik Indonesia.'),
      createEv(`hol_natal_${year}`, `Hari Raya Natal ${year}`, `${year}-12-25`, 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, `Libur Nasional Natal ${year}.`)
    );
  }

  // 4. IMPORTANT NATIONAL & INTERNATIONAL DAYS (Marketing Opportunities)
  events.push(
    createEv(`day_val_${year}`, 'Hari Valentine (Kasih Sayang)', `${year}-02-14`, 'INTERNATIONAL_DAY', 'MEDIUM', 'MARKETPLACE', false, true, 'Peluang promo olahan kurma cokelat & paket gift.'),
    createEv(`day_kartini_${year}`, 'Hari Kartini', `${year}-04-21`, 'NATIONAL_DAY', 'LOW', 'OFFICIAL', true, true, 'Hari Kartini, promosi untuk ibu & wanita pembeli setia.'),
    createEv(`day_hardiknas_${year}`, 'Hari Pendidikan Nasional', `${year}-05-02`, 'NATIONAL_DAY', 'LOW', 'OFFICIAL', true, true, 'Momentum kampanye edukasi manfaat gizi buah kurma.'),
    createEv(`day_pancasila_${year}`, 'Hari Lahir Pancasila', `${year}-06-01`, 'NATIONAL_HOLIDAY', 'MEDIUM', 'OFFICIAL', true, true, 'Hari Lahir Pancasila.'),
    createEv(`day_backtoschool_${year}`, 'Back to School Promo Season', `${year}-07-10`, 'SEASONAL', 'MEDIUM', 'MARKETPLACE', false, true, 'Bekal sehat anak sekolah: sari kurma & camilan kurma madu.', 'SEASONAL', undefined, `${year}-07-10`, `${year}-07-20`),
    createEv(`day_sumpahpemuda_${year}`, 'Hari Sumpah Pemuda', `${year}-10-28`, 'NATIONAL_DAY', 'LOW', 'OFFICIAL', true, true, 'Hari Sumpah Pemuda.'),
    createEv(`day_pahlawan_${year}`, 'Hari Pahlawan', `${year}-11-10`, 'NATIONAL_DAY', 'LOW', 'OFFICIAL', true, true, 'Hari Pahlawan Nasional.'),
    createEv(`day_blackfriday_${year}`, 'Black Friday Global Sale', `${year}-11-27`, 'ECOMMERCE', 'HIGH', 'MARKETPLACE', false, true, 'Pesta diskon Black Friday di marketplace.'),
    createEv(`day_cybermonday_${year}`, 'Cyber Monday Online Deals', `${year}-11-30`, 'ECOMMERCE', 'HIGH', 'MARKETPLACE', false, true, 'Cyber Monday belanja online.'),
    createEv(`day_hariibu_${year}`, 'Hari Ibu Nasional', `${year}-12-22`, 'NATIONAL_DAY', 'HIGH', 'OFFICIAL', true, true, 'Hari Ibu. Rekomendasi hampers kurma Ajwa sebagai kado spesial untuk ibu.', 'SEASONAL'),
    createEv(`day_yearend_${year}`, 'Year End Sale & Cuci Gudang', `${year}-12-28`, 'SEASONAL', 'HIGH', 'MARKETPLACE', false, true, 'Promo cuci gudang kurma & resolusi sehat tahun baru.', 'ECOMMERCE', undefined, `${year}-12-28`, `${year}-12-31`)
  );

  return events;
}

export const INITIAL_MARKETING_EVENTS: MarketingEvent[] = [
  ...generateYearlyEvents(2026),
  ...generateYearlyEvents(2027)
];
