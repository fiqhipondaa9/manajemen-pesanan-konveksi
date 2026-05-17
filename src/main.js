import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBBv2Xzyfrp5v5coy1nRoR4snvmxc4YK4g",
  authDomain: "sistem-manajemen-konveksi.firebaseapp.com",
  projectId: "sistem-manajemen-konveksi",
  storageBucket: "sistem-manajemen-konveksi.firebasestorage.app",
  messagingSenderId: "123814163816",
  appId: "1:123814163816:web:37dc648680b4b6dea1d2dd",
  measurementId: "G-QDFEWJ5DN9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const pesananRef = collection(db, "pesanan");
const q = query(pesananRef, orderBy("createdAt", "asc"));

let dataPesanan = [];
let editId = null; 
let fotoUrlLama = ""; 
let filterBulanValue = "";

// --- VARIABEL LOGIN ---
let currentUserRole = ""; // Akan berisi 'superadmin' atau 'admin'
let currentUsername = "";

// --- LOGIKA LOGIN & LOGOUT ---
document.getElementById('btnLogin').addEventListener('click', () => {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    if (user === "superadmin" && pass === "super123") {
        currentUserRole = "superadmin";
        currentUsername = "Super Admin";
    } else if (user === "admin1" && pass === "admin123") {
        currentUserRole = "admin";
        currentUsername = "Admin 1";
    } else if (user === "admin2" && pass === "admin123") {
        currentUserRole = "admin";
        currentUsername = "Admin 2";
    } else {
        alert("Username atau Password salah!");
        return;
    }

    // Jika berhasil login, sembunyikan overlay, tampilkan aplikasi
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    document.getElementById('userInfo').innerText = `👤 Login sebagai: ${currentUsername}`;
    
    // Render ulang tabel untuk menerapkan batasan hak akses
    renderTable();
});

document.getElementById('btnLogout').addEventListener('click', () => {
    // Reset dan kembali ke layar login
    currentUserRole = "";
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
});

// --- FITUR KOMPRESI FOTO ---
const compressImage = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600; 
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            }
        };
    });
};

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
    if (total > 0 && sisa <= 0) { elSisa.value = "LUNAS (0)"; elSisa.style.color = "green"; } 
    else { elSisa.value = `Rp ${sisa.toLocaleString('id-ID')}`; elSisa.style.color = "red"; }
};

['inputPcs', 'inputHarga', 'inputDp', 'inputPelunasan'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateLive);
});

// --- LISTENER FILTER ---
document.getElementById('filterBulan').addEventListener('change', (e) => { filterBulanValue = e.target.value; renderTable(); });
document.getElementById('btnResetFilter').addEventListener('click', () => { document.getElementById('filterBulan').value = ""; filterBulanValue = ""; renderTable(); });

// --- FIREBASE REAL-TIME ---
onSnapshot(q, (snapshot) => {
    dataPesanan = [];
    snapshot.forEach((doc) => { dataPesanan.push({ id: doc.id, ...doc.data() }); });
    if (currentUserRole !== "") renderTable(); // Render hanya jika sudah login
});

