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

// ===== State Periode Aktif =====
let currentPeriode = null;

// Ambil transaksi sesuai periode
function getRawTransactions() {
  if (window.kasData) {
    if (!currentPeriode) {
      const periodes = Object.keys(window.kasData).sort((a, b) => a - b);
      currentPeriode = periodes[periodes.length - 1];
    }
    return window.kasData[currentPeriode] || [];
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

// ... (fungsi showTransactionPopup tetap sama)

// Render tabel ringkasan
function renderSummaryTable() {
  const ledger = computeLedger();
  const tbody = document.querySelector("#summary-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  ledger.forEach(row => {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    dateTd.innerHTML = formatTanggalPendekHTML(row.date);

    const incomeTd = document.createElement("td");
    incomeTd.textContent = row.type === "income" ? (row.amount / 1000).toLocaleString("id-ID") : "-";
    if (row.type === "income") {
      incomeTd.classList.add("income");
      incomeTd.style.cursor = "pointer";
      incomeTd.style.textDecoration = "underline";
      incomeTd.addEventListener("click", () => showTransactionPopup(row, incomeTd));
    }

    const expenseTd = document.createElement("td");
    expenseTd.textContent = row.type === "expense" ? (row.amount / 1000).toLocaleString("id-ID") : "-";
    if (row.type === "expense") {
      expenseTd.classList.add("expense");
      expenseTd.style.cursor = "pointer";
      expenseTd.style.textDecoration = "underline";
      expenseTd.addEventListener("click", () => showTransactionPopup(row, expenseTd));
    }

    const balanceTd = document.createElement("td");
    balanceTd.textContent = (row.balanceAfter / 1000).toLocaleString("id-ID");

    tr.append(dateTd, incomeTd, expenseTd, balanceTd);
    tbody.appendChild(tr);
  });

  const sums = summary();
  const tfoot = document.querySelector("#summary-foot");
  if (!tfoot) return;

  tfoot.innerHTML = `
    <tr class="totals">
      <td><strong>Total</strong></td>
      <td class="income"><strong>${(sums.income / 1000).toLocaleString("id-ID")}</strong></td>
      <td class="expense"><strong>${(sums.expense / 1000).toLocaleString("id-ID")}</strong></td>
      <td><strong>${((sums.income - sums.expense) / 1000).toLocaleString("id-ID")}</strong></td>
    </tr>
  `;
}

// ... (fungsi renderHistoryList tetap sama)

// ===== Pagination Periode =====
function renderPeriodePagination(current, periodes) {
  const container = document.getElementById("periode-pagination");
  if (!container) return;

  container.innerHTML = "";
  periodes.forEach(periode => {
    const btn = document.createElement("button");
    btn.textContent = "Kas Periode " + periode;

    if (periode === current) {
      btn.className = "periode-active";
      btn.disabled = true;
    } else {
      btn.className = "periode-btn";
      btn.onclick = () => {
        currentPeriode = periode;
        renderSummaryTable();
        renderHistoryList(1);
        renderPeriodePagination(currentPeriode, periodes);
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
    renderPeriodePagination(currentPeriode, periodes);
  }

  renderSummaryTable();
  renderHistoryList();

  const saldo = summary().net;
  const saldoEl = document.getElementById("saldoNow");
  saldoEl.textContent = formatRupiah(saldo);
  if (saldo < 0) saldoEl.classList.add("negative");

  const allTransactions = getRawTransactions();
  if (allTransactions.length > 0) {
    const latest = allTransactions.slice().sort((a, b) => toDate(b.date) - toDate(a.date))[0];
    document.getElementById("last-updated").innerText = "Terakhir diperbarui: " + formatTanggalPanjang(latest.date);
  } else {
    document.getElementById("last-updated").innerText = "Terakhir diperbarui: -";
  }
});