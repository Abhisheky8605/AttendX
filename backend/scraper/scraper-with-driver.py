"""
Final working scraper - combines all successful fixes
"""
import time
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from .utils import find_and_expand_tree_node, find_and_click_link, extract_attendance_table_enhanced


def scrape_attendance_with_driver(driver, password, captcha, year_idx=0, semester_idx=0):
    """
    Continue scraping with existing driver session
    """
    try:
        print("🔐 Continuing login...")
        
        wait = WebDriverWait(driver, 20)
        
        # STEP 1: Ensure in login frame
        try:
            print("🔄 Switching to login frame...")
            driver.switch_to.default_content()
            wait.until(EC.frame_to_be_available_and_switch_to_it(0))
            print("✅ In login frame")
            
            uid_field = driver.find_element(By.ID, "uid")
            print(f"✅ UID: {uid_field.get_attribute('value')[:3]}***")
            
        except Exception as e:
            return {'success': False, 'error': f'Frame error: {str(e)}'}
        
        # STEP 2: Fill password
        try:
            print("📝 Filling password...")
            pwd_input = wait.until(EC.presence_of_element_located((By.ID, "pwd")))
            pwd_input.clear()
            time.sleep(0.5)
            pwd_input.send_keys(password)
            time.sleep(0.5)
            print(f"✅ Password entered ({len(password)} chars)")
            
        except Exception as e:
            return {'success': False, 'error': f'Password error: {str(e)}'}
        
        # STEP 3: Fill CAPTCHA
        try:
            print(f"🔤 Filling CAPTCHA: {captcha}")
            captcha_input = driver.find_element(By.ID, "cap")
            captcha_input.clear()
            time.sleep(0.5)
            captcha_input.send_keys(captcha)
            time.sleep(0.5)
            print("✅ CAPTCHA entered")
                
        except Exception as e:
            return {'success': False, 'error': f'CAPTCHA error: {str(e)}'}
        
        # STEP 4: Submit form
        try:
            print("🚀 Submitting form...")
            submit_btn = driver.find_element(By.NAME, "login")
            submit_btn.click()
            print("✅ Submitted, waiting...")
            time.sleep(6)
            
        except Exception as e:
            return {'success': False, 'error': f'Submit error: {str(e)}'}
        
        # STEP 5: Verify login
        print("🔍 Verifying login...")
        driver.switch_to.default_content()
        time.sleep(2)
        
        current_url = driver.current_url
        print(f"📍 URL: {current_url}")
        
        # Check if on student.htm (logged in page)
        if "student.htm" in current_url:
            print("✅ LOGIN SUCCESSFUL!")
        else:
            return {'success': False, 'error': 'Login failed - wrong page'}
        
        # STEP 6: Navigate to My Activities
        print("📚 Navigating to My Activities...")
        time.sleep(3)
        
        # Find My Activities link
        activities_found = False
        for frame_name in ['top', 'contents', 'data', 'banner']:
            try:
                driver.switch_to.default_content()
                driver.switch_to.frame(frame_name)
                links = driver.find_elements(By.TAG_NAME, "a")
                for link in links:
                    if 'activit' in link.text.lower():
                        print(f"✅ Found My Activities in '{frame_name}'")
                        link.click()
                        activities_found = True
                        break
                if activities_found:
                    break
            except:
                continue
        
        if not activities_found:
            return {'success': False, 'error': 'Could not find My Activities'}
        
        driver.switch_to.default_content()
        time.sleep(3)
        
        # STEP 7: Navigate to Attendance
        print("📖 Looking for Attendance...")
        find_and_expand_tree_node(driver, ['Attendance'])
        time.sleep(2)
        
        if not find_and_click_link(driver, ['My Attendance'], exact_match=True):
            return {'success': False, 'error': 'Could not find My Attendance'}
        
        print("✅ Clicked My Attendance")
        time.sleep(5)
        
        # STEP 8: Select Year and Semester
        print(f"📅 Selecting Year (index {year_idx}) and Semester (index {semester_idx})...")
        
        year_selected = False
        semester_selected = False
        submit_clicked = False
        
        for frame_name in ['data', 'contents', 'bottom', 'top']:
            try:
                driver.switch_to.default_content()
                driver.switch_to.frame(frame_name)
                
                selects = driver.find_elements(By.TAG_NAME, "select")
                print(f"🔍 Found {len(selects)} dropdowns in '{frame_name}' frame")
                
                for idx, select_elem in enumerate(selects):
                    try:
                        select = Select(select_elem)
                        select_name = (select_elem.get_attribute("name") or 
                                     select_elem.get_attribute("id") or "").lower()
                        
                        print(f"  Dropdown {idx}: name='{select_name}', options={len(select.options)}")
                        
                        # Try to select Year - check multiple possible names
                        if not year_selected:
                            # Check if this dropdown might be the year dropdown
                            if any(k in select_name for k in ['year', 'yr', 'academic', 'session']):
                                # IMPORTANT: Check if first option is blank/placeholder
                                first_option_value = select.options[0].get_attribute('value') if len(select.options) > 0 else ""
                                
                                # If first option is blank, adjust index
                                actual_year_idx = year_idx
                                if first_option_value == "" or "select" in select.options[0].text.lower():
                                    actual_year_idx = year_idx + 1  # Skip the blank option
                                    print(f"  📌 First option is blank, using index {actual_year_idx} instead of {year_idx}")
                                
                                if actual_year_idx < len(select.options):
                                    select.select_by_index(actual_year_idx)
                                    print(f"✅ Year selected (index {actual_year_idx}): {select.options[actual_year_idx].text}")
                                    year_selected = True
                                    time.sleep(1)
                                else:
                                    print(f"⚠️  Year index {actual_year_idx} out of range (max: {len(select.options)-1})")
                            # If first dropdown and still no year, assume it's year
                            elif idx == 0 and not year_selected and not semester_selected:
                                # Check for blank first option
                                first_option_value = select.options[0].get_attribute('value') if len(select.options) > 0 else ""
                                actual_year_idx = year_idx
                                if first_option_value == "" or "select" in select.options[0].text.lower():
                                    actual_year_idx = year_idx + 1
                                    print(f"  📌 First option is blank, using index {actual_year_idx}")
                                
                                if actual_year_idx < len(select.options):
                                    select.select_by_index(actual_year_idx)
                                    print(f"✅ Year selected (dropdown 0, index {actual_year_idx}): {select.options[actual_year_idx].text}")
                                    year_selected = True
                                    time.sleep(1)
                        
                        # Try to select Semester
                        elif not semester_selected:
                            # Check if this dropdown might be the semester dropdown
                            if any(k in select_name for k in ['sem', 'semester', 'term', 'part']):
                                # Check if first option is blank
                                first_option_value = select.options[0].get_attribute('value') if len(select.options) > 0 else ""
                                actual_sem_idx = semester_idx
                                if first_option_value == "" or "select" in select.options[0].text.lower():
                                    actual_sem_idx = semester_idx + 1
                                    print(f"  📌 First semester option is blank, using index {actual_sem_idx}")
                                
                                if actual_sem_idx < len(select.options):
                                    select.select_by_index(actual_sem_idx)
                                    print(f"✅ Semester selected (index {actual_sem_idx}): {select.options[actual_sem_idx].text}")
                                    semester_selected = True
                                    time.sleep(1)
                            # If second dropdown and year already selected, assume it's semester
                            elif year_selected and not semester_selected:
                                # Check for blank first option
                                first_option_value = select.options[0].get_attribute('value') if len(select.options) > 0 else ""
                                actual_sem_idx = semester_idx
                                if first_option_value == "" or "select" in select.options[0].text.lower():
                                    actual_sem_idx = semester_idx + 1
                                    print(f"  📌 First semester option is blank, using index {actual_sem_idx}")
                                
                                if actual_sem_idx < len(select.options):
                                    select.select_by_index(actual_sem_idx)
                                    print(f"✅ Semester selected (dropdown {idx}, index {actual_sem_idx}): {select.options[actual_sem_idx].text}")
                                    semester_selected = True
                                    time.sleep(1)
                    except Exception as e:
                        print(f"⚠️  Error with dropdown {idx}: {e}")
                        continue
                
                if year_selected and semester_selected:
                    # Find submit button - SKIP PDF buttons!
                    print("🔍 Looking for submit button...")
                    buttons = driver.find_elements(By.TAG_NAME, "input") + \
                             driver.find_elements(By.TAG_NAME, "button")
                    
                    for button in buttons:
                        try:
                            button_type = (button.get_attribute("type") or "").lower()
                            button_value = (button.get_attribute("value") or "").lower()
                            button_name = (button.get_attribute("name") or "").lower()
                            
                            # CRITICAL: Skip PDF/Download buttons
                            if any(skip in button_value for skip in ['pdf', 'download', 'export', 'print']):
                                print(f"  ⏭️  Skipping: {button_value}")
                                continue
                            
                            if any(skip in button_name for skip in ['pdf', 'mpdfx', 'download']):
                                print(f"  ⏭️  Skipping: name={button_name}")
                                continue
                            
                            # Click ONLY submit buttons
                            if button_type == "submit" and "submit" in button_name:
                                print(f"✅ Clicking submit button: name='{button_name}'")
                                button.click()
                                submit_clicked = True
                                time.sleep(5)
                                break
                        except Exception as e:
                            print(f"⚠️  Error with button: {e}")
                            continue
                    
                    if submit_clicked:
                        break
                    else:
                        print(f"⚠️  No valid submit button found in '{frame_name}'")
                        
            except Exception as e:
                print(f"⚠️  Error in frame '{frame_name}': {e}")
                continue
        
        if not year_selected:
            print("❌ Year not selected!")
        if not semester_selected:
            print("❌ Semester not selected!")
        if not submit_clicked:
            print("⚠️  WARNING: Submit button was not clicked!")
            
        if not year_selected or not semester_selected:
            return {'success': False, 'error': 'Could not select year/semester'}
        
        # STEP 9: Extract attendance
        print("📊 Extracting attendance data...")
        
        all_attendance = []
        
        for frame_name in ['data', 'contents', 'bottom', 'top']:
            try:
                driver.switch_to.default_content()
                driver.switch_to.frame(frame_name)
                
                html = driver.page_source
                
                if 'attend' in html.lower() and len(html) > 500:
                    print(f"✅ Found data in '{frame_name}'")
                    
                    # Production mode - debug disabled
                    attendance_rows = extract_attendance_table_enhanced(html, debug=False)
                    
                    if attendance_rows:
                        all_attendance.extend(attendance_rows)
                        print(f"✅ Extracted {len(attendance_rows)} subjects")
            except:
                continue
        
        driver.switch_to.default_content()
        
        if not all_attendance:
            return {'success': False, 'error': 'No attendance data found'}
        
        print(f"🎉 Success! {len(all_attendance)} subjects")
        
        return {
            'success': True,
            'data': all_attendance,
            'total_subjects': len(all_attendance)
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        
        return {'success': False, 'error': f'Error: {str(e)}'}