const periodeSelect = document.getElementById("periode");
const checklist = document.getElementById("checklist");
const output = document.getElementById("reportOutput");

// =========================================================
// 🗓 Populate periode options
// =========================================================
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

// =========================================================
// 📋 Populate checklist transaksi
// =========================================================
function populateChecklist() {
  const periode = periodeSelect.value;
  const txs = kasData[periode]?.transaksi || [];
  checklist.innerHTML = "";

  // Tombol pilih semua
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

// =========================================================
// 🔑 Generate laporan
// =========================================================
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
  const sortedSelected = [...selected].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startDate = new Date(sortedSelected[0].date);
  const endDate = new Date(sortedSelected.at(-1).date);

  // ================= Saldo awal dari transaksi sebelum periode =================
  let saldoAwal = txs
    .filter(t => new Date(t.date) < startDate)
    .reduce((s, t) =>
      s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0
    );

  // ================= Tambahkan transaksi "Saldo Awal" dalam periode =================
  const saldoAwalDalamPeriode = sortedSelected.filter(
    t => t.description.toLowerCase().includes("saldo awal")
  );
  const totalSaldoAwalTx = saldoAwalDalamPeriode.reduce((s, t) => s + t.amount, 0);
  saldoAwal += totalSaldoAwalTx;

  // ================= Filter transaksi agar "Saldo Awal" tidak ikut ke pemasukan =================
  const filteredSelected = sortedSelected.filter(
    t => !t.description.toLowerCase().includes("saldo awal")
  );

  // ================= Fungsi pengelompokan transaksi =================
  function groupByDescription(arr) {
    const map = {};
    arr.forEach(t => {
      if (!map[t.description]) {
        map[t.description] = { total: 0, count: 0, list: [] };
      }
      map[t.description].total += t.amount;
      map[t.description].count += 1;
      map[t.description].list.push(t);
    });
    return map;
  }

  const pemasukan = filteredSelected.filter(t => t.type === "income");
  const pengeluaran = filteredSelected.filter(t => t.type === "expense");
  const groupedIn = groupByDescription(pemasukan);
  const groupedOut = groupByDescription(pengeluaran);

  const totalIn = pemasukan.reduce((s, t) => s + t.amount, 0);
  const totalOut = pengeluaran.reduce((s, t) => s + t.amount, 0);
  const saldoAkhir = saldoAwal + totalIn - totalOut;

  const startMonthYear = formatMonthYear(startDate);
  const endMonthYear = formatMonthYear(endDate);

  // ================= Teks laporan untuk WA =================
  const lines = [];
  if (startMonthYear === endMonthYear) {
    lines.push(`*📢 Laporan Bulanan Kas Masjid Al-Huda*`);
    lines.push(`📅 ${startMonthYear}`);
  } else {
    lines.push(`*📢 Laporan Tahunan Kas Masjid Al-Huda*`);
    lines.push(`📅 ${startMonthYear} - ${endMonthYear}`);
  }

  lines.push(`-------------------------`);
  lines.push(`💰 *Saldo Awal:* *${saldoAwal.toLocaleString("id-ID")}*`);

  lines.push(`\n🟢 *Pemasukan:*`);
  if (pemasukan.length === 0) {
    lines.push(`(Tidak ada)`);
  } else {
    for (const [desc, obj] of Object.entries(groupedIn)) {
      const label = obj.count > 1 ? `(${obj.count}x) ${desc}` : desc;
      lines.push(`+ ${label}: ${obj.total.toLocaleString("id-ID")}`);
    }
  }

  lines.push(`\n*Total Pemasukan:* ${totalIn.toLocaleString("id-ID")}`);

  lines.push(`\n🔴 *Pengeluaran:*`);
  if (pengeluaran.length === 0) {
    lines.push(`(Tidak ada)`);
  } else {
    for (const [desc, obj] of Object.entries(groupedOut)) {
      const label = obj.count > 1 ? `(${obj.count}x) ${desc}` : desc;
      lines.push(`- ${label}: ${obj.total.toLocaleString("id-ID")}`);
    }
  }

  lines.push(`\n*Total Pengeluaran:* ${totalOut.toLocaleString("id-ID")}`);
  lines.push(`\n💰 *Saldo Akhir:* *${saldoAkhir.toLocaleString("id-ID")}*`);
  lines.push(`-------------------------`);

// ================= Tambahkan link video ke laporan WA =================
if (videoTxs.length > 0) {
  lines.push(`\n🎥 *Dokumentasi Video:*`);
  videoTxs.forEach(t => {
    const humanDate = new Date(t.date).toLocaleDateString("id-ID", {
      day: "numeric", month: "long", year: "numeric"
    });
    lines.push(`• ${t.description}`);
    lines.push(`  ${t.video}`);
    lines.push(`  (${humanDate})`);
  });
}

// ================= Video dokumentasi hanya di preview =================
  const videoTxs = filteredSelected.filter(t => t.video);

  
  lines.push(`📌 Info: 👉 tanjungbulan.my.id/masjid`);
  lines.push(`> dibuat otomatis oleh sistem`);

  output.value = lines.join("\n");

  // ================= Laporan elegan untuk preview =================
  const previewDiv = document.getElementById("reportPreview");

  let html = `
  <div class="laporan-elegan">
    <div class="header">
      <img class="logo" src="https://tanjungbulan.my.id/img/risma_1.png" alt="RISMA Logo" style="
  width:100px;
  height:100px;
  border-radius:50%;
  object-fit:cover;
  border:3px solid #4CAF50;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  margin-bottom:15px;
">
      <h2>📊 ${startMonthYear === endMonthYear ? "Laporan Bulanan" : "Laporan Tahunan"} Kas Masjid Al-Huda</h2>
      <p>📆 ${startMonthYear === endMonthYear ? startMonthYear : `${startMonthYear} - ${endMonthYear}`}</p>
      <hr>
    </div>

    <p><b>Saldo Awal:</b> Rp ${saldoAwal.toLocaleString("id-ID")}</p>

    <h3 style="color:green;">🟢 Pemasukan</h3>
  `;

  if (pemasukan.length === 0) {
    html += `<p>(Tidak ada pemasukan)</p>`;
  } else {
    html += "<ul>";
    for (const [desc, obj] of Object.entries(groupedIn)) {
      const label = obj.count > 1 ? `(${obj.count}x) ${desc}` : desc;
      html += `<li>${label}: <b>Rp ${obj.total.toLocaleString("id-ID")}</b></li>`;
    }
    html += "</ul>";
  }

  html += `<p><b>Total Pemasukan:</b> Rp ${totalIn.toLocaleString("id-ID")}</p>`;

  html += `<h3 style="color:#d63031;">🔴 Pengeluaran</h3>`;
  if (pengeluaran.length === 0) {
    html += `<p>(Tidak ada pengeluaran)</p>`;
  } else {
    html += "<ul>";
    for (const [desc, obj] of Object.entries(groupedOut)) {
      const label = obj.count > 1 ? `(${obj.count}x) ${desc}` : desc;
      html += `<li>${label}: <b>Rp ${obj.total.toLocaleString("id-ID")}</b></li>`;
    }
    html += "</ul>";
  }

  html += `<p><b>Total Pengeluaran:</b> Rp ${totalOut.toLocaleString("id-ID")}</p>`;
  html += `<p><b>Saldo Akhir:</b> Rp ${saldoAkhir.toLocaleString("id-ID")}</p>`;

  if (videoTxs.length > 0) {
    html += `<h3>🎥 Dokumentasi Video</h3><ul>`;
    videoTxs.forEach(t => {
      const humanDate = new Date(t.date).toLocaleDateString("id-ID", {
        day: "numeric", month: "long", year: "numeric"
      });
      html += `<li><b>${t.description}</b><br><a href="${t.video}" target="_blank">${t.video}</a><br><small>${humanDate}</small></li>`;
    });
    html += "</ul><hr>";
  } else {
    html += `<hr>`;
  }

  html += `
    <div class="footer">
      📌 Info: <a href="https://tanjungbulan.my.id/masjid" target="_blank">tanjungbulan.my.id/masjid</a><br>
      <small>Dibuat otomatis oleh sistem</small>
    </div>
  </div>
  `;

  previewDiv.innerHTML = html;
  previewDiv.style.display = "block";
}

