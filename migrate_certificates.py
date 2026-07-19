import sys
from model import Database

def migrate():
    db = Database()
    
    # 1. Add logo_url to skills
    try:
        print("Menambahkan kolom logo_url ke tabel skills...")
        db.execute_query("ALTER TABLE skills ADD COLUMN logo_url VARCHAR(500);")
        print("Berhasil!")
    except Exception as e:
        print("Info (skills):", e)
        
    # 2. Create certificates table
    try:
        print("Membuat tabel certificates...")
        query = """
        CREATE TABLE IF NOT EXISTS certificates (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            judul VARCHAR(200) NOT NULL,
            gambar_url VARCHAR(500) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """
        db.execute_query(query)
        print("Berhasil!")
    except Exception as e:
        print("Info (certificates):", e)

if __name__ == "__main__":
    migrate()
