import requests
from bs4 import BeautifulSoup
import re
from playwright.sync_api import sync_playwright

def scrape_job_details(url: str) -> dict:
    """
    Scrapes job details. Uses Playwright headless browser for Unstop 
    to bypass strict bot protections, and standard requests for LinkedIn.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    # ----------------------------------------------------
    # 1. UNSTOP ROUTE (Uses Real Browser Emulation)
    # ----------------------------------------------------
    if "unstop.com" in url:
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                )
                page = context.new_page()
                page.goto(url, wait_until="networkidle", timeout=25000)
                html_content = page.content()
                browser.close()
            
            soup = BeautifulSoup(html_content, "html.parser")
            
            title_node = soup.find("h1") or soup.find(class_=re.compile(r"title|job-title", re.I))
            company_node = soup.find("h2") or soup.find(class_=re.compile(r"company|organisation|brand", re.I))
            desc_node = soup.find("div", id="description") or soup.find(class_=re.compile(r"description|about-opportunity", re.I))
            
            title = title_node.get_text(strip=True) if title_node else "Unknown Unstop Job"
            company = company_node.get_text(strip=True) if company_node else "Unknown Organisation"
            
            if desc_node:
                description = desc_node.get_text(separator="\n", strip=True)
            else:
                for s in soup(["script", "style", "nav", "footer"]):
                    s.decompose()
                description = soup.get_text(separator="\n", strip=True)[:1500]
                
            return {
                "company_name": company,
                "job_title": title,
                "raw_jd": description,
                "jd_url": url
            }
            
        except Exception as e:
            return {
                "company_name": "Unknown Organisation",
                "job_title": "Unknown Unstop Job",
                "raw_jd": f"Browser engine extraction error: {str(e)}",
                "jd_url": url
            }

    # ----------------------------------------------------
    # 2. LINKEDIN ROUTE 
    # ----------------------------------------------------
    elif "linkedin.com" in url:
        try:
            response = requests.get(url, headers=headers, timeout=10)
            if response.status_code != 200:
                return {"company_name": "Unknown Company", "job_title": "Unknown Title", "raw_jd": "Could not fetch data.", "jd_url": url}
            
            soup = BeautifulSoup(response.text, "html.parser")
            title_node = soup.find("h1", class_=re.compile(r"top-card-layout__title|topcard__title", re.I))
            company_node = soup.find(["a", "span"], class_=re.compile(r"top-card-layout__company-name|topcard__org-name", re.I))
            desc_node = soup.find("div", class_=re.compile(r"description__text|show-more-less-html__markup", re.I))
            
            return {
                "company_name": company_node.get_text(strip=True) if company_node else "Unknown Company",
                "job_title": title_node.get_text(strip=True) if title_node else "Unknown Title",
                "raw_jd": desc_node.get_text(separator="\n", strip=True) if desc_node else "Could not isolate description.",
                "jd_url": url
            }
        except Exception as e:
            return {"company_name": "Unknown Company", "job_title": "Unknown Title", "raw_jd": str(e), "jd_url": url}

    # ----------------------------------------------------
    # 3. GLOBAL FALLBACK ROUTE
    # ----------------------------------------------------
    else:
        return {
            "company_name": "Unknown Organisation",
            "job_title": "Unknown Job Title",
            "raw_jd": "Platform profile format not supported.",
            "jd_url": url
        }
