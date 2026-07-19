from flask import Blueprint, jsonify
from model import Database

utama_bp = Blueprint('utama', __name__)

@utama_bp.route('/profil', methods=['GET'])
def get_profil_public():
    """Endpoint publik untuk mengambil data profil (tanpa token).
    Digunakan oleh frontend halaman utama untuk menampilkan identitas."""
    try:
        db = Database()
        query = "SELECT * FROM profiles LIMIT 1"
        result = db.execute_query(query, fetch=True)
        if result:
            return jsonify({'success': True, 'data': result[0]}), 200
        return jsonify({'success': True, 'data': {}}), 200
    except Exception as e:
        # Jika DB belum tersedia, kembalikan data kosong (bukan error 500)
        return jsonify({'success': True, 'data': {}}), 200

@utama_bp.route('/experiences', methods=['GET'])
def get_experiences_public():
    try:
        db = Database()
        query = "SELECT * FROM experiences ORDER BY id ASC"
        result = db.execute_query(query, fetch=True)
        return jsonify({'success': True, 'data': result or []}), 200
    except Exception as e:
        return jsonify({'success': True, 'data': []}), 200

@utama_bp.route('/projects', methods=['GET'])
def get_projects_public():
    try:
        db = Database()
        query = "SELECT * FROM projects ORDER BY id ASC"
        result = db.execute_query(query, fetch=True)
        return jsonify({'success': True, 'data': result or []}), 200
    except Exception as e:
        return jsonify({'success': True, 'data': []}), 200

@utama_bp.route('/skills', methods=['GET'])
def get_skills_public():
    try:
        db = Database()
        query = "SELECT * FROM skills ORDER BY id ASC"
        result = db.execute_query(query, fetch=True)
        return jsonify({'success': True, 'data': result or []}), 200
    except Exception as e:
        return jsonify({'success': True, 'data': []}), 200

@utama_bp.route('/blogs-public', methods=['GET'])
def get_blogs_public():
    """Endpoint publik untuk mengambil semua blog (tanpa token)."""
    try:
        db = Database()
        query = "SELECT * FROM blogs ORDER BY created_at DESC"
        result = db.execute_query(query, fetch=True)
        return jsonify({'success': True, 'data': result or []}), 200
    except Exception as e:
        return jsonify({'success': True, 'data': []}), 200
