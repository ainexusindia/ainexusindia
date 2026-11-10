/* Content lives in content.json (projects, gallery, showreel) and feed.json (auto-updated). */
let C={projects:[],gallery:[],showreel:""},F={videos:[]};
const FILTERS=[["all","All Projects"],["cinematic","Cinematic & Music"],["myth","Mythological & Devotional"],["tech","AI & Technology"],["cyber","Cybersecurity & Awareness"],["edu","Educational Content"]];
const ICON=p=>`<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const STRENGTHS=[
["Original concept development","I enjoy developing original ideas, unusual concepts and fresh ways of presenting stories rather than reproducing existing content.",'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>'],
["Visual imagination","I visualise scenes, environments, characters, camera perspectives and lighting moods before production begins.",'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'],
["Storytelling and script development","I start by understanding the idea, shaping the narrative and planning how the story unfolds visually and emotionally.",'<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z M8 9h8M8 13h6"/>'],
["Prompt engineering and iteration","AI tools are creative instruments. I develop and refine prompts until the result matches the intention.",'<path d="M4 6l6 6-6 6M12 18h8"/>'],
["Consistency and continuity","I keep characters, environments, storytelling and presentation consistent across scenes, refining outputs repeatedly.",'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M8 5v4M16 5v4"/>'],
["Creative quality control","My QA background helps me review outputs systematically, spot inconsistencies and improve the final production.",'<path d="M5 12l4 4 10-10"/>']];
const TOOLS=[
["Visual generation and image creation",[["Google Flow","AI image generation and visual concept creation"],["Canva","Image design, graphic composition and creative assets"]]],
["AI video and animation",[["Google Flow","AI video generation and cinematic visual scenes"],["Grok","Animation-led videos and short-form visual content"]]],
["Video editing and post-production",[["Microsoft Clipchamp","Primary video editing and assembly"],["VSDC Video Editor","Additional editing and refinement on selected projects"]]],
["Music and audio production",[["Suno AI","AI-generated music, songs and vocals"],["ElevenLabs","AI-assisted voiceovers and narration"]]],
["Thinking, planning and script development",[["ChatGPT","Research, ideation and scripting support"],["Claude","Creative planning and story development"],["Google Gemini","Prompt refinement and content organisation"]]]];
const FLOW=[["Idea and concept","Begin with an original idea, objective, subject and intended audience."],["Research and story development","Explore the subject, develop the narrative, define the emotional direction and prepare the script."],["Visualisation and scene planning","Imagine characters, environments, camera perspectives, composition, mood and continuity."],["AI prompt development","Create and refine prompts that guide generation toward the intended outcome."],["Image, video and animation generation","Use suitable AI tools to develop assets, scenes, motion and animated sequences."],["Music, vocals and voiceover","Integrate music, vocals, narration and audio using the available tools."],["Editing and refinement","Assemble the content, refine pacing, improve transitions and align visuals with the narrative."],["Quality review and final delivery","Review visual consistency, storytelling and audio alignment before publication."]];
const $=s=>document.querySelector(s),esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
$("#strengths").innerHTML=STRENGTHS.map(s=>`<article class="card rv">${ICON(s[2])}<h3>${s[0]}</h3><p>${s[1]}</p></article>`).join("");
$("#tools").innerHTML=TOOLS.map(t=>`<article class="card rv"><h3>${t[0]}</h3><ul>${t[1].map(x=>`<li><b>${x[0]}</b>: ${x[1]}</li>`).join("")}</ul></article>`).join("");
$("#flow").innerHTML=FLOW.map((f,i)=>`<li class="rv"><span>${i+1}</span><h3>${f[0]}</h3><p>${f[1]}</p></li>`).join("");
function render(){
const CH="https://www.youtube.com/@AINEXUSINDIA";
$("#projects").innerHTML=C.projects.map(p=>{const v=p.videoId;return `<article class="proj" data-tags="${p.tags.join(" ")}">
<div class="thumb">${v?`<img loading="lazy" src="https://i.ytimg.com/vi/${v}/hqdefault.jpg" alt="Thumbnail of ${esc(p.title)}"><button class="play" data-id="${v}" aria-label="Play ${esc(p.title)}"></button>`:`<span>Thumbnail appears here once you add this project's YouTube video ID</span>`}</div>
<div class="pb"><span class="cat">${p.cat}</span><h3>${p.title}</h3><p>${p.desc}</p>
${p.role.length?`<ul>${p.role.map(r=>`<li>${r}</li>`).join("")}</ul>`:""}
${p.tools.length?`<span class="tools">Tools: ${p.tools.join(", ")}</span>`:""}${p.note?`<span class="note">${p.note}</span>`:""}
<a class="btn" target="_blank" rel="noopener" href="${v?"https://www.youtube.com/watch?v="+v:CH}">${v?"Watch Project":"Watch on the channel"}</a></div></article>`}).join("");
$("#filters").innerHTML=FILTERS.map((f,i)=>`<button data-f="${f[0]}" aria-pressed="${!i}">${f[1]}</button>`).join("");
$("#filters").onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll("#filters button").forEach(x=>x.setAttribute("aria-pressed",x===b));
document.querySelectorAll(".proj").forEach(c=>c.hidden=!(b.dataset.f=="all"||c.dataset.tags.split(" ").includes(b.dataset.f)))};
const embed=(el,id)=>{el.insertAdjacentHTML("beforeend",`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&rel=0" title="YouTube video player" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen loading="lazy"></iframe>`)};
$("#projects").onclick=e=>{const b=e.target.closest(".play");if(b){embed(b.parentElement,b.dataset.id);b.remove()}};
const reel=$("#reel");if(C.showreel)embed(reel,C.showreel);else reel.textContent="Showreel coming soon";
$("#reelform").onsubmit=e=>{e.preventDefault();const m=$("#reelurl").value.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
if(!m){alert("Please paste a valid YouTube link.");return}reel.innerHTML="";embed(reel,m[1])};

