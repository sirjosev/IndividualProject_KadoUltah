# Petualangan Hadiah Ulang Tahun Interaktif

Ini adalah sebuah proyek web interaktif yang dibuat sebagai hadiah ulang tahun digital yang personal dan unik. Proyek ini membawa pengguna (dalam kasus ini, "Sena") dalam sebuah petualangan kecil melalui serangkaian teka-teki yang terkait dengan kenangan bersama, yang pada akhirnya akan membuka sebuah hadiah virtual.

## ✨ Fitur Utama

- **Pengalaman Multi-Scene**: Alur cerita yang membawa pengguna melewati beberapa "adegan", mulai dari pembukaan kado hingga teka-teki dan pengungkapan hadiah.
- **Grafis 3D**: Menggunakan **Three.js** untuk membuat kotak kado dan globe peta dunia 3D yang interaktif.
- **Animasi Halus**: Ditenagai oleh **GSAP (GreenSock Animation Platform)** untuk transisi antar adegan dan animasi elemen yang menarik.
- **Teka-Teki Interaktif**: Berbagai jenis puzzle seperti trivia, puzzle gambar (jigsaw), permainan memori, dan teka-teki kode.
- **Personalisasi Penuh**: Didesain agar mudah diubah dan disesuaikan untuk orang lain.

## 🚀 Stack Teknologi

Proyek ini dibangun sepenuhnya menggunakan teknologi front-end, membuatnya ringan dan mudah untuk di-host di mana saja.

- **HTML**: Struktur dasar dari halaman web.
- **Tailwind CSS**: Untuk styling yang cepat dan modern. Semua styling ada di dalam file `index.html`.
- **JavaScript (ES6)**: Menangani semua logika permainan, interaksi, dan manipulasi DOM.
- **Three.js**: Library untuk membuat dan menampilkan grafis 3D (kotak kado dan globe).
- **GSAP (GreenSock)**: Library untuk animasi yang performan dan kompleks.

## ⚙️ Alur Kerja Program

Pengguna akan melalui alur berikut:

1.  **Scene 1: Kotak Kado**: Pengguna disambut dengan animasi kotak kado 3D. Mengklik kado akan "membukanya".
2.  **Scene 2: Surat Misteri**: Sebuah surat muncul, menjelaskan bahwa hadiahnya tersembunyi dan pengguna harus menyelesaikan serangkaian teka-teki untuk menemukannya.
3.  **Scene 3: Peta Kenangan Dunia**: Pengguna melihat globe 3D yang dapat diputar. Di globe tersebut terdapat beberapa "pin" yang menandai lokasi kenangan. Setiap pin adalah pintu masuk ke sebuah teka-teki.
4.  **Teka-Teki**: Ada 5 teka-teki yang harus dipecahkan. Setiap teka-teki yang berhasil dipecahkan akan memberikan satu karakter dari kode final.
    - Teka-teki #1: Trivia pilihan ganda.
    - Teka-teki #2: Puzzle Jigsaw.
    - Teka-teki #3: Permainan mencocokkan kartu (Memory Game).
    - Teka-teki #4: Pertanyaan dengan jawaban singkat.
    - Teka-teki #5: Memecahkan sandi Caesar sederhana.
5.  **Scene 5: Hadiah Terakhir**: Setelah semua teka-teki selesai, pengguna harus memasukkan 5 karakter kode yang telah dikumpulkan.
6.  **Scene 6: Pengungkapan Hadiah**: Jika kode benar, hadiah terakhir akan terungkap (dalam kasus ini, voucher GoPay) beserta pesan penutup. Terdapat juga *easter egg* kecil di halaman ini.

## 🛠️ Cara Penggunaan dan Deployment

### Menjalankan Secara Lokal

Proyek ini tidak memerlukan server atau proses build. Cukup buka file `index.html` di browser modern pilihan Anda (seperti Chrome, Firefox, atau Edge).

```bash
# Cukup klik dua kali pada file index.html atau buka dari browser
```

### Deployment

Cara termudah untuk membagikan proyek ini adalah dengan menggunakan **GitHub Pages**.

