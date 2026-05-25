export default function Result({ result, onReset }) {
  const matched = result.matched || result.keywords || [];
  const missing = result.missing || [];
  const score = result.score || 0;
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Excellent! 💪" : score >= 40 ? "Good — Keep Learning 📚" : "Beginner — Keep Going 🚀";
  return (
    <div style={{background:"#1e293b",borderRadius:20,padding:32}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:120,height:120,borderRadius:"50%",background:color+"22",border:"4px solid "+color,fontSize:36,fontWeight:800,color:color}}>
          {score}%
        </div>
        <h2 style={{color:"#fff",margin:"16px 0 4px"}}>{label}</h2>
        <p style={{color:"#64748b",fontSize:14}}>Domain: {result.domain}</p>
      </div>
      <div style={{marginBottom:24}}>
        <div style={{background:"#0f172a",borderRadius:99,height:12,overflow:"hidden"}}>
          <div style={{width:score+"%",height:"100%",background:color,borderRadius:99}} />
        </div>
      </div>
      <div style={{marginBottom:20}}>
        <p style={{color:"#fff",fontWeight:700,marginBottom:10}}>✅ Matched Skills ({matched.length})</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {matched.length > 0 ? matched.map(k => (
            <span key={k} style={{background:"#052e16",color:"#86efac",padding:"4px 14px",borderRadius:99,fontSize:13}}>{k}</span>
          )) : <span style={{color:"#475569",fontSize:13}}>No skills matched</span>}
        </div>
      </div>
      {missing.length > 0 && (
        <div style={{marginBottom:24}}>
          <p style={{color:"#fff",fontWeight:700,marginBottom:10}}>❌ Missing Skills ({missing.length})</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {missing.map(k => (
              <span key={k} style={{background:"#450a0a",color:"#fca5a5",padding:"4px 14px",borderRadius:99,fontSize:13}}>{k}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{background:"#0f172a",borderRadius:12,padding:16,marginBottom:20,fontSize:13,color:"#94a3b8"}}>
        💡 <strong style={{color:"#fff"}}>Tip:</strong> Add missing skills to your resume to improve your score!
      </div>
      <button onClick={onReset} style={{width:"100%",padding:14,background:"#3b82f6",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>🔄 Analyze Another Domain</button>
    </div>
  );
}
