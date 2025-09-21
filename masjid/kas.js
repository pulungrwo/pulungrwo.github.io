// kas.js
// Penyimpanan data arus kas per tahun Hijriah

const kasData = {
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
description: "Gotong Royong",
type: "expense",
amount: 52500,
note: "beli alat kebersihan 35.000 + konsumsi 17.500",
receipt: ""
},
  ]


};



// Fungsi bantu: Mengubah tanggal ke tahun Hijriah (menggunakan Intl API)
function getHijriYear(dateStr) {
  const date = new Date(dateStr);
  const hijriDate = new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
    year: "numeric"
  }).format(date);
  return `${hijriDate}H`;
}

// Tambah transaksi ke tahun Hijriah yang sesuai
function addTransaction({ date, description, type, amount, note = "" }) {
  if (!date || !description || !["income", "expense"].includes(type) || typeof amount !== "number") {
    throw new Error("Format transaksi tidak valid");
  }

  const hijriYear = getHijriYear(date);

  if (!kasData[hijriYear]) {
    kasData[hijriYear] = [];
  }

  kasData[hijriYear].push({ date, description, type, amount, note });
}

// Ambil semua transaksi dari seluruh tahun
function getAllTransactions() {
  return Object.values(kasData).flat(); // Gabungkan semua array tahun
}

// Ekspor untuk digunakan di fungsi lain
if (typeof window !== "undefined") {
  window.kas = {
    addTransaction,
    getAllTransactions,
    raw: kasData
  };
  }
