from playwright.sync_api import sync_playwright

def run_browser_task(url, action_prompt):
    print(f"🌐 [Browser Use] Navigating to {url} for task: {action_prompt}")
    try:
        with sync_playwright() as p:
            # Launch Chromium (headless=False so the user can see it during YOLO mode)
            browser = p.chromium.launch(headless=False)
            page = browser.new_page()
            page.goto(url)
            print("🌐 [Browser Use] Page loaded.")
            
            # TODO: Future ML integration -> Agent uses DOM / Accessibility tree to find elements based on action_prompt
            # For now, it just opens the page as a proof of concept.
            page.wait_for_timeout(3000) # Wait 3 seconds
            
            browser.close()
        return f"Successfully opened {url} and evaluated '{action_prompt}'"
    except Exception as e:
        print(f"❌ [Browser Use] Error: {e}")
        return str(e)
