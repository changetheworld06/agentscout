import os,sys,time,json,math,re,requests,schedule
from datetime import datetime,timedelta
from dotenv import load_dotenv
load_dotenv()
GITHUB_TOKEN=os.getenv("GITHUB_TOKEN","")
SUPABASE_URL=os.getenv("SUPABASE_URL","")
SUPABASE_KEY=os.getenv("SUPABASE_KEY","")
HF_TOKEN=os.getenv("HF_TOKEN","")
if not GITHUB_TOKEN:
    print("❌ GITHUB_TOKEN manquant dans scanner/.env")
    print("   → https://github.com/settings/tokens")
    sys.exit(1)
CATS={"research":["research","web search","browse","internet","scrape"],"coding":["code","coding","programming","developer","debug","git"],"knowledge":["rag","document","pdf","knowledge","retrieval","vector","embedding"],"assistant":["chat","conversation","assistant","voice","copilot"],"orchestration":["multi-agent","orchestrat","workflow","pipeline","crew","swarm","graph"],"multimodal":["vision","image","visual","multimodal","audio","speech","video"],"automation":["automat","rpa","browser","selenium","playwright","scraping","task"],"finance":["finance","trading","stock","crypto","investment"],"devops":["devops","deploy","kubernetes","docker","monitoring","cloud"],"data":["data","analytics","sql","database","etl","pandas","spark"]}
def classify(text):
    t=(text or "").lower()
    for cat,kws in CATS.items():
        if any(k in t for k in kws): return cat
    return "general"
def calc_score(stars=0,forks=0,downloads=0,likes=0,updated=""):
    try:
        days=(datetime.utcnow()-datetime.fromisoformat(updated.replace("Z",""))).days
        recency=max(0,1-days/730)
    except: recency=0.5
    return round(math.log(max(stars,1))*38+math.log(max(forks,1))*22+math.log(max(downloads,1))*8+math.log(max(likes,1))*12+recency*20+10,2)
def safe_get(url,headers=None,params=None):
    try:
        r=requests.get(url,headers=headers,params=params,timeout=15)
        if r.status_code==200: return r.json()
    except: pass
    return None
def bar(i,total,label=""):
    filled=int(i/total*28)
    print(f"\r  [{'█'*filled}{'░'*(28-filled)}] {i}/{total}  {label[:35]:35}",end="",flush=True)
TOPICS=["ai-agent","llm-agent","autonomous-agent","ai-assistant","langchain-agent","multi-agent","agent-framework","agentic-ai","autogpt","crewai","openai-agent","gpt-agent","claude-agent","llm-tools","tool-use","function-calling","react-agent","rag-agent","autonomous-ai","ai-automation","llm-automation","agent-workflow","agentic-workflow","langchain","llamaindex","langgraph","haystack","semantic-kernel","autogen","crewai-framework","phidata","dspy","guidance","instructor","marvin-ai","superagent","coding-agent","research-agent","web-agent","browser-agent","data-agent","document-agent","search-agent","writing-agent","rag","vector-database","embeddings","llm","open-source-llm","prompt-engineering","tool-calling","mcp","model-context-protocol","ai-tools","llm-apps","multimodal-agent","vision-agent","voice-agent","chatbot","ai-chatbot","conversational-ai","virtual-assistant","ai-copilot","agent-memory","agent-planning","agent-reasoning","python-agent","typescript-agent","nextjs-ai","fastapi-ai","ai-pipeline","llm-pipeline","agent-swarm","task-automation","openai-tools","anthropic-tools","ai-sdk","vercel-ai"]
KEYWORDS=["autonomous agent","ai agent","llm agent","multi-agent system","intelligent agent","language agent","reasoning agent","agentic framework","agent orchestration","llm app","ai workflow","rag pipeline","function calling llm","tool use agent"]
def scan_github():
    print(f"\n{'─'*55}\n🐙  GITHUB — {len(TOPICS)} topics · {len(KEYWORDS)} keywords")
    hdrs={"Accept":"application/vnd.github+json","Authorization":f"Bearer {GITHUB_TOKEN}","X-GitHub-Api-Version":"2022-11-28"}
    found={}
    def search(query,sort="stars",pages=3):
        for page in range(1,pages+1):
            params={"q":query,"sort":sort,"order":"desc","per_page":30,"page":page}
            while True:
                try:
                    r=requests.get("https://api.github.com/search/repositories",headers=hdrs,params=params,timeout=15)
                    if r.status_code==403:
                        wait=max(int(r.headers.get("X-RateLimit-Reset",time.time()+61))-int(time.time()),1)+3
                        print(f"\n  ⏳ Rate limit — pause {wait}s..."); time.sleep(wait); continue
                    if r.status_code in(422,404): return
                    r.raise_for_status()
                    items=r.json().get("items",[])
                    if not items: return
                    for repo in items:
                        rid=repo["id"]
                        if rid in found: continue
                        desc=(repo.get("description") or "")[:500]
                        topics=repo.get("topics",[])
                        found[rid]={"github_id":f"gh_{rid}","source":"github","name":repo["name"],"full_name":repo["full_name"],"owner":repo["owner"]["login"],"description":desc,"url":repo["html_url"],"stars":repo.get("stargazers_count",0),"forks":repo.get("forks_count",0),"language":repo.get("language") or "Unknown","topics":topics,"category":classify(desc+" "+" ".join(topics)),"score":calc_score(stars=repo.get("stargazers_count",0),forks=repo.get("forks_count",0),updated=repo.get("updated_at","")),"created_at":repo.get("created_at") or None,"updated_at":repo.get("updated_at") or None,"scanned_at":datetime.utcnow().isoformat()}
                    time.sleep(0.7); break
                except requests.exceptions.Timeout: time.sleep(5)
                except Exception as e: print(f"\n  ⚠️  {e}"); return
    for i,t in enumerate(TOPICS,1): bar(i,len(TOPICS),f"topic:{t}"); search(f"topic:{t}",pages=3)
    print(f"\n  ✅ Topics: {len(found)}")
    for i,kw in enumerate(KEYWORDS,1): bar(i,len(KEYWORDS),kw); search(f'"{kw}" in:description,name',pages=2)
    print(f"\n  ✅ Keywords: {len(found)}")
    since=(datetime.utcnow()-timedelta(days=7)).strftime("%Y-%m-%d")
    for kw in ["ai agent","llm agent","agentic"]: search(f'"{kw}" created:>{since}',sort="updated",pages=2)
    print(f"  ✅ GitHub total: {len(found)} agents")
    return list(found.values())
