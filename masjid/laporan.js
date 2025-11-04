const periodeSelect = document.getElementById("periode");
const checklist = document.getElementById("checklist");
const output = document.getElementById("reportOutput");

function populatePeriodeOptions() {
  const periodeKeys = Object.keys(kasData);
  periodeSelect.innerHTML = "";
  periodeKeys.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    periodeSelect.appendChild(option);
  });
}

function populateChecklist() {
  const periode = periodeSelect.value;
  const txs = kasData[periode]?.transaksi || [];
  checklist.innerHTML = "";

  // 🆕 Tombol pilih semua
  const selectAllBtn = document.createElement("button");
  selectAllBtn.textContent = "Pilih Semua Transaksi";
  selectAllBtn.style.margin = "6px 0";
  selectAllBtn.onclick = () => {
    const checkboxes = checklist.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(cb => cb.checked = true);
  };
  checklist.appendChild(selectAllBtn);
  checklist.appendChild(document.createElement("hr"));

  // Daftar transaksi
  txs.forEach((t, i) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = i;
    label.appendChild(checkbox);
    label.append(` ${t.date} - ${t.description}`);
    checklist.appendChild(label);
    checklist.appendChild(document.createElement("br"));
  });
}

function generateReport() {
  const periode = periodeSelect.value;
  const txs = kasData[periode]?.transaksi || [];

  const checked = Array.from(checklist.querySelectorAll("input[type=checkbox]:checked"))
    .map(cb => parseInt(cb.value));

  if (checked.length === 0) {
    output.value = "❗ Harap pilih setidaknya satu transaksi.";
    return;
  }

  const selected = checked.map(i => txs[i]);

  // Urutkan berdasarkan tanggal
  const sortedSelected = [...selected].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startDate = new Date(sortedSelected[0].date);
  const endDate = new Date(sortedSelected.at(-1).date);

  // ✅ Saldo awal hanya dari transaksi sebelum periode terpilih
  const saldoAwal = txs
    .filter(t => new Date(t.date) < startDate)
    .reduce((s, t) =>
      s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);

  // Kelompokkan transaksi
  function groupByDescription(arr) {
    const map = {};
    arr.forEach(t => {
      if (!map[t.description]) {
        map[t.description] = { total: 0, count: 0 };
      }
      map[t.description].total += t.amount;
      map[t.description].count += 1;
    });
    return map;
  }

  const pemasukan = selected.filter(t => t.type === "income");
  const pengeluaran = selected.filter(t => t.type === "expense");

  const groupedIn = groupByDescription(pemasukan);
  const groupedOut = groupByDescription(pengeluaran);

  const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0);
  const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0);
  const saldoAkhir = saldoAwal + totalIn - totalOut;

  const startMonthYear = formatMonthYear(startDate);
  const endMonthYear = formatMonthYear(endDate);

  const lines = [];
  if (startMonthYear === endMonthYear) {
    // Bulanan
    lines.push(`*📢 Laporan Bulanan Kas Masjid Al-Huda*`);
    lines.push(`📅 ${startMonthYear}`);
  } else {
    // Tahunan, ambil langsung dari key kas.js (misal "1447H")
    lines.push(`*📢 Laporan Tahunan Kas Masjid Al-Huda – ${periode}*`);
    lines.push(`📅 ${startMonthYear} - ${endMonthYear}`);
  }

  lines.push(`-------------------------`);
  lines.push(`\n💰 *Saldo Awal:* *${saldoAwal.toLocaleString("id-ID")}*`);

  lines.push(`\n🟢 *Pemasukan:*`);
  if (pemasukan.length === 0) {
    lines.push(`(Tidak ada)`);
  } else {
    for (const [desc, obj] of Object.entries(groupedIn)) {
      const label = obj.count > 1 ? `${desc} (${obj.count}x)` : desc;
      lines.push(`+ ${label}: ${obj.total.toLocaleString("id-ID")}`);
    }
  }

  lines.push(`\n*Total Pemasukan:* ${totalIn.toLocaleString("id-ID")}`);
  lines.push(`\n🔴 *Pengeluaran:*`);

  if (pengeluaran.length === 0) {
    lines.push(`(Tidak ada)`);
  } else {
    for (const [desc, obj] of Object.entries(groupedOut)) {
      const label = obj.count > 1 ? `${desc} (${obj.count}x)` : desc;
      lines.push(`- ${label}: ${obj.total.toLocaleString("id-ID")}`);
    }
  }

  lines.push(`\n*Total Pengeluaran:* ${totalOut.toLocaleString("id-ID")}`);
  lines.push(`\n💰 *Saldo Akhir:* *${saldoAkhir.toLocaleString("id-ID")}*`);
  lines.push(`-------------------------`);

  // 🆕 Tambahkan daftar video dokumentasi
  const videoTxs = sortedSelected.filter(t => t.video);
  if (videoTxs.length > 0) {
    lines.push(`\n🎥 _Konten Video Dokumentasi_`);
    lines.push(`-----------`);
    videoTxs.forEach(t => {
      const cleanLink = t.video.replace(/^https?:\/\//, "");
      const humanDate = new Date(t.date).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      });
      lines.push(`▶️ *${t.description}*`);
      lines.push(`${cleanLink}`);
      lines.push(`${humanDate}`);
      lines.push(`-----------`);
    });
  }

  lines.push(`\n📌Info: 👉tanjungbulan.my.id/masjid`);
  lines.push(`\n> dibuat otomatis oleh sistem`);
  output.value = lines.join("\n");

  // 🆕 Laporan elegan di bawah tombol salin
  const previewDiv = document.getElementById("reportPreview");

  let html = `
  <div class="laporan-elegan">
    <h2>📊 ${startMonthYear === endMonthYear ? "Laporan Bulanan" : "Laporan Tahunan"} Kas Masjid Al-Huda${startMonthYear !== endMonthYear ? " – " + periode : ""}</h2>
    <p style="text-align:center;">Periode: ${kasData[periode]?.periode || (startMonthYear + (startMonthYear !== endMonthYear ? " - " + endMonthYear : ""))}</p>
    <hr>
    <p><b>Saldo Awal:</b> Rp ${saldoAwal.toLocaleString("id-ID")}</p>
    <h3 style="color:green;">🟢 Pemasukan</h3>
  `;

  if (pemasukan.length === 0) {
    html += `<p>(Tidak ada pemasukan)</p>`;
  } else {
    html += "<ul>";
    for (const [desc, obj] of Object.entries(groupedIn)) {
      const label = obj.count > 1 ? `${desc} (${obj.count}x)` : desc;
      html += `<li>${label}: <b>Rp ${obj.total.toLocaleString("id-ID")}</b></li>`;
    }
    html += "</ul>";
  }

  html += `
    <p><b>Total Pemasukan:</b> Rp ${totalIn.toLocaleString("id-ID")}</p>
    <h3 style="color:#d63031;">🔴 Pengeluaran</h3>
  `;

  if (pengeluaran.length === 0) {
    html += `<p>(Tidak ada pengeluaran)</p>`;
  } else {
    html += "<ul>";
    for (const [desc, obj] of Object.entries(groupedOut)) {
      const label = obj.count > 1 ? `${desc} (${obj.count}x)` : desc;
      html += `<li>${label}: <b>Rp ${obj.total.toLocaleString("id-ID")}</b></li>`;
    }
    html += "</ul>";
  }

  html += `
    <p><b>Total Pengeluaran:</b> Rp ${totalOut.toLocaleString("id-ID")}</p>
    <div class="saldo-akhir">💰 Saldo Akhir: Rp ${saldoAkhir.toLocaleString("id-ID")}</div>
    <hr>
  `;

  if (videoTxs.length > 0) {
    html += `<h3>🎥 Dokumentasi Video</h3><ul>`;
    videoTxs.forEach(t => {
      const humanDate = new Date(t.date).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      });
      html += `<li><b>${t.description}</b><br>
      <a href="${t.video}" target="_blank">${t.video}</a><br>
      <small>${humanDate}</small></li>`;
    });
    html += "</ul><hr>";
  }

  html += `
    <div class="tagline">
      📌 Info: <a href="https://tanjungbulan.my.id/masjid" target="_blank">tanjungbulan.my.id/masjid</a><br>
      <small>Dibuat otomatis oleh sistem</small>
    </div>
  </div>
  `;

  previewDiv.innerHTML = html;
  previewDiv.style.display = "block";
}

