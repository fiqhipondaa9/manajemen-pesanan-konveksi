// 1. Array untuk menyimpan semua data pesanan seperti "database" sementara
let dataPesanan = [];

// 2. Mengambil elemen HTML yang akan kita gunakan
const btnAddOrder = document.getElementById('btnAddOrder');
const tableBody = document.getElementById('tableBody');

// 3. Memberikan perintah pada tombol Tambah Pesanan saat diklik
btnAddOrder.addEventListener('click', () => {
  // Mengambil nilai (value) yang diketikkan pengguna di dalam form
  const tanggal = document.getElementById('inputTanggal').value;
  const nama = document.getElementById('inputNama').value;
  const jenisOrder = document.getElementById('inputJenisOrder').value;
  const bahan = document.getElementById('inputBahan').value;
    // Mengambil nilai dari dropdown kerah dan cutting
    const kerah = document.getElementById('inputKerah').value;
    const cutting = document.getElementById('inputCutting').value;
    // Menggabungkan keduanya agar sesuai dengan format tabel yang sudah ada
    const detailBaju = kerah + " / " + cutting; 
    
    const pcs = parseFloat(document.getElementById('inputPcs').value) || 0;
  const harga = parseFloat(document.getElementById('inputHarga').value) || 0;
  const dp = parseFloat(document.getElementById('inputDp').value) || 0;
  const jenisPembayaran = document.getElementById('inputJenisPembayaran').value;
  const pengerjaan = document.getElementById('inputPengerjaan').value;
  const penjahit = document.getElementById('inputPenjahit').value;

  // Pengecekan sederhana: Jangan simpan kalau Nama dan Jenis Order kosong
  if (!nama || !jenisOrder || pcs === 0) {
    alert(
      'Mohon isi Nama Pelanggan, Jenis Order, dan Jumlah (PCS) terlebih dahulu!'
    );
    return; // Hentikan proses jika data penting belum diisi
  }

  // 4. Logika Perhitungan Otomatis
  const total = pcs * harga;
  const sisaPelunasan = total - dp;

  // 5. Bungkus semua data menjadi satu "Pesanan Baru"
  const pesananBaru = {
    tanggal,
    nama,
    jenisOrder,
    bahan,
    detailBaju,
    pcs,
    harga,
    total,
    dp,
    sisaPelunasan,
    jenisPembayaran,
    pengerjaan,
    penjahit,
  };

  // 6. Masukkan pesanan baru ke dalam array dataPesanan
  dataPesanan.push(pesananBaru);

  // 7. Panggil fungsi untuk menampilkan data ke tabel
  renderTable();

  // Pesan sukses
  console.log('Pesanan berhasil ditambahkan:', pesananBaru);
});

