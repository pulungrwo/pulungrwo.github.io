
document.addEventListener("DOMContentLoaded", function () {
  // Load Footer
  fetch("/bank-risma/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer-placeholder").innerHTML = data;
    })
    .catch(err => console.error("Gagal memuat footer:", err));
});
