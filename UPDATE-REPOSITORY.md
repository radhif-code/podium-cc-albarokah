# Memperbarui repository yang sudah ada

Paket ini berisi seluruh proyek versi revisi dengan tiga logo asli, podium fullscreen, tab operator terpisah, dan timer lima detik.

## Pilihan A — GitHub Desktop

Cara ini memudahkan penambahan, penggantian, dan penghapusan file dalam satu commit.

1. Ekstrak ZIP `gemass-podium-3-logo.zip`.
2. Di GitHub Desktop pilih **File → Clone repository**, kemudian pilih repository podium yang sudah ada. Jika sudah tersimpan di komputer, cukup buka repository itu lalu klik **Fetch origin / Pull origin** bila ada perubahan terbaru.
3. Pilih **Repository → Show in Explorer** untuk membuka folder repository.
4. Salin isi folder `gemass-podium-3-logo` ke folder repository tersebut. Pilih **Replace the files in the destination** saat diminta. Pastikan `package.json` yang baru langsung berada di folder utama repository. Pertahankan folder `.git` yang sudah ada.
5. Jika repository masih berasal dari ZIP TanStack/Lovable awal, hapus file/folder lama yang tercantum pada daftar migrasi di bawah. Ini hanya berlaku pada file lama yang masih ada di repository tersebut.
6. Kembali ke GitHub Desktop dan periksa tab **Changes**. Pastikan file logo baru dan file sumber yang diganti tercantum. Gunakan branch produksi proyekmu (biasanya `main`) atau branch perubahan bila branch produksi dilindungi.
7. Isi Summary: `Update podium fullscreen, operator, timer, dan 3 logo`.
8. Klik **Commit to [nama branch]**, lalu **Push origin**. Bila memakai branch perubahan, buat pull request dan merge ke branch produksi setelah ditinjau.
9. Jika repository sudah terhubung ke Vercel dengan auto-deploy aktif, perubahan pada branch produksi akan memulai deployment baru. Periksa sampai statusnya **Ready**.

Jangan menimpa `.env`, file rahasia, atau file khusus lain yang hanya ada di repository-mu. Paket ini tidak memerlukan environment variable.

## Pilihan B — melalui website GitHub

1. Ekstrak ZIP dan buka folder proyek di komputer.
2. Buka halaman repository yang sudah ada, pilih branch yang sesuai.
3. Klik **Add file → Upload files**.
4. Seret isi folder proyek ke area unggahan dengan struktur folder yang sama. `src`, `public`, `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, dan `vercel.json` berada langsung pada root repository. Tidak perlu mengunggah `dist`; Vercel membangunnya dari source.
5. Periksa daftar unggahan, tulis pesan commit, lalu pilih commit langsung atau usulkan perubahan lewat branch/PR sesuai izin repository.
6. Jika berangkat dari ZIP awal, hapus file lama pada daftar migrasi berikut melalui GitHub sebelum menganggap migrasi selesai. Tindakan upload hanya menambah/mengganti file; tidak otomatis menghapus file lama yang sudah tidak dipakai.
7. Periksa deployment Vercel terakhir setelah seluruh perubahan selesai.

## Daftar migrasi dari ZIP awal

Versi revisi memakai React/Vite statis. File berikut dari proyek TanStack Start/Lovable awal sudah tidak digunakan. Jika masih ada di repository lama, hapus:

- `bun.lock` — proyek sekarang memakai `package-lock.json` dan npm.
- `bunfig.toml`
- `src/routes/` (seluruh folder)
- `src/router.tsx`
- `src/routeTree.gen.ts`
- `src/server.ts`
- `src/start.ts`
- `src/test/app-routing.test.tsx`
- `src/components/ui/` (seluruh folder)
- `src/hooks/use-mobile.tsx`
- `src/lib/error-capture.ts`
- `src/lib/error-page.ts`
- `src/lib/lovable-error-reporting.ts`
- `src/lib/utils.ts`
- `eslint.config.js`
- `components.json`

Daftar ini hanya untuk repository proyek podium asli yang diberikan. Jika sudah memakai paket revisi sebelumnya, cukup timpa file baru dan tambahkan tiga PNG di `public/logos`.

## Pengaturan Vercel

- Framework Preset: **Vite**
- Root Directory: folder yang berisi `package.json` (kosong/default jika di root repository)
- Install Command: **npm ci** (atau otomatis/npm install)
- Build Command: **npm run build**
- Output Directory: **dist**
- Node.js: **22.x** atau lebih baru yang didukung proyek

Jika sebelumnya memakai TanStack Start atau build command khusus, ubah pengaturan Vercel sesuai daftar di atas sebelum menjalankan deployment baru. Setelah Ready, muat ulang tab operator dan podium agar keduanya memakai versi yang sama. Tiga logo terpasang otomatis tanpa menghapus skor tersimpan.

## Pemeriksaan lokal opsional

Buka terminal pada folder repository:

```sh
npm install
npm test
npm run build
```

## Sumber panduan

- GitHub: https://docs.github.com/en/desktop/making-changes-in-a-branch/committing-and-reviewing-changes-to-your-project-in-github-desktop
- GitHub: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- Vercel: https://vercel.com/docs/git/vercel-for-github
