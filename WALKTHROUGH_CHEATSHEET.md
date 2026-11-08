# 🎬 CHEAT SHEET REKAMAN VIDEO WALKTHROUGH (3–5 MENIT)
> **Panduan Praktis Layar & Naskah Presentasi Teknis GDGoC Back-End**  
> Gunakan dokumen ini sebagai panduan visual saat Anda merekam layar dan membacakan presentasi.

---

## ⏱️ Alur Singkat & Pembagian Menit

```text
[00:00 - 00:30]  Pembuka & Tech Stack Overview
[00:30 - 01:45]  POIN 1: Database Architecture (ERD & Relasi) ─────────── (Bobot 30%)
[01:45 - 03:00]  POIN 2: Security & Error Handling (Bcrypt, JWT, Status) ── (Bobot 30%)
[03:00 - 04:15]  POIN 3: Gemini AI Prompt Grounding (Anti-Halusinasi) ──── (Bobot 20%)
[04:15 - 04:45]  Demo Singkat (npm test / Frontend) & Penutup
```

---

## 🟢 1. PEMBUKA (00:00 - 00:30)

* **Yang Ditampilkan di Layar:**
  Buka file [README.md](README.md) di VS Code atau buka halaman utama Frontend [frontend/index.html](frontend/index.html).
* **Naskah yang Dibaca:**
  > *"Halo teman-teman tim penilai GDGoC. Nama saya [Nama Anda].  
  > Pada video kali ini saya akan mendemonstrasikan hasil pengerjaan technical assignment untuk posisi Back-End Developer, yaitu membangun RESTful API FilmLog — platform pelacak dan pengulas film.  
  > Layanan ini saya bangun menggunakan Node.js dengan framework Express.js, Prisma ORM dengan basis data SQLite, serta integrasi Google Gemini AI untuk rekomendasi film cerdas."*

---

## 🗄️ 2. POIN 1: DATABASE ARCHITECTURE (00:30 - 01:45) — *Bobot 30%*

### 📍 File & Baris yang Harus Ditampilkan:
Buka file [`prisma/schema.prisma`](prisma/schema.prisma):
* **Baris 11 - 22:** Model `User` (email unik & relasi)
* **Baris 24 - 41:** Model `Movie` (20 data film awal)
* **Baris 43 - 54:** Model `Watchlist` (**Sorot Baris 49-50** untuk `onDelete: Cascade` dan **Baris 52** untuk `@@unique([userId, movieId])`)
* **Baris 56 - 68:** Model `Review` (**Sorot Baris 60-61** rating 1-5 & review, serta **Baris 65-66** `onDelete: Cascade`)

### 🗣️ Naskah yang Dibaca:
> *"Pada bagian **Database Architecture**, saya merancang skema relasional yang bersih dengan 4 entitas utama:
>
> 1. **Model `User` (Baris 11-22):** Menyimpan identitas akun pengguna. Kolom email diberi constraint `unique` agar tidak ada duplikasi akun, dan password tersimpan dalam bentuk hash.
> 2. **Model `Movie` (Baris 24-41):** Menampung katalog 20 film awal lengkap dengan ID tetap, judul, sutradara, genre, rating, durasi, hingga sinopsis.
> 3. **Model `Watchlist` (Baris 43-54):** Memodelkan relasi many-to-many antara User dan Movie.  
>    **Poin kunci di sini adalah Baris 52:** saya menerapkan composite unique constraint `@@unique([userId, movieId])`. Ini menjamin di level basis data bahwa pengguna tidak dapat menambahkan film yang sama dua kali ke watchlist-nya.
> 4. **Model `Review` (Baris 56-68):** Menyimpan catatan tontonan nyata dengan rating bintang dan teks ulasan.
>
> Selain itu, pada **Baris 49-50 dan 65-66**, kedua tabel relasi ini dilengkapi **`onDelete: Cascade`** sehingga jika data induk dihapus, seluruh data relasinya otomatis terhapus secara bersih tanpa meninggalkan orphan record."*

---

## 🔒 3. POIN 2: SECURITY & ERROR HANDLING (01:45 - 03:00) — *Bobot 30%*

### 📍 File & Baris yang Harus Ditampilkan:

#### A. Password Hashing & Validasi:
Buka [`src/controllers/authController.js`](src/controllers/authController.js):
* **Baris 7 - 16:** Skema validasi Zod (`registerSchema` & `loginSchema`).
* **Baris 32:** Hashing password: `bcrypt.hash(validatedData.password, 10)`.
* **Baris 71:** Komparasi password: `bcrypt.compare`.
* **Baris 78 - 82:** Penerbitan JWT Token: `jwt.sign`.

#### B. Middleware Auth Guard:
Buka [`src/middlewares/auth.js`](src/middlewares/auth.js):
* **Baris 7 - 19:** Pengecekan header `Authorization: Bearer <token>`.
* **Baris 21 - 39:** Verifikasi `jwt.verify` dan pengecekan keberadaan user di database.

#### C. Pencegahan Duplikasi Watchlist (Status 409):
Buka [`src/controllers/watchlistController.js`](src/controllers/watchlistController.js):
* **Baris 61 - 74:** Pengecekan data ganda yang mengembalikan HTTP `409 Conflict`.

#### D. Centralized Error Handler:
Buka [`src/middlewares/errorHandler.js`](src/middlewares/errorHandler.js):
* **Baris 8 - 17:** Menangani `ZodError` $\rightarrow$ `400 Bad Request`.
* **Baris 21 - 42:** Menangani Prisma Error $\rightarrow$ `P2002` (409 Conflict), `P2025` (404 Not Found), `P2003` (400 FK Error).

