from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from model import Database
import jwt
import datetime
import logging
import os
import resend
from functools import wraps
from config import Config

# Setup logger sederhana untuk debugging login
logger = logging.getLogger(__name__)

# PERBAIKAN 1: Tidak ada url_prefix di sini karena sudah diatur global di app.py
login_bp = Blueprint('login', __name__) 

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 1. Cek Header Authorization (Prioritas utama untuk API/Fetch)
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        # 2. Fallback ke Session Cookie (Untuk navigasi browser langsung)
        if not token:
            token = session.get('token')
        
        if not token:
            return jsonify({'error': 'Token tidak ditemukan'}), 401
        
        try:
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            current_user = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token telah kadaluarsa'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token tidak valid'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated

@login_bp.route('/login', methods=['POST'])
def login():
    """Endpoint untuk login admin"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body harus JSON'}), 400
            
        username = data.get('username', '').strip()
        password = data.get('password', '')
        
        if not username or not password:
            return jsonify({'error': 'Username dan password wajib diisi'}), 400
        
        db = Database()
        query = "SELECT id, username, password_hash, role FROM users WHERE username = %s"
        user = db.execute_query(query, (username,), fetch=True)
        
        if not user:
            # Gunakan pesan generik untuk keamanan (mencegah user enumeration)
            return jsonify({'error': 'Username atau password salah'}), 401
        
        user = user[0]
        
        # --- DEBUGGING SECTION (Hapus setelah masalah teratasi) ---
        hash_preview = user['password_hash'][:30] + "..." if len(user['password_hash']) > 30 else user['password_hash']
        logger.info(f"[LOGIN DEBUG] User: {username} | Hash Prefix: {hash_preview}")
        # ---------------------------------------------------------

        # Verifikasi password dengan fallback aman
        is_valid = False
        try:
            is_valid = check_password_hash(user['password_hash'], password)
        except Exception as e:
            logger.warning(f"[LOGIN DEBUG] Werkzeug check failed: {str(e)}. Trying plain comparison.")
            # Fallback hanya jika hash korup/bukan format standar Werkzeug
            is_valid = (user['password_hash'] == password)
            
        if not is_valid:
            logger.warning(f"[LOGIN DEBUG] Password mismatch for user: {username}")
            return jsonify({'error': 'Username atau password salah'}), 401
        
        # Generate JWT Token
        token_payload = {
            'user_id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(token_payload, Config.SECRET_KEY, algorithm='HS256')
        
        # Set session flags untuk keamanan cookie
        session.permanent = True
        session['token'] = token
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['role'] = user['role']
        
        return jsonify({
            'message': 'Login berhasil',
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'role': user['role']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"[LOGIN ERROR] {str(e)}")
        return jsonify({'error': 'Terjadi kesalahan pada server'}), 500
@login_bp.route('/logout', methods=['POST'])
def logout():
    """Endpoint untuk logout"""
    # Hapus semua data session di server-side
    session.clear()
    
    response = jsonify({'message': 'Logout berhasil'})
    # Hapus cookie session browser
    response.delete_cookie('session') 
    return response, 200

@login_bp.route('/auth/check', methods=['GET'])
@token_required
def check_auth(current_user):
    """Cek status autentikasi"""
    return jsonify({
        'authenticated': True,
        'user': {
            'id': current_user,
            'username': session.get('username'),
            'role': session.get('role')
        }
    }), 200

@login_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        if not username:
            return jsonify({'error': 'Username wajib diisi'}), 400
        
        db = Database()
        query = """
            SELECT u.id, p.email 
            FROM users u
            JOIN profiles p ON u.id = p.user_id
            WHERE u.username = %s
        """
        results = db.execute_query(query, (username,), fetch=True)
        user = results[0] if results else None
        
        if not user or not user.get('email'):
            # Return success anyway to prevent username enumeration, but log it
            return jsonify({'message': 'Jika username valid, link reset password telah dikirim ke email yang terdaftar.'}), 200
            
        email = user['email']
        
        # Generate reset token (1 hour expiration)
        token = jwt.encode({
            'reset_password': user['id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, Config.SECRET_KEY, algorithm='HS256')
        
        # Determine base URL for reset link
        host = request.headers.get('Host', '')
        protocol = 'https' if request.is_secure or 'vercel' in host else 'http'
        reset_link = f"{protocol}://{host}/reset-password?token={token}"
        
        resend.api_key = os.environ.get('RESEND_API_KEY')
        if not resend.api_key:
            return jsonify({'error': 'Resend API key belum dikonfigurasi'}), 500
            
        # Send email via Resend
        params = {
            "from": "onboarding@resend.dev",
            "to": [email],
            "subject": "Reset Password Admin Portfolio",
            "html": f"""
            <h2>Reset Password</h2>
            <p>Anda menerima email ini karena ada permintaan reset password untuk akun admin Anda.</p>
            <p>Silakan klik link di bawah ini untuk mengganti password Anda (berlaku selama 1 jam):</p>
            <p><a href="{reset_link}" style="padding:10px 20px; background:#00ff41; color:#000; text-decoration:none; border-radius:5px; font-weight:bold;">Reset Password</a></p>
            <p>Jika Anda tidak meminta reset, abaikan saja email ini.</p>
            """
        }
        try:
            email_res = resend.Emails.send(params)
            logger.info(f"Forgot password email sent to {email}. Resend ID: {email_res}")
        except Exception as e:
            logger.error(f"[RESEND API ERROR] {str(e)}")
            return jsonify({'error': f"Gagal mengirim email: {str(e)}"}), 500
        
        return jsonify({'message': 'Jika username valid, link reset password telah dikirim ke email yang terdaftar.'}), 200
        
    except Exception as e:
        logger.error(f"[FORGOT PASSWORD ERROR] {str(e)}")
        return jsonify({'error': 'Terjadi kesalahan pada server saat mengirim email'}), 500

@login_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')
        
        if not token or not new_password:
            return jsonify({'error': 'Token dan password baru wajib diisi'}), 400
            
        # Verify token
        try:
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('reset_password')
            if not user_id:
                raise ValueError("Token tidak valid")
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token reset password telah kadaluarsa. Silakan request ulang.'}), 400
        except Exception:
            return jsonify({'error': 'Token reset password tidak valid.'}), 400
            
        # Update password
        db = Database()
        hashed_pw = generate_password_hash(new_password)
        db.execute_query("UPDATE users SET password_hash = %s WHERE id = %s", (hashed_pw, user_id))
        
        return jsonify({'message': 'Password berhasil diubah. Silakan login dengan password baru.'}), 200
        
    except Exception as e:
        logger.error(f"[RESET PASSWORD ERROR] {str(e)}")
        return jsonify({'error': 'Terjadi kesalahan pada server saat mereset password'}), 500