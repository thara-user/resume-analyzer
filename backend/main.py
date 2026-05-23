
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber, uuid
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
    "devops": ["docker","kubernetes","jenkins","terraform","ansible","aws","azure","gcp","linux","git","ci/cd","helm","prometheus","grafana","nginx","devops","bash","yaml"],
    "fullstack": ["react","nodejs","javascript","typescript","html","css","python","django","flask","fastapi","mongodb","postgresql","mysql","restapi","graphql","redux","nextjs","express"],
    "datascience": ["python","machine learning","deep learning","tensorflow","pytorch","pandas","numpy","scikit-learn","keras","nlp","computer vision","sql","tableau","powerbi","statistics","jupyter","matplotlib","data analysis"],
    "cybersecurity": ["penetration testing","ethical hacking","kali linux","wireshark","metasploit","nmap","firewall","vpn","siem","owasp","vulnerability","cryptography","network security","soc","incident response","burpsuite","oscp","ceh"],
    "mobile": ["android","ios","flutter","react native","kotlin","swift","java","dart","xcode","firebase","restapi","sqlite","play store","app store","ui/ux","jetpack compose","mvvm"],
    "java": ["java","spring","spring boot","hibernate","maven","gradle","jvm","junit","microservices","rest api","jdbc","tomcat","j2ee","multithreading","design patterns","oop","kafka","docker"],
    "uiux": ["figma","adobe xd","sketch","wireframe","prototype","user research","usability","design system","typography","color theory","interaction design","canva","invision","zeplin","accessibility","responsive design"],
    "blockchain": ["solidity","ethereum","web3","smart contracts","nft","defi","truffle","hardhat","metamask","ipfs","consensus","blockchain","cryptocurrency","bitcoin","hyperledger","chainlink"],
    "cloud": ["aws","azure","gcp","cloud","terraform","kubernetes","docker","lambda","s3","ec2","rds","cloudformation","devops","microservices","serverless","load balancer","auto scaling"],
    "frontend": ["react","vue","angular","javascript","typescript","html","css","sass","webpack","vite","tailwind","bootstrap","redux","nextjs","responsive design","figma","rest api","graphql"],
    "backend": ["nodejs","python","java","golang","rust","express","django","fastapi","spring","postgresql","mysql","mongodb","redis","kafka","rabbitmq","rest api","graphql","microservices"],
    "golang": ["golang","go","goroutine","channel","gin","echo","grpc","protobuf","docker","kubernetes","microservices","rest api","postgresql","redis","concurrency","testing"],
    "rust": ["rust","cargo","ownership","borrowing","tokio","actix","wasm","systems programming","concurrency","memory safety","cli","embedded","webassembly"],
    "ml": ["python","tensorflow","pytorch","scikit-learn","keras","pandas","numpy","machine learning","deep learning","nlp","computer vision","data science","jupyter","matplotlib","statistics"],
    "database": ["sql","postgresql","mysql","mongodb","redis","elasticsearch","cassandra","oracle","sqlite","database design","query optimization","indexing","replication","backup","data modeling"],
    "embedded": ["c","c++","arduino","raspberry pi","rtos","microcontroller","firmware","embedded linux","i2c","spi","uart","iot","sensors","pcb","arm","fpga"],
    "gamedev": ["unity","unreal engine","c#","c++","3d modeling","blender","game design","physics engine","shader","opengl","vulkan","directx","animation","multiplayer","steam sdk"],
    "qa": ["selenium","cypress","jest","pytest","junit","postman","jmeter","test automation","manual testing","api testing","load testing","bug tracking","jira","agile","bdd","tdd"],
    "product": ["product management","roadmap","user story","agile","scrum","jira","figma","data analysis","stakeholder","okr","go to market","wireframe","a/b testing","kpi","backlog"],
    "data": ["sql","python","excel","tableau","powerbi","pandas","statistics","etl","data pipeline","spark","hadoop","airflow","data warehouse","snowflake","dbt","looker","data modeling"]
}

def get_keywords_for_domain(domain_query):
    query = domain_query.lower().strip()
    for key, keywords in DOMAIN_KEYWORDS.items():
        if key in query or query in key:
            return keywords, key
    general = [w for w in query.split() if len(w) > 2]
    auto_keywords = general + [
        "python","javascript","sql","git","linux","docker",
        "communication","teamwork","problem solving","agile","rest api"
    ]
    return list(set(auto_keywords)), query

@app.get("/")
def root():
    return {"status": "Resume Analyzer API running"}

@app.get("/domains")
def get_domains():
    return [
        {"id": "devops", "label": "DevOps / Cloud", "emoji": "⚙️"},
        {"id": "fullstack", "label": "Full Stack Web Dev", "emoji": "🌐"},
        {"id": "datascience", "label": "Data Science / AI", "emoji": "🤖"},
        {"id": "cybersecurity", "label": "Cybersecurity", "emoji": "🔐"},
        {"id": "mobile", "label": "Mobile Dev", "emoji": "📱"}
    ]

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), domain: str = Form(...)):
    content = await file.read()
    try:
        with pdfplumber.open(BytesIO(content)) as pdf:
            text = " ".join(p.extract_text() or "" for p in pdf.pages)
    except Exception:
        text = ""
    text_lower = text.lower()
    keywords, matched_domain = get_keywords_for_domain(domain)
    found = [k for k in keywords if k in text_lower]
    score = round(len(found) / len(keywords) * 100) if keywords else 0
    session = str(uuid.uuid4())
    store[session] = {
        "sessionId": session,
        "domain": domain,
        "score": score,
        "matched": found,
        "missing": [k for k in keywords if k not in found],
        "filename": file.filename
    }
    return store[session]

@app.get("/results/{session_id}")
def get_result(session_id: str):
    return store.get(session_id, {"error": "not found"})

# Serve React frontend
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static/static"), name="static")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        index = "static/index.html"
        if os.path.exists(f"static/{full_path}") and full_path != "":
            return FileResponse(f"static/{full_path}")
        return FileResponse(index)
