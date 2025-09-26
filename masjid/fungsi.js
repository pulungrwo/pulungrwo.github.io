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
function showImageModal(src) { /* ... tetap sama ... */ }            
function showTransactionPopup(tx, anchorElement) { /* ... tetap sama ... */ }            

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

function renderHistoryList(page = 1, doScroll = false) { /* ... tetap sama ... */ }            

// =================== Filter Periode ===================
function renderPeriodeFilter(selectedPeriode, periodes) {
  const container = document.getElementById("periode-filter");
  if (!container) return;

  container.innerHTML = "";
  const label = document.createElement("label");
  label.textContent = "Pilih Periode: ";
  label.style.marginRight = "8px";

  const select = document.createElement("select");
  periodes.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    if (p === selectedPeriode) opt.selected = true;
    select.appendChild(opt);
  });

  select.onchange = () => {
    currentPeriode = select.value;
    renderSummaryTable();
    renderHistoryList(1, false);

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
  };

  container.append(label, select);
}

// =================== Init ===================
document.addEventListener("DOMContentLoaded", () => {            
  function initKas() {
    if (window.kasData && Object.keys(window.kasData).length > 0) {            
      const periodes = Object.keys(window.kasData).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));            
      currentPeriode = periodes[periodes.length - 1];            

      renderPeriodeFilter(currentPeriode, periodes);            
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
    } else {
      console.warn("⚠️ kasData belum tersedia saat init.");
    }
  }

  if (window.kasData) {
    initKas();
  } else {
    const checkKas = setInterval(() => {
      if (window.kasData && Object.keys(window.kasData).length > 0) {
        clearInterval(checkKas);
        initKas();
      }
    }, 500);
  }
});