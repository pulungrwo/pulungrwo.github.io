// Format angka ke Rupiah
function formatRupiah(num) {
  return "Rp " + num.toLocaleString("id-ID");
}

// Parsing tanggal string
function toDate(str) {
  return new Date(str + "T00:00:00");
}

// Sort berdasarkan tanggal
function sortByDate(a, b) {
  return toDate(a.date) - toDate(b.date);
}

// Format tanggal pendek dua baris
function formatTanggalPendekHTML(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("id-ID", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month}<br>${year}`;
}

// Format tanggal panjang
function formatTanggalPanjang(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// ===== Variabel global periode aktif =====
let currentPeriode = null;

// Ambil semua transaksi
function getRawTransactions() {
  if (window.kasData) {
    if (currentPeriode && window.kasData[currentPeriode]) {
      return window.kasData[currentPeriode];
    }
    // default: pakai periode terakhir
    const periodes = Object.keys(window.kasData).sort((a, b) => a - b);
    const latest = periodes[periodes.length - 1];
    currentPeriode = latest;
    return window.kasData[latest] || [];
  }
  console.warn("window.kasData tidak tersedia, menggunakan array kosong.");
  return [];
}

// Hitung saldo berjalan
function computeLedger(startingBalance = 0) {
  const raw = getRawTransactions();
  const sorted = raw.slice().sort(sortByDate);
  let balance = startingBalance;

  return sorted.map(tx => {
    if (tx.type === "income") balance += tx.amount;
    else balance -= tx.amount;
    return { ...tx, balanceAfter: balance };
  });
}

// Ringkasan total
function summary() {
  const raw = getRawTransactions();
  const income = raw.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = raw.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return { income, expense, net: income - expense };
}

// Modal gambar
function showImageModal(src) {
  const existing = document.getElementById("imageModal");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "imageModal";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 10000;
  overlay.style.animation = "fadeIn 0.25s ease";

  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "90vw";
  img.style.maxHeight = "90vh";
  img.style.borderRadius = "8px";
  img.style.boxShadow = "0 0 20px rgba(0,0,0,0.5)";
  img.style.animation = "zoomIn 0.3s ease";

  overlay.addEventListener("click", () => overlay.remove());
  img.addEventListener("click", () => overlay.remove());

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

// ... (fungsi popup dan renderSummaryTable tetap sama) ...

// ===== Pagination Periode =====
function renderPeriodePagination(activePeriode, periodes) {
  const container = document.getElementById("periode-pagination");
  if (!container) return;

  container.innerHTML = "";
  periodes.forEach(periode => {
    const btn = document.createElement("button");
    btn.textContent = "Kas Periode " + periode;

    if (periode === activePeriode) {
      btn.className = "periode-active";
      btn.disabled = true;
    } else {
      btn.className = "periode-btn";
      btn.onclick = () => {
        currentPeriode = periode;
        renderSummaryTable();
        renderHistoryList(1, false);
        renderPeriodePagination(periode, periodes);

        // update saldo & last updated
        const saldo = summary().net;
        const saldoEl = document.getElementById("saldoNow");
        saldoEl.textContent = formatRupiah(saldo);
        if (saldo < 0) saldoEl.classList.add("negative");
        else saldoEl.classList.remove("negative");

        const allTx = getRawTransactions();
        if (allTx.length > 0) {
          const latest = allTx.slice().sort((a, b) => toDate(b.date) - toDate(a.date))[0];
          document.getElementById("last-updated").innerText =
            "Terakhir diperbarui: " + formatTanggalPanjang(latest.date);
        } else {
          document.getElementById("last-updated").innerText = "Terakhir diperbarui: -";
        }

        // scroll ke atas
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }

    container.appendChild(btn);
  });
}

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  if (window.kasData) {
    const periodes = Object.keys(window.kasData).sort((a, b) => a - b);
    currentPeriode = periodes[periodes.length - 1];
    renderSummaryTable();
    renderHistoryList();
    renderPeriodePagination(currentPeriode, periodes);

    // set saldo awal
    const saldo = summary().net;
    const saldoEl = document.getElementById("saldoNow");
    saldoEl.textContent = formatRupiah(saldo);
    if (saldo < 0) saldoEl.classList.add("negative");

    const allTx = getRawTransactions();
    if (allTx.length > 0) {
      const latest = allTx.slice().sort((a, b) => toDate(b.date) - toDate(a.date))[0];
      document.getElementById("last-updated").innerText =
        "Terakhir diperbarui: " + formatTanggalPanjang(latest.date);
    } else {
      document.getElementById("last-updated").innerText = "Terakhir diperbarui: -";
    }
  }
});