(() => {
  "use strict";
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];
  const categories = ["Projects","AI Tools","Blogs","PDF Documents","Programming Code"];
  const demoResources = [
    {id:"demo-1",title:"Modern Developer Portfolio",description:"A responsive portfolio starter with clean sections, subtle motion and a polished layout.",category:"Projects",creator:"Code Zero Team",views:1280,downloads:342,created_at:"2026-11-12",symbol:"{ }"},
    {id:"demo-2",title:"AI Productivity Toolkit",description:"A curated collection of AI assistants and workflows for everyday productivity.",category:"AI Tools",creator:"Community Picks",views:960,downloads:211,created_at:"2026-11-10",symbol:"✳"},
    {id:"demo-3",title:"A Practical Guide to Git",description:"Learn essential Git workflows, branches, commits and collaboration fundamentals.",category:"Blogs",creator:"Dev Notes",views:740,downloads:0,created_at:"2026-11-08",symbol:"Aa"},
    {id:"demo-4",title:"Web Development Cheat Sheet",description:"A concise reference for common HTML, CSS and JavaScript concepts.",category:"PDF Documents",creator:"Open Learning",views:1850,downloads:520,created_at:"2026-11-06",symbol:"PDF"},
    {id:"demo-5",title:"Responsive Navbar Component",description:"A lightweight vanilla JavaScript navigation component for responsive websites.",category:"Programming Code",creator:"Frontend Lab",views:630,downloads:184,created_at:"2026-11-04",symbol:"</>"},
    {id:"demo-6",title:"Task Manager Starter Project",description:"A simple task manager concept with local persistence and reusable UI patterns.",category:"Projects",creator:"Build Club",views:512,downloads:96,created_at:"2026-11-02",symbol:"▦"}
  ];
  const state = {resources:[], filter:"All", query:"", sort:"latest", route:"home", supabase:null};
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const savedIds = () => read("cz_saved", []);
  const toast = message => { const el=$("#toast"); el.textContent=message; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),2600); };
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const artClass = category => category==="AI Tools"?"ai":category==="Blogs"?"blog":category==="PDF Documents"?"pdf":category==="Programming Code"?"code":"";
  function initBackend(){
    const c=window.CZ_CONFIG||{};
    if(c.supabaseUrl && c.supabaseAnonKey && window.supabase?.createClient){
      state.supabase=window.supabase.createClient(c.supabaseUrl,c.supabaseAnonKey);
    }
  }
  async function loadResources(){
    if(state.supabase){
      try {
        const {data,error}=await state.supabase.from("resources").select("id,title,description,category,created_at,views_count,downloads_count,creator_name,status").eq("status","approved").order("created_at",{ascending:false}).limit(60);
        if(error) throw error;
        state.resources=(data||[]).map(r=>({...r,views:r.views_count||0,downloads:r.downloads_count||0,creator:r.creator_name||"Community",symbol:"↗"}));
      } catch(err){ console.error("Supabase read failed:",err); state.resources=read("cz_resources",demoResources); toast("Could not reach the resource database. Showing saved demo content."); }
    } else {
      state.resources=[...demoResources,...read("cz_resources",[])];
    }
    render();
  }
  function render(){
    const route=(location.hash.replace("#","")||"home").split("?")[0];
    state.route=route;
    const routeLabels={"home":"Home","explore":"Explore","projects":"Projects","ai-tools":"AI Tools","blogs":"Blogs","pdf-library":"PDF Library","code-library":"Code Library","learning":"Learning Hub","community":"Community","saved":"Saved resources","collections":"Collections","creator":"Creator Studio","upload":"Submit a resource","more":"More"};
    $("#currentPage").textContent=routeLabels[route]||"Home";
    $$(".nav-link[data-route],.mobile-nav [data-route]").forEach(a=>a.classList.toggle("active",a.dataset.route===route));
    let category=state.filter;
    if(route==="projects")category="Projects"; if(route==="ai-tools")category="AI Tools"; if(route==="blogs")category="Blogs"; if(route==="pdf-library")category="PDF Documents"; if(route==="code-library")category="Programming Code";
    let list=[...state.resources];
    if(route==="saved") list=list.filter(r=>savedIds().includes(r.id));
    if(categories.includes(category)) list=list.filter(r=>r.category===category);
    if(state.query) list=list.filter(r=>(r.title+" "+r.description+" "+r.category+" "+(r.creator||"")).toLowerCase().includes(state.query.toLowerCase()));
    if(state.sort==="downloads") list.sort((a,b)=>(b.downloads||0)-(a.downloads||0)); else list.sort((a,b)=>String(b.created_at||"").localeCompare(String(a.created_at||"")));
    $("#statResources").textContent=state.resources.length.toString().padStart(2,"0");
    $("#resourceGrid").innerHTML=list.map(cardHTML).join("");
    $("#emptyState").classList.toggle("hidden",list.length>0);
    $("#resourceGrid").classList.toggle("hidden",list.length===0);
    $$(".filter-tab").forEach(b=>b.classList.toggle("selected",b.dataset.filter===state.filter));
    if(route==="upload") $("#uploadDialog").showModal();
    if(route==="collections") renderCollections();
  }
  function cardHTML(r){
    const isSaved=savedIds().includes(r.id);
    return `<article class="resource-card"><div class="resource-art ${artClass(r.category)}"><span class="art-symbol">${escapeHTML(r.symbol||"↗")}</span></div><div class="resource-card-body"><div class="resource-meta"><span class="pill">${escapeHTML(r.category)}</span><button class="save-btn ${isSaved?"saved":""}" data-save="${escapeHTML(r.id)}" aria-label="Save ${escapeHTML(r.title)}">${isSaved?"♥":"♡"}</button></div><h3>${escapeHTML(r.title)}</h3><p>${escapeHTML(r.description)}</p><div class="resource-foot"><span>◉ ${escapeHTML(r.creator||"Community")}</span><span>↓ ${Number(r.downloads||0).toLocaleString()}</span></div></div></article>`;
  }
  function renderCollections(){
    const collections=read("cz_collections",[]);
    $("#resourceGrid").innerHTML=collections.length?collections.map(c=>`<article class="resource-card"><div class="resource-art"><span class="art-symbol">▦</span></div><div class="resource-card-body"><h3>${escapeHTML(c.name)}</h3><p>${c.items.length} saved resource(s)</p><button class="btn btn-secondary" data-delete-collection="${escapeHTML(c.id)}">Delete collection</button></div></article>`).join(""):`<div class="empty-state"><h3>No collections yet</h3><p>Create a personal collection from your saved resources.</p><button class="btn btn-primary" id="newCollection">＋ New collection</button></div>`;
  }
  function toggleSave(id){
    const ids=savedIds(); const next=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]; write("cz_saved",next); render(); toast(next.includes(id)?"Saved to your library":"Removed from saved resources");
  }
  async function submitResource(form){
    const fd=new FormData(form); const file=fd.get("file");
    const resource={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title:String(fd.get("title")).trim(),category:fd.get("category"),description:String(fd.get("description")).trim(),url:String(fd.get("url")||"").trim(),creator:"Guest creator",created_at:new Date().toISOString().slice(0,10),views:0,downloads:0,symbol:({Projects:"▣","AI Tools":"✳",Blogs:"Aa","PDF Documents":"PDF","Programming Code":"</>"}[fd.get("category")])};
    if(file && file.size>20*1024*1024){toast("File exceeds the 20 MB demo limit.");return;}
    if(state.supabase){
      try {
        // Public submissions are inserted as pending; storage upload requires matching bucket policies.
        let filePath=null;
        if(file && file.size){
          const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
          filePath=`public-submissions/${resource.id}/${safeName}`;
          const {error:uploadError}=await state.supabase.storage.from("resource-files").upload(filePath,file,{upsert:false});
          if(uploadError) throw uploadError;
        }
        const {error}=await state.supabase.from("resources").insert({title:resource.title,category:resource.category,description:resource.description,external_url:resource.url||null,file_path:filePath,status:"pending",creator_name:"Guest creator"});
        if(error) throw error;
        toast("Submission received for moderation.");
      } catch(err){console.error(err);toast("Submission failed. Check Supabase configuration and policies.");return;}
    } else {
      const items=read("cz_resources",[]); items.unshift(resource); write("cz_resources",items); state.resources=[...demoResources,...items]; toast("Saved in this browser. Configure Supabase for public publishing.");
    }
    form.reset(); $("#uploadDialog").close(); location.hash="#explore"; render();
  }
  function openUpload(){ $("#uploadDialog").showModal(); }
  function bind(){
    document.addEventListener("click",e=>{
      const save=e.target.closest("[data-save]"); if(save){toggleSave(save.dataset.save);return;}
      const del=e.target.closest("[data-delete-collection]"); if(del){write("cz_collections",read("cz_collections",[]).filter(c=>c.id!==del.dataset.deleteCollection));renderCollections();return;}
      const routeLink=e.target.closest('a[href^="#"]'); if(routeLink && routeLink.getAttribute("href")==="#upload"){e.preventDefault();openUpload();}
    });
    $("#homeFilters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;state.filter=b.dataset.filter;render();});
    $("#globalSearch").addEventListener("input",e=>{state.query=e.target.value;render();});
    $("#sortButton").addEventListener("click",()=>{state.sort=state.sort==="latest"?"downloads":"latest";$("#sortButton").textContent=state.sort==="latest"?"↕ Latest first":"↓ Most downloaded";render();});
    $("#themeToggle").addEventListener("click",()=>{const next=document.documentElement.dataset.theme==="light"?"dark":"light";document.documentElement.dataset.theme=next;localStorage.setItem("cz_theme",next);});
    $("#menuToggle").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
    $("#closeUpload").addEventListener("click",()=>$("#uploadDialog").close());
    $("#cancelUpload").addEventListener("click",()=>$("#uploadDialog").close());
    $("#uploadForm").addEventListener("submit",e=>{e.preventDefault();submitResource(e.currentTarget);});
    $("#notificationBtn").addEventListener("click",()=>toast("You are all caught up."));
    $("#view").addEventListener("click",e=>{if(e.target.id==="newCollection"){const name=prompt("Collection name");if(name?.trim()){const list=read("cz_collections",[]);list.push({id:String(Date.now()),name:name.trim(),items:[]});write("cz_collections",list);renderCollections();}}});
    window.addEventListener("hashchange",render);
    document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();$("#globalSearch").focus();}});
  }
  document.documentElement.dataset.theme=localStorage.getItem("cz_theme")||"dark";
  $("#year").textContent=new Date().getFullYear();
  initBackend(); bind(); loadResources();
  if("serviceWorker" in navigator && location.protocol.startsWith("http")) navigator.serviceWorker.register("/service-worker.js").catch(console.warn);
})();