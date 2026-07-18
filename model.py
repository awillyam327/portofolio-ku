import mysql.connector
from mysql.connector import pooling
from config import Config
import time
import logging

# Konfigurasi logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Database:
    _instance = None
    _pool = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        # Kita tidak menggunakan connection pool karena TiDB Serverless sering memutus koneksi idle,
        # yang menyebabkan TCP timeout (menggantung 60-90 detik) saat pool mencoba menggunakan koneksi mati.
        pass
    
    def get_connection(self):
        """Membuat koneksi baru setiap kali (mencegah masalah koneksi mati)"""
        return mysql.connector.connect(**Config.MYSQL_CONFIG)
    
    def execute_query(self, query, params=None, fetch=False):
        """Menjalankan query dengan opsi fetch untuk SELECT"""
        start_time = time.time()
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        try:
            cursor.execute(query, params or ())
            if fetch:
                result = cursor.fetchall()
            else:
                conn.commit()
                result = cursor.lastrowid if cursor.lastrowid else True
            
            elapsed = time.time() - start_time
            logger.debug(f"Query executed in {elapsed:.3f}s: {query[:50]}...")
            return result
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()
