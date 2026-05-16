// Mengimpor alat-alat Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Kunci Rahasia Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyBBv2Xzyfrp5v5coy1nRoR4snvmxc4YK4g",
  authDomain: "sistem-manajemen-konveksi.firebaseapp.com",
  projectId: "sistem-manajemen-konveksi",
  storageBucket: "sistem-manajemen-konveksi.firebasestorage.app",
  messagingSenderId: "123814163816",
  appId: "1:123814163816:web:37dc648680b4b6dea1d2dd",
  measurementId: "G-QDFEWJ5DN9"
};

// Menghidupkan Firebase & Database
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Membuat referensi ke tabel/koleksi bernama "pesanan" yang diurutkan berdasarkan waktu pembuatan
const pesananRef = collection(db, "pesanan");
const q = query(pesananRef, orderBy("createdAt", "asc"));

let dataPesanan = [];
let editId = null; // Sekarang kita menggunakan ID Unik dari Firebase, bukan Index

const btnAddOrder = document.getElementById('btnAddOrder');
const tableBody = document.getElementById('tableBody');

// --- FITUR LIVE CALCULATION ---
const calculateLive = () => {
    const pcs = parseFloat(document.getElementById('inputPcs').value) || 0;
    const harga = parseFloat(document.getElementById('inputHarga').value) || 0;
    const dp = parseFloat(document.getElementById('inputDp').value) || 0;
    const pelunasan = parseFloat(document.getElementById('inputPelunasan').value) || 0;

    const total = pcs * harga;
    const sisa = total - dp - pelunasan;

    document.getElementById('inputTotal').value = total > 0 ? `Rp ${total.toLocaleString('id-ID')}` : "0";
    
    const elSisa = document.getElementById('inputSisa');
    if (total > 0 && sisa <= 0) {
        elSisa.value = "LUNAS (0)";
        elSisa.style.color = "green";
    } else {
        elSisa.value = `Rp ${sisa.toLocaleString('id-ID')}`;
        elSisa.style.color = "red";
    }
};

['inputPcs', 'inputHarga', 'inputDp', 'inputPelunasan'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateLive);
});

// --- SINKRONISASI REAL-TIME DARI FIREBASE ---
// Kode ini akan otomatis mengambil data setiap kali ada perubahan di server
onSnapshot(q, (snapshot) => {
    dataPesanan = [];
    snapshot.forEach((doc) => {
        dataPesanan.push({ id: doc.id, ...doc.data() });
    });
    renderTable(); // Gambar ulang tabel dengan data terbaru
});

// --- FITUR SIMPAN & EDIT KE FIREBASE ---
btnAddOrder.addEventListener('click', async () => {
    const pesanan = {
        tanggal: document.getElementById('inputTanggal').value,
        nama: document.getElementById('inputNama').value,
        jenisOrder: document.getElementById('inputJenisOrder').value,
        bahan: document.getElementById('inputBahan').value,
        kerah: document.getElementById('inputKerah').value,
        cutting: document.getElementById('inputCutting').value,
        pcs: parseFloat(document.getElementById('inputPcs').value) || 0,
        harga: parseFloat(document.getElementById('inputHarga').value) || 0,
        
        tanggalDp: document.getElementById('inputTanggalDp').value,
        dp: parseFloat(document.getElementById('inputDp').value) || 0,
        jenisPembayaranDp: document.getElementById('inputJenisPembayaranDp').value,
        
        tanggalPelunasan: document.getElementById('inputTanggalPelunasan').value,
        pelunasan: parseFloat(document.getElementById('inputPelunasan').value) || 0,
        jenisPembayaranPelunasan: document.getElementById('inputJenisPembayaranPelunasan').value,
        
        pengerjaan: document.getElementById('inputPengerjaan').value,
        penjahit: document.getElementById('inputPenjahit').value
    };

    if (!pesanan.nama || !pesanan.jenisOrder || pesanan.pcs === 0) {
        alert("Nama, Jenis Order, dan PCS wajib diisi!");
        return;
    }

    pesanan.total = pesanan.pcs * pesanan.harga;
    pesanan.sisaTagihan = pesanan.total - pesanan.dp - pesanan.pelunasan;

    btnAddOrder.innerText = "⏳ Menyimpan..."; // Indikator loading

    try {
        if (editId) {
            // Update data lama di Firebase
            const docRef = doc(db, "pesanan", editId);
            await updateDoc(docRef, pesanan);
            editId = null;
            btnAddOrder.style.backgroundColor = "#007bff";
        } else {
            // Tambah data baru ke Firebase
            pesanan.createdAt = Date.now(); // Catat waktu agar tabel berurutan
            await addDoc(pesananRef, pesanan);
        }
        clearForm();
    } catch (error) {
        console.error("Gagal menyimpan ke server:", error);
        alert("Gagal menyimpan data! Pastikan Anda terhubung ke internet.");
    } finally {
        btnAddOrder.innerText = "+ Simpan Pesanan ke Server";
    }
});

