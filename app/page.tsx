"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Instagram, Mail, Menu,
  Play, Video, Palette, Clapperboard, X, MessageCircle, Sparkles
} from "lucide-react";

type Project = {
  title: string;
  category: "Video Editing" | "Graphic Design" | "Branding";
  type: string;
  number: string;
  description: string;
  visual: string;
  image_url?: string | null;
  video_url?: string | null;
};

const projects: Project[] = [
  { title: "Campaign in Motion", category: "Video Editing", type: "PROMOTIONAL FILM", number: "01", description: "A punchy promotional edit built around rhythm, movement and a clear brand message.", visual: "visual-one" },
  { title: "Festival Stories", category: "Graphic Design", type: "SOCIAL MEDIA CAMPAIGN", number: "02", description: "A bold festive visual system designed to stand out in a crowded social feed.", visual: "visual-two" },
  { title: "After Hours", category: "Video Editing", type: "CINEMATIC REEL", number: "03", description: "A cinematic short-form edit with atmospheric pacing and expressive transitions.", visual: "visual-three" },
  { title: "Brand Language", category: "Branding", type: "IDENTITY CONCEPT", number: "04", description: "A visual identity direction connecting typography, colour and brand personality.", visual: "visual-four" },
  { title: "The Big Offer", category: "Graphic Design", type: "ADVERTISING CREATIVE", number: "05", description: "A high-impact promotional layout that puts the offer and product first.", visual: "visual-five" },
  { title: "Sound & Vision", category: "Video Editing", type: "MOTION EXPERIMENT", number: "06", description: "An energetic edit exploring sound-led cuts, kinetic type and visual flow.", visual: "visual-six" }
];

const filters = ["All Work", "Video Editing", "Graphic Design", "Branding"] as const;

