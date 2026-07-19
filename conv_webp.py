from PIL import Image
import os
d = r"C:\Users\ivane\OneDrive\Desktop\webs\CHINABUYHUB\images"
src = Image.open(os.path.join(d, "logo.png")).convert("RGBA")
src.resize((64, 64), Image.LANCZOS).save(os.path.join(d, "favicon.webp"), lossless=True)
print("favicon.webp", os.path.getsize(os.path.join(d, "favicon.webp")))
src.save(os.path.join(d, "logo.webp"), lossless=True)
print("logo.webp", os.path.getsize(os.path.join(d, "logo.webp")))
src.resize((1200, 630), Image.LANCZOS).convert("RGB").save(os.path.join(d, "og-image.webp"), quality=90)
print("og-image.webp", os.path.getsize(os.path.join(d, "og-image.webp")))
