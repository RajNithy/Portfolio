"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Project = {
  id: string; title: string; category: string; project_type: string;
  description: string; image_url: string | null; video_url: string | null;
  published: boolean; created_at: string;
};

const blank = { title: "", category: "Graphic Design", project_type: "SOCIAL MEDIA DESIGN", description: "", published: true };
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

  async function load() {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) setMessage(error.message); else setProjects(data || []);
  }
  useEffect(() => { load(); }, []);

  function reset() { setForm(blank); setImage(null); setVideo(null); setEditing(null); }

  function startEdit(p: Project) {
    setEditing(p.id);
    setForm({ title: p.title, category: p.category, project_type: p.project_type, description: p.description || "", published: p.published });
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
      const payload: any = { ...form, ...(image_url ? { image_url } : {}), ...(video_url ? { video_url } : {}) };
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

  async function togglePublished(p: Project) {
    const { error } = await supabase.from("projects").update({ published: !p.published }).eq("id", p.id);
    setMessage(error ? error.message : (p.published ? "Project unpublished." : "Project published."));
    await load();
  }

  const shown = filter === "All" ? projects : projects.filter(p => p.category === filter);

  return (
    <main className="dashboard-screen">
      <header className="dashboard-top">
        <a href="/" className="admin-brand"><span>R.</span> RAAK EDITZ <small> / ADMIN</small></a>
        <div className="dashboard-top-actions"><a href="/" target="_blank" rel="noreferrer">View website ↗</a><button onClick={() => supabase.auth.signOut()}>Sign out</button></div>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-heading"><div><p className="admin-kicker">YOUR CREATIVE SPACE</p><h1>Portfolio manager.</h1><p className="admin-muted">Upload your poster or video, then publish it to your website.</p></div><div className="project-count"><strong>{projects.length}</strong><span>PROJECTS</span></div></div>

        <section className="admin-panel">
          <div className="admin-panel-heading"><div><p className="admin-kicker">{editing ? "EDIT PROJECT" : "NEW PROJECT"}</p><h2>{editing ? "Update your work" : "Add to your portfolio"}</h2></div>{editing && <button type="button" className="admin-secondary" onClick={reset}>Cancel edit</button>}</div>
          <form className="project-form" onSubmit={save}>
            <div className="admin-form-grid">
              <label>Project title<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required placeholder="e.g. Diwali campaign poster"/></label>
              <label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Graphic Design</option><option>Video Editing</option><option>Branding</option></select></label>
              <label>Project label<input value={form.project_type} onChange={e=>setForm({...form,project_type:e.target.value})} placeholder="e.g. PROMOTIONAL REEL"/></label>
            </div>
            <label>Short description<textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Briefly describe this project…"/></label>
            <div className="admin-form-grid">
              <label className="upload-box"><span className="upload-symbol">＋</span><strong>{image ? image.name : "Choose poster / thumbnail"}</strong><small>JPG, PNG, WebP · up to 50 MB</small><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={e=>setImage(e.target.files?.[0] || null)}/></label>
              <label className="upload-box"><span className="upload-symbol">▶</span><strong>{video ? video.name : "Choose video file"}</strong><small>MP4, WebM, MOV · up to 50 MB</small><input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={e=>setVideo(e.target.files?.[0] || null)}/></label>
            </div>
            <p className="upload-note">Video uploads are stored online and play directly in your portfolio. For videos larger than 50 MB, compress the export or use a YouTube embed in a future update.</p>
            <label className="publish-toggle"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publish this project on my public website</label>
            <button className="admin-primary" disabled={busy}>{busy ? "Uploading and saving…" : editing ? "Save changes →" : "Add project →"}</button>
          </form>
          {message && <p className="admin-message">{message}</p>}
        </section>

        <section className="admin-projects">
          <div className="admin-panel-heading"><div><p className="admin-kicker">CONTENT LIBRARY</p><h2>Your projects</h2></div><select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Video Editing</option><option>Graphic Design</option><option>Branding</option></select></div>
          {shown.length === 0 ? <div className="empty-projects">No projects here yet. Add your first project above.</div> :
            <div className="admin-project-list">{shown.map(p=><article className="admin-project-item" key={p.id}>
              <div className="admin-thumb">{p.image_url ? <img src={p.image_url} alt=""/> : p.video_url ? <span>▶</span> : <span>✳</span>}</div>
              <div className="admin-project-info"><strong>{p.title}</strong><small>{p.category} · {p.project_type}{p.video_url ? " · Video attached" : ""}</small><span className={p.published ? "published-label" : "draft-label"}>{p.published ? "PUBLISHED" : "DRAFT"}</span></div>
              <div className="admin-item-actions"><button onClick={()=>startEdit(p)}>Edit</button><button onClick={()=>togglePublished(p)}>{p.published ? "Unpublish" : "Publish"}</button><button className="delete-action" onClick={()=>remove(p.id)}>Delete</button></div>
            </article>)}</div>}
        </section>
      </div>
    </main>
  );
}
