from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pdfplumber, uuid, os, re
from io import BytesIO

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

store = {}

DOMAIN_KEYWORDS = {
    "devops":       ["docker","kubernetes","jenkins","terraform","ansible","aws","azure","gcp","linux","git","ci/cd","helm","prometheus","grafana","nginx","devops","bash","yaml"],
    "fullstack":    ["react","nodejs","javascript","typescript","html","css","python","django","flask","fastapi","mongodb","postgresql","mysql","rest api","graphql","redux","nextjs","express"],
    "datascience":  ["python","machine learning","deep learning","tensorflow","pytorch","pandas","numpy","scikit-learn","keras","nlp","computer vision","sql","tableau","powerbi","statistics","jupyter","matplotlib"],
    "cybersecurity":["penetration testing","ethical hacking","kali linux","wireshark","metasploit","nmap","firewall","vpn","siem","owasp","vulnerability","cryptography","network security","soc","incident response","burpsuite","ceh"],
    "mobile":       ["android","ios","flutter","react native","kotlin","swift","java","dart","xcode","firebase","sqlite","play store","app store","jetpack compose","mvvm","retrofit","room database"],
    "java":         ["java","spring","spring boot","hibernate","maven","gradle","jvm","junit","microservices","rest api","jdbc","tomcat","multithreading","design patterns","kafka","solid principles"],
    "uiux":         ["figma","adobe xd","sketch","wireframe","prototype","user research","usability testing","design system","typography","color theory","interaction design","canva","invision","zeplin","accessibility","ux writing","user persona","information architecture"],
    "blockchain":   ["solidity","ethereum","web3","smart contracts","nft","defi","truffle","hardhat","metamask","ipfs","blockchain","cryptocurrency","bitcoin","hyperledger","chainlink","rust","consensus mechanism"],
    "cloud":        ["aws","azure","gcp","terraform","kubernetes","docker","lambda","s3","ec2","rds","cloudformation","devops","serverless","load balancer","auto scaling","vpc","iam","cloudwatch"],
    "frontend":     ["react","vue","angular","javascript","typescript","html","css","sass","webpack","vite","tailwind","bootstrap","redux","nextjs","responsive design","figma","graphql","accessibility"],
    "backend":      ["nodejs","python","java","golang","express","django","fastapi","spring","postgresql","mysql","mongodb","redis","kafka","rest api","graphql","microservices","docker","authentication"],
    "golang":       ["golang","go","goroutine","channel","gin","echo","grpc","protobuf","docker","kubernetes","microservices","rest api","postgresql","redis","concurrency","unit testing"],
    "ml":           ["python","tensorflow","pytorch","scikit-learn","keras","pandas","numpy","machine learning","deep learning","nlp","computer vision","jupyter","matplotlib","feature engineering","model deployment"],
    "database":     ["sql","postgresql","mysql","mongodb","redis","elasticsearch","cassandra","oracle","sqlite","database design","query optimization","indexing","replication","data modeling","stored procedures"],
    "gamedev":      ["unity","unreal engine","c#","c++","3d modeling","blender","game design","physics engine","shader","opengl","animation","multiplayer","steam","game mechanics","level design"],
    "qa":           ["selenium","cypress","jest","pytest","junit","postman","jmeter","test automation","manual testing","api testing","load testing","bug tracking","jira","bdd","tdd","test cases"],
    "product":      ["product management","roadmap","user story","agile","scrum","jira","figma","data analysis","stakeholder","okr","go to market","a/b testing","kpi","backlog","product strategy"],
    "data":         ["sql","python","excel","tableau","powerbi","pandas","statistics","etl","data pipeline","spark","airflow","data warehouse","snowflake","dbt","data modeling","looker","databricks"],
    "embedded":     ["c","c++","arduino","raspberry pi","rtos","microcontroller","firmware","embedded linux","i2c","spi","uart","iot","arm","fpga","oscilloscope","pcb design"],
    "rust":         ["rust","cargo","ownership","borrowing","tokio","actix","webassembly","systems programming","concurrency","memory safety","cli","embedded","async","trait","lifetime"],
}

def get_keywords(domain_query):
    query = domain_query.lower().strip()
    for key, keywords in DOMAIN_KEYWORDS.items():
        if key in query or query in key:
            return keywords, key
    words = [w for w in query.split() if len(w) > 3]
    base = ["communication","teamwork","problem solving","agile","leadership","project management"]
    return list(set(words + base)), query

