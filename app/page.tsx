"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Instagram, Mail, Menu,
  Play, Video, Palette, Clapperboard, X, MessageCircle, Sparkles
} from "lucide-react";

type SiteSettings = {
  brand_name: string; logo_url: string | null; hero_kicker: string; hero_title_line1: string; hero_title_line2: string; hero_description: string;
  about_kicker: string; about_title_line1: string; about_title_line2: string; about_paragraph1: string; about_paragraph2: string;
  contact_kicker: string; contact_title_line1: string; contact_title_line2: string; contact_description: string;
  instagram_url: string; whatsapp_number: string; contact_email: string;
  service_intro: string; service1_title: string; service1_description: string; service2_title: string; service2_description: string; service3_title: string; service3_description: string;
};
const defaultSettings: SiteSettings = {
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
  title: string;
  category: "Video Editing" | "Poster Design";
  type: string;
  number: string;
  description: string;
  visual: string;
  image_url?: string | null;
  video_url?: string | null;
};

const projects: Project[] = [
  { title: "Campaign in Motion", category: "Video Editing", type: "PROMOTIONAL FILM", number: "01", description: "A punchy promotional edit built around rhythm, movement and a clear brand message.", visual: "visual-one" },
  { title: "Festival Stories", category: "Poster Design", type: "SOCIAL MEDIA CAMPAIGN", number: "02", description: "A bold festive visual system designed to stand out in a crowded social feed.", visual: "visual-two" },
  { title: "After Hours", category: "Video Editing", type: "CINEMATIC REEL", number: "03", description: "A cinematic short-form edit with atmospheric pacing and expressive transitions.", visual: "visual-three" },
  { title: "Brand Language", category: "Poster Design", type: "IDENTITY CONCEPT", number: "04", description: "A visual identity direction connecting typography, colour and brand personality.", visual: "visual-four" },
  { title: "The Big Offer", category: "Poster Design", type: "ADVERTISING CREATIVE", number: "05", description: "A high-impact promotional layout that puts the offer and product first.", visual: "visual-five" },
  { title: "Sound & Vision", category: "Video Editing", type: "MOTION EXPERIMENT", number: "06", description: "An energetic edit exploring sound-led cuts, kinetic type and visual flow.", visual: "visual-six" }
];