function clearForm() {
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
    calculateLive();
}

// --- FITUR MENAMPILKAN TABEL ---
function renderTable() {
    tableBody.innerHTML = '';
    dataPesanan.forEach((p, index) => {
        const tr = document.createElement('tr');
        const textSisa = p.sisaTagihan <= 0 ? '<strong style="color:green;">LUNAS</strong>' : `Rp ${p.sisaTagihan.toLocaleString('id-ID')}`;
        
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${p.nama}</td>
            <td>${p.jenisOrder}</td>
            <td>${p.bahan}<br><small>${p.kerah} / ${p.cutting}</small></td>
            <td>${p.pcs}</td>
            <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
            <td>Rp ${p.total.toLocaleString('id-ID')}</td>
            <td>${p.tanggalDp || '-'}</td>
            <td>Rp ${p.dp.toLocaleString('id-ID')}</td>
            <td>${p.jenisPembayaranDp}</td>
            <td>${p.tanggalPelunasan || '-'}</td>
            <td>Rp ${p.pelunasan.toLocaleString('id-ID')}</td>
            <td>${p.jenisPembayaranPelunasan}</td>
            <td>${textSisa}</td>
            <td>${p.pengerjaan}</td>
            <td>${p.penjahit}</td>
            <td>
                <button class="btn-edit" onclick="editData('${p.id}')">Edit</button>
                <button class="btn-delete" onclick="deleteData('${p.id}')">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- FITUR EDIT & HAPUS ---
window.editData = function(id) {
    const p = dataPesanan.find(item => item.id === id);
    editId = id;

    document.getElementById('inputTanggal').value = p.tanggal;
    document.getElementById('inputNama').value = p.nama;
    document.getElementById('inputJenisOrder').value = p.jenisOrder;
    document.getElementById('inputBahan').value = p.bahan;
    document.getElementById('inputKerah').value = p.kerah;
    document.getElementById('inputCutting').value = p.cutting;
    document.getElementById('inputPcs').value = p.pcs;
    document.getElementById('inputHarga').value = p.harga;
    document.getElementById('inputTanggalDp').value = p.tanggalDp;
    document.getElementById('inputDp').value = p.dp;
    document.getElementById('inputJenisPembayaranDp').value = p.jenisPembayaranDp;
    document.getElementById('inputTanggalPelunasan').value = p.tanggalPelunasan;
    document.getElementById('inputPelunasan').value = p.pelunasan;
    document.getElementById('inputJenisPembayaranPelunasan').value = p.jenisPembayaranPelunasan;
    document.getElementById('inputPengerjaan').value = p.pengerjaan;
    document.getElementById('inputPenjahit').value = p.penjahit;

    btnAddOrder.innerText = "💾 Simpan Perubahan (Edit)";
    btnAddOrder.style.backgroundColor = "#ffc107";
    calculateLive();
};

window.deleteData = async function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus pesanan ini dari Database Server?")) {
        try {
            await deleteDoc(doc(db, "pesanan", id));
        } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus data!");
        }
    }
};

// --- FITUR CETAK PDF ---
const btnPdf = document.getElementById('btnPdf');
btnPdf.addEventListener('click', () => {
    if (dataPesanan.length === 0) return alert("Belum ada data!");
    const judul = prompt("Masukkan Judul Laporan:", "Laporan Konveksi");
    if (!judul) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(14);
    doc.text(judul, 14, 15);
    
    const dataTabel = dataPesanan.map((p, index) => [
        index + 1, p.nama, p.jenisOrder, 
        `${p.bahan}\n${p.kerah}/${p.cutting}`, 
        p.pcs, p.harga, p.total,
        p.tanggalDp || '-', p.dp, 
        p.tanggalPelunasan || '-', p.pelunasan, 
        p.sisaTagihan <= 0 ? "LUNAS" : p.sisaTagihan, 
        p.pengerjaan, p.penjahit
    ]);

    doc.autoTable({
        startY: 20,
        head: [['NO', 'NAMA', 'ORDER', 'DETAIL', 'PCS', 'HRG', 'TOTAL', 'TGL DP', 'DP', 'TGL LNS', 'LUNAS', 'SISA', 'STATUS', 'PENJAHIT']],
        body: dataTabel,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] },
        styles: { fontSize: 7, cellPadding: 1 }, 
    });

    doc.save(judul.replace(/\s+/g, '_') + '.pdf');
});