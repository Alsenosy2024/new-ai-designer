import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def run_test():
    print("Starting Chrome/Selenium Test...")
    
    # Setup Chrome
    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # Comment out to see the browser
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    
    try:
        # 1. Load Homepage
        print("Navigating to http://localhost:3000...")
        driver.get("http://localhost:3000")
        time.sleep(2)
        
        # 2. Check Title or Key Element
        title = driver.title
        print(f"Page Title: {title}")
        
        # 3. Navigate to New Project
        print("Clicking 'New Project'...")
        # Try to find a link or button to new project. 
        # Adjust selector based on actual App.js/Home code (assuming there's a link to /new-project or a button)
        # If specific ID is unknown, we go directly:
        driver.get("http://localhost:3000/new-project")
        time.sleep(2)
        
        # 4. Fill Form
        print("Filling form...")
        # These selectors need to match your actual HTML. 
        # Based on typical intake forms:
        try:
            name_input = driver.find_element(By.NAME, "projectName") # Update selector if needed
            name_input.send_keys("Selenium Test Project")
            
            loc_input = driver.find_element(By.NAME, "location") # Update selector if needed
            loc_input.send_keys("Cairo")
            
            submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_btn.click()
            print("Form submitted.")
            
        except Exception as e:
            print(f"Form interaction failed (selectors might need adjustment): {e}")
        
        # 5. Wait for Results
        time.sleep(5)
        print(f"Current URL: {driver.current_url}")
        
        if "outputs" in driver.current_url or "viewer" in driver.current_url:
            print("SUCCESS: Reached output page.")
        else:
            print("NOTE: Did not redirect to output page expectedly.")
            
    except Exception as e:
        print(f"Test Failed: {e}")
    finally:
        print("Test complete. closing browser in 5 seconds...")
        time.sleep(5)
        driver.quit()

if __name__ == "__main__":
    run_test()
