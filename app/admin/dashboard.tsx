"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type BrandSettings = {
  brand_name: string; logo_url: string | null; hero_kicker: string; hero_title_line1: string; hero_title_line2: string; hero_description: string;
  about_kicker: string; about_title_line1: string; about_title_line2: string; about_paragraph1: string; about_paragraph2: string;
  contact_kicker: string; contact_title_line1: string; contact_title_line2: string; contact_description: string;
  instagram_url: string; whatsapp_number: string; contact_email: string;
  service_intro: string; service1_title: string; service1_description: string; service2_title: string; service2_description: string; service3_title: string; service3_description: string;
};
const defaultBrand: BrandSettings = {
  brand_name: "Raak Editz", logo_url: null, hero_kicker: "INDEPENDENT CREATIVE STUDIO", hero_title_line1: "Visuals that", hero_title_line2: "make an impact.",
  hero_description: "I turn ideas into scroll-stopping videos and memorable designs. Thoughtful visuals, sharp edits, and creative work built to connect.",
  about_kicker: "A LITTLE ABOUT ME", about_title_line1: "Good design gets noticed.", about_title_line2: "Great stories stay.",
  about_paragraph1: "Raak Editz is a creative space for video editing and graphic design. I enjoy shaping raw ideas into polished visual stories — whether that’s a fast-paced reel, a campaign poster or a complete brand look.",
  about_paragraph2: "This portfolio is a growing collection of selected work. Each project is an opportunity to experiment, solve a visual problem and make something people remember.",
  contact_kicker: "AVAILABLE FOR SELECT PROJECTS", contact_title_line1: "Have an idea?", contact_title_line2: "Let’s make it real.", contact_description: "Tell me what you’re working on. Let’s create something worth looking at.",
  instagram_url: "https://www.instagram.com/raak_editz/", whatsapp_number: "", contact_email: "", service_intro: "From the first rough idea to the final export, I focus on making every frame and every detail count.",
  service1_title: "Video editing", service1_description: "Reels, promotional videos, cinematic edits, short-form content and motion-led storytelling.",
  service2_title: "Graphic design", service2_description: "Social media creatives, posters, thumbnails, campaign artwork and advertising layouts.",
  service3_title: "Branding & creative", service3_description: "Logo concepts, visual direction and consistent design assets for growing brands."
};

type Project = {
  id: string; title: string; category: string; project_type: string;
  description: string; image_url: string | null; video_url: string | null;
  published: boolean; created_at: string; sort_order?: number;
};

