const bulanFiles = [        

  "september2025.json",        
  "agustus2025.json"        
];        

const bulanMap = {        
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,        
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11,        
  desember: 12        
};        

const toNum = (name) => {        
  const nama = name.replace('.json', '');        
  const bulanStr = nama.slice(0, -4);        
  const tahun = parseInt(nama.slice(-4));        
  const bulan = bulanMap[bulanStr] || 0;        
  return tahun * 100 + bulan;        
};        

const sortedFiles = [...bulanFiles].sort((a, b) => toNum(a) - toNum(b));        
const reversedFiles = [...sortedFiles].reverse();        
const formatRupiah = (num) => num.toLocaleString('id-ID');        

let rekapData = {};        
let saldoTerakhir = {};        
let dataBulananTersimpan = {};        

function updateRekap(nama, jenis, tabungan, penarikan) {        
  if (!rekapData[nama]) {        
    rekapData[nama] = { jenis, tabungan: 0, penarikan: 0 };        
  }        
  rekapData[nama].tabungan += tabungan;        
  rekapData[nama].penarikan += penarikan;        
}        

function renderTabelRekap() {
  const container = document.getElementById("rekap-tabungan");
  let totalPutra = 0, totalPutri = 0, totalTabungan = 0, totalTarik = 0, totalSaldo = 0;

  const dataArray = Object.entries(rekapData).map(([nama, val]) => {
    const saldo = val.tabungan - val.penarikan;
    return { nama, ...val, saldo };
  });

  dataArray.sort((a, b) => b.saldo - a.saldo);

  let rows = '';
  dataArray.forEach(({ nama, jenis, tabungan, penarikan, saldo }) => {
    if (jenis === "putra") totalPutra += tabungan;
    else totalPutri += tabungan;
    totalTabungan += tabungan;
    totalTarik += penarikan;
    totalSaldo += saldo;

    const warnaSaldo = saldo > 0 ? 'green' : 'white'; // ✅ Warna saldo baris

    rows += `<tr>
      <td>${nama}</td>
      <td>${formatRupiah(tabungan)}</td>
      <td>${formatRupiah(penarikan)}</td>
      <td><span style="color:${warnaSaldo}">${formatRupiah(saldo)}</span></td>
    </tr>`;
  });

  const warnaTotalSaldo = totalSaldo > 0 ? 'green' : 'white'; // ✅ Warna total

  container.innerHTML = `
    <table border="1" cellspacing="0" cellpadding="5">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Tabungan</th>
          <th>Penarikan</th>
          <th>Saldo</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p><br/>
      Tabungan Putra: ${formatRupiah(totalPutra)}<br/>
      Tabungan Putri: ${formatRupiah(totalPutri)}<br/>
      Total Tabungan: ${formatRupiah(totalTabungan)}<br/>
      Total Penarikan: ${formatRupiah(totalTarik)}<br/>
      Sisa Saldo: <span style="color:${warnaTotalSaldo}">${formatRupiah(totalSaldo)}</span>
    </p><br/>
    <hr/>
  `;
}


function formatNamaBulan(namaFile) {        
  const nama = namaFile.replace('.json', '');        
  const match = nama.match(/([a-z]+)(\d+)/i);        
  if (!match) return namaFile;        
  const [_, bulan, tahun] = match;        
  return bulan.charAt(0).toUpperCase() + bulan.slice(1) + ' ' + tahun;        
}        

