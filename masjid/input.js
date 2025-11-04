function formatTanggal(tanggal) {
  const tahun = tanggal.getFullYear();
  const bulan = String(tanggal.getMonth() + 1).padStart(2, "0");
  const hari = String(tanggal.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

function tambahNol() {
  const amountInput = document.getElementById("amount");
  let val = amountInput.value.trim();
  if (!val) val = "0";
  amountInput.value = parseInt(val + "000");
}

function generateCode() {
  let description = document.getElementById("description").value.trim();
  if (!description) description = "Infak Jumat"; // ✅ isi default jika kosong

  const type = document.getElementById("type").value;
  const amount = parseInt(document.getElementById("amount").value);
  const note = document.getElementById("note").value.trim();
  const dateInput = document.getElementById("tanggal").value;
  const foto = document.getElementById("foto").value.trim();
  const video = document.getElementById("video").value.trim();

  if (isNaN(amount) || !dateInput) {
    alert("Mohon isi tanggal dan jumlah dengan benar.");
    return;
  }

  const date = new Date(dateInput);
  const formattedDate = formatTanggal(date);

  // Tampilkan preview
  document.getElementById("previewDate").innerText = formattedDate;
  document.getElementById("previewDesc").innerText = description;
  document.getElementById("previewType").innerText =
    type === "income" ? "Pemasukan" : "Pengeluaran";
  document.getElementById("previewAmount").innerText =
    amount.toLocaleString("id-ID");
  document.getElementById("previewNote").innerText = note || "-";

  if (foto) {
    document.getElementById("previewImage").src = foto;
    document.getElementById("previewImageContainer").style.display = "block";
  } else {
    document.getElementById("previewImageContainer").style.display = "none";
  }

  if (video) {
    const videoLink = document.getElementById("previewVideoLink");
    videoLink.href = video;
    videoLink.style.display = "inline-block";
  } else {
    const videoLink = document.getElementById("previewVideoLink");
    videoLink.style.display = "none";
  }

  document.getElementById("preview").style.display = "block";

  // Kode untuk disalin (sesuai kas.js terbaru)
  const output = `{
  date: "${formattedDate}",
  description: "${description}",
  type: "${type}",
  amount: ${amount},
  note: "${note}",
  foto: "${foto}",
  video: "${video}"
  
},`;

  const resultDiv = document.getElementById("result");
  resultDiv.innerText = output;
  resultDiv.style.display = "block";

  document.getElementById("copyBtn").style.display = "block";
}

function copyToClipboard() {
  const resultText = document.getElementById("result").innerText;
  navigator.clipboard.writeText(resultText).then(() => {
    alert("Kode berhasil disalin!");
  });
}