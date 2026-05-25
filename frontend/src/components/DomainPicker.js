import { useState } from "react";

const SUGGESTIONS = [
  {emoji:"⚙️", label:"DevOps"},
  {emoji:"🌐", label:"Full Stack"},
  {emoji:"🤖", label:"Data Science"},
  {emoji:"🔐", label:"Cybersecurity"},
  {emoji:"📱", label:"Mobile Dev"},
  {emoji:"☕", label:"Java"},
  {emoji:"🎨", label:"UI/UX"},
  {emoji:"⛓️", label:"Blockchain"},
  {emoji:"☁️", label:"Cloud"},
  {emoji:"🎮", label:"Game Dev"},
  {emoji:"🧪", label:"QA Testing"},
  {emoji:"📊", label:"Data Analytics"},
  {emoji:"🦀", label:"Rust"},
  {emoji:"🐹", label:"Golang"},
  {emoji:"🤖", label:"ML Engineer"},
];

export default function DomainPicker({ onPick }) {
  const [query, setQuery] = useState("");

  function handleGo() {
    if (!query.trim()) return;
    onPick({ id: query.trim().toLowerCase(), label: query.trim(), emoji: "🔍" });
  }

  function handleKey(e) {
    if (e.key === "Enter") handleGo();
  }

  return (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{display:"flex",gap:10}}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type any domain... e.g. Java, UI/UX, Blockchain, DevOps"
            autoFocus
            style={{flex:1,padding:"16px 20px",fontSize:16,borderRadius:14,border:"2px solid #334155",background:"#1e293b",color:"#fff",outline:"none",boxSizing:"border-box"}}
            onFocus={e => e.target.style.borderColor="#3b82f6"}
            onBlur={e => e.target.style.borderColor="#334155"}
          />
          <button onClick={handleGo} disabled={!query.trim()}
            style={{padding:"16px 24px",background:query.trim()?"#3b82f6":"#334155",color:"#fff",border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:query.trim()?"pointer":"not-allowed"}}>
            Go
          </button>
        </div>
        <p style={{color:"#475569",fontSize:12,marginTop:8}}>Press Enter or click Go — works with ANY domain name</p>
      </div>
      <p style={{color:"#64748b",fontSize:13,marginBottom:12,textAlign:"center"}}>— or pick a popular one —</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
        {SUGGESTIONS.map((s,i) => (
          <button key={i}
            onClick={() => onPick({ id: s.label.toLowerCase(), label: s.label, emoji: s.emoji })}
            style={{background:"#1e293b",border:"1px solid #334155",borderRadius:99,padding:"8px 16px",color:"#94a3b8",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
            onMouseOver={e => {e.currentTarget.style.borderColor="#3b82f6";e.currentTarget.style.color="#fff";}}
            onMouseOut={e => {e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#94a3b8";}}>
            {s.emoji} {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
