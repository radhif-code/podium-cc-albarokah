# Verification — 5 November 2026

- `npm test`: 18/18 passed.
- `npm run build`: TypeScript and Vite production build passed.
- Browser QA: separate tabs; PPG +100 appeared on podium and changed ordering; operator timer produced a five-second overlay and was absent after expiration; refresh retained score and remaining timer; uploading a test PNG to the GEMASS header slot appeared in the podium tab; test logo removed afterward.
- Cloud preview denies Fullscreen API requests; the implemented F11 fallback was observed. Actual browser fullscreen should be exercised on the event computer before use.
- Review fixes verified by regression tests: activated toolbar controls release focus so they can auto-hide; asynchronous logo uploads update the latest individual slot; imported scores and undo respect the configured cap.
- Original logo image assets were absent. Four editable upload slots were implemented rather than fabricated organization logos.

## Update tiga logo asli

- LDII, GEMASS, dan PPG disalin persis dari tiga PNG pengguna; hash SHA-256 diverifikasi identik.
- Tiga logo menjadi bawaan; logo GEMASS menggunakan area lebih lebar dengan object-fit contain.
- Migrasi pengaturan lama memasang tiga logo tanpa mereset skor, tim, dan timer. Penghapusan logo setelah migrasi tetap dipertahankan.
- `npm test`: 21/21 passed. TypeScript dan production build passed.
- Browser: tiga elemen gambar LDII, GEMASS, PPG tampil; file GEMASS terdekode dengan ukuran asli 1270×665.
- Panduan update repository dan migrasi konfigurasi npm/Vite disertakan sebagai UPDATE-REPOSITORY.md.
