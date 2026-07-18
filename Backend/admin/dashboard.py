from flask import Blueprint, jsonify
from model import Database
from Backend.admin.login import token_required

# Inisialisasi Blueprint
dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user):
    """Mengambil statistik dashboard untuk admin"""
    try:
        db = Database()
        stats = {}
        # Gabungkan 4 query menjadi 1 untuk mengurangi latency jaringan
        query = """
            SELECT 
                (SELECT COUNT(*) FROM experiences WHERE user_id = %s) as experiences_count,
                (SELECT COUNT(*) FROM projects WHERE user_id = %s) as projects_count,
                (SELECT COUNT(*) FROM skills WHERE user_id = %s) as skills_count,
                (SELECT username FROM users WHERE id = %s LIMIT 1) as admin_name
        """
        result = db.execute_query(query, (current_user, current_user, current_user, current_user), fetch=True)
        
        if result:
            stats = {
                'experiences_count': result[0]['experiences_count'],
                'projects_count': result[0]['projects_count'],
                'skills_count': result[0]['skills_count'],
                'admin_name': result[0]['admin_name']
            }
        else:
            stats = {'experiences_count': 0, 'projects_count': 0, 'skills_count': 0, 'admin_name': 'Admin'}
            
        return jsonify({
            'success': True,
            'data': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dashboard_bp.route('/dashboard/recent', methods=['GET'])
@token_required
def get_recent_activity(current_user):
    """Mengambil aktivitas terbaru"""
    try:
        db = Database()
        activities = []
        
        # Ambil 3 experiences terbaru
        # Pastikan kolom 'durasi' ada di tabel experiences kamu
        query_exp = """
            SELECT id, posisi, perusahaan, durasi, created_at, 'experience' as type 
            FROM experiences 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 3
        """
        result_exp = db.execute_query(query_exp, (current_user,), fetch=True)
        if result_exp:
            activities.extend(result_exp)
        
        # Ambil 3 projects terbaru
        # Pastikan kolom 'deskripsi' ada di tabel projects kamu
        query_proj = """
            SELECT id, judul, deskripsi, created_at, 'project' as type 
            FROM projects 
            WHERE user_id = %s 
            ORDER BY created_at DESC 
            LIMIT 3
        """
        result_proj = db.execute_query(query_proj, (current_user,), fetch=True)
        if result_proj:
            activities.extend(result_proj)
        
        # Sort gabungan berdasarkan waktu terbaru
        activities.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'success': True,
            'data': activities[:5] # Ambil 5 teratas
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500