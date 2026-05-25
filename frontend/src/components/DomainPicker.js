import { useState } from "react";

const ALL_DOMAINS = [
  {emoji:"⚙️", label:"DevOps", id:"devops"},
  {emoji:"🌐", label:"Full Stack", id:"fullstack"},
  {emoji:"🤖", label:"Data Science", id:"datascience"},
  {emoji:"🔐", label:"Cybersecurity", id:"cybersecurity"},
  {emoji:"📱", label:"Mobile Dev", id:"mobile"},
  {emoji:"☕", label:"Java Developer", id:"java"},
  {emoji:"🎨", label:"UI/UX Designer", id:"uiux"},
  {emoji:"⛓️", label:"Blockchain", id:"blockchain"},
  {emoji:"☁️", label:"Cloud Engineer", id:"cloud"},
  {emoji:"🎮", label:"Game Developer", id:"gamedev"},
  {emoji:"🧪", label:"QA Testing", id:"qa"},
  {emoji:"📊", label:"Data Analytics", id:"data"},
  {emoji:"🦀", label:"Rust Developer", id:"rust"},
  {emoji:"🐹", label:"Golang Developer", id:"golang"},
  {emoji:"🧠", label:"ML Engineer", id:"ml"},
  {emoji:"🖥️", label:"Backend Developer", id:"backend"},
  {emoji:"🖌️", label:"Frontend Developer", id:"frontend"},
  {emoji:"🗄️", label:"Database Admin", id:"database"},
  {emoji:"📡", label:"Embedded Systems", id:"embedded"},
  {emoji:"📦", label:"Product Manager", id:"product"},
];

export default function DomainPicker({ onPick }) {
  const [query, setQuery] = useState("");
  const filtered = query.trim()
    ? ALL_DOMAINS.filter(d =>
        d.label.toLowerCase().includes(query.toLowerCase()) ||
        d.id.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_DOMAINS;

  function handleGo() {
    if (!query.trim()) return;
    if (filtered.length === 1) { onPick(filtered[0]); return; }
    onPick({ id: query.trim().toLowerCase(), label: query.trim(), emoji: "🔍" });
  }

  return (
    <div>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",gap:10}}>
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGo()}
            placeholder="Search or type any domain... e.g. DevOps, UI/UX, Java"
            autoFocus
            style={{flex:1,padding:"16px 20px",fontSize:16,borderRadius:14,border:"2px solid #334155",background:"#1e293b",color:"#fff",outline:"none",boxSizing:"border-box"}}
            onFocus={e => e.target.style.borderColor="#3b82f6"}
            onBlur={e => e.target.style.borderColor="#334155"} />
          <button onClick={handleGo} disabled={!query.trim()}
            style={{padding:"16px 24px",background:query.trim()?"#3b82f6":"#334155",color:"#fff",border:"none",borderRadius:14,fontSize:15,fontWeight:700,cursor:query.trim()?"pointer":"not-allowed"}}>
            Go →
          </button>
        </div>
        {query && <p style={{color:"#64748b",fontSize:12,marginTop:6}}>{filtered.length} match — press Enter or click Go</p>}
      </div>
      <p style={{color:"#64748b",fontSize:12,marginBottom:12,textAlign:"center"}}>— or click a domain below —</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center"}}>
        {filtered.map((d,i) => (
          <button key={d.id} onClick={() => onPick(d)}
            style={{background:"#1e293b",border:"1px solid #334155",borderRadius:99,padding:"8px 16px",color:"#94a3b8",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}
            onMouseOver={e => {e.currentTarget.style.borderColor="#3b82f6";e.currentTarget.style.color="#fff";}}
            onMouseOut={e => {e.currentTarget.style.borderColor="#334155";e.currentTarget.style.color="#94a3b8";}}>
            {d.emoji} {d.label}
          </button>
        ))}
        {filtered.length === 0 && query && (
          <p style={{color:"#475569",fontSize:14,width:"100%",textAlign:"center"}}>
            No match — press <strong style={{color:"#3b82f6"}}>Go</strong> to analyze as custom domain
          </p>
        )}
      </div>
    </div>
  );
}
