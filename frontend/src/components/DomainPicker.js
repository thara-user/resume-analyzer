export default function DomainPicker({ domains, onPick }) {
  const colors = ["#3b82f6","#8b5cf6","#ec4899","#f59e0b","#10b981"];
  return (
    <div>
      <h2 style={{color:"#fff",textAlign:"center",marginBottom:24,fontSize:20}}>Select Your Domain</h2>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {domains.map((d,i) => (
          <button key={d.id} onClick={() => onPick(d)}
            style={{background:"#1e293b",border:"2px solid "+colors[i%colors.length]+"55",borderRadius:16,padding:"28px 16px",cursor:"pointer",textAlign:"center",color:"#fff",width:"100%"}}
            onMouseOver={e => e.currentTarget.style.transform="scale(1.03)"}
            onMouseOut={e => e.currentTarget.style.transform="scale(1)"}>
            <div style={{fontSize:44,marginBottom:10}}>{d.emoji}</div>
            <div style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>{d.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
