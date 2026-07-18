import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

host = os.getenv('DB_HOST')
port = int(os.getenv('DB_PORT', 4000))
user = os.getenv('DB_USER')
password = os.getenv('DB_PASSWORD')

print("Connecting to TiDB Cloud...")
try:
    # Koneksi tanpa spesifik DB dulu untuk membuat DB Portofolio
    conn = mysql.connector.connect(
        host=host,
        port=port,
        user=user,
        password=password
    )
    cursor = conn.cursor()
    
    print("Creating Database Portofolio...")
    cursor.execute("CREATE DATABASE IF NOT EXISTS Portofolio")
    cursor.execute("USE Portofolio")
    
    print("Reading database.sql...")
    with open('database.sql', 'r', encoding='utf-8') as f:
        sql_script = f.read()
        
    # Eksekusi multi-statement
    print("Executing schema and seed data...")
    for result in cursor.execute(sql_script, multi=True):
        pass # Consume all results
        
    conn.commit()
    print("Database setup complete!")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals() and conn.is_connected():
        cursor.close()
        conn.close()
