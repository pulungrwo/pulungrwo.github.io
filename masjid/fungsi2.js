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
      const latest = allTransactions
        .slice()
        .sort((a, b) => toDate(b.date) - toDate(a.date))[0];
      document.getElementById("last-updated").innerText =
        "Terakhir diperbarui: " + formatTanggalPanjang(latest.date);
    } else {
      document.getElementById("last-updated").innerText =
        "Terakhir diperbarui: -";
    }

    // update periode label
    const periodeInfo = document.getElementById("periode-info");
    if (periodeInfo) {
      periodeInfo.textContent =
        window.kasData[currentPeriode]?.periode || "";
    }
  };

  container.append(label, select);

  // tambahkan info periode di bawah filter
  let periodeInfo = document.getElementById("periode-info");
  if (!periodeInfo) {
    periodeInfo = document.createElement("div");
    periodeInfo.id = "periode-info";
    periodeInfo.style.marginTop = "6px";
    periodeInfo.style.fontSize = "0.9rem";
    periodeInfo.style.color = "#ccc";
    container.appendChild(periodeInfo);
  }
  periodeInfo.textContent = window.kasData[selectedPeriode]?.periode || "";
}

// =================== Init ===================
document.addEventListener("DOMContentLoaded", () => {
  function initKas() {
    if (window.kasData && Object.keys(window.kasData).length > 0) {
      const periodes = Object.keys(window.kasData).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
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
        const latest = allTransactions
          .slice()
          .sort((a, b) => toDate(b.date) - toDate(a.date))[0];
        document.getElementById("last-updated").innerText =
          "Terakhir diperbarui: " + formatTanggalPanjang(latest.date);
      } else {
        document.getElementById("last-updated").innerText =
          "Terakhir diperbarui: -";
      }

      // tampilkan periode saat init
      const periodeInfo = document.getElementById("periode-info");
      if (periodeInfo) {
        periodeInfo.textContent =
          window.kasData[currentPeriode]?.periode || "";
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