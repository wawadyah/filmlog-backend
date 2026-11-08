# 🎥 Panduan & Naskah Video Walkthrough (3–5 Menit)
> **GDGoC Back-End Recruitment Task — FilmLog Movie Watchlist API**

Dokumen ini disusun untuk membantu Anda merekam video presentasi teknis berdurasi **3 hingga 5 menit** sesuai rubrik penilaian GDGoC.

---

## ⏱️ Alokasi Waktu (Timeline 4 Menit)

| Waktu | Bagian | Topik Utama |
| :--- | :--- | :--- |
| **00:00 - 00:30** | **1. Pembuka & Tech Stack** | Salam, perkenalan diri, dan arsitektur umum backend (Node.js + Express + Prisma + SQLite). |
| **00:30 - 01:45** | **2. Database Architecture (ERD)** | Menjelaskan relasi antar tabel (`users`, `movies`, `watchlists`, `reviews`), foreign keys, dan unique constraints. |
| **01:45 - 03:00** | **3. Security & Error Handling** | Menunjukkan password hashing (`bcryptjs`), JWT middleware, validasi Zod, dan penanganan HTTP status (400, 401, 404, 409). |
| **03:00 - 04:15** | **4. AI Implementation (Gemini Grounding)** | Menjelaskan prompt engineering & grounding ke 20 film lokal, serta output JSON terstruktur. |
| **04:15 - 04:45** | **5. Demo Singkat & Penutup** | Menunjukkan hasil `npm test` atau demo live di frontend companion. |

---

## 📝 Naskah & Panduan Tampilan Layar (Langkah demi Langkah)

### 1. Pembuka (00:00 - 00:30)
- **Tampilan Layar:** Tampilkan file [README.md](README.md) atau tampilan awal frontend FilmLog.
- **Poin Bicara:**
  > *"Halo teman-teman tim penilai GDGoC. Nama saya [Nama Anda]. Pada kesempatan ini saya akan mempresentasikan hasil pengerjaan technical assignment untuk track Back-End, yaitu FilmLog Movie Watchlist & Review RESTful API. Proyek ini saya bangun menggunakan Node.js dengan framework Express.js, Prisma ORM dengan database SQLite, serta integrasi Google Gemini API."*

---

### 2. Database Architecture & ERD (00:30 - 01:45) — *Bobot 30%*
- **Tampilan Layar:** Buka file [prisma/schema.prisma](prisma/schema.prisma) atau diagram ERD di [README.md](README.md).
- **Poin Bicara:**
  > *"Untuk pemodelan database relasional, saya merancang 4 entitas utama:*
  > 1. *Tabel `users` untuk menyimpan identitas pengguna, dengan email unik dan password yang telah di-hash.*
  > 2. *Tabel `movies` yang menampung 20 film kurasi awal dengan atribut lengkap seperti judul, tahun, sutradara, rating, dan genre.*
  > 3. *Tabel `watchlists` sebagai relasi many-to-many antara User dan Movie. Di sini saya menambahkan constraint `@@unique([userId, movieId])` untuk memastikan pengguna tidak dapat memasukkan film yang sama dua kali ke watchlist-nya.*
  > 4. *Tabel `reviews` untuk mencatat riwayat tontonan, rating bintang 1 hingga 5, dan catatan opini pengguna.*
  > *Kedua relasi ini dilengkapi dengan `onDelete: Cascade`, sehingga integritas data tetap terjaga apabila entitas induk dihapus."*

---

### 3. Security & Error Handling (01:45 - 03:00) — *Bobot 30%*
- **Tampilan Layar:** 
  1. Buka [src/controllers/authController.js](src/controllers/authController.js).
  2. Buka [src/middlewares/auth.js](src/middlewares/auth.js).
  3. Buka [src/middlewares/errorHandler.js](src/middlewares/errorHandler.js).
- **Poin Bicara:**
  > *"Aspek keamanan dan integritas data diimplementasikan pada beberapa lapisan:*
  > 1. *Pada autentikasi (`authController.js`), password di-hash menggunakan `bcryptjs` dengan 10 salt rounds sebelum disimpan.*
  > 2. *Otorisasi endpoint privat dilindungi oleh middleware `authenticateToken` (`auth.js`), yang mengekstrak dan memverifikasi header `Bearer Token` JWT.*
  > 3. *Validasi input menggunakan library `Zod` untuk memastikan kelayakan format data (seperti email valid, password minimal 6 karakter, rating 1-5).*
  > 4. *Error handling terpusat di `errorHandler.js` mengembalikan semantic HTTP status code yang tepat: `400` untuk validasi gagal, `401` untuk unauthorized, `404` untuk data tidak ditemukan, dan `409 Conflict` jika terjadi duplikasi email atau watchlist."*

---

### 4. AI Implementation & Gemini Grounding (03:00 - 04:15) — *Bobot 20%*
- **Tampilan Layar:** Buka [src/services/geminiService.js](src/services/geminiService.js).
- **Poin Bicara:**
  > *"Untuk fitur rekomendasi AI pada endpoint `POST /api/movies/recommend`, tantangan utamanya adalah menjaga agar Gemini tidak berhalusinasi dan hanya merekomendasikan film dari database lokal.*
  > *Strategi grounding yang saya terapkan:*
  > 1. *Backend terlebih dahulu mengambil ringkasan 20 film langsung dari database SQLite lokal.*
  > 2. *Data tersebut dimasukkan ke dalam prompt bersama dengan `systemInstruction` yang sangat ketat: model diwajibkan memilih HANYA dari 20 kandidat lokal tersebut dan dilarang merekomendasikan film luar.*
  > 3. *Saya memanfaatkan parameter `responseMimeType: 'application/json'` agar output yang dihasilkan terstruktur secara konsisten memuat `movie_id` dan `reasoning`.*
  > 4. *Di backend, kita juga melakukan verifikasi ulang bahwa ID yang dipilih benar-benar ada di tabel lokal sebelum dikembalikan ke klien."*

---

### 5. Demo Singkat & Penutup (04:15 - 04:45)
- **Tampilan Layar:** Tampilkan terminal saat menjalankan `npm test`, atau demonstrasikan satu kali klik di tab **Ask AI** pada frontend companion.
- **Poin Bicara:**
  > *"Seluruh endpoint juga telah lulus uji integrasi otomatis via `npm test`. Aplikasi ini siap digunakan dan dapat diintegrasikan secara mulus dengan frontend companion. Sekian presentasi dari saya, terima kasih kepada tim penilai GDGoC atas kesempatannya."*

---

## 💡 Tips Penting Sebelum Merekam:
1. Pastikan audio jelas dan tidak ada noise bising.
2. Gunakan software perekam layar seperti **OBS Studio**, **Xbox Game Bar (Win + G)**, atau **Loom**.
3. Upload video ke **Google Drive**.
4. **Wajib:** Klik kanan file di Google Drive $\rightarrow$ **Share** $\rightarrow$ Ubah *General Access* menjadi **"Anyone with the link can view"** (*Siapa saja yang memiliki link dapat melihat*).