// Fungsi untuk menggambar ulang tabel berdasarkan isi array dataPesanan
function renderTable() {
  // Bersihkan isi tabel HTML terlebih dahulu
  tableBody.innerHTML = '';

  // Lakukan perulangan (looping) untuk setiap data pesanan yang ada di array
  dataPesanan.forEach((pesanan, index) => {
    // Buat baris baru (tr)
    const tr = document.createElement('tr');

    // Isi kolom-kolomnya (td)
    tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${pesanan.nama}</td>
            <td>${pesanan.jenisOrder}</td>
            <td>${pesanan.bahan} <br> <small>${pesanan.detailBaju}</small></td>
            <td>${pesanan.pcs}</td>
            <td>Rp ${pesanan.harga.toLocaleString('id-ID')}</td>
            <td>Rp ${pesanan.total.toLocaleString('id-ID')}</td>
            <td>${pesanan.tanggal}</td>
            <td>Rp ${pesanan.dp.toLocaleString('id-ID')}</td>
            <td><strong>Rp ${pesanan.sisaPelunasan.toLocaleString(
              'id-ID'
            )}</strong></td>
            <td>${pesanan.jenisPembayaran}</td>
            <td>${pesanan.pengerjaan}</td>
            <td>${pesanan.penjahit}</td>
        `;

    // Tambahkan baris tersebut ke dalam tabel HTML
    tableBody.appendChild(tr);
  });
}

// --- KODE LANGKAH 3: SIMPAN & BUKA FILE JSON ---

// 1. Logika untuk Tombol "Simpan File JSON"
const btnSave = document.getElementById('btnSave');

btnSave.addEventListener('click', () => {
    // Cek apakah ada data yang bisa disimpan
    if (dataPesanan.length === 0) {
        alert("Belum ada data pesanan untuk disimpan!");
        return;
    }

    // Mengubah array dataPesanan menjadi teks berformat JSON
    const dataString = JSON.stringify(dataPesanan, null, 2);
    
    // Membuat sebuah "Blob" (objek file sementara di memori browser)
    const blob = new Blob([dataString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Membuat elemen link (<a>) tersembunyi untuk memicu proses download
    const a = document.createElement('a');
    a.href = url;
    
    // Memberikan nama file otomatis berdasarkan tanggal hari ini
    const tanggalHariIni = new Date().toISOString().split('T')[0];
    a.download = `Data_Konveksi_${tanggalHariIni}.json`;
    
    // Memicu klik pada link tersembunyi tersebut
    a.click();
    
    // Membersihkan memori browser setelah download selesai
    URL.revokeObjectURL(url);
});

// 2. Logika untuk Tombol "Buka File JSON"
const fileInput = document.getElementById('fileInput');
// Catatan: Tombol "btnOpen" di HTML sudah dikonfigurasi untuk memicu klik pada "fileInput"

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0]; // Mengambil file yang dipilih pengguna
    if (!file) return; // Batalkan jika tidak ada file yang dipilih

    const reader = new FileReader(); // Alat bawaan browser untuk membaca file
    
    // Perintah ini akan dijalankan setelah file selesai dibaca
    reader.onload = (e) => {
        try {
            // Mengubah teks JSON kembali menjadi array JavaScript
            const dataMasuk = JSON.parse(e.target.result);
            
            // Memastikan data yang dimasukkan benar-benar sebuah array
            if (Array.isArray(dataMasuk)) {
                dataPesanan = dataMasuk; // Ganti data lama dengan data dari file
                renderTable(); // Gambar ulang tabel dengan data baru
                alert("Data berhasil dimuat!");
            } else {
                alert("Format data di dalam file tidak sesuai!");
            }
        } catch (error) {
            alert("Gagal membaca file! Pastikan itu adalah file JSON yang valid.");
            console.error(error);
        }
    };
    
    // Membaca isi file sebagai teks
    reader.readAsText(file);
    
    // Mengosongkan input file agar file yang sama bisa dibuka ulang jika perlu
    fileInput.value = ''; 
});

// --- KODE LANGKAH 4: CETAK LAPORAN PDF ---

const btnPdf = document.getElementById('btnPdf');

btnPdf.addEventListener('click', () => {
    // 1. Pastikan ada data sebelum mencetak
    if (dataPesanan.length === 0) {
        alert("Belum ada data pesanan untuk dicetak!");
        return;
    }

    // 2. Meminta pengguna memasukkan judul laporan (Bulanan/Tahunan)
    const judulLaporan = prompt(
        "Masukkan Judul Laporan\nContoh: Laporan Bulanan Mei 2026 atau Laporan Tahunan 2026", 
        "Laporan Pesanan Konveksi"
    );
    
    // Jika pengguna menekan 'Cancel' pada pop-up, hentikan proses
    if (judulLaporan === null) return; 

    // 3. Memanggil library jsPDF yang sudah kita pasang di HTML
    const { jsPDF } = window.jspdf;
    
    // Membuat dokumen PDF baru. 'landscape' artinya format kertas memanjang ke samping 
    // agar tabel yang panjang bisa muat dengan baik.
    const doc = new jsPDF('landscape');

    // 4. Menambahkan teks Judul dan Tanggal Cetak ke PDF
    doc.setFontSize(16);
    doc.text(judulLaporan, 14, 20); // (Teks, posisi X, posisi Y)
    
    doc.setFontSize(10);
    const tanggalCetak = new Date().toLocaleDateString('id-ID', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    doc.text(`Dicetak pada: ${tanggalCetak}`, 14, 28);

    // 5. Menyiapkan isi tabel. Kita memformat array agar sesuai urutan kolom.
    const dataTabel = dataPesanan.map((pesanan, index) => [
        index + 1,
        pesanan.nama,
        pesanan.jenisOrder,
        `${pesanan.bahan}\n(${pesanan.detailBaju})`, // Menggabungkan bahan dan kerah
        pesanan.pcs,
        `Rp ${pesanan.harga.toLocaleString('id-ID')}`,
        `Rp ${pesanan.total.toLocaleString('id-ID')}`,
        pesanan.tanggal,
        `Rp ${pesanan.dp.toLocaleString('id-ID')}`,
        `Rp ${pesanan.sisaPelunasan.toLocaleString('id-ID')}`,
        pesanan.pengerjaan,
        pesanan.penjahit
    ]);

    // 6. Menggambar tabel ke dalam PDF menggunakan plugin autoTable
    doc.autoTable({
        startY: 35, // Jarak tabel dari atas kertas
        head: [['NO', 'NAMA', 'ORDER', 'BAHAN & CUTTING', 'PCS', 'HARGA', 'TOTAL', 'TANGGAL', 'DP', 'SISA', 'STATUS', 'PENJAHIT']],
        body: dataTabel,
        theme: 'grid',
        headStyles: { fillColor: [0, 123, 255] }, // Memberi warna biru pada header tabel
        styles: { fontSize: 8, cellPadding: 2 }, // Mengecilkan font agar semua kolom muat
        columnStyles: {
            3: { cellWidth: 30 }, // Mengatur lebar spesifik untuk kolom bahan agar tidak terlalu sempit
            10: { fontStyle: 'bold' } // Menebalkan teks pada kolom status pengerjaan
        }
    });

    // 7. Mengunduh file PDF secara otomatis
    // Nama file akan menyesuaikan dengan judul yang Anda ketik (spasi diganti dengan garis bawah)
    const namaFile = judulLaporan.replace(/\s+/g, '_') + '.pdf';
    doc.save(namaFile);
});