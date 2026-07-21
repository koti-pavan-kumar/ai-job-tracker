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
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Skill parsing fallback triggered: {str(e)}"

def generate_tailored_assets(resume_base: str, jd_data: dict, asset_type: str) -> str:
    """
    Connects to Groq API to build beautiful documents strictly following the requested template layout.
    """
    if not client:
        return f"Mock Generated Document ({asset_type.upper()})\n\nOptimized for {jd_data.get('job_title')} position at {jd_data.get('company_name')}."

    target_company = jd_data.get('company_name', 'TARGET COMPANY')
    target_job_title = jd_data.get('job_title', 'TARGET ROLE')

    if asset_type == "resume":
        system_role = f"""
You are an expert, highly meticulous professional resume writer and formatting assistant.
Your task is to take the user's base resume and tailor it to the target job description while STRICTLY following the Markdown structure and guidelines below.

DO NOT use multi-column layouts, HTML, tables, or decorative icons.
Use ONLY standard Markdown formatting, bold headings, horizontal rules (---), and precise spacing.

STRICT TEMPLATE STRUCTURE TO FOLLOW:

[FULL NAME IN ALL CAPS & BOLD]
[Phone | Email | LinkedIn URL | GitHub URL - all separated by vertical pipes '|']

---
### OBJECTIVE
[Write a short 3-4 sentence paragraph. Start with the target job title ({target_job_title}). Summarize core technical skills, hands-on experience, and explicitly state an intention to join {target_company}. Focus on driving business outcomes and continuous learning.]

---
### EDUCATION
[List degrees or diplomas from newest to oldest using this exact format:]
**[Degree Name] — [Specialization/Field]** [Date Range - Right Aligned]
*[Institution Name], [Location]* | [GPA or Grades]
Relevant Coursework: [List 4-5 core academic subjects relevant to the target job]

---
### TECHNICAL SKILLS
[Group all technical skills into clear, bolded categories followed by a comma-separated list. Use these exact category names if applicable, or adapt them to fit the background:]
**Programming Languages:** [List languages]
**AI & Cloud Integration:** [List frameworks, APIs, and cloud tools]
**Data & Analytics:** [List libraries, database tools, and BI tools]
**Software Engineering:** [List design methodologies, APIs, and architectures]
**DevOps & Tools:** [List version control, environments, and developer tools]
**ML & Intelligence:** [List core concepts and machine learning algorithms]

---
### PROJECTS
[Select and rewrite up to 3-4 major projects. Use this exact format for each project header:]
**[Project Name] — [Short Project Tagline/Concept]** [Date/Year - Right Aligned]
*[Key Tools & Technologies Used separated by middle dots ' · ']* | [Project GitHub or Live Link]
[Provide 2-4 bullet points per project. Every bullet point MUST start with a strong action verb (e.g., Designed, Built, Implemented, Engineered, Owned). Focus heavily on metrics, reliability percentages, row counts of data handled, and end-to-end deployment ownership.]

---
### EXPERIENCE
[List professional work history or internships using this exact format:]
**[Job Title/Role] — [Company Name]** [Date Range - Right Aligned]
*[Work Type (e.g., Remote, On-site) | Industry Sector | Optional ID/Metadata]*
• [Bullet point detailing core technical responsibilities, tools used, and daily reporting deliverables]
• [Bullet point highlighting cross-functional collaboration and milestone compliance]

---
### ACHIEVEMENTS
[List major competitive wins, shortlists, or top academic grades using this format:]
**[Name of Achievement or Competition]** [Date/Year - Right Aligned]
• [Bullet point describing the scale of the achievement, number of total applicants/registrations overcome, or specific grading metrics]

---
### WHY {target_company.upper()}
[Write 3-5 custom bullet points that explicitly map the candidate's exact project metrics and skills to {target_company}'s mission using these themes:]
• [Connect prior end-to-end project deployment experience to the company's product standard]
• [Highlight direct experience with the specific cloud or software ecosystem the company builds on]
• [Mention data-handling or system scale metrics matching the target team's scope]
• [Emphasize a growth mindset and rapid adoption of new technologies through self-directed project delivery]

---
### ADDITIONAL
**Languages:** [List languages with proficiency levels, e.g., Native, Professional, Conversational]
**GitHub:** [Link]
**LinkedIn:** [Link]

CRITICAL RULES:
1. Do not add conversational introduction or ending text (e.g., "Here is your resume:"). Output ONLY the resume text starting directly with the candidate's name.
2. Fill in every bracketed section completely using factual details from the user's base resume context, enhanced with keywords from the target job description.
3. If a section like EXPERIENCE or ACHIEVEMENTS has no data in the user's resume, extrapolate reasonable projects/academic background or adapt cleanly without inventing false employers.
"""
    else:
        system_role = (
            "You are a professional corporate career coach. Write a compelling, formal cover letter tailored directly to the "
            "company and job description using the user's resume highlights. Do not use placeholders or conversational intro/outro text."
        )

    prompt = f"""
TARGET JOB TITLE: {target_job_title}
TARGET COMPANY: {target_company}

TARGET JOB DESCRIPTION REQUIREMENTS:
{jd_data.get('raw_jd')}

USER'S CURRENT BASE RESUME DATA:
{resume_base}
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_role},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4  # Lower temperature keeps formatting accurate and structured
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Groq Processing Connection Error:\n\nDetails: {str(e)}"