function renderBulananSemua() {
  const container = document.getElementById("tabungan-bulanan");

  reversedFiles.forEach(namaFile => {
    const data = dataBulananTersimpan[namaFile];
    if (!data) return;

    const combinedData = [];
    let totalPutra = 0, totalPutri = 0, totalTabungan = 0, totalTarik = 0;

    ["putra", "putri"].forEach(jenis => {
      data[jenis]?.forEach(item => {
        combinedData.push({ ...item, jenis });
        if (jenis === "putra") totalPutra += item.tabungan;
        else totalPutri += item.tabungan;
        totalTabungan += item.tabungan;
        totalTarik += item.penarikan;
      });
    });

    const saldoMasuk = totalTabungan - totalTarik;
    combinedData.sort((a, b) => b.tabungan - a.tabungan);

    let rows = '';

    combinedData.forEach(({ nama, tabungan, penarikan }) => {
      const selisih = tabungan - penarikan;
      let simbol = '', warna = '';

      if (selisih > 0) {
        simbol = '➕';
        warna = 'green';
      } else if (selisih < 0) {
        simbol = '➖';
        warna = 'red';
      } else {
        simbol = '';
        warna = 'white';
      }

      rows += `<tr>
        <td>${nama}</td>
        <td>${formatRupiah(tabungan)}</td>
        <td>${formatRupiah(penarikan)}</td>
        <td><span style="color:${warna}">${simbol}${formatRupiah(Math.abs(selisih))}</span></td>
      </tr>`;
    });

    // Tentukan warna saldo masuk keseluruhan
    const simbolSaldo = saldoMasuk > 0 ? '➕' : saldoMasuk < 0 ? '➖' : '';
    const warnaSaldo = saldoMasuk > 0 ? 'green' : saldoMasuk < 0 ? 'red' : 'white';

    container.innerHTML += `
      <h3>${formatNamaBulan(namaFile)}</h3>
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Tabungan</th>
            <th>Penarikan</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p><br/>
        Tabungan Putra: ${formatRupiah(totalPutra)}<br/>
        Tabungan Putri: ${formatRupiah(totalPutri)}<br/>
        Jumlah Tabungan: ${formatRupiah(totalTabungan)}<br/>
        Jumlah Penarikan: ${formatRupiah(totalTarik)}<br/>
        <strong>Jumlah Saldo: 
          <span style="color:${warnaSaldo}">${simbolSaldo}${formatRupiah(Math.abs(saldoMasuk))}</span>
        </strong>
      </p><br/>
      <hr/>
    `;
  });
}


async function loadSemua() {        
  for (let namaFile of sortedFiles) {        
    try {        
      const res = await fetch(`data/${namaFile}`);        
      if (!res.ok) continue;        
      const data = await res.json();        
      if (!data.putra && !data.putri) continue;        
      dataBulananTersimpan[namaFile] = data;        
    } catch (e) {        
      console.warn(`Gagal membaca ${namaFile}`);        
    }        
  }        

  for (let namaFile of sortedFiles) {        
    const data = dataBulananTersimpan[namaFile];        
    if (!data) continue;        

    ["putra", "putri"].forEach(jenis => {        
      data[jenis]?.forEach(item => {        
        const { nama, tabungan, penarikan } = item;        
        const saldoLalu = saldoTerakhir[nama] || 0;        
        const saldoKini = saldoLalu + tabungan - penarikan;        
        saldoTerakhir[nama] = saldoKini;        
        updateRekap(nama, jenis, tabungan, penarikan);        
      });        
    });        
  }        

  renderBulananSemua();        
  renderTabelRekap();        
}        

loadSemua();        