// =========================================================
// 📋 Copy laporan ke clipboard
// =========================================================
function copyReport() {
  output.select();
  document.execCommand("copy");
  alert("Teks laporan disalin ke clipboard.");
}

// =========================================================
// 📲 Kirim laporan ke WhatsApp
// =========================================================
function sendToWhatsApp() {
  const text = encodeURIComponent(output.value);
  const url = `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

// =========================================================
// 📅 Format month & year
// =========================================================
function formatMonthYear(dateObj) {
  return dateObj.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric"
  });
}

// =========================================================
// 🖨 Print laporan
// =========================================================
function printReport() {
  const previewDiv = document.getElementById("reportPreview");
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
      <head>
        <title>Laporan Kas Masjid Al-Huda</title>
        <style>
          body { font-family: 'Poppins', sans-serif; padding: 30px; color:#000; }
          .logo { width:80px; height:80px; margin-bottom:10px; }
          .header, .footer { text-align:center; }
          h2 { margin:0; }
          hr { margin:10px 0; border:1px solid #ccc; }
          ul { text-align:left; }
          @media print { body { margin:0; } a { color: #000; text-decoration:none; } }
        </style>
      </head>
      <body>
        ${previewDiv.innerHTML.replace(/<h3>🎥 Dokumentasi Video<\/h3>[\s\S]*?<hr>/, "")}
        <script>window.onload=function(){window.print();}</script>
      </body>
    </html>
  `);
  win.document.close();
}

// =========================================================
// 🔔 Inisialisasi event listener
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  populatePeriodeOptions();
  periodeSelect.addEventListener("change", populateChecklist);
  populateChecklist();
});