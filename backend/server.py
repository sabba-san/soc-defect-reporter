from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import datetime
import json

app = Flask(__name__)
CORS(app)

# 1. Config
DB_FILE = 'reports.json'
UPLOAD_FOLDER = 'uploads'

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 2. Helper to Load JSON
def load_reports():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        except:
            return [] 
    return []

# 3. Helper to Save JSON
def save_reports(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Load data on start
reports = load_reports()

# --- ROUTE 1: GET REPORTS (View) ---
@app.route('/api/reports', methods=['GET'])
def get_reports():
    # Always reload to get latest updates
    global reports
    reports = load_reports()
    return jsonify(reports)

# --- ROUTE 2: SUBMIT REPORT (Add) ---
# FIXED: Changed URL from '/api/submit' to '/api/reports' to match Frontend
@app.route('/api/reports', methods=['POST'])
def submit_report():
    try:
        # Get text data
        name = request.form.get('name', 'Staf') # Default to 'Staf' if missing
        level = request.form.get('level')
        category = request.form.get('category')
        issue = request.form.get('issue')
        
        # FIXED: Changed 'photo' to 'image' to match React FormData
        file = request.files.get('image') 
        
        filename = ""
        if file:
            # Timestamp prevents duplicate filenames
            clean_name = file.filename.replace(" ", "_")
            filename = f"{datetime.datetime.now().timestamp()}_{clean_name}"
            file.save(os.path.join(UPLOAD_FOLDER, filename))

        new_report = {
            "id": str(len(reports) + 1),
            "name": name,
            "level": level,
            "category": category,
            "issue": issue,
            "status": "Baru",
            "date": datetime.datetime.now().isoformat(),
            # Hardcoded IP for Hotspot (Change this if IP changes!)
            "image_url": f"http://172.20.10.3:5000/uploads/{filename}" if filename else ""
        }

        reports.insert(0, new_report)
        save_reports(reports) 
        
        return jsonify({"message": "Success", "report": new_report}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

# --- ROUTE 3: SERVE IMAGES ---
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    # host='0.0.0.0' allows phone connections
    print("✅ Server running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)