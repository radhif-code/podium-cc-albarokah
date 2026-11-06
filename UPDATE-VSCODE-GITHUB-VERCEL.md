# Update website GEMASS lama lewat VS Code tanpa membuat repo/Vercel baru

Panduan ini untuk proyek yang **sudah terhubung** dari GitHub ke Vercel. ZIP revisi berisi **source code**, bukan file yang perlu diunggah langsung ke Vercel. Koneksi GitHub → Vercel tetap dipakai.

## A. Cadangkan skor dulu

Pada website lama, buka **Panel operator → Cadangan acara → Unduh**, simpan file JSON. Skor sebenarnya disimpan di browser (localStorage), bukan di database Vercel. Umumnya skor tetap ada setelah deploy ke domain yang sama, tetapi cadangan tetap wajib untuk keamanan acara. Jendela podium dan operator mesti memakai **browser, profil, dan domain yang sama** untuk sinkronisasi; sistem ini belum menyinkronkan HP berbeda lewat server.

## B. Siapkan folder repository GitHub lama di VS Code

1. Buka **Visual Studio Code → File → Open Folder** dan pilih folder hasil clone repository **lama**. Jika belum pernah clone, gunakan **Clone Git Repository** dari VS Code lalu tempel URL repo lama. Ini **bukan** membuat repository baru.
2. Buka **Terminal → New Terminal** (Ctrl+`), lalu jalankan:

```bash
git status
git remote -v
git branch --show-current
```

3. Pastikan `git remote -v` menunjukkan alamat repository GitHub yang lama. Pastikan tidak ada pekerjaan lokal penting yang belum di-commit. Jika ada, simpan dulu sebelum mengganti file.
4. Ekstrak ZIP revisi **di folder lain**, misalnya `Downloads/GEMASS-revisi/`. Buka folder di dalam ZIP yang bernama `podium-cc-albarokah-main`.
5. **Salin ISI folder tersebut** (`src`, `public`, `package.json`, `package-lock.json`, `index.html`, `vercel.json`, dan file pendukung) ke **root folder repo lama**, lalu izinkan **Replace/Overwrite**.

> Penting: **Jangan** menyalin folder `podium-cc-albarokah-main` sebagai subfolder baru di dalam repo. **Jangan menghapus folder `.git`** di repo yang lama. **Jangan menjalankan `git init`** dan jangan melakukan `git push --force`. Folder `node_modules` dan `dist` tidak perlu disalin.

## C. Cek aplikasi dari VS Code sebelum push

Pastikan Node.js memenuhi persyaratan proyek (`>=22.12.0`), kemudian:

```bash
npm ci
npm test
npm run build
npm run dev
```

Buka alamat lokal dari Terminal, misalnya `http://localhost:5173`. Layar podium ada di `/`; panel operator di `/?view=operator`.

Cek minimal: juara 1 lebih besar dan bermahkota; juara 2 perak; juara 3 perunggu; logo tajam; klik minus dari skor 0 menjadi negatif; nilai negatif tetap ada sesudah refresh; undo berhasil; panel operator tetap sama. Jika tes/build gagal, **jangan push sebelum memperbaikinya**.

## D. Update repo GitHub yang sama

Jika branch produksi Vercel adalah `main` dan hasil perintah `git branch --show-current` adalah `main`:

```bash
git add -A
git commit -m "Update podium GEMASS dan dukungan skor negatif"
git push origin main
```

**Jika branch produksinya berbeda**, gunakan nama branch sebenarnya pada perintah `git push origin NAMA_BRANCH`. Jika folder clone memiliki remote upstream yang sudah benar, `git push` juga dapat dipakai. Jangan buat repo baru.

Lewat tombol VS Code juga bisa: buka **Source Control** → review file berubah → klik **+ Stage All Changes** → tulis pesan commit → **Commit** → **Sync Changes / Push**.

## E. Pantau deployment Vercel lama

1. Buka dashboard Vercel, pilih **project yang sudah ada** (jangan `Add New Project`).
2. Masuk ke **Deployments**. Push ke *Production Branch* yang terhubung otomatis membuat deployment baru.
3. Jika tidak ada deployment, periksa **Project Settings → Git** untuk memastikan repo terhubung, serta pengaturan branch production di **Settings → Environments → Production → Branch Tracking**.
4. Tunggu status deployment **Ready**, lalu buka **domain lama**. Tidak perlu mengubah domain, membuat project Vercel baru, atau import repo ulang.
5. Cek lagi podium, operator, pengurangan nilai negatif, timer, dan skor tersimpan dari browser acara. Bila data browser berbeda atau kosong, gunakan **Cadangan acara → Pulihkan** dengan file JSON tadi.

Konfigurasi build untuk proyek ini: **Vite**, `npm run build`, folder output `dist`. `vercel.json` sudah disertakan. Sesuaikan **Root Directory** jika proyek lama memang menggunakan subfolder khusus.

## Troubleshooting

- **Vercel masih menampilkan versi lama:** periksa commit/branch yang dipush, status build terakhir, lalu refresh browser. Pastikan GitHub yang terhubung memang repository yang sedang diedit.
- **Push ditolak karena remote lebih baru:** jangan force push; ambil pembaruan dengan `git pull --ff-only origin main` (ubah `main` sesuai branch), selesaikan perbedaan dengan hati-hati.
- **Build gagal karena lockfile:** jalankan `npm ci` sesuai Node.js yang diminta. Hindari menyalin `node_modules` dari ZIP.
- **Skor hilang:** data tersimpan per domain dan profil browser, sehingga cek domain lama dan gunakan file cadangan JSON jika perlu.

Rujukan resmi: https://vercel.com/docs/git dan https://vercel.com/docs/git/vercel-for-github
