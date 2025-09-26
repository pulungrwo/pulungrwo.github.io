// kas.js
// Penyimpanan data arus kas per tahun Hijriah

const kasData = {
"1448H": [
{
date: "2025-09-27",
description: "Sumbangan",
type: "income",
amount: 15000,
note: "hahahahahahahahahaha",
receipt: ""
},
],
"1447H": [
    {
date: "2025-08-08",
description: "Panen Jagung",
type: "income",
amount: 4000000,
note: "Untung bersih ±7.300.000 dibagi 2 dengan pengelola lahan, pengelola membulatkan 4.000.000 untuk kas masjid (detailnya tanyakan kepada BPK. Nurman)."
},
{
date: "2025-08-08",
description: "Sisa Kas",
type: "income",
amount: 825000,
note: "Sisa uang infak dan sumbangan warga yang di pegang oleh bapak Suhdi selaku bendahara lama, sisa 824 RB digenapkan 825.",
receipt: "/masjid/bukti/IMG_20250812_171022_375.jpg"
},
{
date: "2025-08-08",
description: "Pasang Kaca",
type: "expense",
amount: 3000000,
note: "Pemesanan pasang kaca kepada mas SAKIP tanjung sari 2",
receipt: "/masjid/bukti/IMG-20250811-WA0006.jpg"
},
{
date: "2025-08-08",
description: "Untuk RISMA",
type: "expense",
amount: 500000,
note: "Bantuan 500 ribu untuk modal RISMA mengelola lahan 2 Rante."
},
{
date: "2025-08-15",
description: "Infak Jumat",
type: "income",
amount: 30000,
note: "",
receipt: ""
},
{
date: "2025-08-15",
description: "Infak Karet",
type: "income",
amount: 150000,
note: "Kotak infak ditempat ibu eli",
receipt: ""
},
{
date: "2025-08-22",
description: "Infak Jumat",
type: "income",
amount: 35000,
note: "",
receipt: ""
},
{
date: "2025-08-22",
description: "Beli Mic + Bensin",
type: "expense",
amount: 235000,
note: "Harga mic 225.000 dan untuk beli bensin motor bapak RT Suhdi 10.000",
receipt: "/masjid/bukti/Screenshot_20250822-170932.jpg"
},
{
date: "2025-08-23",
description: "Beli Amplifier",
type: "expense",
amount: 514000,
note: "Pembelian amplifier 2000watt 4 channel",
receipt: "/masjid/bukti/beli-ampli-masjid-2000watt-4channel.jpg"
},
{
date: "2025-08-29",
description: "Infak Jumat",
type: "income",
amount: 15000,
note: "",
receipt: ""
},
{
date: "2025-09-12",
description: "Infak Jumat",
type: "income",
amount: 35000,
note: "",
receipt: ""
},
{
date: "2025-09-16",
description: "Obat Lulangan",
type: "expense",
amount: 70000,
note: "beli online Herbisida GluBest 65.000 + biaya admin brilink 5.000",
receipt: "/masjid/bukti/obat-lulangan-16sep2025.jpg"
},
{
date: "2025-09-19",
description: "Infak Jumat",
type: "income",
amount: 12000,
note: "",
receipt: ""
},
{
date: "2025-09-19",
description: "Konsumsi Rapat",
type: "expense",
amount: 53000,
note: "rapat dewan kemakmuran masjid dan persiapan tuan rumah pengajian An-Nisa",
receipt: ""
},
{
date: "2025-09-21",
description: "Alat Kebersihan",
type: "expense",
amount: 35000,
note: "beli sapu lidi dan wiper lantai",
receipt: ""
},
{
date: "2025-09-21",
description: "Gotong Royong",
type: "expense",
amount: 17500,
note: "konsumsi bersih2 masjid",
receipt: ""
},
{
date: "2025-09-26",
description: "Infak Jumat",
type: "income",
amount: 15000,
note: "",
receipt: ""
},
  ]


};



// ================= Fungsi =================

// Ambil semua transaksi dari periode tertentu
function getTransactionsByPeriod(period) {
  return kasData[period] || [];
}

// Ambil semua periode (sort angka)
function getAllPeriods() {
  return Object.keys(kasData).sort((a, b) => parseInt(a) - parseInt(b));
}

// Ambil periode terbaru
function getLatestPeriod() {
  const periods = getAllPeriods();
  return periods[periods.length - 1] || null;
}

// Ambil semua transaksi dari seluruh periode
function getAllTransactions() {
  return Object.values(kasData).flat();
}

// Ekspor
if (typeof window !== "undefined") {
  window.kas = {
    getTransactionsByPeriod,
    getAllPeriods,
    getLatestPeriod,
    getAllTransactions,
    raw: kasData
  };
}