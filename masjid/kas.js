// kas.js  
// Penyimpanan data arus kas per tahun Hijriah  

window.kasData = {  
  "1447H": {  
    periode: "Agustus 2025 – Maret 2026",  
    bendahara: "Pulung Riswanto",  
    transaksi: [  
      {  
        date: "2025-08-08",  
        description: "Panen Jagung",  
        type: "income",  
        amount: 4000000,  
        note: "Untung bersih ±7.300.000 dibagi 2 dengan pengelola lahan, pengelola membulatkan 4.000.000 untuk kas masjid (detailnya tanyakan kepada BPK. Nurman).",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-08-08",  
        description: "Sisa Kas",  
        type: "income",  
        amount: 825000,  
        note: "Sisa uang infak dan sumbangan warga yang di pegang oleh bapak Suhdi selaku bendahara lama, sisa 824 RB digenapkan 825.",  
        video: "",  
        foto: "/masjid/bukti/IMG_20250812_171022_375.jpg"  
      },  
      {  
        date: "2025-08-08",  
        description: "Pasang Kaca",  
        type: "expense",  
        amount: 3000000,  
        note: "Pemesanan pasang kaca kepada mas SAKIP tanjung sari 2",  
        video: "",  
        foto: "/masjid/bukti/IMG-20250811-WA0006.jpg"  
      },  
      {  
        date: "2025-08-08",  
        description: "Untuk RISMA",  
        type: "expense",  
        amount: 500000,  
        note: "Bantuan 500 ribu untuk modal RISMA mengelola lahan 2 Rante.",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-08-15",  
        description: "Infak Jumat",  
        type: "income",  
        amount: 30000,  
        note: "",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-08-15",  
        description: "Infak Karet",  
        type: "income",  
        amount: 150000,  
        note: "Kotak infak ditempat ibu eli",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-08-22",  
        description: "Infak Jumat",  
        type: "income",  
        amount: 35000,  
        note: "",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-08-22",  
        description: "Beli Mic + Bensin",  
        type: "expense",  
        amount: 235000,  
        note: "Harga mic 225.000 dan untuk beli bensin motor bapak RT Suhdi 10.000",  
        video: "",  
        foto: "/masjid/bukti/Screenshot_20250822-170932.jpg"  
      },  
      {  
        date: "2025-08-23",  
        description: "Beli Amplifier",  
        type: "expense",  
        amount: 514000,  
        note: "Pembelian amplifier 2000watt 4 channel",  
        video: "",  
        foto: "/masjid/bukti/beli-ampli-masjid-2000watt-4channel.jpg"  
      },  
      {  
        date: "2025-08-29",  
        description: "Infak Jumat",  
        type: "income",  
        amount: 15000,  
        note: "",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-09-12",  
        description: "Infak Jumat",  
        type: "income",  
        amount: 35000,  
        note: "",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-09-16",  
        description: "Obat Lulangan",  
        type: "expense",  
        amount: 70000,  
        note: "beli online Herbisida GluBest 65.000 + biaya admin brilink 5.000",  
        video: "",  
        foto: "/masjid/bukti/obat-lulangan-16sep2025.jpg"  
      },  
      {  
        date: "2025-09-19",  
        description: "Infak Jumat",  
        type: "income",  
        amount: 12000,  
        note: "",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-09-19",  
        description: "Konsumsi Rapat",  
        type: "expense",  
        amount: 53000,  
        note: "rapat dewan kemakmuran masjid dan persiapan tuan rumah pengajian Annisa",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-09-21",  
        description: "Alat Kebersihan",  
        type: "expense",  
        amount: 35000,  
        note: "beli sapu lidi dan wiper lantai",  
        video: "",  
        foto: ""  
      },  
      {  
        date: "2025-09-21",  
        description: "Gotong Royong",  
        type: "expense",  
        amount: 17500,  
        note: "konsumsi bersih2 masjid",  
        video: "https://vt.tiktok.com/ZSDGbd7hX/",  
        foto: ""  
      },  
      {  
        date: "2025-09-26",  
        description: "Infak Jumat",  
        type: "income",  
        amount: 15000,  
        note: "",  
        video: "",  
        foto: ""  
      },
{
date: "2025-09-28",
description: "Pengajian Annisa",
type: "expense",
amount: 400000,
note: "Uang amplop penceramah pengajian annisa di tanjung bulan",
foto: "",
video: "https://vt.tiktok.com/ZSDtkmYgy/"

},
{
date: "2025-10-03",
description: "Infak Jumat",
type: "income",
amount: 15000,
note: "",
foto: "",
video: ""

},
{
date: "2025-10-04",
description: "Servis Ampli",
type: "expense",
amount: 100000,
note: "",
foto: "",
video: ""

},

    ]  
  }  
};  

// ================= Fungsi =================  

// Ambil semua transaksi dari periode tertentu  
function getTransactionsByPeriod(period) {  
  return window.kasData[period]?.transaksi || [];  
}  

// Ambil semua periode  
function getAllPeriods() {  
  return Object.keys(window.kasData).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));  
}  

// Ambil periode terbaru  
function getLatestPeriod() {  
  const periods = getAllPeriods();  
  return periods[periods.length - 1] || null;  
}  

// Ambil semua transaksi dari seluruh periode  
function getAllTransactions() {  
  return Object.values(window.kasData).flatMap(p => p.transaksi || []);  
}  

// Ekspor ke window  
if (typeof window !== "undefined") {  
  window.kas = {  
    getTransactionsByPeriod,  
    getAllPeriods,  
    getLatestPeriod,  
    getAllTransactions,  
    raw: window.kasData  
  };  
}