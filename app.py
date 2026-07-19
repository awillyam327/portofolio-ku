from flask import Flask, jsonify, send_from_directory,request
from flask_cors import CORS
from config import Config
import os

# Import blueprints
from Backend.admin.login import login_bp
from Backend.admin.dashboard import dashboard_bp
from Backend.admin.profiles import profiles_bp
from Backend.admin.experience import experience_bp
from Backend.admin.projects import projects_bp
from Backend.admin.case_studies import case_studies_bp
from Backend.admin.skills import skills_bp
from Backend.utama.utama import utama_bp
from Backend.utama.contact import contact_bp
from Backend.admin.upload import upload_bp
from Backend.admin.contacts import contacts_admin_bp
from Backend.admin.blogs import blogs_bp


def create_app():
    # PERBAIKAN 1: template_folder harus menunjuk ke folder yang berisi .html
    # static_folder menunjuk ke root aset statis (CSS, JS, Gambar)
    app = Flask(__name__, 
                static_folder='Frontend',      # Root untuk semua aset frontend
                template_folder='.')           # '.' berarti root project (tempat index.html berada)
    
    # Konfigurasi
    app.config.from_object(Config)
    
    # Enable CORS untuk development
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Register blueprints
    app.register_blueprint(login_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')
    app.register_blueprint(profiles_bp, url_prefix='/api')
    app.register_blueprint(experience_bp, url_prefix='/api')
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(skills_bp, url_prefix='/api')
    app.register_blueprint(utama_bp, url_prefix='/api')
    app.register_blueprint(contact_bp, url_prefix='/api')
    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(contacts_admin_bp, url_prefix='/api')
    app.register_blueprint(case_studies_bp, url_prefix='/api')
    app.register_blueprint(blogs_bp, url_prefix='/api')
    
    # Route untuk serving frontend files
    @app.route('/')
    def index():
        # Coba cari di root dulu
        if os.path.exists(os.path.join(app.root_path, 'index.html')):
            return send_from_directory(app.root_path, 'index.html')
        # Jika tidak ada, coba cari di folder Frontend
        elif os.path.exists(os.path.join(app.root_path, 'Frontend', 'index.html')):
            return send_from_directory(os.path.join(app.root_path, 'Frontend'), 'index.html')
        else:
            return "Error: index.html not found in root or Frontend folder", 404
    @app.route('/index.html')
    def index_file():
        # Logika yang sama untuk permintaan eksplisit /index.html
        if os.path.exists(os.path.join(app.root_path, 'index.html')):
            return send_from_directory(app.root_path, 'index.html')
        elif os.path.exists(os.path.join(app.root_path, 'Frontend', 'index.html')):
            return send_from_directory(os.path.join(app.root_path, 'Frontend'), 'index.html')
        else:
            return "Error: index.html not found", 404
    
    @app.route('/admin/<path:filename>')
    def admin_pages(filename):
        return send_from_directory(os.path.join(app.root_path, 'Frontend', 'admin'), filename)
    
    @app.route('/profil/<path:filename>')
    def profil_pages(filename):
        return send_from_directory(os.path.join(app.root_path, 'Frontend', 'profil'), filename)
    
    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(
            app.root_path,          # <-- Ganti ke root_path
            'favicon.ico', 
            mimetype='image/vnd.microsoft.icon'
        )
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        # Jika request HTML (bukan API), kembalikan index.html untuk SPA routing
        if request.accept_mimetypes.best == 'text/html':
            return send_from_directory(app.root_path, 'index.html')
        return jsonify({'error': 'Route tidak ditemukan'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Terjadi kesalahan pada server'}), 500
    
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=Config.DEBUG, host='0.0.0.0', port=5000)