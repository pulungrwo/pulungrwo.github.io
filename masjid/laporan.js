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
  const sortedSelected = [...selected].sort((a, b) => new Date(a.date) - new Date(b.date));
  const startDate = new Date(sortedSelected[0].date);
  const endDate = new Date(sortedSelected.at(-1).date);

  // ✅ Saldo awal dari transaksi sebelum periode
  let saldoAwal = txs
    .filter(t => new Date(t.date) < startDate)
    .reduce((s, t) =>
      s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);

  // ✅ Tambahkan transaksi "Saldo Awal" dalam periode
  const saldoAwalDalamPeriode = sortedSelected.filter(
    t => t.description.toLowerCase().includes("saldo awal")
  );
  const totalSaldoAwalTx = saldoAwalDalamPeriode.reduce((s, t) => s + t.amount, 0);
  saldoAwal += totalSaldoAwalTx;

  // Filter transaksi agar "Saldo Awal" tidak ikut ke pemasukan
  const filteredSelected = sortedSelected.filter(
    t => !t.description.toLowerCase().includes("saldo awal")
  );

  // Kelompokkan transaksi dengan urutan tanggal
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

  // Hapus video dokumentasi dari laporan WA dan preview
  // lines.push(`🎥 _Konten Video Dokumentasi_`); // removed

  lines.push(`📌 Info: 👉 tanjungbulan.my.id/masjid`);
  lines.push(`> dibuat otomatis oleh sistem`);

  output.value = lines.join("\n");

  // 🆕 Laporan elegan untuk preview
  const previewDiv = document.getElementById("reportPreview");

  let html = `
  <div class="laporan-elegan">
    <div class="header" style="text-align:center;">
      <img class="logo" src="https://tanjungbulan.my.id/img/risma_1.png" alt="RISMA Logo" style="width:80px;height:80px;margin-bottom:10px;">
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

  html += `
    <p><b>Total Pemasukan:</b> Rp ${totalIn.toLocaleString("id-ID")}</p>
    <h3 style="color:#d63031;">🔴 Pengeluaran</h3>
  `;

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

  html += `
    <p><b>Total Pengeluaran:</b> Rp ${totalOut.toLocaleString("id-ID")}</p>
    <p><b>Saldo Akhir:</b> Rp ${saldoAkhir.toLocaleString("id-ID")}</p>
    <hr>
    <div class="footer" style="text-align:center;">
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
          @media print { body { margin:0; } }
        </style>
      </head>
      <body>
        ${previewDiv.innerHTML}
        <script>window.onload=function(){window.print();}</script>
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