-- ============================================================
-- database.sql — Arthur Willyam Liang Portfolio
-- Schema + Seed Data untuk TiDB Cloud (MySQL-compatible)
--
-- Cara pakai:
--   1. Buka TiDB Cloud Console → SQL Editor
--   2. Pastikan database "Portofolio" sudah ada (CREATE DATABASE IF NOT EXISTS Portofolio;)
--   3. Pilih database tersebut (USE Portofolio;)
--   4. Copy-paste seluruh isi file ini dan jalankan
-- ============================================================

-- Gunakan database
-- (Uncomment baris di bawah jika menjalankan dari CLI/tool yang mendukung)
-- CREATE DATABASE IF NOT EXISTS Portofolio;
-- USE Portofolio;

-- ============================================================
-- DROP EXISTING TABLES UNTUK RE-SEEDING
-- ============================================================
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS case_studies;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS experiences;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

-- ============================================================
-- TABEL: users
-- Menyimpan data login admin
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABEL: profiles
-- Menyimpan data profil personal (1 per user)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_lengkap VARCHAR(200),
    nama_panggilan VARCHAR(100),
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    email VARCHAR(200),
    telepon VARCHAR(30),
    universitas VARCHAR(200),
    fakultas VARCHAR(200),
    prodi VARCHAR(200),
    semester INT,
    alamat TEXT,
    foto_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL: experiences
-- Menyimpan riwayat pengalaman kerja / organisasi
-- ============================================================
CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    posisi VARCHAR(200) NOT NULL,
    perusahaan VARCHAR(200) NOT NULL,
    durasi VARCHAR(100),
    deskripsi TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL: projects
-- Menyimpan daftar project / karya
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi TEXT,
    gambar_url VARCHAR(500),
    link_project VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL: case_studies
-- Menyimpan daftar studi kasus / featured projects (banyak gambar)
-- ============================================================
CREATE TABLE IF NOT EXISTS case_studies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    deskripsi_singkat TEXT,
    tech_stack TEXT,
    penjelasan_detail TEXT,
    gambar_urls TEXT,
    link_project VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL: skills
-- Menyimpan daftar kemampuan / keahlian
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    nama_skill VARCHAR(200) NOT NULL,
    icon_class VARCHAR(100),
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL: certificates
-- Menyimpan daftar sertifikat
-- ============================================================
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(200) NOT NULL,
    gambar_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- TABEL: contacts
-- Menyimpan pesan dari form kontak
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    pesan TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- ---- Admin User ----
-- Password: admin123 (hashed dengan werkzeug pbkdf2:sha256)
-- Untuk generate ulang hash: python -c "from werkzeug.security import generate_password_hash; print(generate_password_hash('admin123'))"
INSERT INTO users (username, password_hash, role) VALUES
('admin', 'scrypt:32768:8:1$FurbdYFbqtZcgVRh$ec342e9dbfd3fd78cdce010f2637e1dfb4a239a2197ab89cf865e55337839965c71fdadbff9b200b1a215dbdb9ce58e2c3831b12023913ad042d1639d34f4ac2', 'admin');

-- ---- Profile ----
INSERT INTO profiles (user_id, nama_lengkap, nama_panggilan, tempat_lahir, tanggal_lahir, email, telepon, universitas, fakultas, prodi, semester, alamat) VALUES
(1, 'Arthur Willyam Liang', 'Arthur', 'Salatiga', '2003-01-01', 'arthur@example.com', '082230429592', 'Universitas Kristen Satya Wacana', 'Fakultas Teknologi Informasi', 'Teknik Informatika', 6, 'Salatiga, Jawa Tengah');

-- ---- Experiences ----
INSERT INTO experiences (user_id, posisi, perusahaan, durasi, deskripsi) VALUES
(1, 'President of ISACA Student Group', 'UKSW', '2026 - Present', 'Leading overall organization, determining strategic direction, and overseeing all work programs at UKSW.'),
(1, 'Vice President of ISACA Student Group', 'UKSW', '2025 - 2026', 'Managed internal organization, maintained operational stability, and coordinated across divisions.'),
(1, 'Teaching Assistant', 'UKSW', '2024 - 2025', 'Discrete Mathematics and Basic Programming for Information Systems at UKSW. Trusted since the first year of college.'),
(1, 'Photography Lead & Trainer', 'Bethany Indonesia Salatiga & GKI Ambarawa', '2022 - Present', 'Managed visual documentation and provided technical photography training for Bethany Indonesia Salatiga & GKI Ambarawa.');

