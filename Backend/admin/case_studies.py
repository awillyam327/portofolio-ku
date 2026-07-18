from flask import Blueprint, request, jsonify
from model import Database
from Backend.admin.login import token_required
import logging

logger = logging.getLogger(__name__)

case_studies_bp = Blueprint('case_studies', __name__)

@case_studies_bp.route('/case-studies', methods=['GET'])
def get_case_studies():
    """Mengambil semua case studies (publik)"""
    try:
        db = Database()
        query = """
            SELECT c.*, u.username 
            FROM case_studies c 
            JOIN users u ON c.user_id = u.id 
            WHERE u.role = 'admin'
            ORDER BY c.created_at DESC
        """
        result = db.execute_query(query, fetch=True)
        return jsonify({'success': True, 'data': result if result else []}), 200
    except Exception as e:
        logger.error(f"Error in get_case_studies: {str(e)}")
        return jsonify({'error': str(e)}), 500

@case_studies_bp.route('/case-studies/<int:id>', methods=['GET'])
def get_case_study_by_id(id):
    """Mengambil satu case study berdasarkan ID"""
    try:
        db = Database()
        query = "SELECT * FROM case_studies WHERE id = %s"
        result = db.execute_query(query, (id,), fetch=True)
        if not result:
            return jsonify({'error': 'Case Study tidak ditemukan'}), 404
        return jsonify({'success': True, 'data': result[0]}), 200
    except Exception as e:
        logger.error(f"Error in get_case_study_by_id: {str(e)}")
        return jsonify({'error': str(e)}), 500

@case_studies_bp.route('/case-studies', methods=['POST'])
@token_required
def create_case_study(current_user):
    """Create case study baru"""
    try:
        data = request.get_json()
        required_fields = ['judul', 'deskripsi_singkat']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} wajib diisi'}), 400
        
        db = Database()
        query = """
            INSERT INTO case_studies (user_id, judul, deskripsi_singkat, tech_stack, penjelasan_detail, gambar_urls, link_project)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        values = (
            current_user,
            data.get('judul'),
            data.get('deskripsi_singkat'),
            data.get('tech_stack'),
            data.get('penjelasan_detail'),
            data.get('gambar_urls'),
            data.get('link_project')
        )
        new_id = db.execute_query(query, values)
        return jsonify({'success': True, 'message': 'Case Study berhasil dibuat', 'id': new_id}), 201
    except Exception as e:
        logger.error(f"Error in create_case_study: {str(e)}")
        return jsonify({'error': str(e)}), 500

@case_studies_bp.route('/case-studies/<int:id>', methods=['PUT'])
@token_required
def update_case_study(current_user, id):
    """Update case study"""
    try:
        data = request.get_json()
        db = Database()
        
        check_query = "SELECT id FROM case_studies WHERE id = %s AND user_id = %s"
        existing = db.execute_query(check_query, (id, current_user), fetch=True)
        if not existing:
            return jsonify({'error': 'Case Study tidak ditemukan atau bukan milik Anda'}), 404
        
        allowed_fields = ['judul', 'deskripsi_singkat', 'tech_stack', 'penjelasan_detail', 'gambar_urls', 'link_project']
        updates = []
        values = []
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                values.append(data[field])
        
        if not updates:
            return jsonify({'error': 'Tidak ada data yang diupdate'}), 400
        
        values.append(id)
        query = f"UPDATE case_studies SET {', '.join(updates)} WHERE id = %s"
        db.execute_query(query, tuple(values))
        return jsonify({'success': True, 'message': 'Case Study berhasil diupdate'}), 200
    except Exception as e:
        logger.error(f"Error in update_case_study: {str(e)}")
        return jsonify({'error': str(e)}), 500

@case_studies_bp.route('/case-studies/<int:id>', methods=['DELETE'])
@token_required
def delete_case_study(current_user, id):
    """Delete case study"""
    try:
        db = Database()
        check_query = "SELECT id FROM case_studies WHERE id = %s AND user_id = %s"
        existing = db.execute_query(check_query, (id, current_user), fetch=True)
        if not existing:
            return jsonify({'error': 'Case Study tidak ditemukan atau bukan milik Anda'}), 404
        
        query = "DELETE FROM case_studies WHERE id = %s"
        db.execute_query(query, (id,))
        return jsonify({'success': True, 'message': 'Case Study berhasil dihapus'}), 200
    except Exception as e:
        logger.error(f"Error in delete_case_study: {str(e)}")
        return jsonify({'error': str(e)}), 500
