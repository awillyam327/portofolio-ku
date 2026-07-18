from flask import Blueprint, jsonify
from model import Database
from Backend.admin.login import token_required

contacts_admin_bp = Blueprint('contacts_admin', __name__)

@contacts_admin_bp.route('/admin/contacts', methods=['GET'])
@token_required
def get_contacts(current_user):
    """Mengambil semua pesan kontak masuk"""
    try:
        db = Database()
        query = "SELECT * FROM contacts ORDER BY created_at DESC"
        result = db.execute_query(query, fetch=True)
        return jsonify({'success': True, 'data': result or []}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@contacts_admin_bp.route('/admin/contacts/<int:contact_id>', methods=['DELETE'])
@token_required
def delete_contact(current_user, contact_id):
    """Menghapus pesan kontak"""
    try:
        db = Database()
        query = "DELETE FROM contacts WHERE id = %s"
        db.execute_query(query, (contact_id,))
        return jsonify({'success': True, 'message': 'Pesan berhasil dihapus'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
