import pyautogui
import time

# Safeties
pyautogui.FAILSAFE = True
pyautogui.PAUSE = 0.5

def execute_computer_action(action, params):
    print(f"💻 [Computer Use] Executing: {action} with params: {params}")
    try:
        if action == "move_mouse":
            x, y = params.get('x', 0), params.get('y', 0)
            pyautogui.moveTo(x, y, duration=0.5)
        elif action == "click":
            pyautogui.click()
        elif action == "type":
            text = params.get('text', '')
            pyautogui.write(text, interval=0.05)
        elif action == "hotkey":
            keys = params.get('keys', [])
            pyautogui.hotkey(*keys)
        else:
            return f"Unknown action: {action}"
            
        return "Action executed successfully."
    except Exception as e:
        print(f"❌ [Computer Use] Error: {e}")
        return str(e)
