# Create file with content using echo (careful with quotes in Git Bash)

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('text', '')
    
    # Simple response logic
    if "crash" in message.lower() or "export" in message.lower():
        response = "I understand your app is crashing when exporting data. This is a known issue with version 2.3.1. Could you try temporarily disabling your antivirus software? Our logs show this resolves the issue in 88% of cases."
    elif "sync" in message.lower() or "syncing" in message.lower():
        response = "I see you're having sync issues between devices. Let's try resetting your sync token. Please go to Settings > Sync > Force Full Sync and wait 10 minutes for the process to complete."
    elif "connect" in message.lower() or "thermostat" in message.lower():
        response = "It sounds like you're having trouble connecting your thermostat. The HT-2019 model is only compatible with app versions 5.0 and below. I can help you roll back your app or offer a discount on a newer compatible model."
    elif "network" in message.lower() or "internet" in message.lower():
        response = "For network connection issues, please check your Local Network permissions in the app settings and try clearing the app cache. A recent update may have reset these permissions."
    else:
        response = "Thank you for contacting technical support. Could you provide more details about your issue so I can help you better?"
    
    return jsonify({
        "message": response,
        "action_items": [
            {"action_type": "troubleshooting", "description": "Check for software conflicts", "priority": "High"}
        ],
        "summary": "Customer reporting technical issue with the application.",
        "sentiment": "Concerned",
        "priority": "Medium",
        "estimated_time": 45
    })

@app.route('/knowledge/Technical%20Support', methods=['GET'])
def knowledge():
    return jsonify([
        {"kb_id": 1, "title": "Sync Issues Troubleshooting", "content": "For sync issues between devices: 1. Verify same account on all devices 2. Check sync logs for errors 3. Try Settings > Sync > Force Full Sync 4. Wait 10 minutes for completion."},
        {"kb_id": 2, "title": "Device Compatibility Guidelines", "content": "Always check compatibility matrix before updating. Older devices may require app version rollback."},
        {"kb_id": 3, "title": "Network Connection Problems", "content": "For connection issues: 1. Check Local Network permissions 2. Clear app cache 3. Verify network status"},
        {"kb_id": 4, "title": "Installation Troubleshooting", "content": "For installation failures: 1. Temporarily disable antivirus 2. Run as administrator 3. Check for disk space issues"}
    ])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8001,debug=True)
