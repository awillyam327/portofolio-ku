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

