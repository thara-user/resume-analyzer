export default function Result({ result, onReset }) {
  if (!result) return null;
  const matched = Array.isArray(result.matched) ? result.matched : [];
  const missing = Array.isArray(result.missing) ? result.missing : [];
  const skill   = result.skillScore || result.score || 0;
  const ats     = result.atsScore || 0;
  const overall = result.overallScore || result.score || skill;
  const bd      = result.atsBreakdown || {};

  const getColor = s => s >= 70 ? "#22c55e" : s >= 40 ? "#f59e0b" : "#ef4444";
  const getLabel = s => s >= 70 ? "Excellent! 💪" : s >= 40 ? "Good — Keep Learning 📚" : "Beginner — Keep Going 🚀";

  function Bar({ label, value, max }) {
    const pct = max > 0 ? Math.round(value/max*100) : 0;
    return (
      <div style={{marginBottom:10}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#94a3b8",marginBottom:4}}>
          <span>{label}</span><span>{value}/{max}</span>
        </div>
        <div style={{background:"#1e293b",borderRadius:99,height:8,overflow:"hidden"}}>
          <div style={{width:pct+"%",height:"100%",background:getColor(pct),borderRadius:99}} />
        </div>
      </div>
    );
  }

  return (
    <div style={{background:"#1e293b",borderRadius:20,padding:32}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:130,height:130,borderRadius:"50%",background:getColor(overall)+"22",border:"4px solid "+getColor(overall),fontSize:38,fontWeight:800,color:getColor(overall)}}>
          {overall}%
        </div>
        <h2 style={{color:"#fff",margin:"12px 0 4px"}}>{getLabel(overall)}</h2>
        <p style={{color:"#64748b",fontSize:13}}>Domain: {result.domain}</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <div style={{background:"#0f172a",borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:90,height:90,borderRadius:"50%",background:getColor(skill)+"22",border:"3px solid "+getColor(skill),fontSize:24,fontWeight:800,color:getColor(skill)}}>{skill}%</div>
          <p style={{color:"#94a3b8",fontSize:12,marginTop:6}}>Skill Match</p>
        </div>
        <div style={{background:"#0f172a",borderRadius:14,padding:16,textAlign:"center"}}>
          <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:90,height:90,borderRadius:"50%",background:getColor(ats)+"22",border:"3px solid "+getColor(ats),fontSize:24,fontWeight:800,color:getColor(ats)}}>{ats}%</div>
          <p style={{color:"#94a3b8",fontSize:12,marginTop:6}}>ATS Score</p>
        </div>
      </div>

      {Object.keys(bd).length > 0 && (
        <div style={{background:"#0f172a",borderRadius:14,padding:16,marginBottom:20}}>
          <p style={{color:"#fff",fontWeight:700,marginBottom:14,fontSize:14}}>📊 ATS Breakdown</p>
          <Bar label="📞 Contact Info" value={bd.contact_info||0} max={15} />
          <Bar label="📄 Sections" value={bd.sections||0} max={25} />
          <Bar label="🎓 Education" value={bd.education||0} max={15} />
          <Bar label="💼 Experience" value={bd.experience||0} max={20} />
          <Bar label="📐 Format" value={bd.format||0} max={15} />
          <Bar label="🏆 Extras" value={bd.extras||0} max={10} />
        </div>
      )}

      <div style={{marginBottom:16}}>
        <p style={{color:"#fff",fontWeight:700,marginBottom:10}}>✅ Matched Skills ({matched.length})</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {matched.length > 0 ? matched.map((k,i) => (
            <span key={i} style={{background:"#052e16",color:"#86efac",padding:"4px 14px",borderRadius:99,fontSize:13}}>{k}</span>
          )) : <span style={{color:"#475569",fontSize:13}}>No skills matched</span>}
        </div>
      </div>

      {missing.length > 0 && (
        <div style={{marginBottom:20}}>
          <p style={{color:"#fff",fontWeight:700,marginBottom:10}}>❌ Missing Skills ({missing.length})</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {missing.map((k,i) => (
              <span key={i} style={{background:"#450a0a",color:"#fca5a5",padding:"4px 14px",borderRadius:99,fontSize:13}}>{k}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{background:"#0f172a",borderRadius:12,padding:16,marginBottom:20,fontSize:13,color:"#94a3b8"}}>
        💡 <strong style={{color:"#fff"}}>Tip:</strong> Add missing skills to your resume to improve your score!
      </div>

      <button onClick={onReset} style={{width:"100%",padding:14,background:"#3b82f6",color:"#fff",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer"}}>
        🔄 Analyze Another Domain
      </button>
    </div>
  );
}
