import time
import os
import sys
import threading
from flask import Flask, request, jsonify
from browser_use import run_browser_task
from computer_use import execute_computer_action
from openclaw import init_openclaw, execute_claw
from openhands import execute_openhands_task
from git_nexus import sync_git
from second_brain import query_second_brain

app = Flask(__name__)

@app.route('/api/agent/browser', methods=['POST'])
def handle_browser():
    data = request.json or {}
    url = data.get('url', 'https://google.com')
    action = data.get('action', '')
    res = run_browser_task(url, action)
    return jsonify({"status": "success", "result": res})

@app.route('/api/agent/computer', methods=['POST'])
def handle_computer():
    data = request.json or {}
    action = data.get('action', '')
    params = data.get('params', {})
    res = execute_computer_action(action, params)
    return jsonify({"status": "success", "result": res})

@app.route('/api/agent/openclaw/init', methods=['POST'])
def handle_openclaw_init():
    res = init_openclaw()
    return jsonify({"status": "success", "result": res})

@app.route('/api/agent/openhands', methods=['POST'])
def handle_openhands():
    data = request.json or {}
    task = data.get('task', '')
    res = execute_openhands_task(task)
    return jsonify({"status": "success", "result": res})

@app.route('/api/agent/gitnexus', methods=['POST'])
def handle_gitnexus():
    res = sync_git()
    return jsonify({"status": "success", "result": res})

@app.route('/api/agent/secondbrain', methods=['POST'])
def handle_secondbrain():
    data = request.json or {}
    query = data.get('query', '')
    res = query_second_brain(query)
    return jsonify({"status": "success", "result": res})

def start_server():
    print("[INFO] Starting ML Agent Hub RPC on port 3051...")
    # Run the internal RPC server that Go Gateway talks to
    app.run(port=3051, host='127.0.0.1', use_reloader=False)

def main():
    import sys
    if sys.stdout.encoding != 'utf-8':
        sys.stdout.reconfigure(encoding='utf-8')
    print("==================================================")
    print(" 🧠 DEVKiTZ Python ML Agent Hub ")
    print("==================================================")
    print("[INFO] Loading Voicebox, Playwright and OS-Control modules...")
    
    server_thread = threading.Thread(target=start_server)
    server_thread.daemon = True
    server_thread.start()
    
    # Keep alive for C Daemon
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("[INFO] Shutting down Agent Hub.")
        sys.exit(0)

if __name__ == "__main__":
    main()