### 🗣️ Naskah yang Dibaca:
> *"Untuk aspek **Security dan Error Handling**:
>
> 1. **Password Hashing:** Pada `authController.js` baris 32, kata sandi di-hash menggunakan `bcryptjs` dengan 10 salt rounds sebelum disimpan ke database, sehingga password asli tidak pernah bocor.
> 2. **JWT Authorization Guard:** Pada `src/middlewares/auth.js`, seluruh rute privat (Watchlist dan Watched) dilindungi middleware `authenticateToken`. Middleware ini memvalidasi token Bearer JWT dan memastikan sesi user masih valid.
> 3. **Input Validation:** Saya menggunakan library `Zod` di baris 7-16 untuk memvalidasi kelayakan format email, panjang karakter password, dan batas rating bintang 1–5 sebelum request diproses.
> 4. **Semantic Error Codes:** Di `errorHandler.js`, semua error ditangani secara terpusat:
>    - `400 Bad Request` jika input Zod tidak lolos.
>    - `401 Unauthorized` jika token JWT hilang atau kadaluarsa.
>    - `404 Not Found` jika ID film tidak ditemukan.
>    - `409 Conflict` di `watchlistController.js` baris 71 untuk mencegah duplikasi film di daftar tontonan.
>    - Serta `500 Internal Server Error` yang menyembunyikan stack trace sensitif di lingkungan produksi."*

---

## 🤖 4. POIN 3: GEMINI AI PROMPT GROUNDING (03:00 - 04:15) — *Bobot 20%*

### 📍 File & Baris yang Harus Ditampilkan:

#### A. Retrieval Data Lokal:
Buka [`src/controllers/aiController.js`](src/controllers/aiController.js):
* **Baris 19 - 21:** Ekstraksi film lokal: `await prisma.movie.findMany()`.
* **Baris 30:** Memanggil fungsi `getGroundedRecommendation`.

#### B. Prompt Engineering & Hard Constraints:
Buka [`src/services/geminiService.js`](src/services/geminiService.js):
* **Baris 26 - 34:** Pembuatan ringkasan 20 film lokal (`candidateSummary`).
* **Baris 40 - 50:** **Sorot Aturan Krusial:** `ATURAN PALING KRUSIAL (GROUNDING CONSTRAINT)`.
* **Baris 73 - 75:** Structured output: `responseMimeType: 'application/json'`.
* **Baris 94 - 98:** Verifikasi silang lokal: `candidateMovies.some(m => m.id === chosenId)`.

### 🗣️ Naskah yang Dibaca:
> *"Pada **Poin ke-3: Integrasi Gemini AI** (`POST /api/movies/recommend`), tantangan terbesarnya adalah **mencegah AI Hallucination** agar Gemini tidak merekomendasikan film di luar database 20 film lokal kita.
>
> Solusi yang saya bangun menerapkan **Prompt Grounding**:
> 1. **Data Retrieval:** Di `aiController.js` baris 19, backend mengambil ke-20 data film dari database SQLite lokal.
> 2. **In-Context Injection:** Di `geminiService.js` baris 26, ringkasan 20 film lokal tersebut dimasukkan langsung ke dalam konteks prompt.
> 3. **Hard Negative Constraint:** Pada baris 40-50, saya menyusun `systemInstruction` yang sangat tegas: model DILARANG KERAS merekomendasikan film di luar 20 kandidat lokal, wajib mencocokkan kemiripan emosi pengguna dengan sinopsis lokal, dan memberikan penalaran (*reasoning*) dalam Bahasa Indonesia.
> 4. **Structured JSON Output:** Pada baris 74, saya menggunakan parameter native Gemini `responseMimeType: 'application/json'` untuk memastikan model selalu merespons dalam JSON terstruktur berisi `movie_id` dan `reasoning`.
> 5. **Defensive Post-Validation:** Pada baris 94-98, backend memeriksa ulang bahwa ID hasil rekomendasi benar-benar ada di tabel lokal sebelum dikirimkan ke frontend."*

---

## 🏁 5. DEMO SINGKAT & PENUTUP (04:15 - 04:45)

* **Yang Ditampilkan di Layar:**
  Buka terminal terintegrasi di VS Code (`Ctrl + ~`), lalu jalankan perintah:
  ```bash
  npm test
  ```
  *(Biarkan terminal menampilkan checklist hijau 11 test yang lolos termasuk Gemini recommendation).*
* **Naskah yang Dibaca:**
  > *"Untuk memverifikasi keandalan sistem, saya telah menyiapkan automated integration test.  
  > Seperti yang terlihat di layar, seluruh endpoint inti mulai dari register, login, CRUD watchlist, validasi rating review, error code 409 conflict, hingga rekomendasi Gemini berhasil lulus 100%.  
  > 
  > Sekian presentasi teknis penugasan backend FilmLog dari saya. Terima kasih banyak kepada tim penilai GDGoC atas kesempatannya!"*

---

## 💡 Tips Rekaman:
1. **Resolusi:** Gunakan resolusi layar 1080p (Full HD) dan perbesar font VS Code (`Ctrl + +`) agar teks kode terbaca jelas.
2. **Tab Bersih:** Buka hanya file-file di atas di tab VS Code agar tidak bingung saat berpindah file.
3. **Google Drive:** Setelah selesai direkam, upload ke Google Drive dan pastikan opsi berbagi disetel ke **"Anyone with the link can view"**!
