import React, { useEffect, useMemo, useRef, useState } from "react";

const cls = (...c) => c.filter(Boolean).join(" ");
const LS_KEY = "aiwriter_project_v1";

function useTheme(defaultName = "Minimal") {
  const THEMES = {
    Minimal: { body: { background:"#ffffff", color:"#111" }, editor:"bg-white text-[#111] border" },
    Immersive: { body:{ background:"#0b0f14", color:"#e8eef6"}, editor:"bg-[#0e141b] text-[#e8eef6] border border-[#1a2531]" },
    Typewriter:{ body:{background:"#f7f1e3", color:"#1b1206"}, editor:"bg-[#f8f3e9] text-[#1b1206] border border-[#d8cdb8]" },
  };

  const [name, setName] = useState(() => localStorage.getItem("theme") || defaultName);
  useEffect(() => {
    localStorage.setItem("theme", name);
    const t = THEMES[name];
    Object.assign(document.body.style, t.body);
  }, [name]);
  return { name, setName };
}

function useProject() {
  const [data, setData] = useState(() => {
    try { const raw = localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw); } catch {}
    return {
      title:"Projek Novel",
      mood:"Romantis",
      chapters:[{id:"c1", title:"Bab 1", content:""}],
      activeId:"c1",
    };
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  }, [data]);
  return [data, setData];
}

function Topbar({ theme, setTheme, mood, setMood, onExport }) {
  return (
    <div className="h-12 px-3 border-b flex items-center gap-2 justify-between" style={{backdropFilter:"blur(6px)"}}>
      <div className="text-sm opacity-80">Pena.AI — Immersive Writing</div>
      <div className="flex items-center gap-2 text-sm">
        <select className="border rounded px-2 py-1" value={mood} onChange={(e)=>setMood(e.target.value)}>
          <option>Romantis</option><option>Misteri</option><option>Psikologi</option><option>Lucu</option>
        </select>
        <select className="border rounded px-2 py-1" value={theme} onChange={(e)=>setTheme(e.target.value)}>
          <option>Minimal</option><option>Immersive</option><option>Typewriter</option>
        </select>
        <button className="h-9 px-3 rounded bg-black text-white" onClick={onExport}>Eksport .txt</button>
      </div>
    </div>
  );
}

function Sidebar({ chapters, activeId, onAdd, onOpen, onRename }) {
  return (
    <div className="h-full border-r p-2 space-y-2 min-w-[220px]">
      <div className="text-xs uppercase opacity-60 mb-1">Bab</div>
      <div className="space-y-2">
        {chapters.map(c=>(
          <div key={c.id} className={cls("rounded border p-2", c.id===activeId && "bg-black/5")}>
            <input className="w-full text-sm border rounded px-2 py-1 mb-1 bg-transparent"
              value={c.title} onChange={(e)=>onRename(c.id, e.target.value)} />
            <button className={cls("text-xs px-2 py-1 rounded w-full",c.id===activeId?"bg-black text-white":"bg-transparent border")}
              onClick={()=>onOpen(c.id)}>Buka</button>
          </div>
        ))}
      </div>
      <button className="h-9 px-3 rounded bg-black text-white w-full" onClick={onAdd}>+ Tambah Bab</button>
    </div>
  );
}

export default function App() {
  const { name:theme, setName:setTheme } = useTheme("Immersive");
  const [proj, setProj] = useProject();
  const active = useMemo(()=>proj.chapters.find(c=>c.id===proj.activeId),[proj]);
  const [text,setText] = useState(active?.content || "");

  useEffect(()=>setText(active?.content||""), [proj.activeId]);

  const addChapter = () => {
    const id = crypto.randomUUID();
    setProj(p=>({...p, chapters:[...p.chapters,{id,title:`Bab ${p.chapters.length+1}`,content:""}], activeId:id }));
  };

  const rename = (id,title)=> setProj(p=>({...p,chapters:p.chapters.map(c=>c.id===id?{...c,title}:c)}));
  const save = ()=> setProj(p=>({...p,chapters:p.chapters.map(c=>c.id===p.activeId?{...c,content:text}:c)}));

  // ======== Panggil AI API sebenar =========
  const askAI = async () => {
    const res = await fetch("/api/ai",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({ text, mood:proj.mood })
    });
    const data = await res.json();
    if(data.result){ setText(t=>t+"\n\n"+data.result); }
  };

  const exportTxt = ()=>{
    const all = proj.chapters.map((c,i)=>`# ${c.title}\n\n${i===0&&c.id===proj.activeId?text:c.content}`).join("\n\n---\n\n");
    const blob = new Blob([all],{type:"text/plain;charset=utf-8"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=(proj.title||"naskhah")+".txt"; a.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar theme={theme} setTheme={setTheme} mood={proj.mood} setMood={(m)=>setProj(p=>({...p,mood:m}))} onExport={exportTxt}/>
      <div className="grid grid-cols-[240px_1fr] h-[calc(100vh-3rem)]">
        <Sidebar chapters={proj.chapters} activeId={proj.activeId} onAdd={addChapter}
          onOpen={id=>setProj(p=>({...p,chapters:p.chapters.map(c=>c.id===p.activeId?{...c,content:text}:c),activeId:id}))}
          onRename={rename}/>
        <div className="h-full p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button className="h-9 px-3 rounded border" onClick={save}>Simpan</button>
            <button className="h-9 px-3 rounded bg-black text-white" onClick={askAI}>Minta AI Sambung</button>
          </div>
          <textarea className="w-full flex-1 rounded p-3 text-base leading-7 outline-none bg-white border"
            value={text} onChange={(e)=>setText(e.target.value)}
            placeholder="Tulis bab di sini… gaya penceritaan immersive lembut."
          />
        </div>
      </div>
    </div>
  );
}
