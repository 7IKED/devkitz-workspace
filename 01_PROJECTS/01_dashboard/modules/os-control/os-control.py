import sys
import json

try:
    import pyautogui
except ImportError:
    print(json.dumps({"success": False, "error": "pyautogui not installed"}))
    sys.exit(1)

def main():
    try:
        data = sys.stdin.read()
        cmd = json.loads(data)
        action = cmd.get("action")
        
        if action == "click":
            x, y = cmd.get("x"), cmd.get("y")
            if x is not None and y is not None:
                pyautogui.click(x, y)
            else:
                pyautogui.click()
            print(json.dumps({"success": True}))
        elif action == "type":
            text = cmd.get("text")
            pyautogui.write(text, interval=0.05)
            print(json.dumps({"success": True}))
        elif action == "hotkey":
            keys = cmd.get("keys", [])
            pyautogui.hotkey(*keys)
            print(json.dumps({"success": True}))
        elif action == "screenshot":
            import io
            import base64
            screenshot = pyautogui.screenshot()
            buffered = io.BytesIO()
            screenshot.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            print(json.dumps({"success": True, "screenshot": img_str}))
        else:
            print(json.dumps({"success": False, "error": "Unknown action"}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    main()