function copyReport() {
  output.select();
  document.execCommand("copy");
  alert("Teks laporan disalin ke clipboard.");
}

function sendToWhatsApp() {
  const text = encodeURIComponent(output.value);
  const url = `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

function formatMonthYear(dateObj) {
  return dateObj.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });
}

function printReport() {
  const laporan = document.getElementById("reportPreview").innerHTML;

  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Laporan Kas Masjid Al-Huda</title>
        <style>
          body {
            font-family: 'Poppins', sans-serif;
            background: #fff;
            color: #333;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .header img {
            width: 70px;
            height: 70px;
            object-fit: contain;
            margin-bottom: 6px;
          }
          .header h1 {
            font-size: 1.3rem;
            margin: 0;
            color: #2d3436;
          }
          .header p {
            margin: 2px 0 8px;
            color: #636e72;
            font-size: 0.9rem;
          }
          h2 {
            text-align: center;
            color: #2d3436;
            margin-top: 6px;
          }
          h3 {
            color: #2d3436;
            margin-top: 12px;
            margin-bottom: 6px;
          }
          ul { list-style-type: "• "; padding-left: 20px; }
          li { margin-bottom: 4px; }
          hr { border: none; border-top: 1px solid #ccc; margin: 10px 0; }
          .saldo-akhir {
            background: linear-gradient(90deg, #00b894, #55efc4);
            padding: 10px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            text-align: center;
            margin-top: 10px;
          }
          .tagline {
            text-align: center;
            color: #777;
            font-size: 0.8em;
            margin-top: 10px;
          }
          a {
            color: #0984e3;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          @media print {
            button { display: none; }
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="https://tanjungbulan.my.id/img/risma_1.png" alt="Logo RISMA Tanjung Bulan">
          <h1>Masjid Al-Huda Tanjung Bulan</h1>
          <p>Laporan Keuangan & Dokumentasi Kegiatan</p>
        </div>
        ${laporan}
        <div class="tagline">
          <p>Dicetak otomatis dari sistem <a href="https://tanjungbulan.my.id/masjid" target="_blank">tanjungbulan.my.id/masjid</a></p>
          <p><small>© RISMA Tanjung Bulan</small></p>
        </div>
        <script>window.onload = function(){ window.print(); }</script>
      </body>
    </html>
  `);
  win.document.close();
}

document.addEventListener("DOMContentLoaded", () => {
  populatePeriodeOptions();
  periodeSelect.addEventListener("change", populateChecklist);
  populateChecklist();
});