from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import datetime
import json

app = Flask(__name__)
CORS(app)

# 1. Config
DB_FILE = 'reports.json'  # Make sure this matches your file name
UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# 2. Helper to Load JSON
def load_reports():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, 'r') as f:
                return json.load(f)
        except:
            return [] # Return empty if file is broken
    return []

# 3. Helper to Save JSON
def save_reports(data):
    with open(DB_FILE, 'w') as f:
        json.dump(data, f, indent=4)

# Load data when server starts
reports = load_reports()

@app.route('/api/reports', methods=['GET'])
def get_reports():
    # Always reload to get latest updates
    global reports
    reports = load_reports()
    return jsonify(reports)

@app.route('/api/submit', methods=['POST'])
def submit_report():
    try:
        name = request.form.get('name')
        level = request.form.get('level')
        category = request.form.get('category')
        issue = request.form.get('issue')
        
        file = request.files.get('photo')
        filename = ""
        if file:
            # Timestamp prevents duplicate filenames
            clean_name = file.filename.replace(" ", "_") # Fix spaces in names
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
            # "image_url": f"http://localhost:5000/uploads/{filename}" if filename else ""
            "image_url": f"http://172.20.10.3:5000/uploads/{filename}" if filename else ""
            
        }

        reports.insert(0, new_report)
        save_reports(reports) # <--- Save to your JSON file
        
        return jsonify({"message": "Success", "report": new_report}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    print("✅ Server running on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)