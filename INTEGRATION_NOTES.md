# Catatan Integrasi

## Ke mana file-file ini pergi

Struktur ini mengikuti persis `struktur_folder.txt` yang sudah ada.
Tinggal merge ke root project `Tugas_Portofolio/`:

```
index.html                          → root (timpa index.html lama kalau ada)
Frontend/profil/css/style.css       → Frontend/profil/css/
Frontend/profil/js/*.js             → Frontend/profil/js/
Frontend/profil/sequence/           → folder baru, taruh 150 frame di sini
```

**Tidak ada perubahan ke `app.py`, `model.py`, atau `config.py`.** Route
`/profil/<path:filename>` yang sudah ada otomatis meng-cover
`css/`, `js/`, maupun `sequence/` di dalam `Frontend/profil/`.

## Asumsi tentang API `/api/profil`

Saya tidak punya akses ke `Backend/admin/profiles.py`, jadi `js/api.js`
menebak nama field secara defensif:

- Nama: coba `nama` → `name` → `full_name` → fallback "Arthur Willyam Liang"
- Role: coba `role` → `jabatan` → `title` → `profesi` → fallback "Cybersecurity"

Juga otomatis unwrap kalau response-nya dibungkus `{ "data": {...} }`
maupun kalau langsung berupa object.

**Cara cek/perbaiki:** jalankan `python app.py`, buka
`http://localhost:5000/api/profil` di browser, lihat field apa yang
benar-benar dikembalikan. Kalau beda, tinggal edit larik `pick(...)`
di `Frontend/profil/js/main.js` — satu tempat, nggak nyebar ke file lain.

## Yang sengaja DIHAPUS dari brief awal, dan kenapa

- **Next.js / TypeScript / React** → diganti HTML/CSS/JS murni + ES
  Modules, supaya sesuai poin 11 instruksi tugas.
- **Framer Motion** → diganti CSS transitions/keyframes + easing manual
  (lerp) di JS. Efek visualnya sama, tanpa dependency build-step.
- **Lenis (smooth scroll)** → sengaja TIDAK dipakai. Native scroll
  browser sudah cukup untuk men-drive canvas (mekanisme intinya memang
  berbasis `scrollY`, bukan Lenis), dan menghindari kompleksitas
  scroll-hijacking yang rawan bug/aksesibilitas buruk — relevan karena
  poin 12 mewajibkan "seluruh aplikasi dapat dijalankan tanpa error".
- **Tailwind CSS** → CSS murni, biar tidak butuh build step sama
  sekali. Flask men-serve file statis apa adanya; menambah Tailwind
  berarti menambah langkah kompilasi yang bisa gagal saat submission
  dijalankan ulang oleh asisten dosen.

## Yang masih perlu kamu selesaikan (di luar scope hari ini)

Brief scrollytelling ini cuma soal halaman utama. Instruksi tugas PA
juga wajib:
- Halaman Admin CRUD penuh + Login (`Backend/admin/*`, `Frontend/admin/*`)
- Upload gambar via Cloudinary (`Backend/admin/upload.py`)
- Kirim email via Resend
- `database.sql` + `.env.example` + screenshot-screenshot sesuai
  ketentuan pengumpulan

Kalau bagian-bagian itu belum jalan, bilang aja — bisa dibantu juga.
