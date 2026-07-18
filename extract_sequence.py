import cv2
import os

VIDEO_PATH = "video.mp4"
OUTPUT_DIR = "Frontend/profil/sequence"
TARGET_FRAMES = 192

if not os.path.exists(VIDEO_PATH):
    print(f"Error: File '{VIDEO_PATH}' tidak ditemukan!")
    print("Pastikan Anda sudah menaruh video di folder ini dengan nama 'video.mp4'.")
    exit(1)

# Buat folder jika belum ada
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Buka video
cap = cv2.VideoCapture(VIDEO_PATH)
if not cap.isOpened():
    print("Error: Tidak bisa membuka video.")
    exit(1)

total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
fps = cap.get(cv2.CAP_PROP_FPS)

print(f"Video ditemukan: {total_frames} frames (FPS: {fps:.2f})")

# Jika durasi video sangat panjang, kita harus skip frame agar tepat 192 gambar (192 frames)
# atau jika kurang, kita ambil apa adanya.
if total_frames < TARGET_FRAMES:
    print(f"Peringatan: Video hanya memiliki {total_frames} frame, tapi target kita {TARGET_FRAMES}.")
    print("Gambar mungkin tidak mencapai 192. Sebaiknya gunakan video yang lebih panjang.")
    step = 1
else:
    # Calculate step to evenly sample exactly TARGET_FRAMES
    step = total_frames / TARGET_FRAMES

print(f"Mengekstrak {TARGET_FRAMES} gambar ke {OUTPUT_DIR} ...")

frame_idx = 0
extracted_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break
    
    # Ambil frame sesuai interval yang dihitung (step)
    if frame_idx >= int(extracted_count * step):
        extracted_count += 1
        
        # Simpan sebagai .webp
        # Nama file: 0001.webp, 0002.webp, dst...
        filename = f"{extracted_count:04d}.webp"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        # CV2 menggunakan kualitas WebP (1-100). Default sekitar 80, kita set ke 85
        cv2.imwrite(filepath, frame, [cv2.IMWRITE_WEBP_QUALITY, 85])
        
        print(f"Tersimpan: {filename}")
        
        if extracted_count >= TARGET_FRAMES:
            break
            
    frame_idx += 1

cap.release()
print("\nSelesai! Berhasil mengekstrak", extracted_count, "gambar.")
print("Silakan Refresh (F5) website Anda untuk melihat animasinya!")
