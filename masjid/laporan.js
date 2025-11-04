const periodeSelect = document.getElementById("periode");
const checklist = document.getElementById("checklist");
const output = document.getElementById("reportOutput");

// 🆕 Checkbox toggle gunakan saldo periode sebelumnya
let usePreviousSaldo = false;

function populatePeriodeOptions() {
  const periodeKeys = Object.keys(kas.raw);
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
  const txs = kas.raw[periode]?.transaksi || [];
  checklist.innerHTML = "";

  // 🆕 Tambahkan checkbox kontrol saldo
  const saldoLabel = document.createElement("label");
  const saldoCheckbox = document.createElement("input");
  saldoCheckbox.type = "checkbox";
  saldoCheckbox.id = "usePrevSaldo";
  saldoCheckbox.checked = usePreviousSaldo;
  saldoCheckbox.addEventListener("change", () => {
    usePreviousSaldo = saldoCheckbox.checked;
  });
  saldoLabel.appendChild(saldoCheckbox);
  saldoLabel.append(" Gunakan saldo periode sebelumnya");
  checklist.appendChild(saldoLabel);
  checklist.appendChild(document.createElement("br"));
  checklist.appendChild(document.createElement("hr"));

  // 🆕 Tambahkan tombol pilih semua
  const selectAllBtn = document.createElement("button");
  selectAllBtn.textContent = "Pilih Semua Transaksi";
  selectAllBtn.style.margin = "6px 0";
  selectAllBtn.onclick = () => {
    const checkboxes = checklist.querySelectorAll("input[type=checkbox]");
    checkboxes.forEach(cb => {
      if (cb.id !== "usePrevSaldo") cb.checked = true;
    });
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
  const txs = kas.raw[periode]?.transaksi || [];

  const checked = Array.from(checklist.querySelectorAll("input[type=checkbox]:checked"))
    .filter(cb => cb.id !== "usePrevSaldo") // abaikan checkbox saldo
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

  let saldoAwal = 0;

  if (usePreviousSaldo) {
    // ✅ Gunakan periode sebelumnya
    const allYears = Object.keys(kas.raw).sort();
    const currentIndex = allYears.indexOf(periode);

    for (let i = 0; i < currentIndex; i++) {
      const txsSebelumnya = kas.raw[allYears[i]]?.transaksi || [];
      saldoAwal += txsSebelumnya.reduce((s, t) =>
        s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);
    }

    saldoAwal += txs
      .filter(t => new Date(t.date) < startDate)
      .reduce((s, t) =>
        s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);
  } else {
    // ✅ Hanya saldo dari periode terpilih
    saldoAwal = txs
      .filter(t => new Date(t.date) < startDate)
      .reduce((s, t) =>
        s + (t.type === "income" ? t.amount : (t.type === "expense" ? -t.amount : 0)), 0);
  }

  // Kelompokkan transaksi berdasarkan deskripsi
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
    lines.push(`*📢 Laporan Bulanan Kas Masjid Al-Huda*`);
    lines.push(`📅 ${startMonthYear}`);
  } else {
    lines.push(`*📢 Laporan Tahunan Kas Masjid Al-Huda*`);
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

  // 🆕 Tambahkan daftar video dokumentasi jika ada
  const videoTxs = sortedSelected.filter(t => t.video);
  if (videoTxs.length > 0) {
    lines.push(`\n🎥 _Konten Video Dokumentasi_`);
    lines.push(`-----------`);
    videoTxs.forEach(t => {
      const cleanLink = t.video.replace(/^https?:\/\//, "");
      const humanDate = new Date(t.date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
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

// 🆕 Tampilkan laporan elegan di bawah tombol salin
const previewDiv = document.getElementById("reportPreview");
let html = `
  <div style="background:#f9f9f9;border-radius:12px;padding:16px;margin-top:10px;font-family:'Poppins',sans-serif;color:#333;">
    <h2 style="text-align:center;margin-bottom:6px;">📊 Laporan Kas Masjid Al-Huda</h2>
    <p style="text-align:center;color:#666;margin-top:0;margin-bottom:10px;">Periode: ${startMonthYear}${startMonthYear !== endMonthYear ? " - " + endMonthYear : ""}</p>
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
  <h3 style="color:red;">🔴 Pengeluaran</h3>
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
  <hr>
  <p><b>Saldo Akhir:</b> Rp ${saldoAkhir.toLocaleString("id-ID")}</p>
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

html += `<p style="font-size:12px;color:#666;">📌 Info: tanjungbulan.my.id/masjid</p>
          <p style="font-size:12px;color:#888;">Dibuat otomatis oleh sistem</p>
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

document.addEventListener("DOMContentLoaded", () => {
  populatePeriodeOptions();
  periodeSelect.addEventListener("change", populateChecklist);
  populateChecklist();
});