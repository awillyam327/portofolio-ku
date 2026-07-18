import resend
from flask import Blueprint, request, jsonify
from model import Database
from config import Config

contact_bp = Blueprint('contact', __name__)

# Konfigurasi Resend API Key
resend.api_key = Config.RESEND_API_KEY

@contact_bp.route('/contact', methods=['POST'])
def send_contact():
    """Endpoint publik untuk menerima pesan dari form kontak.
    Mengirim email via Resend dan menyimpan pesan ke database."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body harus JSON'}), 400

        nama = data.get('nama', '').strip()
        email = data.get('email', '').strip()
        pesan = data.get('pesan', '').strip()

        if not nama or not email or not pesan:
            return jsonify({'error': 'Nama, email, dan pesan wajib diisi'}), 400

        # 1. Simpan pesan ke database
        db = Database()
        query = "INSERT INTO contacts (nama, email, pesan) VALUES (%s, %s, %s)"
        db.execute_query(query, (nama, email, pesan))

        # 2. Kirim email notifikasi via Resend
        try:
            params = {
                "from": "Portfolio Contact <onboarding@resend.dev>",
                "to": ["awillyam327@gmail.com"],
                "subject": f"Pesan Baru dari Portfolio: {nama}",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">📩 Pesan Baru dari Portfolio</h2>
                    <hr style="border: 1px solid #e5e7eb;">
                    <p><strong>Nama:</strong> {nama}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Pesan:</strong></p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
                        <p>{pesan}</p>
                    </div>
                    <hr style="border: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 12px;">
                        Email ini dikirim otomatis dari form kontak portfolio Arthur Willyam Liang.
                    </p>
                </div>
                """
            }
            resend.Emails.send(params)
        except Exception as email_err:
            # Jika email gagal, tetap simpan ke DB tapi beri warning
            print(f"[RESEND WARNING] Email gagal terkirim: {email_err}")

        return jsonify({
            'success': True,
            'message': 'Pesan berhasil dikirim! Terima kasih telah menghubungi.'
        }), 200

    except Exception as e:
        return jsonify({'error': f'Gagal mengirim pesan: {str(e)}'}), 500
