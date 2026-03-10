"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { Agent, fetchAgents, fetchLanguages, fetchStats, Stats } from "@/lib/supabase"
const CATS:Record<string,{label:string;color:string}>={orchestration:{label:"Orchestration",color:"#00ff88"},research:{label:"Research",color:"#00e5ff"},coding:{label:"Coding",color:"#a855f7"},knowledge:{label:"Knowledge",color:"#ff9500"},assistant:{label:"Assistant",color:"#ff3cac"},multimodal:{label:"Multimodal",color:"#fbbf24"},automation:{label:"Automation",color:"#34d399"},finance:{label:"Finance",color:"#6ee7b7"},devops:{label:"DevOps",color:"#93c5fd"},data:{label:"Data",color:"#f472b6"},general:{label:"General",color:"#8899aa"}}
const SOURCES=[{key:"all",label:"Toutes"},{key:"github",label:"GitHub"},{key:"huggingface",label:"HuggingFace"},{key:"pypi",label:"PyPI"},{key:"npm",label:"npm"},{key:"arxiv",label:"Arxiv"}]
const PG=60
const fmt=(n?:number)=>!n?"0":n>=1000?(n/1000).toFixed(1)+"k":String(n)
function Card({a,i}:{a:Agent;i:number}){
  const cat=CATS[a.category]??CATS.general;const[hov,setHov]=useState(false)
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>window.open(a.url,"_blank")} style={{background:hov?"#0d0f1a":"#07090f",border:`1px solid ${hov?cat.color+"55":"#161828"}`,borderRadius:7,padding:"1rem 1.1rem",cursor:"pointer",display:"flex",flexDirection:"column",gap:".4rem",transition:"all .18s",transform:hov?"translateY(-3px)":"none",boxShadow:hov?`0 8px 28px ${cat.color}15`:"none",animation:`fadeUp .35s ease ${Math.min(i,20)*.025}s both`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:".4rem"}}>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:".6rem",fontFamily:"monospace",color:"#2e3148",marginBottom:1}}>{a.owner}/</div><div style={{fontWeight:700,fontSize:".9rem",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</div></div>
      <div style={{background:cat.color+"18",color:cat.color,fontSize:".55rem",fontFamily:"monospace",padding:".17rem .48rem",borderRadius:3,border:`1px solid ${cat.color}30`,whiteSpace:"nowrap",flexShrink:0,letterSpacing:".1em",textTransform:"uppercase"}}>{cat.label}</div>
    </div>
    <div style={{fontSize:".75rem",color:"#4a4e68",lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",minHeight:"2.3rem"}}>{a.description||"Pas de description."}</div>
    <div style={{display:"flex",alignItems:"center",gap:".6rem"}}>
      <span style={{fontSize:".67rem",fontFamily:"monospace",color:"#4a4e68"}}>★ {fmt(a.stars)}</span>
      <span style={{fontSize:".67rem",fontFamily:"monospace",color:"#4a4e68"}}>⑂ {fmt(a.forks)}</span>
      {a.language&&<span style={{fontSize:".59rem",fontFamily:"monospace",background:"#0e1020",color:"#222438",padding:".1rem .38rem",borderRadius:2}}>{a.language}</span>}
      <span style={{marginLeft:"auto",fontSize:".64rem",fontFamily:"monospace",fontWeight:700,color:cat.color}}>{a.score?.toFixed(0)}</span>
    </div>
  </div>)
}
function AIPanel({onClose}:{onClose:()=>void}){
  const[q,setQ]=useState("");const[msgs,setMsgs]=useState<{role:string;text:string}[]>([]);const[loading,setLoading]=useState(false);const bottom=useRef<HTMLDivElement>(null)
  useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"})},[msgs])
  const send=async(text?:string)=>{
    const question=(text??q).trim();if(!question||loading)return;setQ("");setMsgs(m=>[...m,{role:"user",text:question}]);setLoading(true)
    const{agents}=await fetchAgents({sort:"score",pageSize:60})
    const ctx=agents.map(a=>`${a.owner}/${a.name} [${a.category}] ★${fmt(a.stars)}: ${a.description}`).join("\n")
    try{
      const res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:`Tu es un expert en agents IA open source. Réponds en français, concis. Agents:\n\n${ctx}`,messages:[{role:"user",content:question}]})})
      const d=await res.json();setMsgs(m=>[...m,{role:"assistant",text:d.content?.[0]?.text||"Pas de réponse."}])
    }catch{setMsgs(m=>[...m,{role:"assistant",text:"❌ Erreur réseau."}])}
    setLoading(false)
  }
  const sugs=["Quel agent pour la recherche web ?","Compare AutoGPT et BabyAGI","Meilleur agent pour coder ?","Agent pour analyser des PDFs ?"]
  const C={bg:"#07090f",b:"#161828",cyan:"#00e5ff",purple:"#a855f7",muted:"#4a4e68",dim:"#2e3148"}
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
    <div style={{background:C.bg,border:`1px solid ${C.cyan}33`,borderRadius:10,width:"100%",maxWidth:580,display:"flex",flexDirection:"column",maxHeight:"82vh",overflow:"hidden",animation:"fadeUp .25s ease"}}>
      <div style={{padding:"1.1rem 1.4rem",borderBottom:`1px solid ${C.b}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div><div style={{fontWeight:800,fontSize:"1rem",background:`linear-gradient(135deg,${C.cyan},${C.purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>✦ Assistant IA</div><div style={{fontFamily:"monospace",fontSize:".6rem",color:C.dim,marginTop:2}}>// pose n'importe quelle question</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"1.1rem"}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"1.2rem 1.4rem",display:"flex",flexDirection:"column",gap:".8rem"}}>
        {msgs.length===0?(<div style={{display:"flex",flexDirection:"column",gap:".4rem"}}><div style={{fontFamily:"monospace",fontSize:".63rem",color:C.dim,marginBottom:".15rem"}}>//suggestions:</div>{sugs.map(s=><div key={s} onClick={()=>send(s)} style={{fontFamily:"monospace",fontSize:".74rem",color:C.muted,cursor:"pointer",padding:".5rem .75rem",border:`1px solid ${C.b}`,borderRadius:4}} onMouseEnter={e=>{(e.currentTarget as any).style.color=C.cyan;(e.currentTarget as any).style.borderColor=C.cyan+"33"}} onMouseLeave={e=>{(e.currentTarget as any).style.color=C.muted;(e.currentTarget as any).style.borderColor=C.b}}>→ {s}</div>)}</div>
        ):msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}><div style={{maxWidth:"85%",padding:".75rem 1rem",borderRadius:6,fontSize:".79rem",lineHeight:1.6,whiteSpace:"pre-wrap",background:m.role==="user"?"rgba(0,229,255,.08)":"#0e1020",border:`1px solid ${m.role==="user"?C.cyan+"33":C.b}`,color:m.role==="user"?C.cyan:"#c0c4df",fontFamily:m.role==="assistant"?"monospace":undefined}}>{m.text}</div></div>))}
        {loading&&<div style={{display:"flex"}}><div style={{padding:".75rem 1rem",border:`1px solid ${C.b}`,borderRadius:6,background:"#0e1020",color:C.dim,fontFamily:"monospace",animation:"blink 1.2s ease infinite"}}>● ● ●</div></div>}
        <div ref={bottom}/>
      </div>
      <div style={{padding:"1rem 1.4rem",borderTop:`1px solid ${C.b}`,display:"flex",gap:".6rem",flexShrink:0}}>
        <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Pose ta question..." autoFocus style={{flex:1,background:"#0e1020",border:`1px solid ${C.b}`,borderRadius:5,padding:".65rem .9rem",color:"#dde0f5",fontFamily:"monospace",fontSize:".79rem",outline:"none"}}/>
        <button onClick={()=>send()} disabled={loading||!q.trim()} style={{background:loading||!q.trim()?"#0e1020":"rgba(0,229,255,.12)",border:`1px solid ${loading||!q.trim()?C.b:C.cyan+"44"}`,color:loading||!q.trim()?C.dim:C.cyan,fontFamily:"monospace",fontSize:".78rem",fontWeight:700,padding:".65rem 1rem",borderRadius:5,cursor:loading||!q.trim()?"not-allowed":"pointer"}}>→</button>
      </div>
    </div>
  </div>)
}
function Btn({active,color="#fff",onClick,children}:any){
  return<button onClick={onClick} style={{fontFamily:"monospace",fontSize:".63rem",padding:".26rem .65rem",borderRadius:3,cursor:"pointer",transition:"all .15s",background:active?color+"1a":"transparent",border:`1px solid ${active?color+"44":"#161828"}`,color:active?color:"#4a4e68",letterSpacing:".08em"}}>{children}</button>
}
export default function Page(){
  const[agents,setAgents]=useState<Agent[]>([]);const[total,setTotal]=useState(0);const[stats,setStats]=useState<Stats|null>(null)
  const[langs,setLangs]=useState<string[]>([]);const[loading,setLoading]=useState(true)
  const[search,setSearch]=useState("");const[category,setCategory]=useState("all");const[language,setLanguage]=useState("all")
  const[source,setSource]=useState("all");const[sort,setSort]=useState("score");const[page,setPage]=useState(0);const[showAI,setShowAI]=useState(false)
  const timer=useRef<any>(null)
  useEffect(()=>{fetchStats().then(setStats);fetchLanguages().then(setLangs)},[])
  const load=useCallback(async(reset=false)=>{
    setLoading(true);const p=reset?0:page;if(reset)setPage(0)
    const{agents:a,total:t}=await fetchAgents({search,category,language,source,sort,page:p,pageSize:PG})
    setAgents(a);setTotal(t);setLoading(false)
  },[search,category,language,source,sort,page])
  useEffect(()=>{clearTimeout(timer.current);timer.current=setTimeout(()=>load(true),300)},[search])
  useEffect(()=>{load(true)},[category,language,source,sort])
  useEffect(()=>{load()},[page])
  const pages=Math.ceil(total/PG)
  const cyan="#00e5ff",purple="#a855f7"
  const timeAgo=(iso?:string)=>{if(!iso)return"";const d=Math.floor((Date.now()-new Date(iso).getTime())/60000);return d<1?"à l'instant":d<60?`${d}min`:d<1440?`${Math.floor(d/60)}h`:`${Math.floor(d/1440)}j`}
  return(<div style={{minHeight:"100vh",background:"#05060a",color:"#dde0f5",fontFamily:"var(--font-syne),sans-serif"}}>
    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#05060a}::-webkit-scrollbar-thumb{background:#161828;border-radius:3px}input::placeholder{color:#1a1d30}input:focus,select:focus,button:focus{outline:none}`}</style>
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,229,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.018) 1px,transparent 1px)",backgroundSize:"55px 55px"}}/>
    <div style={{position:"fixed",top:-120,left:"50%",transform:"translateX(-50%)",width:800,height:450,background:"radial-gradient(circle,rgba(0,229,255,.04) 0%,transparent 65%)",pointerEvents:"none",zIndex:0}}/>
    {showAI&&<AIPanel onClose={()=>setShowAI(false)}/>}
    <div style={{position:"relative",zIndex:1,maxWidth:1200,margin:"0 auto",padding:"0 1.5rem 4rem"}}>
      <header style={{borderBottom:"1px solid #161828",padding:"1.6rem 0 1.2rem"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"1rem",marginBottom:"1.3rem"}}>
          <div>
            <div style={{display:"flex",alignItems:"baseline"}}>
              <span style={{fontSize:"clamp(1.9rem,4vw,2.6rem)",fontWeight:800,letterSpacing:"-.03em"}}>AGENT</span>
              <span style={{fontSize:"clamp(1.9rem,4vw,2.6rem)",fontWeight:800,letterSpacing:"-.03em",background:`linear-gradient(135deg,${cyan},${purple})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>SCOUT</span>
            </div>
            <div style={{fontFamily:"monospace",fontSize:".6rem",color:"#2e3148",letterSpacing:".15em",marginTop:2}}>// RÉPERTOIRE MONDIAL DES AGENTS IA OPEN SOURCE</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:".75rem"}}>
            {stats?.last_scan&&<div style={{display:"flex",alignItems:"center",gap:".4rem"}}><div style={{width:6,height:6,borderRadius:"50%",background:"#00ff88",animation:"blink 2s ease infinite"}}/><span style={{fontFamily:"monospace",fontSize:".6rem",color:"#2e3148"}}>scanné il y a {timeAgo(stats.last_scan)}</span></div>}
            <button onClick={()=>setShowAI(true)} style={{display:"flex",alignItems:"center",gap:".5rem",padding:".6rem 1.2rem",borderRadius:6,cursor:"pointer",fontWeight:700,fontSize:".78rem",color:"#dde0f5",background:`linear-gradient(135deg,rgba(0,229,255,.1),rgba(168,85,247,.1))`,border:"1px solid rgba(0,229,255,.25)",letterSpacing:".04em"}} onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 22px rgba(0,229,255,.2)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>✦ Demander à l'IA</button>
          </div>
        </div>
        <div style={{display:"flex",gap:"1.6rem",flexWrap:"wrap"}}>
          <div style={{cursor:"pointer"}} onClick={()=>setCategory("all")}><div style={{fontSize:"1.5rem",fontWeight:800,color:cyan}}>{fmt(stats?.total)}</div><div style={{fontFamily:"monospace",fontSize:".55rem",color:"#2e3148",letterSpacing:".15em"}}>TOTAL</div></div>
          {Object.entries(CATS).filter(([k])=>k!=="general").map(([k,c])=>{const n=(stats as any)?.[k];if(!n)return null;return<div key={k} style={{cursor:"pointer",opacity:category===k||category==="all"?1:.4,transition:"opacity .15s"}} onClick={()=>setCategory(category===k?"all":k)}><div style={{fontSize:"1.5rem",fontWeight:800,color:c.color}}>{fmt(n)}</div><div style={{fontFamily:"monospace",fontSize:".55rem",color:"#2e3148",letterSpacing:".12em",textTransform:"uppercase"}}>{c.label}</div></div>})}
        </div>
      </header>
      <div style={{overflow:"hidden",background:"#07090f",borderBottom:"1px solid #161828",padding:".5rem 0"}}>
        <div style={{display:"flex",gap:"2.5rem",animation:"ticker 40s linear infinite",whiteSpace:"nowrap",fontFamily:"monospace",fontSize:".63rem",color:"#2e3148"}}>
          {[0,1].map(ri=>SOURCES.filter(s=>s.key!=="all").map(s=><span key={`${ri}-${s.key}`}><span style={{color:cyan,opacity:.5}}>●</span> {s.label} · {fmt((stats as any)?.[`src_${s.key}`])} agents{"   "}</span>))}
        </div>
      </div>
      <div style={{padding:"1rem 0 .6rem",borderBottom:"1px solid #161828",display:"flex",flexDirection:"column",gap:".6rem"}}>
        <div style={{display:"flex",gap:".6rem"}}>
          <div style={{flex:1,display:"flex",alignItems:"center",gap:".6rem",background:"#07090f",border:"1px solid #161828",borderRadius:6,padding:".6rem .9rem"}}>
            <span style={{color:"#2e3148"}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un agent, owner, description..." style={{background:"transparent",border:"none",flex:1,color:"#dde0f5",fontFamily:"monospace",fontSize:".8rem"}}/>
            {search&&<button onClick={()=>setSearch("")} style={{background:"none",border:"none",color:"#2e3148",cursor:"pointer",fontSize:".85rem"}}>✕</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:".38rem",flexWrap:"wrap",alignItems:"center"}}>
          <Btn active={category==="all"} color="#ffffff" onClick={()=>setCategory("all")}>TOUS</Btn>
          {Object.entries(CATS).filter(([k])=>k!=="general").map(([k,c])=><Btn key={k} active={category===k} color={c.color} onClick={()=>setCategory(category===k?"all":k)}>{c.label.toUpperCase()}</Btn>)}
        </div>
        <div style={{display:"flex",gap:".38rem",flexWrap:"wrap",alignItems:"center"}}>
          {SOURCES.map(s=><Btn key={s.key} active={source===s.key} color={cyan} onClick={()=>setSource(s.key)}>{s.label}</Btn>)}
          <div style={{marginLeft:"auto",display:"flex",gap:".35rem",alignItems:"center"}}>
            {[{k:"score",l:"Score"},{k:"stars",l:"Stars"},{k:"recent",l:"Récent"}].map(s=><Btn key={s.k} active={sort===s.k} color={purple} onClick={()=>setSort(s.k)}>{s.l}</Btn>)}
            <select value={language} onChange={e=>setLanguage(e.target.value)} style={{background:"#07090f",border:"1px solid #161828",color:language!=="all"?"#ff9500":"#4a4e68",fontFamily:"monospace",fontSize:".6rem",padding:".26rem .55rem",borderRadius:3,cursor:"pointer"}}>
              <option value="all">Langage</option>
              {langs.map(l=><option key={l} value={l} style={{background:"#07090f"}}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={{padding:".55rem 0",fontFamily:"monospace",fontSize:".64rem",color:"#2e3148",display:"flex",justifyContent:"space-between"}}>
        <span>{total.toLocaleString("fr-FR")} agent{total!==1?"s":""}{search?` · "${search}"`:""}
          {category!=="all"?` · ${CATS[category]?.label}`:""}{source!=="all"?` · ${source}`:""}</span>
        {loading&&<span style={{color:cyan,animation:"blink 1.2s ease infinite"}}>chargement...</span>}
      </div>
      {loading&&agents.length===0?(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(272px,1fr))",gap:".65rem"}}>{Array.from({length:24}).map((_,i)=><div key={i} style={{background:"#07090f",border:"1px solid #161828",borderRadius:7,height:130,animation:`blink 1.5s ease ${i*.05}s infinite`}}/>)}</div>
      ):agents.length===0?(<div style={{textAlign:"center",padding:"4rem",color:"#2e3148",fontFamily:"monospace",fontSize:".82rem"}}>Aucun agent trouvé{search?` pour "${search}"`:""}.</div>
      ):(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(272px,1fr))",gap:".65rem"}}>{agents.map((a,i)=><Card key={a.id} a={a} i={i}/>)}</div>)}
      {pages>1&&(<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:".75rem",marginTop:"2rem"}}>
        <button onClick={()=>{setPage(p=>p-1);window.scrollTo({top:0,behavior:"smooth"})}} disabled={page===0} style={{fontFamily:"monospace",fontSize:".67rem",padding:".5rem 1.25rem",borderRadius:4,cursor:page===0?"not-allowed":"pointer",background:"transparent",border:`1px solid ${page===0?"#161828":"#2a2d3e"}`,color:page===0?"#1e2030":"#4a4e68"}}>← Préc.</button>
        <span style={{fontFamily:"monospace",fontSize:".64rem",color:"#2e3148"}}>Page {page+1}/{pages}</span>
        <button onClick={()=>{setPage(p=>p+1);window.scrollTo({top:0,behavior:"smooth"})}} disabled={page>=pages-1} style={{fontFamily:"monospace",fontSize:".67rem",padding:".5rem 1.25rem",borderRadius:4,cursor:page>=pages-1?"not-allowed":"pointer",background:"transparent",border:`1px solid ${page>=pages-1?"#161828":"#2a2d3e"}`,color:page>=pages-1?"#1e2030":"#4a4e68"}}>Suiv. →</button>
      </div>)}
      <footer style={{marginTop:"2.5rem",paddingTop:"1.1rem",borderTop:"1px solid #161828",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:".5rem"}}>
        <span style={{fontFamily:"monospace",fontSize:".58rem",color:"#2e3148"}}>// GitHub · HuggingFace · PyPI · npm · Arxiv · scan auto toutes les 6h</span>
        <span style={{fontFamily:"monospace",fontSize:".58rem",color:"#2e3148"}}>AGENT<span style={{color:cyan}}>SCOUT</span> · {new Date().getFullYear()}</span>
      </footer>
    </div>
  </div>)
}