export default function Home() {
  const [active, setActive] = useState<(typeof filters)[number]>("All Work");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);
  const [liveProjects, setLiveProjects] = useState<Project[] | null>(null);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    supabase.from("projects").select("*").eq("published", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length) setLiveProjects(data.map((p: any, i: number) => ({
          title: p.title, category: p.category, type: p.project_type || "CREATIVE PROJECT",
          number: String(i + 1).padStart(2, "0"), description: p.description || "",
          visual: ["visual-one","visual-two","visual-three","visual-four","visual-five","visual-six"][i % 6],
          image_url: p.image_url, video_url: p.video_url
        })));
      });
  }, []);
  const currentProjects = liveProjects || projects;
  const visible = useMemo(() => active === "All Work" ? currentProjects : currentProjects.filter(p => p.category === active), [active]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <div className="noise" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Raak Editz home">
          <span className="brand-mark">R<span>.</span></span>
          <span className="brand-name">RAAK<span>EDITZ</span></span>
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
            <span className="status-dot" /> INDEPENDENT CREATIVE STUDIO
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .75, delay: .1 }}>
            Visuals that<br />make an <span>impact.</span>
          </motion.h1>
          <motion.p className="hero-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .35, duration: .7 }}>
            I turn ideas into scroll-stopping videos and memorable designs. Thoughtful visuals, sharp edits, and creative work built to connect.
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
            <div className="art-center">
              <div className="orbit orbit-one" /><div className="orbit orbit-two" />
              <div className="art-core"><span>R</span></div>
              <div className="art-label label-top">CREATE</div>
              <div className="art-label label-bottom">WITHOUT LIMITS</div>
            </div>
            <div className="art-bottomline"><span>DESIGN × MOTION</span><span className="sound-bars"><i /><i /><i /><i /><i /><i /><i /></span></div>
          </div>
          <div className="floating-tag"><Sparkles size={14} /> MADE TO STAND OUT</div>
          <div className="hero-index">01 <span>/</span> 04</div>
        </motion.div>
        <a className="scroll-cue" href="#work"><span /> SCROLL TO EXPLORE</a>
      </section>

      <section className="work-section section-wrap" id="work">
        <div className="section-heading">
          <div><div className="eyebrow">A FEW THINGS I’VE MADE</div><h2>Selected <span>work.</span></h2></div>
          <p>A mix of motion, design and ideas.<br />More projects coming soon.</p>
        </div>
        <div className="filters" role="group" aria-label="Filter projects">
          {filters.map(filter => <button key={filter} className={active === filter ? "filter active" : "filter"} onClick={() => setActive(filter)}>{filter}</button>)}
        </div>
        <motion.div layout className="project-grid">
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <motion.button layout key={project.number} className="project-card" onClick={() => setSelected(project)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .35, delay: index * .04 }}>
                <div className={`project-visual ${project.visual}`}>
                  {project.image_url ? <img className="project-image" src={project.image_url} alt={project.title} /> : <div className="project-visual-grid" />}
                  {project.category === "Video Editing" ? <div className="play-button"><Play size={18} fill="currentColor" /></div> : null}
                  <div className="visual-type">{project.type}</div>
                  <div className="visual-title">{project.title}</div>
                  <div className="visual-orb" />
                  <span className="card-open"><ArrowUpRight size={18} /></span>
                </div>
                <div className="project-info"><div><span>{project.category}</span><h3>{project.title}</h3></div><span className="project-number">{project.number}</span></div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        <div className="work-note"><span className="note-line" /> SELECTED CREATIVE WORK — UPDATED THROUGH THE CREATOR DASHBOARD.</div>
      </section>

      <section className="services-section" id="services">
        <div className="section-wrap">
          <div className="section-heading">
            <div><div className="eyebrow">WHAT I BRING TO THE TABLE</div><h2>Creative work,<br /><span>made clear.</span></h2></div>
            <p>From the first rough idea to the final export, I focus on making every frame and every detail count.</p>
          </div>
          <div className="service-list">
            <div className="service-row"><div className="service-icon"><Video /></div><div><span>01 / MOTION</span><h3>Video editing</h3><p>Reels, promotional videos, cinematic edits, short-form content and motion-led storytelling.</p></div><ArrowUpRight className="service-arrow" /></div>
            <div className="service-row"><div className="service-icon"><Palette /></div><div><span>02 / VISUALS</span><h3>Graphic design</h3><p>Social media creatives, posters, thumbnails, campaign artwork and advertising layouts.</p></div><ArrowUpRight className="service-arrow" /></div>
            <div className="service-row"><div className="service-icon"><Clapperboard /></div><div><span>03 / IDENTITY</span><h3>Branding & creative</h3><p>Logo concepts, visual direction and consistent design assets for growing brands.</p></div><ArrowUpRight className="service-arrow" /></div>
          </div>
        </div>
      </section>

      <section className="about-section section-wrap" id="about">
        <div className="about-stamp"><span>RAAK</span><strong>EDITZ</strong><i>CREATIVE STUDIO · 2026</i></div>
        <div className="about-copy">
          <div className="eyebrow">A LITTLE ABOUT ME</div>
          <h2>Good design gets noticed.<br /><span>Great stories stay.</span></h2>
          <p>Raak Editz is a creative space for video editing and graphic design. I enjoy shaping raw ideas into polished visual stories — whether that’s a fast-paced reel, a campaign poster or a complete brand look.</p>
          <p>This portfolio is a growing collection of selected work. Each project is an opportunity to experiment, solve a visual problem and make something people remember.</p>
          <div className="skill-tags"><span>Photoshop</span><span>Illustrator</span><span>Premiere Pro</span><span>After Effects</span><span>Lightroom</span><span>Creative Direction</span></div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="section-wrap contact-inner">
          <div className="eyebrow"><span className="status-dot" /> AVAILABLE FOR SELECT PROJECTS</div>
          <h2>Have an idea?<br /><span>Let’s make it real.</span></h2>
          <p>Tell me what you’re working on. Let’s create something worth looking at.</p>
          <a className="button button-primary contact-cta" href="mailto:hello@raakeditz.com?subject=Project%20enquiry">Start a conversation <ArrowUpRight size={18} /></a>
          <div className="contact-links">
            <a href="https://www.instagram.com/raak_editz/" target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram <ArrowUpRight size={14} /></a>
            <a href="https://wa.me/91XXXXXXXXXX" target="_blank" rel="noreferrer"><MessageCircle size={17} /> WhatsApp <ArrowUpRight size={14} /></a>
            <a href="mailto:hello@raakeditz.com"><Mail size={17} /> Email <ArrowUpRight size={14} /></a>
          </div>
        </div>
      </section>

      <footer className="footer section-wrap">
        <a className="brand" href="#home"><span className="brand-mark">R<span>.</span></span><span className="brand-name">RAAK<span>EDITZ</span></span></a>
        <span>© 2026 RAAK EDITZ. MADE WITH INTENTION.</span>
        <a href="#home" className="back-top">BACK TO TOP ↑</a>
      </footer>

      <AnimatePresence>
        {selected && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)}>
          <motion.div className="project-modal" initial={{ opacity: 0, y: 25, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close project details"><X /></button>
            <div className={`modal-art project-visual ${selected.visual}`}>{selected.image_url ? <img className="project-image" src={selected.image_url} alt={selected.title} /> : null}{selected.video_url ? <video src={selected.video_url} controls playsInline preload="metadata" className="project-video" /> : <><div className="visual-title">{selected.title}</div><div className="visual-type">{selected.type}</div></>}</div>
            <div className="modal-copy"><span>{selected.category} / PROJECT {selected.number}</span><h3>{selected.title}</h3><p>{selected.description}</p>{selected.video_url && <a className="text-link" href={selected.video_url} target="_blank" rel="noreferrer">Open video ↗</a>}</div>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
