import os
import re
from dotenv import load_dotenv
from groq import Groq

# Load environment configurations
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    
# Initialize the official Groq client
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    client = None
    print("⚠️ WARNING: GROQ_API_KEY is not defined in your environment workspace variables.")

def analyze_and_parse_jd(raw_text: str) -> str:
    """
    Extracts core skill identifiers out of job listings using Groq.
    """
    if not client:
        words = re.findall(r'\b[A-Za-z\#\+\.]{3,15}\b', raw_text)
        ignored = {'with', 'that', 'this', 'from', 'your', 'will', 'have', 'team', 'work', 'about', 'their'}
        filtered = [w.capitalize() for w in words if w.lower() not in ignored and len(w) > 4]
        return ", ".join(list(set(filtered))[:12])

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Extract a clean, comma-separated list of hard tech skills and keywords from this job posting. Do not output conversational filler."},
                {"role": "user", "content": raw_text}
            ]
        )
        # Added [0] to correctly extract from the list structure
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Skill parsing fallback triggered: {str(e)}"

def generate_tailored_assets(resume_base: str, jd_data: dict, asset_type: str) -> str:
    """
    Connects to Groq API to build beautiful documents instantly for free.
    """
    if not client:
        return f"Mock Generated Document ({asset_type.upper()})\n\nOptimized for {jd_data.get('job_title')} position at {jd_data.get('company_name')}."

    prompt = f"""
    Analyze the user's base resume context and tailor it perfectly to match the Target Job Description requirements.

    TARGET JOB TITLE: {jd_data.get('job_title')}
    TARGET COMPANY: {jd_data.get('company_name')}
    
    TARGET JOB DESCRIPTION REQUIREMENTS:
    {jd_data.get('raw_jd')}

    USER'S CURRENT BASE RESUME DATA:
    {resume_base}
    """

    if asset_type == "resume":
        system_role = (
            "You are an expert ATS optimization writer. Rewrite the user's experience sections into a highly professional, "
            "polished resume format. Weave in crucial semantic keywords and technical skills from the target description naturally. "
            "Ensure sections for Contact Info, Professional Summary, Core Competencies, Experience, and Education are crisp and clear."
        )
    else:
        system_role = (
            "You are a professional corporate career coach. Write a compelling, formal cover letter tailored directly to the "
            "company and job description using the user's resume highlights. Do not use placeholders."
        )

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_role},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        # Added [0] to correctly extract from the list structure
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq Processing Connection Error:\n\nDetails: {str(e)}"