def calculate_ats_score(text):
    text_lower = text.lower()
    scores = {}

    # 1. Contact info (15 points)
    contact = 0
    if re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text): contact += 5
    if re.search(r'(\+?\d[\d\s\-().]{7,})', text): contact += 5
    if re.search(r'linkedin\.com|github\.com|portfolio|website', text_lower): contact += 5
    scores['contact_info'] = contact

    # 2. Resume sections (25 points)
    sections = 0
    if re.search(r'education|qualification|academic', text_lower): sections += 5
    if re.search(r'experience|employment|work history|internship', text_lower): sections += 8
    if re.search(r'skills|technologies|tools|competencies', text_lower): sections += 7
    if re.search(r'project|portfolio|achievement', text_lower): sections += 5
    scores['sections'] = sections

    # 3. Education (15 points)
    education = 0
    if re.search(r'bachelor|master|phd|degree|b\.?e|b\.?tech|m\.?tech|mba|b\.?sc|m\.?sc', text_lower): education += 8
    if re.search(r'university|college|institute|school', text_lower): education += 4
    if re.search(r'cgpa|gpa|percentage|grade|\d+\.\d+', text_lower): education += 3
    scores['education'] = education

    # 4. Experience (20 points)
    experience = 0
    if re.search(r'\d+\+?\s*(year|yr|month)', text_lower): experience += 8
    if re.search(r'(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december).{1,10}\d{4}', text_lower): experience += 7
    if re.search(r'developed|built|designed|implemented|managed|led|created|improved|deployed', text_lower): experience += 5
    scores['experience'] = experience

    # 5. Format quality (15 points)
    format_score = 0
    word_count = len(text.split())
    if 300 <= word_count <= 1000: format_score += 8
    elif word_count > 100: format_score += 4
    lines = text.split('
')
    non_empty = [l for l in lines if l.strip()]
    if len(non_empty) > 10: format_score += 4
    if re.search(r'summary|objective|profile|about', text_lower): format_score += 3
    scores['format'] = format_score

    # 6. Certifications & extras (10 points)
    extras = 0
    if re.search(r'certif|certified|aws|google|microsoft|oracle|cisco|comptia', text_lower): extras += 5
    if re.search(r'award|honor|publication|volunteer|language|hobby', text_lower): extras += 3
    if re.search(r'github\.com|leetcode|hackerrank|kaggle', text_lower): extras += 2
    scores['extras'] = extras

    total = sum(scores.values())
    return total, scores

@app.get("/api/health")
def health():
    return {"status": "Resume Analyzer API running"}

@app.get("/api/domains")
def get_domains():
    return [
        {"id":"devops","label":"DevOps / Cloud","emoji":"⚙️"},
        {"id":"fullstack","label":"Full Stack Web Dev","emoji":"🌐"},
        {"id":"datascience","label":"Data Science / AI","emoji":"🤖"},
        {"id":"cybersecurity","label":"Cybersecurity","emoji":"🔐"},
        {"id":"mobile","label":"Mobile Dev","emoji":"📱"},
        {"id":"java","label":"Java Developer","emoji":"☕"},
        {"id":"uiux","label":"UI/UX Designer","emoji":"🎨"},
        {"id":"blockchain","label":"Blockchain","emoji":"⛓️"},
        {"id":"cloud","label":"Cloud Engineer","emoji":"☁️"},
        {"id":"gamedev","label":"Game Developer","emoji":"🎮"},
        {"id":"qa","label":"QA Testing","emoji":"🧪"},
        {"id":"data","label":"Data Analytics","emoji":"📊"},
        {"id":"rust","label":"Rust Developer","emoji":"🦀"},
        {"id":"golang","label":"Golang Developer","emoji":"🐹"},
        {"id":"ml","label":"ML Engineer","emoji":"🧠"},
        {"id":"backend","label":"Backend Developer","emoji":"🖥️"},
        {"id":"frontend","label":"Frontend Developer","emoji":"🖌️"},
        {"id":"database","label":"Database Admin","emoji":"🗄️"},
        {"id":"embedded","label":"Embedded Systems","emoji":"📡"},
        {"id":"product","label":"Product Manager","emoji":"📦"},
    ]

@app.post("/api/analyze")
async def analyze(file: UploadFile = File(...), domain: str = Form(...)):
    content = await file.read()
    try:
        with pdfplumber.open(BytesIO(content)) as pdf:
            text = " ".join(p.extract_text() or "" for p in pdf.pages)
    except Exception:
        text = ""
    text_lower = text.lower()
    keywords, matched_domain = get_keywords(domain)
    found   = [k for k in keywords if k in text_lower]
    missing = [k for k in keywords if k not in text_lower]
    skill_score = round(len(found) / len(keywords) * 100) if keywords else 0
    ats_score, ats_breakdown = calculate_ats_score(text)
    overall = round((skill_score * 0.5) + (ats_score * 0.5))
    session = str(uuid.uuid4())
    store[session] = {
        "sessionId":    session,
        "domain":       domain,
        "skillScore":   skill_score,
        "atsScore":     ats_score,
        "overallScore": overall,
        "matched":      found,
        "missing":      missing,
        "atsBreakdown": ats_breakdown,
        "filename":     file.filename
    }
    return store[session]

@app.get("/api/results/{session_id}")
def get_result(session_id: str):
    return store.get(session_id, {"error": "not found"})

if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static/static"), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "not found"}
        file_path = f"static/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("static/index.html")
