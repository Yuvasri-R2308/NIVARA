import os
import shutil

ROOT = r"c:\Users\yuvasri\OneDrive\Desktop\SIH PRG DATASET\Wayanad_FINAL_PROJECT_DATASET_PACKAGE_UPDATED\NIVRA UPDATED PROJECT"

files_to_remove = [
    "index.html",
    "postcss.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    "vite.config.ts"
]

dirs_to_remove = [
    "dist",
    "src",
    "data",
    "models",
    "public"
]

print("Cleaning obsolete files and folders from root...")

for f in files_to_remove:
    path = os.path.join(ROOT, f)
    if os.path.exists(path):
        os.remove(path)
        print(f"Removed root file: {f}")

for d in dirs_to_remove:
    path = os.path.join(ROOT, d)
    if os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)
        print(f"Removed root directory: {d}/")

print("Root directory cleanup complete!")
