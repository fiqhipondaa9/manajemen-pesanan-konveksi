let dataPesanan = [];
let editIndex = -1; // Penanda: -1 berarti "Tambah Baru", angka lain berarti "Mode Edit"

const btnAddOrder = document.getElementById('btnAddOrder');
const tableBody = document.getElementById('tableBody');

// --- FITUR LIVE CALCULATION (Perhitungan Otomatis) ---
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

// Menambahkan pemicu perhitungan otomatis ke kolom input angka
['inputPcs', 'inputHarga', 'inputDp', 'inputPelunasan'].forEach(id => {
    document.getElementById(id).addEventListener('input', calculateLive);
});


// --- FITUR TAMBAH / SIMPAN EDIT DATA ---
btnAddOrder.addEventListener('click', () => {
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

    // Kalkulasi akhir sebelum simpan
    pesanan.total = pesanan.pcs * pesanan.harga;
    pesanan.sisaTagihan = pesanan.total - pesanan.dp - pesanan.pelunasan;

    if (editIndex === -1) {
        // Mode Tambah Baru
        dataPesanan.push(pesanan);
    } else {
        // Mode Simpan Hasil Edit
        dataPesanan[editIndex] = pesanan;
        editIndex = -1; // Kembalikan ke mode normal
        btnAddOrder.innerText = "+ Simpan Pesanan";
        btnAddOrder.style.backgroundColor = "#007bff";
    }

    renderTable();
    clearForm();
});

function clearForm() {
    document.querySelectorAll('input').forEach(input => {
        if(input.type !== 'file') input.value = '';
    });
    document.querySelectorAll('select').forEach(select => select.selectedIndex = 0);
    calculateLive(); // Reset warna dan tulisan sisa/total
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
            <td>${p.tanggalDp}</td>
            <td>Rp ${p.dp.toLocaleString('id-ID')}</td>
            <td>${p.jenisPembayaranDp}</td>
            <td>${p.tanggalPelunasan}</td>
            <td>Rp ${p.pelunasan.toLocaleString('id-ID')}</td>
            <td>${p.jenisPembayaranPelunasan}</td>
            <td>${textSisa}</td>
            <td>${p.pengerjaan}</td>
            <td>${p.penjahit}</td>
            <td>
                <button class="btn-edit" onclick="editData(${index})">Edit</button>
                <button class="btn-delete" onclick="deleteData(${index})">Hapus</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- FITUR EDIT & HAPUS (Dipanggil dari tombol di tabel) ---
window.editData = function(index) {
    const p = dataPesanan[index];
    editIndex = index; // Set penanda bahwa kita sedang mengedit baris ini

    // Masukkan data lama ke form
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

    // Ubah tampilan tombol agar jelas ini mode edit
    btnAddOrder.innerText = "💾 Simpan Perubahan (Edit)";
    btnAddOrder.style.backgroundColor = "#ffc107";
    
    // Panggil kalkulasi live untuk memperbarui tampilan readonly
    calculateLive();
};

window.deleteData = function(index) {
    if (confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
        dataPesanan.splice(index, 1); // Hapus 1 data dari array
        renderTable();
    }
};

// --- FITUR BUKA & SIMPAN FILE JSON ---
const btnSave = document.getElementById('btnSave');
btnSave.addEventListener('click', () => {
    if (dataPesanan.length === 0) return alert("Belum ada data!");
    const dataString = JSON.stringify(dataPesanan, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Data_Konveksi_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            dataPesanan = JSON.parse(e.target.result);
            renderTable();
            alert("Data berhasil dimuat!");
        } catch (error) {
            alert("Format file salah!");
        }
    };
    reader.readAsText(file);
    fileInput.value = ''; 
});

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
        p.tanggalDp, p.dp, 
        p.tanggalPelunasan, p.pelunasan, 
        p.sisaTagihan <= 0 ? "LUNAS" : p.sisaTagihan, 
        p.pengerjaan, p.penjahit
    ]);

    doc.autoTable({
        startY: 20,
        head: [['NO', 'NAMA', 'ORDER', 'DETAIL', 'PCS', 'HRG', 'TOTAL', 'TGL DP', 'DP', 'TGL LNS', 'LUNAS', 'SISA', 'STATUS', 'PENJAHIT']],
        body: dataTabel,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] },
        styles: { fontSize: 7, cellPadding: 1 }, // Diperkecil agar banyak kolom muat di PDF
    });

    doc.save(judul.replace(/\s+/g, '_') + '.pdf');
});