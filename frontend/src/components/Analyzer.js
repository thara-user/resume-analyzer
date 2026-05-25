import { useState } from "react";
export default function Analyzer({ domain, onAnalyze, loading, error, onBack }) {
  const [file, setFile] = useState(null);
  return (
    <div style={{background:"#1e293b",borderRadius:20,padding:32}}>
      <button onClick={onBack} style={{background:"transparent",border:"none",color:"#64748b",cursor:"pointer",fontSize:14,marginBottom:20}}>← Back</button>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:48}}>{domain.emoji}</div>
        <h2 style={{color:"#fff",margin:"8px 0 4px"}}>{domain.label}</h2>
        <p style={{color:"#64748b",fontSize:14}}>Upload your resume PDF</p>
      </div>
      <div style={{border:"2px dashed "+(file ? "#22c55e" : "#334155"),borderRadius:12,padding:32,textAlign:"center",background:file ? "#052e16" : "#0f172a",marginBottom:20}}>
        <div style={{fontSize:40,marginBottom:8}}>📄</div>
        <input type="file" accept=".pdf" id="fi" style={{display:"none"}} onChange={e => setFile(e.target.files[0])} />
        <label htmlFor="fi" style={{cursor:"pointer",color:"#3b82f6",fontWeight:600,fontSize:15}}>
          {file ? "✅ " + file.name : "Click to select PDF"}
        </label>
        {!file && <p style={{color:"#475569",fontSize:12,marginTop:6}}>Only .pdf files</p>}
      </div>
      <button onClick={() => file && onAnalyze(file)} disabled={loading || !file}
        style={{width:"100%",padding:16,background:loading || !file ? "#334155" : "#3b82f6",color:"#fff",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:loading || !file ? "not-allowed" : "pointer"}}>
        {loading ? "⏳ Analyzing..." : "🔍 Analyze Resume"}
      </button>
      {error && <div style={{marginTop:16,padding:12,background:"#450a0a",borderRadius:10,color:"#fca5a5",fontSize:13}}>❌ {error}</div>}
    </div>
  );
}
