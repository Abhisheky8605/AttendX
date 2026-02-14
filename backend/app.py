from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import time
import uuid
from datetime import datetime, timedelta
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import threading

app = Flask(__name__)
CORS(app)

active_sessions = {}
SESSION_TIMEOUT = timedelta(minutes=5)


def cleanup_expired_sessions():
    while True:
        try:
            time.sleep(60)
            now = datetime.now()
            expired = [sid for sid, sess in list(active_sessions.items()) 
                      if now - sess['created_at'] > SESSION_TIMEOUT]
            
            for session_id in expired:
                try:
                    active_sessions[session_id]['driver'].quit()
                    del active_sessions[session_id]
                    print(f"🧹 Expired: {session_id[:8]}...")
                except:
                    pass
        except:
            pass


cleanup_thread = threading.Thread(target=cleanup_expired_sessions, daemon=True)
cleanup_thread.start()


@app.route('/', methods=['GET'])
def home():
    return jsonify({"name": "Attendance API", "version": "3.1 - Visible Browser"})


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "sessions": len(active_sessions)}), 200


@app.route('/api/captcha', methods=['POST'])
def get_captcha():
    driver = None
    try:
        data = request.get_json()
        roll_no = data.get('roll_no')
        
        if not roll_no:
            return jsonify({"success": False, "error": "roll_no required"}), 400
        
        print(f"\n{'='*60}")
        print(f"📸 CAPTCHA: {roll_no[:3]}***")
        
        # Non-headless mode - browser will be visible
        options = uc.ChromeOptions()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        # REMOVED: --headless flag for maximum compatibility
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--start-maximized")
        
        driver = uc.Chrome(options=options, version_main=144)
        
        wait = WebDriverWait(driver, 15)
        
        print("🌐 Loading...")
        driver.get("https://www.imsnsit.org/imsnsit/")
        time.sleep(2)
        
        print("🔗 Login...")
        login_link = wait.until(EC.element_to_be_clickable((By.PARTIAL_LINK_TEXT, "Student Login")))
        login_link.click()
        time.sleep(3)
        
        print("🔄 Frame...")
        wait.until(EC.frame_to_be_available_and_switch_to_it(0))
        
        print("📝 Roll...")
        uid_input = wait.until(EC.presence_of_element_located((By.ID, "uid")))
        uid_input.clear()
        uid_input.send_keys(roll_no)
        
        print("📸 CAPTCHA...")
        captcha_img = wait.until(EC.presence_of_element_located((By.ID, "captchaimg")))
        time.sleep(2)
        
        captcha_screenshot = captcha_img.screenshot_as_base64
        print(f"✅ Done")
        
        session_id = str(uuid.uuid4())
        
        active_sessions[session_id] = {
            'driver': driver,
            'roll_no': roll_no,
            'created_at': datetime.now()
        }
        
        print(f"✅ Session: {session_id[:8]}...")
        print(f"👁️  Browser visible - keep window open!")
        print(f"{'='*60}\n")
        
        return jsonify({
            "success": True,
            "captcha_base64": f"data:image/png;base64,{captcha_screenshot}",
            "session_id": session_id,
            "roll_no": roll_no
        }), 200
            
    except Exception as e:
        print(f"❌ Error: {e}")
        if driver:
            try:
                driver.quit()
            except:
                pass
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/attendance', methods=['POST'])
def get_attendance():
    session_id = None
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        password = data.get('password')
        captcha = data.get('captcha')
        year_idx = data.get('year', 0)
        sem_idx = data.get('semester', 0)
        
        if not all([session_id, password, captcha]):
            return jsonify({"success": False, "error": "Missing fields"}), 400
        
        session = active_sessions.get(session_id)
        if not session:
            return jsonify({"success": False, "error": "Session expired"}), 400
        
        driver = session['driver']
        roll_no = session['roll_no']
        
        print(f"\n{'='*60}")
        print(f"📊 ATTENDANCE: {roll_no[:3]}*** | {captcha}")
        print(f"👁️  Watch browser window!")
        print(f"{'='*60}")
        
        from scraper.scraper_with_driver import scrape_attendance_with_driver
        
        result = scrape_attendance_with_driver(
            driver=driver,
            password=password,
            captcha=captcha,
            year_idx=year_idx,
            semester_idx=sem_idx
        )
        
        try:
            print(f"⏸️  Browser closes in 3s...")
            time.sleep(3)
            del active_sessions[session_id]
            driver.quit()
            print(f"✅ Cleaned: {session_id[:8]}...")
        except:
            pass
        
        return jsonify(result), 200 if result.get('success') else 500
        
    except Exception as e:
        print(f"❌ Error: {e}")
        if session_id and session_id in active_sessions:
            try:
                active_sessions[session_id]['driver'].quit()
                del active_sessions[session_id]
            except:
                pass
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("🎯 ATTENDANCE API v3.1 - VISIBLE BROWSER MODE")
    print("="*60)
    print("⚠️  Browser windows will be VISIBLE")
    print("🌐 http://localhost:5001")
    print("="*60 + "\n")
    app.run(debug=True, port=5001, host='0.0.0.0')