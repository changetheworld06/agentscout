import { createClient } from "@supabase/supabase-js"
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export type Agent = {
  id:number; github_id:string; source:string; name:string; full_name:string
  owner:string; description:string; url:string; stars:number; forks:number
  language:string; topics:string[]; category:string; score:number; updated_at:string
}
export type Stats = {
  total:number; research:number; coding:number; knowledge:number; assistant:number
  orchestration:number; multimodal:number; automation:number; finance:number
  devops:number; data:number; src_github:number; src_huggingface:number
  src_pypi:number; src_npm:number; src_arxiv:number; last_scan:string
}
export async function fetchStats(): Promise<Stats|null> {
  const { data } = await supabase.from("agent_stats").select("*").single()
  return data
}
export async function fetchAgents({ search="",category="all",language="all",source="all",sort="score",page=0,pageSize=60 }:{search?:string;category?:string;language?:string;source?:string;sort?:string;page?:number;pageSize?:number}) {
  let q = supabase.from("agents").select("*",{count:"exact"})
  if (search.trim()) q=q.or(`name.ilike.%${search}%,description.ilike.%${search}%,owner.ilike.%${search}%`)
  if (category!=="all") q=q.eq("category",category)
  if (language!=="all") q=q.eq("language",language)
  if (source!=="all") q=q.ilike("source",`${source}%`)
  const col=sort==="stars"?"stars":sort==="recent"?"updated_at":"score"
  q=q.order(col,{ascending:false}).range(page*pageSize,(page+1)*pageSize-1)
  const { data,count } = await q
  return { agents:(data||[]) as Agent[], total:count||0 }
}
export async function fetchLanguages(): Promise<string[]> {
  const { data } = await supabase.from("agents").select("language").not("language","is",null).order("language")
  return Array.from(new Set((data||[]).map((r:any)=>r.language).filter(Boolean))) as string[]
}