const blank = { title: "", category: "Poster Design", project_type: "POSTER DESIGN", description: "", published: true };
const MAX_FILE_BYTES = 50 * 1024 * 1024;

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState(blank);
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");
  const [brand, setBrand] = useState<BrandSettings>(defaultBrand);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [brandBusy, setBrandBusy] = useState(false);
  const [brandMessage, setBrandMessage] = useState("");

  async function loadBrand() {
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) { setBrandMessage(`Brand settings: ${error.message}. Run the updated SQL setup in Supabase.`); return; }
    if (data) setBrand({ ...defaultBrand, ...data });
  }
  async function load() {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setProjects(data || []);
  }
  useEffect(() => { load(); loadBrand(); }, []);

  async function saveBrand(e: React.FormEvent) {
    e.preventDefault(); setBrandBusy(true); setBrandMessage("");
    try {
      let logo_url = brand.logo_url;
      if (logoFile) logo_url = await uploadFile(logoFile, "poster");
      const payload = { ...brand, logo_url, id: 1, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
      if (error) throw error;
      setBrand({ ...brand, logo_url }); setLogoFile(null); setBrandMessage("Website branding saved. Refresh your public website to see the changes.");
    } catch (err: any) { setBrandMessage(err.message || "Could not save website branding."); }
    finally { setBrandBusy(false); }
  }
  function updateBrand<K extends keyof BrandSettings>(key: K, value: BrandSettings[K]) { setBrand(prev => ({ ...prev, [key]: value })); }

  function reset() { setForm(blank); setImage(null); setVideo(null); setEditing(null); }

  function startEdit(p: Project) {
    setEditing(p.id);
    setForm({ title: p.title, category: p.category === "AI Generated Ads" ? "AI Generated Ads" : (p.category === "Video Editing" ? "Video Editing" : (p.video_url ? "Video Editing" : "Poster Design")), project_type: p.category === "AI Generated Ads" ? "AI GENERATED ADS" : (p.category === "Video Editing" || p.video_url ? "VIDEO EDITING" : "POSTER DESIGN"), description: p.description || "", published: p.published });
    setImage(null); setVideo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFile(file: File, kind: "poster" | "video") {
    if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} is larger than 50 MB. Compress it or use a shorter/lower-resolution export.`);
    const safeName = `${kind}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
    const { error } = await supabase.storage.from("portfolio").upload(safeName, file, { upsert: false, contentType: file.type });
    if (error) throw error;
    return supabase.storage.from("portfolio").getPublicUrl(safeName).data.publicUrl;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      let image_url: string | null | undefined;
      let video_url: string | null | undefined;
      if (image) image_url = await uploadFile(image, "poster");
      if (video) video_url = await uploadFile(video, "video");
      const payload: any = { ...form, project_type: form.category.toUpperCase(), ...(image_url ? { image_url } : {}), ...(video_url ? { video_url } : {}) };
      if (editing) {
        const { error } = await supabase.from("projects").update(payload).eq("id", editing);
        if (error) throw error;
        setMessage("Project updated.");
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
        setMessage("Project added to your portfolio.");
      }
      reset(); await load();
    } catch (err: any) { setMessage(err.message || "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this portfolio project? This cannot be undone.")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    setMessage(error ? error.message : "Project deleted.");
    await load();
  }

  async function moveProject(project: Project, direction: -1 | 1) {
    const categoryProjects = shown.filter((item) => categoryOf(item) === categoryOf(project));
    const index = categoryProjects.findIndex((item) => item.id === project.id);
    const target = categoryProjects[index + direction];
    if (!target) return;
    const reordered = [...categoryProjects];
    [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
    setBusy(true);
    setMessage("");
    try {
      for (let i = 0; i < reordered.length; i++) {
        const { error } = await supabase.from("projects").update({ sort_order: i + 1 }).eq("id", reordered[i].id);
        if (error) throw error;
      }
      setMessage("Project order updated.");
      await load();
    } catch (err: any) {
      setMessage(err.message || "Could not update project order. Check that the sort_order column exists in Supabase.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(p: Project) {
    const { error } = await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
    setMessage(error ? error.message : (p.published ? "Project unpublished." : "Project published."));
    await load();
  }

  const categoryOf = (p: Project) => p.category === "AI Generated Ads" ? "AI Generated Ads" : (p.category === "Video Editing" ? "Video Editing" : (p.video_url ? "Video Editing" : "Poster Design"));
  const shown = filter === "All" ? projects : projects.filter(p => categoryOf(p) === filter);

  return (
    <main className="dashboard-screen">
      <header className="dashboard-top">
        <a href="/" className="admin-brand"><span>R.</span> RAAK EDITZ <small> / ADMIN</small></a>
        <div className="dashboard-top-actions"><a href="/" target="_blank" rel="noreferrer">View website ↗</a><button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-heading"><div><p className="admin-kicker">YOUR CREATIVE SPACE</p><h1>Portfolio manager.</h1><p className="admin-muted">Choose a category manually for every project: Video Editing, Poster Design, or AI Generated Ads. You can upload a video, an image, or both.</p></div><div className="project-count"><strong>{projects.length}</strong><span>PROJECTS</span></div></div>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">WEBSITE CONTENT</p><h2>Brand & text settings</h2></div></div>
          <form className="project-form" onSubmit={saveBrand}>
            <div className="admin-form-grid">
              <label>Website / brand name<input value={brand.brand_name} onChange={e=>updateBrand("brand_name",e.target.value)} required /></label>
              <label className="upload-box"><span className="upload-symbol">＋</span><strong>{logoFile ? logoFile.name : "Upload / replace logo"}</strong><small>PNG, JPG, WebP · transparent PNG recommended</small><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setLogoFile(e.target.files?.[0] || null)}/></label>
            </div>
            {brand.logo_url && <div className="brand-logo-preview"><img src={brand.logo_url} alt="Current website logo"/><button type="button" className="admin-secondary" onClick={()=>{updateBrand("logo_url",null);setLogoFile(null)}}>Remove logo</button></div>}
            <div className="admin-form-grid">
              <label>Hero small heading<input value={brand.hero_kicker} onChange={e=>updateBrand("hero_kicker",e.target.value)} /></label>
              <label>Main headline – first line<input value={brand.hero_title_line1} onChange={e=>updateBrand("hero_title_line1",e.target.value)} /></label>
              <label>Main headline – second line<input value={brand.hero_title_line2} onChange={e=>updateBrand("hero_title_line2",e.target.value)} /></label>
              <label>Hero introduction<textarea rows={3} value={brand.hero_description} onChange={e=>updateBrand("hero_description",e.target.value)} /></label>
            </div>
            <div className="admin-form-grid">
              <label>About small heading<input value={brand.about_kicker} onChange={e=>updateBrand("about_kicker",e.target.value)} /></label>
              <label>About headline – first line<input value={brand.about_title_line1} onChange={e=>updateBrand("about_title_line1",e.target.value)} /></label>
              <label>About headline – second line<input value={brand.about_title_line2} onChange={e=>updateBrand("about_title_line2",e.target.value)} /></label>
              <label>About paragraph 1<textarea rows={3} value={brand.about_paragraph1} onChange={e=>updateBrand("about_paragraph1",e.target.value)} /></label>
              <label>About paragraph 2<textarea rows={3} value={brand.about_paragraph2} onChange={e=>updateBrand("about_paragraph2",e.target.value)} /></label>
            </div>
            <div className="admin-form-grid">
              <label>Services introduction<textarea rows={3} value={brand.service_intro} onChange={e=>updateBrand("service_intro",e.target.value)} /></label>
              <label>Service 1 title<input value={brand.service1_title} onChange={e=>updateBrand("service1_title",e.target.value)} /></label>
              <label>Service 1 description<textarea rows={2} value={brand.service1_description} onChange={e=>updateBrand("service1_description",e.target.value)} /></label>
              <label>Service 2 title<input value={brand.service2_title} onChange={e=>updateBrand("service2_title",e.target.value)} /></label>
              <label>Service 2 description<textarea rows={2} value={brand.service2_description} onChange={e=>updateBrand("service2_description",e.target.value)} /></label>
              <label>Service 3 title<input value={brand.service3_title} onChange={e=>updateBrand("service3_title",e.target.value)} /></label>
              <label>Service 3 description<textarea rows={2} value={brand.service3_description} onChange={e=>updateBrand("service3_description",e.target.value)} /></label>
            </div>
            <div className="admin-form-grid">
              <label>Contact small heading<input value={brand.contact_kicker} onChange={e=>updateBrand("contact_kicker",e.target.value)} /></label>
              <label>Contact headline – first line<input value={brand.contact_title_line1} onChange={e=>updateBrand("contact_title_line1",e.target.value)} /></label>
              <label>Contact headline – second line<input value={brand.contact_title_line2} onChange={e=>updateBrand("contact_title_line2",e.target.value)} /></label>
              <label>Contact introduction<textarea rows={2} value={brand.contact_description} onChange={e=>updateBrand("contact_description",e.target.value)} /></label>
              <label>Instagram URL<input value={brand.instagram_url} onChange={e=>updateBrand("instagram_url",e.target.value)} placeholder="https://instagram.com/yourpage" /></label>
              <label>WhatsApp number<input value={brand.whatsapp_number} onChange={e=>updateBrand("whatsapp_number",e.target.value)} placeholder="Country code + number, digits only" /></label>
              <label>Contact email<input type="email" value={brand.contact_email} onChange={e=>updateBrand("contact_email",e.target.value)} placeholder="you@example.com" /></label>
            </div>
            <button className="admin-primary" disabled={brandBusy}>{brandBusy ? "Saving website settings…" : "Save website branding →"}</button>
          </form>
          {brandMessage && <p className="admin-message">{brandMessage}</p>}
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">{editing ? "EDIT PROJECT" : "NEW PROJECT"}</p><h2>{editing ? "Update your work" : "Add to your portfolio"}</h2></div>{editing && <button type="button" className="admin-secondary" onClick={reset}>Cancel edit</button>}</div>
          <form className="project-form" onSubmit={save}>
            <div className="admin-form-grid">
              <label>Project title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="e.g. Diwali campaign poster"/></label>
              <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value,project_type:e.target.value.toUpperCase()})}><option>Video Editing</option><option>Poster Design</option><option>AI Generated Ads</option></select></label>
            </div>
            <label>Short description<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Briefly describe this project…"/></label>
            {editing && (() => {
              const current = projects.find(project => project.id === editing);
              return current ? <div className="admin-current-media">
                <strong>Currently uploaded media</strong>
                <div className="admin-form-grid">
                  {current.image_url && <div><small>Current image / thumbnail</small><a href={current.image_url} target="_blank" rel="noreferrer">View current image ↗</a></div>}
                  {current.video_url && <div><small>Current video</small><a href={current.video_url} target="_blank" rel="noreferrer">Open current video ↗</a></div>}
                </div>
                <small>Leave the upload fields empty to keep the existing files. Choose a new file only if you want to replace that media.</small>
              </div> : null;
            })()}
            <div className="admin-form-grid">
              <label className="upload-box"><span className="upload-symbol">＋</span><strong>{image ? image.name : editing ? "Replace poster / thumbnail (optional)" : "Choose poster / thumbnail"}</strong><small>JPG, PNG, WebP · up to 50 MB</small><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>setImage(e.target.files?.[0] || null)}/></label>
              <label className="upload-box"><span className="upload-symbol">▶</span><strong>{video ? video.name : editing ? "Replace video file (optional)" : "Choose video file"}</strong><small>MP4, WebM, MOV · up to 50 MB</small><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setVideo(e.target.files?.[0] || null)}/></label>
            </div>
            <p className="upload-note">When editing, you can change the title, description, category and publish status. Leave media fields empty to keep existing uploads; select a new file to replace it. Video uploads are stored online and play directly in your portfolio. For videos larger than 50 MB, compress the export or use a YouTube embed in a future update.</p>
            <label className="publish-toggle"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publish this project on my public website</label>
            <button className="admin-primary" disabled={busy}>{busy ? "Uploading and saving…" : editing ? "Save changes →" : "Add project →"}</button>
          </form>
          {message && <p className="admin-message">{message}</p>}
        </section>

        <section className="admin-projects">
          <div className="admin-panel-heading"><div><p className="admin-kicker">CONTENT LIBRARY</p><h2>Your projects</h2></div><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Video Editing</option><option>Poster Design</option><option>AI Generated Ads</option></select></div>
          {shown.length === 0 ? <div className="empty-projects">No projects here yet. Add your first project above.</div> :
            <div className="admin-project-list">{shown.map(p=><article className="admin-project-item" key={p.id}>
              <div className="admin-thumb">{p.image_url ? <img src={p.image_url} alt=""/> : p.video_url ? <span>▶</span> : <span>✳</span>}</div>
              <div className="admin-project-info"><strong>{p.title}</strong><small>{categoryOf(p)}{p.video_url ? " · Video attached" : " · Image"}</small><span className={p.published ? "published-label" : "draft-label"}>{p.published ? "PUBLISHED" : "DRAFT"}</span></div>
              <div className="admin-item-actions"><button type="button" title="Move up" disabled={busy || shown.filter(item=>categoryOf(item)===categoryOf(p)).findIndex(item=>item.id===p.id)===0} onClick={()=>moveProject(p,-1)}>↑</button><button type="button" title="Move down" disabled={busy || shown.filter(item=>categoryOf(item)===categoryOf(p)).findIndex(item=>item.id===p.id)===shown.filter(item=>categoryOf(item)===categoryOf(p)).length-1} onClick={()=>moveProject(p,1)}>↓</button><button onClick={()=>startEdit(p)}>Edit</button><button onClick={()=>togglePublished(p)}>{p.published ? "Unpublish" : "Publish"}</button><button className="delete-action" onClick={()=>remove(p.id)}>Delete</button></div>
            </article>)}</div>}
        </section>
      </div>
    </main>
  );
}