const G=C.gallery||[];$("#gallery").hidden=!G.length;
$("#gal").innerHTML=G.map(g=>`<figure><img loading="lazy" src="${esc(g.src)}" alt="${esc(g.alt||"Creative still")}">${g.caption?`<figcaption>${esc(g.caption)}</figcaption>`:""}</figure>`).join("");
const V=F.videos||[];const showFeed=k=>{const l=V.filter(v=>!!v.isShort==(k=="shorts")).slice(0,12);
$("#fl").className="feed "+k;$("#fl").innerHTML=l.length?l.map(v=>`<a class="fc" target="_blank" rel="noopener" href="https://www.youtube.com/${v.isShort?"shorts/":"watch?v="}${v.id}"><img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="Thumbnail: ${esc(v.title)}"><span>${esc(v.title)}</span></a>`).join(""):'<p class="sub">New uploads appear here automatically once the GitHub Action is switched on.</p>';
document.querySelectorAll("#ft button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.k==k))};
$("#ft").onclick=e=>{const b=e.target.closest("button");if(b)showFeed(b.dataset.k)};showFeed("videos");
}
const nav=$("#menu"),bg=document.querySelector(".burger");
bg.onclick=()=>bg.setAttribute("aria-expanded",nav.classList.toggle("open"));nav.onclick=e=>{if(e.target.tagName=="A"){nav.classList.remove("open");bg.setAttribute("aria-expanded","false")}};
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("in");io.unobserve(x.target)}}),{threshold:.15});
document.querySelectorAll(".rv").forEach(e=>io.observe(e));
const get=(w,u,d)=>window[w]?Promise.resolve(window[w]):fetch(u).then(r=>r.json()).catch(()=>d);
Promise.all([get("__CONTENT__","content.json",C),get("__FEED__","feed.json",F)]).then(([c,f])=>{C=c;F=f;render()});

/* decorative art (generated) */
const fr=[200,280,330,30,160,260,10,310].map(h=>`<i style="--h:${h}"></i>`).join("");$("#film").innerHTML=fr+fr;
const hero=document.querySelector(".hero");for(let i=0;i<22;i++){const b=document.createElement("b");b.className="em";
b.style.cssText=`left:${(i*47)%100}%;width:${3+(i%4)*2}px;height:${3+(i%4)*2}px;animation-duration:${9+(i*3)%9}s;animation-delay:-${(i*5)%14}s;background:${["#FFB23E","#FF3D81","#22F0CC"][i%3]}`;hero.appendChild(b)}