function AutoPreview({ src, poster, title }: { src: string; poster?: string | null; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      });
    }, { threshold: [0, 0.35, 0.7] });
    observer.observe(video);
    return () => { observer.disconnect(); video.pause(); };
  }, [src]);
  return <video ref={videoRef} className="gallery-video" src={src} poster={poster || undefined} muted loop playsInline preload="metadata" aria-label={title} />;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [liveProjects, setLiveProjects] = useState<Project[] | null>(null);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => { if (data) setSettings({ ...defaultSettings, ...data }); });
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    supabase.from("projects").select("*").eq("published", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setLiveProjects(data.map((p: any, i: number) => ({
          title: p.title, category: p.video_url ? "Video Editing" : "Poster Design", type: p.video_url ? "VIDEO EDITING" : "POSTER DESIGN",
          number: String(i + 1).padStart(2, "0"), description: p.description || "",
          visual: ["visual-one","visual-two","visual-three","visual-four","visual-five","visual-six"][i % 6],
          image_url: p.image_url, video_url: p.video_url
        })));
      });
  }, []);
  const currentProjects = liveProjects ?? projects;
  const groupedProjects = useMemo(() => {
    const normalized = currentProjects.map((project) => ({
      ...project,
      category: project.video_url ? "Video Editing" : "Poster Design",
      type: project.video_url ? "VIDEO EDITING" : "POSTER DESIGN"
    }));
    return [
      { key: "video-editing", title: "VIDEO EDITING", category: "Video Editing", items: normalized.filter((project) => project.video_url) },
      { key: "poster-design", title: "POSTER DESIGN", category: "Poster Design", items: normalized.filter((project) => !project.video_url && project.image_url) }
    ].filter((group) => group.items.length > 0);
  }, [currentProjects]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <div className="noise" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Raak Editz home">
          {settings.logo_url ? <img className="site-logo-image" src={settings.logo_url} alt={settings.brand_name} /> : <><span className="brand-mark">R<span>.</span></span><span className="brand-name">{settings.brand_name.split(" ")[0]}<span>{settings.brand_name.split(" ").slice(1).join(" ")}</span></span></>}
        </a>
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={menuOpen ? "nav nav-open" : "nav"}>
          <a href="#work" onClick={closeMenu}>Selected work</a>
          <a href="#services" onClick={closeMenu}>What I do</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a className="nav-contact" href="#contact" onClick={closeMenu}>Let&apos;s talk <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <section className="hero section-wrap" id="home">
        <div className="hero-copy">
          <motion.div className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <span className="status-dot" /> {settings.hero_kicker}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .1 }}>
            {settings.hero_title_line1}<br /><span>{settings.hero_title_line2}</span>
          </motion.h1>
          <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35, duration: .7 }}>
            {settings.hero_description}
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .45 }}>
            <a className="button button-primary" href="#work">Explore my work <ArrowDownRight size={17} /></a>
            <a className="text-link" href="#contact">Start a project <ArrowUpRight size={16} /></a>
          </motion.div>
          <div className="hero-meta">
            <div><strong>VIDEO</strong><span>Editing & motion</span></div>
            <div><strong>DESIGN</strong><span>Posters & identity</span></div>
            <div><strong>DETAIL</strong><span>Made with intention</span></div>
          </div>
        </div>
        <motion.div className="hero-art" initial={{ opacity: 0, scale: .94, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .9, delay: .2 }}>
          <div className="art-glow" />
          <div className="art-frame">
            <div className="art-topline"><span>REEL / 2026</span><span>01—06</span></div>
            <div className="art-center art-center-portrait">
              <img
                className="hero-portrait"
                src="/hero-portrait.webp"
                alt="Raak Editz creator portrait"
                fetchPriority="high"
              />
              <div className="hero-portrait-shade" />
              <div className="art-label label-top">RAAK EDITZ</div>
              <div className="art-label label-bottom">VIDEO × DESIGN</div>
            </div>
            <div className="art-bottomline"><span>DESIGN × MOTION</span><span className="sound-bars"><i /><i /><i /><i /><i /><i /><i /></span></div>
          </div>
          <div className="floating-tag"><Sparkles size={14} /> MADE TO STAND OUT</div>
          <div className="hero-index">01 <span>/</span> 04</div>
        </motion.div>
        <a className="scroll-cue" href="#work"><span /> SCROLL TO EXPLORE</a>
      </section>

      <section className="work-section section-wrap" id="work">
        <div className="gallery-intro">
          <div className="eyebrow"><span className="status-dot" /> THE RAAK EDITZ SHOWREEL COLLECTION</div>
          <h2>Work that <span>moves.</span></h2>
          <p>Promotional films, reels, visual stories and design experiments — selected work from the studio.</p>
        </div>
        <div className="gallery-groups">
          {groupedProjects.map((group, groupIndex) => (
            <section className="gallery-section" key={group.key} aria-label={group.title}>
              <motion.div className="gallery-section-title" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }}>
                <span>{String(groupIndex + 1).padStart(2, "0")}</span><h3>{group.title}</h3><span className="gallery-section-count">{String(group.items.length).padStart(2, "0")} PROJECTS</span>
              </motion.div>
              <div className="gallery-grid">
                {group.items.map((project, index) => (
                  <motion.button key={`${project.number}-${project.title}`} className="gallery-card" onClick={() => setSelected(project)} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .15 }} transition={{ duration: .45, delay: Math.min(index * .06, .24) }}>
                    <div className="gallery-media">
                      {project.video_url ? <AutoPreview src={project.video_url} poster={project.image_url} title={project.title} /> : project.image_url ? <img className="gallery-image" src={project.image_url} alt={project.title} loading="lazy" /> : <div className={`gallery-placeholder ${project.visual}`}><span>RAAK EDITZ</span></div>}
                      <span className="gallery-play"><Play size={15} fill="currentColor" /></span>
                      <span className="gallery-card-index">{project.number}</span>
                    </div>
                    <div className="gallery-card-caption"><span>{project.category}</span><strong>{project.title}</strong></div>
                  </motion.button>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="work-note"><span className="note-line" /> SELECTED CREATIVE WORK — UPDATED THROUGH THE CREATOR DASHBOARD.</div>
      </section>

      <section className="services-section" id="services">
        <div className="section-wrap">
          <div className="section-heading">
            <div><div className="eyebrow">WHAT I BRING TO THE TABLE</div><h2>Creative work,<br /><span>made clear.</span></h2></div>
            <p>{settings.service_intro}</p>
          </div>
          <div className="service-list">
            <div className="service-row"><div className="service-icon"><Video /></div><div><span>01 / MOTION</span><h3>{settings.service1_title}</h3><p>{settings.service1_description}</p></div><ArrowUpRight className="service-arrow" /></div>
            <div className="service-row"><div className="service-icon"><Palette /></div><div><span>02 / VISUALS</span><h3>{settings.service2_title}</h3><p>{settings.service2_description}</p></div><ArrowUpRight className="service-arrow" /></div>
            <div className="service-row"><div className="service-icon"><Clapperboard /></div><div><span>03 / IDENTITY</span><h3>{settings.service3_title}</h3><p>{settings.service3_description}</p></div><ArrowUpRight className="service-arrow" /></div>
          </div>
        </div>
      </section>

      <section className="about-section section-wrap" id="about">
        <div className="about-stamp"><span>{settings.brand_name.split(" ")[0]}</span><strong>{settings.brand_name.split(" ").slice(1).join(" ") || "STUDIO"}</strong><i>CREATIVE STUDIO · 2026</i></div>
        <div className="about-copy">
          <div className="eyebrow">{settings.about_kicker}</div>
          <h2>{settings.about_title_line1}<br /><span>{settings.about_title_line2}</span></h2>
          <p>{settings.about_paragraph1}</p>
          <p>{settings.about_paragraph2}</p>
          <div className="skill-tags"><span>Photoshop</span><span>Illustrator</span><span>Premiere Pro</span><span>After Effects</span><span>Lightroom</span><span>Creative Direction</span></div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-wrap contact-inner">
          <div className="eyebrow"><span className="status-dot" /> {settings.contact_kicker}</div>
          <h2>{settings.contact_title_line1}<br /><span>{settings.contact_title_line2}</span></h2>
          <p>{settings.contact_description}</p>
          <a className="button button-primary contact-cta" href={settings.contact_email ? `mailto:${settings.contact_email}?subject=Project%20enquiry` : "#contact"}>Start a conversation <ArrowUpRight size={18} /></a>
          <div className="contact-links">
            <a href={settings.instagram_url || "#contact"} target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram <ArrowUpRight size={14} /></a>
            <a href={settings.whatsapp_number ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, "")}` : "#contact"} target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp <ArrowUpRight size={14} /></a>
            <a href={settings.contact_email ? `mailto:${settings.contact_email}` : "#contact"}><Mail size={17} /> Email <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </section>

      <footer className="footer section-wrap">
        <a className="brand" href="#home">{settings.logo_url ? <img className="site-logo-image" src={settings.logo_url} alt={settings.brand_name} /> : <><span className="brand-mark">R<span>.</span></span><span className="brand-name">{settings.brand_name.split(" ")[0]}<span>{settings.brand_name.split(" ").slice(1).join(" ")}</span></span></>}</a>
        <span>© 2026 {settings.brand_name.toUpperCase()}. MADE WITH INTENTION.</span>
        <a href="#home" className="back-top">BACK TO TOP ↑</a>
      </footer>

      <AnimatePresence>
        {selected && <motion.div className={`modal-backdrop ${selected.video_url ? "video-backdrop" : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
          {selected.video_url ? (
            <motion.div className="fullscreen-video-modal" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .98 }} transition={{ duration: .22 }} onClick={e => e.stopPropagation()}>
              <button className="fullscreen-video-close" onClick={() => setSelected(null)} aria-label="Close video"><X /></button>
              <div className="fullscreen-video-frame">
                <video key={selected.video_url} src={selected.video_url} controls autoPlay playsInline preload="auto" className="fullscreen-project-video" />
              </div>
              <div className="fullscreen-video-caption"><span>{selected.category} / PROJECT {selected.number}</span><strong>{selected.title}</strong></div>
            </motion.div>
          ) : (
            <motion.div className="project-modal" initial={{ opacity: 0, y: 25, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15 }} onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close project details"><X /></button>
              <div className={`modal-art project-visual ${selected.visual}`}>{selected.image_url ? <img className="project-image" src={selected.image_url} alt={selected.title} /> : <><div className="visual-title">{selected.title}</div><div className="visual-type">{selected.type}</div></>}</div>
              <div className="modal-copy"><span>{selected.category} / PROJECT {selected.number}</span><h3>{selected.title}</h3><p>{selected.description}</p></div>
            </motion.div>
          )}
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
