// =================== Utilitas ===================
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

// =================== Data & Periode ===================
let currentPeriode = null;            

function getRawTransactions() {            
  if (window.kasData && currentPeriode && window.kasData[currentPeriode]) {            
    return window.kasData[currentPeriode];            
  }            
  if (window.kas && typeof window.kas.getAllTransactions === "function") {            
    return window.kas.getAllTransactions();            
  }            
  console.warn("Tidak ada data kas tersedia.");            
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

// =================== Modal & Popup ===================
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

function showTransactionPopup(tx, anchorElement) {            
  const existing = document.getElementById("datePopup");            
  if (existing) existing.remove();            

  const popup = document.createElement("div");            
  popup.id = "datePopup";            
  popup.className = "date-popup";            

  const header = document.createElement("div");            
  header.className = "popup-header";            
  header.innerHTML = `<strong>Detail Transaksi</strong> <span class="close-btn" style="cursor:pointer;">❌</span>`;            
  popup.appendChild(header);            

  let receiptHTML = "";            
  if (tx.receipt) {            
    receiptHTML = `            
      <div style="margin-top:8px;">            
        <img src="${tx.receipt}" alt="Bukti" style="max-width:100px;cursor:pointer;border-radius:6px;">            
      </div>            
    `;            
  }            

  const item = document.createElement("div");            
  item.className = "popup-item";            
  item.style.padding = "10px 0";            
  item.innerHTML = `            
    <div style="font-weight:bold; margin-bottom:6px;">            
      ${formatTanggalPanjang(tx.date)} - ${tx.description}            
    </div>            
    <div style="margin-bottom:6px; font-size:0.9rem; color: var(--muted);">            
      ${tx.note || "-"}            
    </div>            
    <div style="font-size:0.9rem; color: var(--muted);">            
      <div><strong>Tipe:</strong> ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}</div>            
      <div><strong>Nominal:</strong> ${formatRupiah(tx.amount)}</div>            
      <div><strong>Saldo Setelah:</strong> ${formatRupiah(tx.balanceAfter)}</div>            
    </div>            
    ${receiptHTML}            
  `;            
  popup.appendChild(item);            

  if (tx.receipt) {            
    const img = item.querySelector("img");            
    img.addEventListener("click", () => showImageModal(tx.receipt));            
  }            

  const closeBtn = header.querySelector(".close-btn");            
  if (closeBtn) closeBtn.addEventListener("click", () => popup.remove());            

  document.body.appendChild(popup);            

  const rect = anchorElement.getBoundingClientRect();            
  const top = rect.bottom + window.scrollY + 6;            
  let left = rect.left + window.scrollX;            
  const popupRect = popup.getBoundingClientRect();            
  if (left + popupRect.width > window.innerWidth - 10) {            
    left = window.innerWidth - popupRect.width - 10;            
  }            

  popup.style.position = "absolute";            
  popup.style.top = `${top}px`;            
  popup.style.left = `${left}px`;            
  popup.style.zIndex = 9999;            
}            

// =================== Render ===================
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

let historyPage = 1;            
const historyPerPage = 5;            

function renderHistoryList(page = 1, doScroll = false) {            
  const historyContainer = document.querySelector("#history");            
  if (!historyContainer) return;            
  historyContainer.innerHTML = "";            

  const ledger = computeLedger().slice().reverse();            
  if (ledger.length === 0) {            
    const msg = document.createElement("div");            
    msg.style.opacity = "0.9";            
    msg.style.padding = "12px";            
    msg.style.borderRadius = "8px";            
    msg.style.background = "rgba(255,255,255,0.05)";            
    msg.textContent = "Belum ada transaksi.";            
    historyContainer.appendChild(msg);            
    return;            
  }            

  historyPage = page;            
  const start = (page - 1) * historyPerPage;            
  const end = start + historyPerPage;            
  const items = ledger.slice(start, end);            

  items.forEach(tx => {            
    const wrapper = document.createElement("div");            
    wrapper.className = "history-item";            

    const header = document.createElement("div");            
    header.style.marginBottom = "6px";            
    header.innerHTML = `<strong>${formatTanggalPanjang(tx.date)}</strong> - ${tx.description}`;            

    const noteDiv = document.createElement("div");            
    noteDiv.className = "note";            
    noteDiv.textContent = tx.note || "-";            

    const detail = document.createElement("div");            
    detail.className = "h-details";            
    detail.innerHTML = `            
      <div><strong>Tipe:</strong> ${tx.type === "income" ? "Pemasukan" : "Pengeluaran"}</div>            
      <div><strong>Nominal:</strong> ${formatRupiah(tx.amount)}</div>            
      <div><strong>Saldo setelah:</strong> ${formatRupiah(tx.balanceAfter)}</div>            
    `;            

    wrapper.append(header, noteDiv, detail);            

    if (tx.receipt) {            
      const img = document.createElement("img");            
      img.src = tx.receipt;            
      img.alt = "Bukti";            
      img.style.maxWidth = "120px";            
      img.style.marginTop = "8px";            
      img.style.borderRadius = "6px";            
      img.style.cursor = "pointer";            
      img.addEventListener("click", () => showImageModal(tx.receipt));            
      wrapper.appendChild(img);            
    }            

    const sep = document.createElement("hr");            
    sep.style.border = "none";            
    sep.style.height = "1px";            
    sep.style.background = "rgba(255,255,255,0.08)";            
    sep.style.margin = "10px 0";            

    wrapper.appendChild(sep);            
    historyContainer.appendChild(wrapper);            
  });            

  const paginationContainer = document.getElementById("history-pagination");            
  if (paginationContainer) paginationContainer.innerHTML = "";            
  else {            
    const div = document.createElement("div");            
    div.id = "history-pagination";            
    div.className = "pagination";            
    historyContainer.after(div);            
  }            
  const totalPages = Math.ceil(ledger.length / historyPerPage);            
  const container = document.getElementById("history-pagination");            

  if (totalPages > 1) {            
    const prevBtn = document.createElement("button");            
    prevBtn.textContent = "« Baru";            
    prevBtn.disabled = page === 1;            
    prevBtn.onclick = () => renderHistoryList(page - 1, true);            
    container.appendChild(prevBtn);            

    for (let i = 1; i <= totalPages; i++) {            
      const pageBtn = document.createElement("button");            
      pageBtn.textContent = i;            
      if (i === page) pageBtn.classList.add("active");            
      pageBtn.onclick = () => renderHistoryList(i, true);            
      container.appendChild(pageBtn);            
    }            

    const nextBtn = document.createElement("button");            
    nextBtn.textContent = "Lama »";            
    nextBtn.disabled = page === totalPages;            
    nextBtn.onclick = () => renderHistoryList(page + 1, true);            
    container.appendChild(nextBtn);            
  }            

  if (doScroll) {            
    const navHeight = document.querySelector(".nav")?.offsetHeight || 0;            
    window.scrollTo({ top: 0, behavior: "smooth" });            
  }            
}            

// =================== Pagination Periode ===================
function renderPeriodePagination(selectedPeriode, periodes) {            
  const container = document.getElementById("periode-pagination");            
  if (!container) return;            

  container.innerHTML = "";            
  periodes.forEach(periode => {            
    const btn = document.createElement("button");            
    btn.textContent = "Kas Periode " + periode + " H";            

    if (periode === selectedPeriode) {            
      btn.className = "periode-active";            
      btn.disabled = true;            
    } else {            
      btn.className = "periode-btn";            
      btn.onclick = () => {            
        currentPeriode = periode;            
        renderSummaryTable();            
        renderHistoryList(1, true);            

        const saldo = summary().net;            
        const saldoEl = document.getElementById("saldoNow");            
        saldoEl.textContent = formatRupiah(saldo);            
        if (saldo < 0) saldoEl.classList.add("negative");            
        else saldoEl.classList.remove("negative");            

        const allTransactions = getRawTransactions();            
        if (allTransactions.length > 0) {            
          const latest = allTransactions.slice().sort((a, b) => toDate(b.date) - toDate(a.date))[0];            
          document.getElementById("last-updated").innerText = "Terakhir diperbarui: " + formatTanggalPanjang(latest.date);            
        } else {            
          document.getElementById("last-updated").innerText = "Terakhir diperbarui: -";            
        }            

        renderPeriodePagination(periode, periodes);            
        window.scrollTo({ top: 0, behavior: "smooth" });            
      };            
    }            

    container.appendChild(btn);            
  });            
}            

// =================== Init ===================
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