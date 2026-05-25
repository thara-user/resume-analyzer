import { useState } from "react";
import DomainPicker from "./components/DomainPicker";
import Analyzer from "./components/Analyzer";
import Result from "./components/Result";

const API = "https://resume-analyzer-sr56.onrender.com";

export default function App() {
  const [domain, setDomain] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function analyze(file) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("domain", domain.id);
      const res = await fetch(API + "/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      setResult(data);
    } catch(e) {
      setError("Cannot connect to backend: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setDomain(null);
    setResult(null);
    setError(null);
  }

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a,#1e293b)",fontFamily:"Segoe UI,sans-serif",padding:"40px 20px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{fontSize:56,marginBottom:12}}>📄</div>
          <h1 style={{color:"#fff",fontSize:32,fontWeight:800,margin:0}}>Resume Analyzer</h1>
          <p style={{color:"#94a3b8",marginTop:8,fontSize:15}}>Type any domain and upload your resume to get your skill score</p>
        </div>
        {!domain && !result && <DomainPicker onPick={setDomain} />}
        {domain && !result && <Analyzer domain={domain} onAnalyze={analyze} loading={loading} error={error} onBack={reset} />}
        {result && <Result result={result} onReset={reset} />}
      </div>
    </div>
  );
}
