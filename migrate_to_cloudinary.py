import os
import time
import cloudinary
import cloudinary.uploader
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

# Set CWD to root directory if running from somewhere else
os.chdir(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
from model import Database

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

db = Database()

def upload_image(file_path, folder_name, public_id=None):
    if not file_path.startswith('http') and not os.path.exists(file_path):
        print(f"Skipping {file_path}, does not exist.")
        return None
    try:
        kwargs = {"folder": folder_name, "resource_type": "image"}
        if public_id:
            kwargs["public_id"] = public_id
        res = cloudinary.uploader.upload(file_path, **kwargs)
        return res['secure_url']
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")
        return None

def extract_filename(url_or_path):
    if url_or_path.startswith('http'):
        return url_or_path.split('/')[-1]
    return url_or_path

def migrate_projects():
    print("Migrating Projects...")
    projects = db.execute_query("SELECT id, gambar_url FROM projects", fetch=True)
    for p in projects:
        img = p['gambar_url']
        if img:
            # Pass the URL directly to cloudinary
            url = upload_image(img, "portfolio/projects")
            if url:
                db.execute_query("UPDATE projects SET gambar_url = %s WHERE id = %s", (url, p['id']))
                print(f"Project {p['id']} image updated.")

def migrate_case_studies():
    print("Migrating Case Studies...")
    cases = db.execute_query("SELECT id, gambar_urls FROM case_studies", fetch=True)
    for c in cases:
        img = c['gambar_urls']
        if img:
            images = [i.strip() for i in img.split(',')]
            new_urls = []
            for im in images:
                url = upload_image(im, "portfolio/projects")
                if url:
                    new_urls.append(url)
                else:
                    new_urls.append(im)
            
            final_str = ",".join(new_urls)
            if final_str != img:
                db.execute_query("UPDATE case_studies SET gambar_urls = %s WHERE id = %s", (final_str, c['id']))
                print(f"Case Study {c['id']} image updated.")

def migrate_certificates():
    print("Migrating Certificates...")
    certs = db.execute_query("SELECT id, gambar_url FROM certificates", fetch=True)
    for c in certs:
        img = c['gambar_url']
        if img:
            url = upload_image(img, "portfolio/certificates")
            if url:
                db.execute_query("UPDATE certificates SET gambar_url = %s WHERE id = %s", (url, c['id']))
                print(f"Certificate {c['id']} image updated.")

def upload_sequence_worker(file_info):
    file_path, public_id = file_info
    return upload_image(file_path, "portfolio/sequence", public_id=public_id)

def migrate_sequence():
    print("Migrating Sequence Images (this might take a while)...")
    sequence_dir = os.path.join('Frontend', 'profil', 'sequence')
    if not os.path.exists(sequence_dir):
        print("Sequence directory not found.")
        return
        
    files = [f for f in os.listdir(sequence_dir) if f.endswith('.webp')]
    files.sort()
    
    upload_tasks = []
    for f in files:
        # e.g. 0001.webp -> public_id="0001"
        file_path = os.path.join(sequence_dir, f)
        public_id = f.replace('.webp', '')
        upload_tasks.append((file_path, public_id))
    
    print(f"Found {len(upload_tasks)} sequence frames.")
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = list(executor.map(upload_sequence_worker, upload_tasks))
    
    print("Sequence migration completed.")

if __name__ == "__main__":
    migrate_projects()
    migrate_case_studies()
    migrate_certificates()
    migrate_sequence()
    print("All migrations completed!")