// fungsi salin rekap total tabungan
function salinRekapTotal() {
  const namaFileTerbaru = reversedFiles[0];
  const dataTerbaru = dataBulananTersimpan[namaFileTerbaru];
  if (!dataTerbaru) {
    alert("Data bulan terbaru belum tersedia.");
    return;
  }

  const bulanTahun = formatNamaBulan(namaFileTerbaru);

  // Persiapan data bulanan terbaru
  const combinedDataBulan = [];
  let totalPutraBulan = 0, totalPutriBulan = 0, totalTabunganBulan = 0, totalTarikBulan = 0;

  ["putra", "putri"].forEach(jenis => {
    dataTerbaru[jenis]?.forEach(item => {
      combinedDataBulan.push({ ...item, jenis });
      if (jenis === "putra") totalPutraBulan += item.tabungan;
      else totalPutriBulan += item.tabungan;
      totalTabunganBulan += item.tabungan;
      totalTarikBulan += item.penarikan;
    });
  });

  // Urutkan berdasarkan selisih terbesar
  combinedDataBulan.sort((a, b) => (b.tabungan - b.penarikan) - (a.tabungan - a.penarikan));

  // ✅ Ubah format tampilan tabungan bulanan
  let teks = `💰 *Tabungan ${bulanTahun}*\n`;
  combinedDataBulan.forEach(({ nama, tabungan, penarikan }, i) => {
    const selisih = tabungan - penarikan;
    const simbol = selisih > 0 ? '➕' : '➖';
    teks += `${i + 1}. ${nama} ${simbol}${formatRupiah(Math.abs(selisih))}\n`;
  });

  // ✅ Tambahan info saldo masuk bulan ini
  const saldoMasukBulan = totalTabunganBulan - totalTarikBulan;
  const simbolSaldo = saldoMasukBulan > 0 ? '➕' : saldoMasukBulan < 0 ? '➖' : '';
  const nilaiSaldo = formatRupiah(Math.abs(saldoMasukBulan));

  teks += `\n💡 *${bulanTahun}*\n`;
  teks += `👨Tabungan Putra: ${formatRupiah(totalPutraBulan)}\n`;
  teks += `👧Tabungan Putri: ${formatRupiah(totalPutriBulan)}\n`;
  teks += `💵Jumlah Tabungan: ${formatRupiah(totalTabunganBulan)}\n`;
  teks += `🏧Jumlah Penarikan: ${formatRupiah(totalTarikBulan)}\n`;
  teks += `💲Jumlah Saldo: ${simbolSaldo}${nilaiSaldo}\n\n`; // ✅ Ubah di sini

  // Rekap Total
  const dataArray = Object.entries(rekapData).map(([nama, val]) => {
    const saldo = val.tabungan - val.penarikan;
    return { nama, ...val, saldo };
  });

  dataArray.sort((a, b) => b.saldo - a.saldo);

  teks += `🏦 *TOTAL SALDO BANK RISMA*\n`;
  dataArray.forEach((item, idx) => {
    teks += `${idx + 1}. ${item.nama} ${formatRupiah(item.saldo)}\n`;
  });

  let totalPutra = 0, totalPutri = 0, totalTabungan = 0, totalPenarikan = 0, sisa = 0;

  dataArray.forEach(({ jenis, tabungan, penarikan, saldo }) => {
    if (jenis === "putra") totalPutra += tabungan;
    else totalPutri += tabungan;
    totalTabungan += tabungan;
    totalPenarikan += penarikan;
    sisa += saldo;
  });

  teks += `\n💡 *Rekap Total*\n`;
  teks += `👨Tabungan Putra: ${formatRupiah(totalPutra)}\n`;
  teks += `👧Tabungan Putri: ${formatRupiah(totalPutri)}\n`;
  teks += `💵Total Tabungan: ${formatRupiah(totalTabungan)}\n`;
  teks += `🏧Total Penarikan: ${formatRupiah(totalPenarikan)}\n`;
  teks += `💲Sisa Saldo: ${formatRupiah(sisa)}\n\n`;

  teks += `_Tabungan diurutkan otomatis dari yang terbanyak_\n\n`;
  teks += `> 📌Tidak boleh diambil kecuali kondisi darurat atau bulan Ramadhan.\n`;
  teks += `> 📌Tidak boleh dipinjam untuk keperluan pribadi\n`;
  teks += `> 📌Uang akan dikelola secara bijak demi kemakmuran bersama\n\n`;
  teks += `Info selengkapnya👉 https://tanjungbulan.my.id/bank-risma`;

  navigator.clipboard.writeText(teks).then(() => {
    alert("Rekap tabungan berhasil disalin ges!");
  });
}


// Tombol chat WhatsApp 
const admins = {
  server: {
    name: "Pulung",
    img: "/risma/img/pulung.png",
    number: "6288971344131"
  },
  putra: {
    name: "Tama",
    img: "/risma/img/tama.jpg",
    number: "6288286786888"
  },
  putri: {
    name: "Salsabila",
    img: "/risma/img/putri.jpg",
    number: "6282282546432"
  }
};

function toggleForm() {
  const form = document.getElementById('formPopup');
  const bantuan = document.getElementById('bantuanPopup');

  if (form.style.display === 'block') {
    form.style.display = 'none';
    bantuan.style.display = 'flex';
  } else {
    form.style.display = 'block';
    bantuan.style.display = 'none';
    updateProfile(); // refresh admin info
  }
}

function closeForm() {
  document.getElementById('formPopup').style.display = 'none';
  document.getElementById('bantuanPopup').style.display = 'flex';
}

function updateProfile() {
  const selected = document.getElementById('adminSelect').value;
  const data = admins[selected];

  document.getElementById('adminName').textContent = data.name;
  document.getElementById('adminImg').src = data.img;
  document.getElementById('bantuanImg').src = data.img;
}

function sendWA() {
  const selected = document.getElementById('adminSelect').value;
  const msg = document.getElementById('message').value.trim();

  if (msg === "") {
    alert("Silakan isi pesan dulu ges.");
    return;
  }

  const phone = admins[selected].number;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  }
