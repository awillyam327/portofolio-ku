from flask import Blueprint, request, jsonify
from model import Database
from Backend.admin.login import token_required

certificates_bp = Blueprint('certificates', __name__)

@certificates_bp.route('/certificates', methods=['GET'])
def get_certificates():
    """Mengambil semua certificates"""
    try:
        db = Database()
        
        query = """
            SELECT c.*, u.username 
            FROM certificates c 
            JOIN users u ON c.user_id = u.id 
            WHERE u.role = 'admin'
            ORDER BY c.id DESC
        """
        result = db.execute_query(query, fetch=True)
        
        return jsonify({
            'success': True,
            'data': result if result else []
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@certificates_bp.route('/certificates/<int:id>', methods=['GET'])
def get_certificate_by_id(id):
    """Mengambil satu certificate berdasarkan ID"""
    try:
        db = Database()
        
        query = "SELECT * FROM certificates WHERE id = %s"
        result = db.execute_query(query, (id,), fetch=True)
        
        if not result:
            return jsonify({'error': 'Certificate tidak ditemukan'}), 404
        
        return jsonify({
            'success': True,
            'data': result[0]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@certificates_bp.route('/certificates', methods=['POST'])
@token_required
def create_certificate(current_user):
    """Create certificate baru"""
    try:
        data = request.get_json()
        
        required_fields = ['judul', 'gambar_url']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} wajib diisi'}), 400
        
        db = Database()
        
        query = """
            INSERT INTO certificates (user_id, judul, gambar_url)
            VALUES (%s, %s, %s)
        """
        values = (
            current_user,
            data.get('judul'),
            data.get('gambar_url')
        )
        
        new_id = db.execute_query(query, values)
        
        return jsonify({
            'success': True,
            'message': 'Certificate berhasil dibuat',
            'id': new_id
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@certificates_bp.route('/certificates/<int:id>', methods=['PUT'])
@token_required
def update_certificate(current_user, id):
    """Update certificate"""
    try:
        data = request.get_json()
        db = Database()
        
        check_query = "SELECT id FROM certificates WHERE id = %s AND user_id = %s"
        existing = db.execute_query(check_query, (id, current_user), fetch=True)
        
        if not existing:
            return jsonify({'error': 'Certificate tidak ditemukan atau bukan milik Anda'}), 404
        
        allowed_fields = ['judul', 'gambar_url']
        updates = []
        values = []
        
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])
        
        if not updates:
            return jsonify({'error': 'Tidak ada data yang diupdate'}), 400
        
        values.append(id)
        query = f"UPDATE certificates SET {', '.join(updates)} WHERE id = %s"
        db.execute_query(query, tuple(values))
        
        return jsonify({
            'success': True,
            'message': 'Certificate berhasil diupdate'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@certificates_bp.route('/certificates/<int:id>', methods=['DELETE'])
@token_required
def delete_certificate(current_user, id):
    """Delete certificate"""
    try:
        db = Database()
        
        check_query = "SELECT id FROM certificates WHERE id = %s AND user_id = %s"
        existing = db.execute_query(check_query, (id, current_user), fetch=True)
        
        if not existing:
            return jsonify({'error': 'Certificate tidak ditemukan atau bukan milik Anda'}), 404
        
        query = "DELETE FROM certificates WHERE id = %s"
        db.execute_query(query, (id,))
        
        return jsonify({
            'success': True,
            'message': 'Certificate berhasil dihapus'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