HF_TAGS=["agent","ai-agent","autonomous-agent","llm-agent","multi-agent","tool-use","rag","conversational","chatbot","text-generation"]
def scan_huggingface():
    print(f"\n{'─'*55}\n🤗  HUGGINGFACE")
    hdrs={"Authorization":f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}
    found={}
    for i,tag in enumerate(HF_TAGS,1):
        bar(i,len(HF_TAGS),f"model:{tag}")
        data=safe_get("https://huggingface.co/api/models",hdrs,{"filter":tag,"sort":"downloads","direction":-1,"limit":100})
        if not data: continue
        for m in data:
            mid=m.get("modelId") or m.get("id",""); key=f"hf_model_{mid.replace('/','_')}"
            if not mid or key in found: continue
            dl=m.get("downloads",0); likes=m.get("likes",0); desc=(m.get("cardData") or {}).get("description","")[:400]; tags=m.get("tags",[])
            found[key]={"github_id":key,"source":"huggingface_model","name":mid.split("/")[-1],"full_name":mid,"owner":mid.split("/")[0] if "/" in mid else "hf","description":desc,"url":f"https://huggingface.co/{mid}","stars":likes,"forks":0,"language":"Python","topics":tags[:10],"category":classify(desc+" "+" ".join(tags)),"score":calc_score(likes=likes,downloads=dl,updated=m.get("lastModified","")),"created_at":m.get("createdAt") or None,"updated_at":m.get("lastModified") or None,"scanned_at":datetime.utcnow().isoformat()}
        time.sleep(0.4)
    print(f"\n  ✅ HF Models: {len(found)}")
    return list(found.values())
PYPI_PKGS=["langchain","langchain-core","langchain-community","langgraph","langsmith","llama-index","llama-index-core","crewai","autogen","pyautogen","semantic-kernel","haystack-ai","phidata","dspy-ai","instructor","anthropic","openai","litellm","agentops","e2b","embedchain","marvin","pydantic-ai","chromadb","weaviate-client","pinecone-client","qdrant-client","sentence-transformers","transformers","promptflow"]
def scan_pypi():
    print(f"\n{'─'*55}\n🐍  PYPI")
    results=[]
    for i,pkg in enumerate(PYPI_PKGS,1):
        bar(i,len(PYPI_PKGS),pkg)
        data=safe_get(f"https://pypi.org/pypi/{pkg}/json")
        if not data: continue
        info=data.get("info",{}); name=info.get("name",pkg); desc=(info.get("summary","") or "")[:400]
        gh_url=""
        for link in (info.get("project_urls") or {}).values():
            if "github.com" in (link or ""): gh_url=link; break
        results.append({"github_id":f"pypi_{name}","source":"pypi","name":name,"full_name":name,"owner":info.get("author","unknown"),"description":desc,"url":gh_url or f"https://pypi.org/project/{name}","stars":0,"forks":0,"language":"Python","topics":[],"category":classify(desc),"score":calc_score(),"created_at":None,"updated_at":None,"scanned_at":datetime.utcnow().isoformat()})
        time.sleep(0.25)
    print(f"\n  ✅ PyPI: {len(results)}")
    return results