-- ---- Projects ----
INSERT INTO projects (user_id, judul, deskripsi, gambar_url, link_project) VALUES
(1, 'ISACA Leadership Event', 'Memimpin dan mengorganisir seminar nasional teknologi dan keamanan sistem informasi di UKSW.', 'President_ISG.png', '#'),
(1, 'Teaching & Mentoring', 'Berbagi ilmu pemrograman dasar dan matematika diskrit kepada mahasiswa baru Sistem Informasi.', 'Vice_President_ISG.png', '#'),
(1, 'E-Sports National Championship', 'Memenangkan berbagai turnamen E-Sports tingkat nasional mewakili universitas.', 'Others1.png', '#'),
(1, 'Photography Expedition', 'Dokumentasi visual untuk berbagai acara gereja dan komunitas di Salatiga dan Ambarawa.', 'others2.png', '#');

-- ---- Case Studies ----
INSERT INTO case_studies (user_id, judul, deskripsi_singkat, tech_stack, penjelasan_detail, gambar_urls, link_project) VALUES
(1, 'AeroRent: Enterprise Car Rental', 'Sistem informasi penyewaan mobil end-to-end dengan arsitektur asynchronous untuk mengotomatiskan proses pemesanan, verifikasi dokumen, penugasan supir, hingga gerbang pembayaran.', 'Frontend: HTML5, CSS Modern, Vanilla JS|Backend: Python FastAPI, Pydantic, PyJWT, APScheduler|Database: TiDB Cloud (MySQL) Asynchronous (aiomysql)|Integrations: Midtrans (Payment), Fonnte (WA Bot)', 'Sistem dilengkapi dengan Role-Based Access Control (RBAC) yang ketat untuk Customer, Kasir, Owner, dan Supir, verifikasi wajah/dokumen untuk penyewa lepas-kunci, serta pengiriman E-Invoice dan laporan analitik otomatis.', 'aerorent-ss.png', 'https://ero-rent-beryl.vercel.app/login.html');

-- ---- Skills ----
INSERT INTO skills (user_id, nama_skill, icon_class) VALUES
(1, 'Cybersecurity', 'ph ph-shield-check'),
(1, 'Risk Management', 'ph ph-chart-line-up'),
(1, 'Leadership', 'ph ph-users-three'),
(1, 'Photography', 'ph ph-camera'),
(1, 'E-Sports', 'ph ph-game-controller'),
(1, 'Public Speaking', 'ph ph-microphone-stage'),
(1, 'Teamwork', 'ph ph-users');

-- ============================================================
-- TABEL: blogs
-- Menyimpan artikel / write-up / catatan
-- ============================================================
CREATE TABLE IF NOT EXISTS blogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    judul VARCHAR(300) NOT NULL,
    konten TEXT NOT NULL,
    kategori VARCHAR(100) DEFAULT 'General',
    gambar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ---- Blogs ----
INSERT INTO blogs (user_id, judul, konten, kategori) VALUES
(1, 'Apa Itu Cybersecurity?', 'Cybersecurity adalah praktik melindungi sistem, jaringan, dan program dari serangan digital. Serangan-serangan ini biasanya ditujukan untuk mengakses, mengubah, atau menghancurkan informasi sensitif. Sebagai mahasiswa yang berfokus pada keamanan siber, saya mempelajari berbagai teknik pertahanan mulai dari enkripsi data, firewall, hingga penetration testing.', 'Cybersecurity'),
(1, 'Pengalaman Menjadi Ketua ISACA Student Group', 'Menjadi pemimpin organisasi IT di kampus mengajarkan saya banyak hal tentang manajemen tim, pengambilan keputusan, dan bagaimana mengkoordinasikan acara berskala nasional. Dari mengatur seminar AI hingga webinar audit keamanan, setiap tantangan membentuk karakter kepemimpinan saya.', 'Leadership'),
(1, 'Tips Memulai Karir di Bidang IT Security', 'Bagi teman-teman yang ingin terjun ke dunia keamanan siber, mulailah dengan mempelajari dasar-dasar jaringan komputer dan sistem operasi Linux. Lanjutkan dengan sertifikasi seperti CompTIA Security+ atau CEH. Yang terpenting, selalu praktik dan ikuti CTF (Capture The Flag) competitions!', 'Career');
