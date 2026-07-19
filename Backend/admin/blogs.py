from flask import Blueprint, request, jsonify
from model import Database
from Backend.admin.login import token_required

blogs_bp = Blueprint('blogs', __name__)

# ===== Admin CRUD =====

@blogs_bp.route('/blogs', methods=['GET'])
@token_required
def get_blogs(current_user):
    """Mengambil semua blog milik user"""
    try:
        db = Database()
        query = "SELECT * FROM blogs WHERE user_id = %s ORDER BY created_at DESC"
        result = db.execute_query(query, (current_user,), fetch=True)
        return jsonify({'success': True, 'data': result or []}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blogs_bp.route('/blogs', methods=['POST'])
@token_required
def add_blog(current_user):
    """Menambah blog baru"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body harus JSON'}), 400

        judul = data.get('judul', '').strip()
        konten = data.get('konten', '').strip()
        kategori = data.get('kategori', 'General').strip()
        gambar_url = data.get('gambar_url', '').strip()

        if not judul or not konten:
            return jsonify({'error': 'Judul dan konten wajib diisi'}), 400

        db = Database()
        query = "INSERT INTO blogs (user_id, judul, konten, kategori, gambar_url) VALUES (%s, %s, %s, %s, %s)"
        db.execute_query(query, (current_user, judul, konten, kategori, gambar_url))

        return jsonify({'success': True, 'message': 'Blog berhasil ditambahkan'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blogs_bp.route('/blogs/<int:blog_id>', methods=['PUT'])
@token_required
def update_blog(current_user, blog_id):
    """Mengupdate blog"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body harus JSON'}), 400

        db = Database()
        query = """UPDATE blogs SET judul = %s, konten = %s, kategori = %s, gambar_url = %s
                   WHERE id = %s AND user_id = %s"""
        db.execute_query(query, (
            data.get('judul', ''),
            data.get('konten', ''),
            data.get('kategori', 'General'),
            data.get('gambar_url', ''),
            blog_id,
            current_user
        ))

        return jsonify({'success': True, 'message': 'Blog berhasil diupdate'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@blogs_bp.route('/blogs/<int:blog_id>', methods=['DELETE'])
@token_required
def delete_blog(current_user, blog_id):
    """Menghapus blog"""
    try:
        db = Database()
        query = "DELETE FROM blogs WHERE id = %s AND user_id = %s"
        db.execute_query(query, (blog_id, current_user))
        return jsonify({'success': True, 'message': 'Blog berhasil dihapus'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