NPM_QUERIES=["ai-agent","llm-agent","langchain","openai","anthropic","vercel-ai","ai-sdk","langgraph","chatbot","rag","embeddings"]
def scan_npm():
    print(f"\n{'─'*55}\n📦  NPM")
    found={}
    for i,q in enumerate(NPM_QUERIES,1):
        bar(i,len(NPM_QUERIES),q)
        data=safe_get("https://registry.npmjs.org/-/v1/search",params={"text":q,"size":50})
        if not data: continue
        for obj in data.get("objects",[]):
            p=obj.get("package",{}); name=p.get("name","")
            if not name or name in found: continue
            desc=(p.get("description","") or "")[:400]; kws=p.get("keywords",[])
            found[name]={"github_id":f"npm_{re.sub(r'[^a-z0-9]','_',name.lower())}","source":"npm","name":name,"full_name":name,"owner":(p.get("publisher") or {}).get("username","unknown"),"description":desc,"url":f"https://www.npmjs.com/package/{name}","stars":0,"forks":0,"language":"TypeScript","topics":kws[:8],"category":classify(desc+" "+" ".join(kws)),"score":calc_score(downloads=obj.get("downloads",{}).get("monthly",0)),"created_at":p.get("date") or None,"updated_at":p.get("date") or None,"scanned_at":datetime.utcnow().isoformat()}
        time.sleep(0.3)
    print(f"\n  ✅ npm: {len(found)}")
    return list(found.values())
def scan_arxiv():
    print(f"\n{'─'*55}\n📚  ARXIV")
    import xml.etree.ElementTree as ET
    queries=['ti:"language agent"','ti:"autonomous agent"','ti:"llm agent"','ti:"multi-agent"','ti:"AI agent"','ti:"agentic"']
    found={}; ns={"a":"http://www.w3.org/2005/Atom"}
    for i,q in enumerate(queries,1):
        bar(i,len(queries),q)
        try:
            r=requests.get("https://export.arxiv.org/api/query",params={"search_query":q,"max_results":50,"sortBy":"submittedDate","sortOrder":"descending"},timeout=20)
            root=ET.fromstring(r.text)
            for entry in root.findall("a:entry",ns):
                aid=(entry.findtext("a:id","",ns) or "").split("/")[-1]
                if not aid or aid in found: continue
                title=(entry.findtext("a:title","",ns) or "").strip().replace("\n"," ")
                summary=(entry.findtext("a:summary","",ns) or "")[:400].strip()
                found[aid]={"github_id":f"arxiv_{aid}","source":"arxiv","name":title[:80],"full_name":title[:120],"owner":"arxiv","description":summary,"url":f"https://arxiv.org/abs/{aid}","stars":0,"forks":0,"language":"Python","topics":["research","paper"],"category":classify(title+" "+summary),"score":12.0,"created_at":entry.findtext("a:published","",ns),"updated_at":entry.findtext("a:updated","",ns),"scanned_at":datetime.utcnow().isoformat()}
        except Exception as e: print(f"\n  ⚠️  {e}")
        time.sleep(3)
    print(f"\n  ✅ Arxiv: {len(found)}")
    return list(found.values())
def upload(agents):
    if not SUPABASE_URL or "XXXXX" in SUPABASE_URL:
        with open("agents_all.json","w",encoding="utf-8") as f: json.dump(agents,f,ensure_ascii=False)
        print(f"💾 Sauvegardé localement: agents_all.json ({len(agents)} agents)")
        return
    try:
        from supabase import create_client
        db=create_client(SUPABASE_URL,SUPABASE_KEY)
        print(f"\n📤 Upload Supabase — {len(agents)} agents...")
        for i in range(0,len(agents),500):
            db.table("agents").upsert(agents[i:i+500],on_conflict="github_id").execute()
            print(f"\r  {min(i+500,len(agents))}/{len(agents)} uploadés",end="",flush=True)
        db.table("meta").upsert({"key":"last_scan","value":json.dumps({"total":len(agents),"updated_at":datetime.utcnow().isoformat()})},on_conflict="key").execute()
        print(f"\n  🎉 Supabase mis à jour!")
    except Exception as e: print(f"\n  ❌ Erreur Supabase: {e}")
def run():
    start=time.time()
    print(f"\n{'═'*55}\n  🚀 AGENTSCOUT — {datetime.utcnow().strftime('%d/%m/%Y %H:%M UTC')}\n{'═'*55}")
    all_agents={}
    def merge(agents):
        n=len(all_agents)
        for a in agents:
            k=a.get("github_id","")
            if k and k not in all_agents: all_agents[k]=a
        print(f"  → +{len(all_agents)-n} nouveaux · total {len(all_agents)}\n")
    for label,fn in [("GitHub",scan_github),("HuggingFace",scan_huggingface),("PyPI",scan_pypi),("npm",scan_npm),("Arxiv",scan_arxiv)]:
        try: merge(fn())
        except Exception as e: print(f"\n  ❌ {label}: {e}\n")
    final=sorted(all_agents.values(),key=lambda x:x.get("score",0),reverse=True)
    elapsed=int(time.time()-start)
    print(f"\n{'═'*55}\n  ✅ TOTAL: {len(final)} agents — {elapsed//60}min {elapsed%60}s\n{'═'*55}\n")
    upload(final)
    print(f"⏰ Prochain scan dans 6h.\n")
if __name__=="__main__":
    run()
    schedule.every(6).hours.do(run)
    while True: schedule.run_pending(); time.sleep(30)
