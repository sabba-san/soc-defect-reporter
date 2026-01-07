from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import datetime

app = Flask(__name__)
CORS(app)  # Allow Next.js to talk to Python

# Mock Database (Starts with one sample report)
reports = [
    {
        "id": "1",
        "name": "Admin",
        "level": "2",
        "category": "Bangunan",
        "issue": "Paip Bocor",
        "status": "Dalam Tindakan",
        "date": datetime.datetime.now().isoformat(),
        "image_url": ""
    }
]

# Ensure uploads folder exists
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    return jsonify(reports)

@app.route('/api/submit', methods=['POST'])
def submit_report():
    try:
        # 1. Get Text Data
        name = request.form.get('name')
        level = request.form.get('level')
        category = request.form.get('category')
        issue = request.form.get('issue')
        
        # 2. Handle Image Upload
        file = request.files.get('photo')
        filename = ""
        if file:
            # Create unique filename: 1_photo.jpg
            filename = f"{len(reports) + 1}_{file.filename}"
            file.save(os.path.join(UPLOAD_FOLDER, filename))

        # 3. Create Report Object
        new_report = {
            "id": str(len(reports) + 1),
            "name": name,
            "level": level,
            "category": category,
            "issue": issue,
            "status": "Baru",
            "date": datetime.datetime.now().isoformat(),
            # Point image URL to this Flask server
            "image_url": f"http://localhost:5000/uploads/{filename}" if filename else ""
        }

        # 4. Save to "Database"
        reports.insert(0, new_report) # Add to top of list
        
        return jsonify({"message": "Success", "report": new_report}), 200

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500

# Route to serve images so frontend can see them
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)