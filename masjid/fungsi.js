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

// Ambil semua transaksi
function getRawTransactions() {
  if (window.kas && typeof window.kas.getAllTransactions === "function") {
    return window.kas.getAllTransactions();
  }
  console.warn("window.kas tidak tersedia, menggunakan array kosong.");
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

// Modal gambar klik di mana saja untuk tutup (termasuk gambar)
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

  // Klik di mana saja termasuk gambar akan menutup modal
  overlay.addEventListener("click", () => overlay.remove());
  img.addEventListener("click", () => overlay.remove());

  overlay.appendChild(img);
  document.body.appendChild(overlay);
}

// Popup detail transaksi
function showDatePopup(date, transactionsForDate, anchorElement) {
  const existing = document.getElementById("datePopup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "datePopup";
  popup.className = "date-popup";

  const header = document.createElement("div");
  header.className = "popup-header";
  header.innerHTML = `<strong>Riwayat Transaksi</strong> <span class="close-btn" style="cursor:pointer;">❌</span>`;
  popup.appendChild(header);

  if (transactionsForDate.length === 0) {
    const empty = document.createElement("div");
    empty.className = "popup-empty";
    empty.textContent = `Tidak ada transaksi di tanggal ${formatTanggalPanjang(date)}.`;
    popup.appendChild(empty);
  } else {
    transactionsForDate.forEach(tx => {
      const item = document.createElement("div");
      item.className = "popup-item";
      item.style.padding = "10px 0";
      item.style.borderBottom = "1px solid rgba(255,255,255,0.08)";

      let receiptHTML = "";
      if (tx.receipt) {
        receiptHTML = `
          <div style="margin-top:8px;">
            <img src="${tx.receipt}" alt="Bukti" style="max-width:100px;cursor:pointer;border-radius:6px;">
          </div>
        `;
      }

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
    });
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

// Render tabel & riwayat
function renderSummaryTable() {
  const ledger = computeLedger();
  const tbody = document.querySelector("#summary-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  ledger.forEach(row => {
    const tr = document.createElement("tr");

    const dateTd = document.createElement("td");
    const span = document.createElement("span");
    span.innerHTML = formatTanggalPendekHTML(row.date);
    span.className = "clickable-date";
    span.style.cursor = "pointer";
    span.style.textDecoration = "underline";
    span.addEventListener("click", () => {
      const ledgerFull = computeLedger();
      const sameDate = ledgerFull.filter(tx => tx.date === row.date);
      showDatePopup(row.date, sameDate, span);
    });
    dateTd.appendChild(span);

    const incomeTd = document.createElement("td");
    incomeTd.textContent = row.type === "income" ? (row.amount / 1000).toLocaleString("id-ID") : "-";
    if (row.type === "income") incomeTd.classList.add("income");

    const expenseTd = document.createElement("td");
    expenseTd.textContent = row.type === "expense" ? (row.amount / 1000).toLocaleString("id-ID") : "-";
    if (row.type === "expense") expenseTd.classList.add("expense");

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

function renderHistoryList() {
  const historyContainer = document.querySelector("#history");
  if (!historyContainer) return;
  historyContainer.innerHTML = "";

  const ledger = computeLedger();
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

  const reversed = ledger.slice().reverse();
  reversed.forEach(tx => {
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
}

document.addEventListener("DOMContentLoaded", () => {
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

  renderSummaryTable();
  renderHistoryList();
});