// --- SIMPAN / EDIT KE FIREBASE ---
const btnAddOrder = document.getElementById('btnAddOrder');
btnAddOrder.addEventListener('click', async () => {
    const tanggalInput = document.getElementById('inputTanggal').value;
    const namaInput = document.getElementById('inputNama').value.trim();
    if (!namaInput || !tanggalInput) return alert("Tanggal dan Nama wajib diisi!");

    const tglFormat = tanggalInput.replace(/-/g, ''); 
    const namaDepan = namaInput.split(' ')[0].toUpperCase();
    const invoiceId = `INV-${tglFormat}-${namaDepan}`;

    const pesanan = {
        invoiceId: invoiceId, 
        tanggal: tanggalInput,
        nama: namaInput.toUpperCase(), 
        jenisOrder: document.getElementById('inputJenisOrder').value,
        bahan: document.getElementById('inputBahan').value,
        kerah: document.getElementById('inputKerah').value,
        cutting: document.getElementById('inputCutting').value,
        pcs: parseFloat(document.getElementById('inputPcs').value) || 0,
        harga: parseFloat(document.getElementById('inputHarga').value) || 0,
        estimasi: document.getElementById('inputEstimasi').value, 
        tanggalDp: document.getElementById('inputTanggalDp').value,
        dp: parseFloat(document.getElementById('inputDp').value) || 0,
        jenisPembayaranDp: document.getElementById('inputJenisPembayaranDp').value,
        tanggalPelunasan: document.getElementById('inputTanggalPelunasan').value,
        pelunasan: parseFloat(document.getElementById('inputPelunasan').value) || 0,
        jenisPembayaranPelunasan: document.getElementById('inputJenisPembayaranPelunasan').value,
        pengerjaan: document.getElementById('inputPengerjaan').value,
        penjahit: document.getElementById('inputPenjahit').value,
        fotoUrl: fotoUrlLama 
    };

    pesanan.total = pesanan.pcs * pesanan.harga;
    pesanan.sisaTagihan = pesanan.total - pesanan.dp - pesanan.pelunasan;

    btnAddOrder.innerText = "⏳ Memproses Data..."; 

    try {
        const fileInput = document.getElementById('inputFoto');
        if (fileInput.files.length > 0) {
            btnAddOrder.innerText = "⏳ Mengompres Foto...";
            const file = fileInput.files[0];
            const compressedDataUrl = await compressImage(file);
            const fileName = `foto_barang/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, fileName);
            await uploadString(storageRef, compressedDataUrl, 'data_url');
            pesanan.fotoUrl = await getDownloadURL(storageRef);
        }

        btnAddOrder.innerText = "⏳ Menyimpan Database...";
        if (editId) {
            await updateDoc(doc(db, "pesanan", editId), pesanan);
            editId = null;
            fotoUrlLama = "";
            btnAddOrder.style.backgroundColor = "#007bff";
        } else {
            pesanan.createdAt = Date.now();
            await addDoc(pesananRef, pesanan);
        }
        clearForm();
    } catch (error) {
        alert("Gagal menyimpan ke server!");
    } finally {
        btnAddOrder.innerText = "+ Simpan Pesanan ke Server";
    }
});

function clearForm() {
    document.querySelectorAll('input').forEach(input => { if(input.type !== 'month') input.value = ''; });
    document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
    fotoUrlLama = "";
    calculateLive();
}

// --- FUNGSI MENGGAMBAR TABEL ---
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    const tableFooter = document.getElementById('tableFooter');
    tableBody.innerHTML = '';
    
    let dataDitampilkan = dataPesanan;
    if (filterBulanValue !== "") {
        dataDitampilkan = dataPesanan.filter(p => p.tanggal && p.tanggal.startsWith(filterBulanValue));
    }

    let totalPcs = 0, totalHargaSemua = 0, totalDpSemua = 0, totalPelunasanSemua = 0, totalSisaSemua = 0;
    let hariIni = new Date();
    hariIni.setHours(0,0,0,0); 

    dataDitampilkan.forEach((p, index) => {
        let warnaStatus = "status-kuning";
        if (p.pengerjaan === "Design" || p.pengerjaan === "Print/Cetak") warnaStatus = "status-merah";
        if (p.pengerjaan === "Selesai") warnaStatus = "status-hijau";

        let teksEstimasi = p.estimasi || '-';
        let kelasEstimasi = "";
        if (p.estimasi && p.pengerjaan !== "Selesai") {
            let tglEstimasi = new Date(p.estimasi);
            let selisihHari = Math.ceil((tglEstimasi - hariIni) / (1000 * 60 * 60 * 24));
            if (selisihHari < 0) { teksEstimasi += `<br><span class="estimasi-telat">Lewat ${Math.abs(selisihHari)} Hari!</span>`; } 
            else if (selisihHari <= 2) { teksEstimasi += `<br><span class="estimasi-dekat">Sisa ${selisihHari} Hari</span>`; kelasEstimasi = "estimasi-dekat"; } 
            else { kelasEstimasi = "estimasi-aman"; }
        }

        const textSisa = p.sisaTagihan <= 0 ? '<span style="color:green; font-weight:bold;">LUNAS</span>' : `Rp ${p.sisaTagihan.toLocaleString('id-ID')}`;
        const imgTag = p.fotoUrl ? `<a href="${p.fotoUrl}" target="_blank"><img src="${p.fotoUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #ccc;"></a>` : '-';

        totalPcs += p.pcs;
        totalHargaSemua += p.total;
        totalDpSemua += p.dp;
        totalPelunasanSemua += p.pelunasan;
        totalSisaSemua += (p.sisaTagihan > 0 ? p.sisaTagihan : 0);

        // LOGIKA TOMBOL HAK AKSES
        let tombolAksi = `<button class="btn-edit" onclick="editData('${p.id}')">Edit</button>`;
        // Tombol Hapus hanya muncul untuk superadmin
        if (currentUserRole === 'superadmin') {
            tombolAksi += `<button class="btn-delete" onclick="deleteData('${p.id}')">Hapus</button>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${p.invoiceId || '-'}</strong></td>
            <td style="text-align:center;">${imgTag}</td>
            <td><strong>${p.nama}</strong><br><small>${p.tanggal}</small></td>
            <td>${p.jenisOrder}</td>
            <td>${p.bahan}<br><small>${p.kerah} / ${p.cutting}</small></td>
            <td>${p.pcs}</td>
            <td>Rp ${p.harga.toLocaleString('id-ID')}</td>
            <td><strong>Rp ${p.total.toLocaleString('id-ID')}</strong></td>
            <td>Rp ${p.dp.toLocaleString('id-ID')}<br><small>${p.jenisPembayaranDp}</small></td>
            <td>Rp ${p.pelunasan.toLocaleString('id-ID')}<br><small>${p.jenisPembayaranPelunasan}</small></td>
            <td>${textSisa}</td>
            <td class="${kelasEstimasi}">${teksEstimasi}</td>
            <td><span class="status-badge ${warnaStatus}">${p.pengerjaan}</span></td>
            <td>${p.penjahit}</td>
            <td>${tombolAksi}</td>
        `;
        tableBody.appendChild(tr);
    });

    // LOGIKA TAMPILAN REKAP UANG HAK AKSES
    if (currentUserRole === 'superadmin') {
        tableFooter.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: right; color: #007bff;"><strong>TOTAL REKAPITULASI DATA:</strong></td>
                <td><strong>${totalPcs} PCS</strong></td>
                <td>-</td>
                <td style="color: #007bff;"><strong>Rp ${totalHargaSemua.toLocaleString('id-ID')}</strong></td>
                <td style="color: #28a745;"><strong>Rp ${totalDpSemua.toLocaleString('id-ID')}</strong></td>
                <td style="color: #28a745;"><strong>Rp ${totalPelunasanSemua.toLocaleString('id-ID')}</strong></td>
                <td style="color: #dc3545;"><strong>Rp ${totalSisaSemua.toLocaleString('id-ID')}</strong></td>
                <td colspan="4"></td>
            </tr>
        `;
    } else {
        // Jika Admin, baris total uang tidak ditampilkan
        tableFooter.innerHTML = ``;
    }
}

// --- FITUR EDIT & HAPUS ---
window.editData = function(id) {
    const p = dataPesanan.find(item => item.id === id);
    editId = id;
    fotoUrlLama = p.fotoUrl || ""; 
    document.getElementById('inputTanggal').value = p.tanggal;
    document.getElementById('inputNama').value = p.nama;
    document.getElementById('inputJenisOrder').value = p.jenisOrder;
    document.getElementById('inputBahan').value = p.bahan;
    document.getElementById('inputKerah').value = p.kerah;
    document.getElementById('inputCutting').value = p.cutting;
    document.getElementById('inputPcs').value = p.pcs;
    document.getElementById('inputHarga').value = p.harga;
    document.getElementById('inputEstimasi').value = p.estimasi || '';
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
    window.scrollTo(0, 0); 
    calculateLive();
};

window.deleteData = async function(id) {
    if (confirm("Yakin hapus data dari Server?")) {
        await deleteDoc(doc(db, "pesanan", id));
    }
};

// Fitur PDF
const btnPdf = document.getElementById('btnPdf');
btnPdf.addEventListener('click', () => {
    if (dataPesanan.length === 0) return alert("Belum ada data!");
    const judul = prompt("Masukkan Judul Laporan:", "Laporan NN Apparel");
    if (!judul) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    doc.setFontSize(14); doc.text(judul, 14, 15);
    
    let dataDitampilkan = dataPesanan;
    if (filterBulanValue !== "") {
        dataDitampilkan = dataPesanan.filter(p => p.tanggal && p.tanggal.startsWith(filterBulanValue));
    }

    const dataTabel = dataDitampilkan.map((p, index) => [
        index + 1, p.invoiceId || '-', p.nama, p.jenisOrder, 
        `${p.bahan}\n${p.kerah}/${p.cutting}`, 
        p.pcs, p.harga, p.total,
        p.tanggalDp || '-', p.dp, 
        p.tanggalPelunasan || '-', p.pelunasan, 
        p.sisaTagihan <= 0 ? "LUNAS" : p.sisaTagihan, 
        p.estimasi || '-', p.pengerjaan, p.penjahit
    ]);

    doc.autoTable({
        startY: 20,
        head: [['NO', 'ID NOTA', 'NAMA', 'ORDER', 'DETAIL', 'PCS', 'HRG', 'TOTAL', 'TGL DP', 'DP', 'TGL LNS', 'LUNAS', 'SISA', 'ESTIMASI', 'STATUS', 'PENJAHIT']],
        body: dataTabel, theme: 'grid', headStyles: { fillColor: [0, 123, 255] }, styles: { fontSize: 7, cellPadding: 1 }, 
    });
    doc.save(judul.replace(/\s+/g, '_') + '.pdf');
});