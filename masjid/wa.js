// wa.js
const admins = {
  bendahara: {
    name: "Pulung Riswanto",
    img: "/risma/img/pulung.png",
    number: "6288971344131"
  },
  ketua: {
    name: "Nurman Wibowo",
    img: "/risma/img/nurman.jpg",
    number: "6282373877424"
  },
  wakil: {
    name: "Suhdi Efendi",
    img: "/risma/img/suhdi.jpg",
    number: "6283811530676"
  }
};

function toggleForm() {
  const form = document.getElementById('formPopup');
  const bantuan = document.getElementById('bantuanPopup');
  if (!form || !bantuan) return;

  if (form.style.display === 'block') {
    form.style.display = 'none';
    bantuan.style.display = 'flex';
  } else {
    form.style.display = 'block';
    bantuan.style.display = 'none';
    updateProfile(); // refresh admin info
  }
}

function closeForm() {
  const form = document.getElementById('formPopup');
  const bantuan = document.getElementById('bantuanPopup');
  if (form) form.style.display = 'none';
  if (bantuan) bantuan.style.display = 'flex';
}

function updateProfile() {
  const select = document.getElementById('adminSelect');
  if (!select) return;
  const selected = select.value;
  const data = admins[selected];
  if (!data) return;

  const adminNameEl = document.getElementById('adminName');
  const adminImgEl = document.getElementById('adminImg');
  const bantuanImgEl = document.getElementById('bantuanImg');

  if (adminNameEl) adminNameEl.textContent = data.name;
  if (adminImgEl) adminImgEl.src = data.img;
  if (bantuanImgEl) bantuanImgEl.src = data.img;
}

function sendWA() {
  const select = document.getElementById('adminSelect');
  const msgEl = document.getElementById('message');
  if (!select || !msgEl) return;

  const selected = select.value;
  const msg = msgEl.value.trim();

  if (msg === "") {
    alert("Silakan isi pesan dulu ges.");
    return;
  }

  const phone = admins[selected]?.number;
  if (!phone) {
    alert("Admin tidak ditemukan.");
    return;
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Bind after DOM is ready to avoid missing elements
document.addEventListener("DOMContentLoaded", () => {
  // Optional: initialize display state
  const form = document.getElementById('formPopup');
  const bantuan = document.getElementById('bantuanPopup');
  if (form) form.style.display = 'none';
  if (bantuan) bantuan.style.display = 'flex';

  // Ensure onchange handler if not inline
  const select = document.getElementById('adminSelect');
  if (select) select.addEventListener('change', updateProfile);
});