1.  Buat repository baru di GitHub.
2.  Upload semua file proyek (`index.html`, `Video_Kado_Ultah_Sena.mp4`) ke repository tersebut.
3.  Masuk ke tab **Settings** di repository Anda.
4.  Pilih menu **Pages** di sidebar kiri.
5.  Di bawah "Build and deployment", pilih sumbernya ke **Deploy from a branch**.
6.  Pilih branch `main` (atau `master`) dan folder `/root`. Klik **Save**.
7.  Tunggu beberapa menit, dan proyek Anda akan tersedia di `https://<username>.github.io/<repository-name>/`.

## 🎨 Panduan Kustomisasi

Bagian terpenting dari proyek ini adalah personalisasi. Semua konfigurasi utama dapat ditemukan di dalam tag `<script>` di file `index.html`.

### 1. Mengubah Konfigurasi Utama

Cari objek `gameState` di dalam tag `<script>`:

```javascript
const gameState = {
    currentScene: 'scene1',
    puzzles: [
        // ... daftar puzzle ...
    ],
    finalCode: "josev", // <-- Ganti kode final di sini
    globeInitialized: false
};
```

-   `finalCode`: Ganti `"josev"` dengan 5 karakter kode yang Anda inginkan. Pastikan panjangnya sesuai dengan jumlah puzzle.

### 2. Mengubah Teka-Teki dan Kode

Setiap objek di dalam array `puzzles` merepresentasikan satu pin di globe dan satu teka-teki.

```javascript
{
    id: 1,
    name: "Our First Kiss", // <-- Nama teka-teki
    lat: 20, lon: -100,     // <-- Posisi pin di globe
    solved: false,
    code: 'j'              // <-- Karakter kode untuk puzzle ini
}
```

-   **Mengubah Jawaban Trivia (Puzzle #1)**:
    Cari `id="trivia-options"` dan ubah tombol mana yang memiliki atribut `data-correct="true"`.

-   **Mengubah Gambar Jigsaw (Puzzle #2)**:
    Cari variabel `imageUrl` di dalam fungsi `initJigsaw()` dan ganti URL-nya dengan URL gambar 300x300 yang Anda inginkan.

-   **Mengubah Jawaban Pertanyaan (Puzzle #4)**:
    Di dalam fungsi `checkJournalAnswer()`, ganti `'pik'` dengan jawaban yang Anda inginkan (dalam huruf kecil).

-   **Mengubah Sandi Rahasia (Puzzle #5)**:
    Di dalam fungsi `checkSecretCode()`, ganti `'i love you'` dengan jawaban sandi yang benar. Anda juga bisa mengubah teks sandi dan petunjuknya di dalam HTML (`id="puzzle5"`).

### 3. Mengubah Teks dan Pesan

-   **Surat Awal (Scene 2)**: Ubah teks di dalam elemen `<div id="letter">`.
-   **Pesan Penutup (Scene 6)**: Ubah teks di dalam fungsi `goToScene('scene6')`, pada baris yang mengatur `document.getElementById('final-message').textContent`.
-   **Nama Pengirim**: Jangan lupa mengganti `[Nama Kamu]` dengan nama Anda di pesan akhir.

### 4. Mengubah Hadiah Akhir

-   Cari elemen `<div id="scene6">`. Anda bisa mengubah nominal voucher, gambar, atau bahkan mengganti seluruh konten hadiah dengan video atau gambar lain.
-   Video `Video_Kado_Ultah_Sena.mp4` yang ada di repository tidak digunakan di dalam kode. Jika Anda ingin menampilkannya, Anda bisa menambahkan tag `<video>` di `scene6`.

## 📂 Struktur File

-   `index.html`: **File utama.** Berisi semua struktur, styling, dan logika aplikasi. Ini adalah satu-satunya file yang perlu Anda edit.
-   `README.md`: File dokumentasi ini.
-   `Video_Kado_Ultah_Sena.mp4`: Aset video yang tidak terpakai. Bisa Anda hapus atau gunakan sebagai hadiah akhir.
-   `style.css`: File CSS dari versi lama proyek. **Tidak digunakan** oleh `index.html` saat ini dan dapat diabaikan atau dihapus.
-   `script.js`: File JavaScript dari versi lama proyek. **Tidak digunakan** oleh `index.html` dan dapat diabaikan atau dihapus.
