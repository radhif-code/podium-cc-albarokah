# GEMASS — Podium Cerdas Cermat

Versi GEMASS Grand Final untuk lomba cerdas cermat Sruni Al Barokah. Desain podium mengikuti referensi bulan sabit, langit ungu, dan podium emas–perak–perunggu. Panel operator tetap menggunakan tampilan aslinya.

## Cara memakai saat acara

1. Buka website. Halaman awal hanya menampilkan podium dan identitas acara.
2. Gerakkan mouse untuk menampilkan tombol kecil di kanan atas, lalu klik **Panel operator**. Panel terbuka di tab terpisah.
3. Dari panel operator, klik **Buka layar podium** bila membutuhkan jendela tampilan baru. Pindahkan tab podium menjadi jendela tersendiri, lalu letakkan pada layar proyektor (gunakan mode layar komputer **Extend/Perluas**, bukan Duplicate/Duplikat).
4. Pada jendela podium, klik **Fullscreen**. Jika izin fullscreen browser tidak tersedia, gunakan **F11** di browser desktop. Tekan Esc/F11 untuk keluar. Tombol tampilan menghilang otomatis setelah mouse diam.
5. Atur skor di panel operator. Peringkat dan angka di jendela podium berubah otomatis.
6. Setelah pembawa acara selesai membaca soal, klik **Mulai 5 detik**. Angka **5 → 4 → 3 → 2 → 1** muncul di atas podium, lalu overlay menghilang otomatis. Timer tidak tampil sebelum dimulai. Klik **Batalkan** untuk langsung menyembunyikannya.

**Gunakan kedua tab pada komputer, browser, profil, dan alamat website yang sama.** Sinkronisasi menggunakan penyimpanan browser; kendali dari HP/perangkat lain belum tersedia. Gunakan satu tab operator utama. Mode privat dan profil browser berbeda tidak berbagi data.

## Logo asli acara

Layar podium menampilkan **tiga lambang penyelenggara** dalam satu baris (lembaga, LDII, PPG), diikuti tulisan GEMASS. Aset transparan tulisan GEMASS dan lambang lembaga diekstrak dari file referensi pengguna. Logo tetap dimuat terpisah, bukan menggunakan gambar papan skor statis. Tiga pengaturan logo operator tetap tersedia dengan label dan ID lama agar data lama serta unggahan kustom tidak rusak.

File bawaan berada di `public/logos/ldii.png`, `public/logos/logo-gemass.png`, `public/logos/logo-ppg.png`, `public/logos/logo-sekolah.png`, dan `public/logos/logo-gemass-transparent.png`. Logo GEMASS versi transparan dipakai pada podium bila pengaturan masih memakai logo default, tetapi logo yang diganti pengguna tetap digunakan. Kamu tetap dapat mengganti atau menghapus logo lewat **Panel operator → Pengaturan → Logo di atas podium**.

Pilih PNG, JPG, atau WebP maksimal 10 MB untuk penggantian. PNG transparan disarankan. Unggahan otomatis diperkecil hingga sisi terpanjang 320 piksel. Logo tim diunggah terpisah pada bagian Tim.

Setelah upgrade dari versi sebelumnya, ketiga logo dipasang otomatis saat halaman dimuat ulang, termasuk pada browser yang sudah mempunyai skor tersimpan. Skor pertandingan dan pengaturan lain dipertahankan. Penggantian/penghapusan logo berikutnya tetap tersimpan.

## Skor dan pengaturan

- Mendukung 2–8 tim agar seluruh podium tetap muat di layar.
- Tambah/kurangi poin dengan tombol yang nilainya bisa diubah di Pengaturan.
- Input skor manual, ubah nama/warna/logo tim, serta atur skor maksimum.
- Skor boleh **negatif** (misalnya 0 − 25 = −25), termasuk input manual, skor awal, undo, cadangan, dan hasil refresh. Batas teknis nilai adalah −999999 sampai 999999; batas skor maksimum yang diatur tetap berlaku.
- **Reset Skor** mengembalikan skor tim ke nilai **Skor awal** yang diatur. Mengubah Skor awal saja tidak mengubah skor pertandingan yang sedang berjalan.
- **Urungkan terakhir** membatalkan satu perubahan skor. Maksimal 30 perubahan terakhir tersimpan. Perubahan batas skor menghapus riwayat agar pembatalan tidak melampaui batas baru.
- Saat skor sama, posisi mengikuti urutan pendaftaran tim. Penentuan juara dengan skor seri mengikuti aturan panitia.
- Skor, pengaturan, logo, dan waktu akhir timer bertahan setelah refresh. Timer tidak dimulai ulang saat podium dimuat ulang.

## Cadangan

Klik **Unduh** di bagian Cadangan acara untuk menyimpan seluruh tim, skor, logo, pengaturan, dan riwayat sebagai JSON. Klik **Pulihkan** untuk memuatnya kembali. Pemulihan meminta konfirmasi dan menghentikan timer lama. Cadangkan sebelum acara, pindah browser, atau membersihkan data browser. Data pada alamat preview, localhost, dan Vercel terpisah; gunakan cadangan untuk memindahkannya.

## Menjalankan proyek

Gunakan Node.js 22.12+ dan npm.

```sh
npm install
npm run dev
```

Buka alamat yang ditampilkan terminal. Podium berada di `/`, operator di `/?view=operator`. Jangan membuka `index.html` langsung dari File Explorer; gunakan server lokal.

Untuk menjalankan hasil produksi tanpa proses pengembangan:

```sh
npm run build
npm run preview
```

Setelah dependensi terpasang, aplikasi tidak membutuhkan server database, API key, atau koneksi internet selama kedua jendela mengakses server lokal yang sama.

## Update repository yang sudah ada (VS Code + GitHub + Vercel)

Gunakan panduan **[UPDATE-VSCODE-GITHUB-VERCEL.md](UPDATE-VSCODE-GITHUB-VERCEL.md)**. Jangan membuat repository atau project Vercel baru. File di ZIP disalin ke *root* folder hasil clone repository yang lama, **tanpa menghapus folder `.git`**, kemudian commit dan push branch production yang sudah terhubung ke Vercel. Periksa data skor dengan fitur Cadangan sebelum upgrade.

## Deploy ke Vercel

1. Ekstrak ZIP, lalu unggah isi folder proyek ke repository GitHub.
2. Pada Vercel pilih **Add New → Project**, lalu impor repository.
3. Pilih framework **Vite**, build command **npm run build**, dan output directory **dist**. `vercel.json` juga sudah memuat pengaturan tersebut.
4. Deploy, lalu buka URL hasil deploy. Tidak perlu environment variable.

Proyek telah disederhanakan dari TanStack Start/SSR menjadi React + Vite karena semua fitur bekerja di browser. Ini menghasilkan berkas statis yang dapat dipasang di Vercel tanpa adapter server khusus.

## Pemeriksaan

```sh
npm test
npm run build
```

Pengujian mencakup klik skor cepat, batas skor, undo, migrasi data lama, sinkronisasi tanpa tulis-balik, kegagalan penyimpanan, persistensi, dan overlay timer tepat lima detik. Pengujian browser mencakup perubahan skor antar-tab, unggah logo, timer, refresh, dan pesan fallback ketika API fullscreen tidak diizinkan pada lingkungan preview.
