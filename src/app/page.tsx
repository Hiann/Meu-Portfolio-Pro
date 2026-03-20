"use client";
import { useState, useEffect, useRef, ReactNode } from "react";

/* ─── useInView ─────────────────────────────────────────────────────────── */
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/* ─── Counter ───────────────────────────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const [ref, inView] = useInView();
  useEffect(() => {
    if (!inView) return;
    let c = 0;
    const step = Math.ceil(target / 60);
    const id = setInterval(() => {
      c += step;
      if (c >= target) {
        setN(target);
        clearInterval(id);
      } else setN(c);
    }, 18);
    return () => clearInterval(id);
  }, [inView, target]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

/* ─── TypeWriter ────────────────────────────────────────────────────────── */
function TypeWriter({
  words,
  speed = 85,
  pause = 1800,
}: {
  words: string[];
  speed?: number;
  pause?: number;
}) {
  const [display, setDisplay] = useState("");
  const [wIdx, setWIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wIdx];
    const delay = deleting
      ? speed / 2
      : charIdx === word.length
        ? pause
        : speed;
    const id = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setDisplay(word.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setDisplay(word.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      } else {
        setDeleting(false);
        setWIdx((i) => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [charIdx, deleting, wIdx, words, speed, pause]);
  return (
    <span className="tw-text">
      {display}
      <span className="tw-cursor">|</span>
    </span>
  );
}

/* ─── SkillBar ──────────────────────────────────────────────────────────── */
function SkillBar({
  name,
  level,
  delay = 0,
}: {
  name: string;
  level: number;
  delay?: number;
}) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className="skill-row">
      <div className="skill-labels">
        <span className="skill-name">{name}</span>
        <span className="skill-pct">{level}%</span>
      </div>
      <div className="skill-track">
        <div
          className="skill-fill"
          style={{
            width: inView ? `${level}%` : "0%",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/* ─── Reveal ────────────────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── GlitchText ────────────────────────────────────────────────────────── */
function GlitchText({ text, dim = false }: { text: string; dim?: boolean }) {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const go = () => {
      t = setTimeout(
        () => {
          setGlitch(true);
          setTimeout(() => {
            setGlitch(false);
            go();
          }, 160);
        },
        5000 + Math.random() * 3000,
      );
    };
    go();
    return () => clearTimeout(t);
  }, []);
  return (
    <span
      className={`glitch-text${dim ? " dim" : ""}${glitch ? " glitching" : ""}`}
    >
      {text}
    </span>
  );
}

/* ─── Terminal ──────────────────────────────────────────────────────────── */
function Terminal() {
  const LINES = [
    { p: "$ python3", o: null },
    { p: ">>> import hiann", o: null },
    {
      p: ">>> hiann.skills",
      o: "['Python', 'AI/ML', 'Java', 'SQL', 'MongoDB', 'Git']",
    },
    { p: ">>> hiann.contact()", o: "hiannpdr1234@gmail.com | (64) 99281-4550" },
  ];
  const DELAYS = [300, 900, 1500, 2200, 3000];
  const [vis, setVis] = useState(0);
  useEffect(() => {
    const ts = DELAYS.map((d, i) => setTimeout(() => setVis(i + 1), d));
    return () => ts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">terminal — hiann@dev</span>
      </div>
      {LINES.slice(0, vis).map((l, i) => (
        <div key={i} className="terminal-line">
          <div className="terminal-prompt">{l.p}</div>
          {l.o && <div className="terminal-output">{l.o}</div>}
        </div>
      ))}
      {vis < LINES.length && <span className="terminal-cursor">▋</span>}
    </div>
  );
}

/* ─── ContactForm ───────────────────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [focused, setFocused] = useState("");
  const [countdown, setCountdown] = useState(6);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    msg?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    msg?: boolean;
  }>({});

  const reset = () => {
    setForm({ name: "", email: "", msg: "" });
    setStatus("idle");
    setCountdown(6);
    setErrors({});
    setTouched({});
  };

  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

  const validate = (f = form) => {
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = "Nome é obrigatório";
    else if (f.name.trim().length < 2) errs.name = "Nome muito curto";
    if (!f.email.trim()) errs.email = "Email é obrigatório";
    else if (!isValidEmail(f.email)) errs.email = "Email inválido";
    if (!f.msg.trim()) errs.msg = "Mensagem é obrigatória";
    else if (f.msg.trim().length < 10)
      errs.msg = "Mensagem muito curta (mín. 10 caracteres)";
    return errs;
  };

  const handleBlur = (field: "name" | "email" | "msg") => {
    setFocused("");
    setTouched((t) => ({ ...t, [field]: true }));
    const errs = validate();
    setErrors(errs);
  };

  const handleSubmit = async () => {
    const allTouched = { name: true, email: true, msg: true };
    setTouched(allTouched);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status !== "sent") return;
    setCountdown(6);
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick);
          reset();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status === "sent")
    return (
      <div
        className="form-success"
        style={{ height: "100%", justifyContent: "center" }}
      >
        <div className="form-success-top">
          <div className="form-success-icon">
            <svg
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg className="form-success-ring" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r="23"
                fill="none"
                stroke="rgba(var(--accent-rgb),.12)"
                strokeWidth="1.5"
              />
              <circle
                cx="26"
                cy="26"
                r="23"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="144.5"
                style={{
                  transformOrigin: "center",
                  transform: "rotate(-90deg)",
                  strokeDashoffset: `${144.5 - (144.5 * (6 - countdown)) / 6}`,
                  transition: "stroke-dashoffset 1s linear",
                }}
              />
            </svg>
          </div>
          <div className="form-success-text">
            <p className="form-success-title">Mensagem enviada!</p>
            <p className="form-success-sub">Portfólio · DEV.SYS</p>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "1.25rem",
            background: "rgba(var(--accent-rgb), 0.03)",
            border: "1px dashed var(--border-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "8px",
                fontWeight: 700,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--text-3)",
              }}
            >
              Email Vinculado
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                color: "var(--text-1)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {form.email}
            </span>
          </div>
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            viewBox="0 0 24 24"
            style={{ flexShrink: 0, marginLeft: "8px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="form-success-stats">
          <div className="form-success-stat">
            <span className="form-success-stat-val accent">✓</span>
            <span className="form-success-stat-label">Entregue</span>
          </div>
          <div className="form-success-stat">
            <span className="form-success-stat-val">48h</span>
            <span className="form-success-stat-label">Resposta</span>
          </div>
          <div className="form-success-stat">
            <span className="form-success-stat-val accent">{countdown}s</span>
            <span className="form-success-stat-label">Novo envio</span>
          </div>
        </div>
        <button className="form-new-msg" onClick={reset}>
          <svg
            width="11"
            height="11"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
          </svg>
          Enviar nova mensagem
        </button>
      </div>
    );

  if (status === "error")
    return (
      <div
        className="form-error"
        style={{ height: "100%", justifyContent: "center" }}
      >
        <div className="form-error-icon">
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <p className="form-error-title">Falha no envio</p>
        <p className="form-error-sub">
          Verifique sua conexão e tente novamente.
        </p>
        <button className="form-retry" onClick={() => setStatus("idle")}>
          Tentar novamente →
        </button>
      </div>
    );

  const canSubmit = Object.keys(validate()).length === 0;

  return (
    <div
      className="form-body"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <div className="form-field" style={{ marginBottom: "8px" }}>
        <label className="form-label" style={{ color: "var(--accent)" }}>
          Destinatário
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 4px",
            borderBottom: "1.5px dashed var(--accent)",
            opacity: 0.8,
            cursor: "not-allowed",
            backgroundColor: "rgba(var(--accent-rgb), 0.02)",
          }}
        >
          <svg
            width="12"
            height="12"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 4l10 8 10-8" />
          </svg>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              color: "var(--text-1)",
            }}
          >
            hiannpdr1234@gmail.com
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "8px",
              color: "var(--accent)",
              letterSpacing: "0.1em",
              fontWeight: "bold",
            }}
          >
            [LOCKED]
          </span>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">
          Seu Nome (Remetente)
          {touched.name && errors.name && (
            <span className="form-field-err">{errors.name}</span>
          )}
        </label>
        <input
          type="text"
          placeholder="Seu nome completo"
          value={form.name}
          className={`form-input${focused === "name" ? " focused" : ""}${touched.name && errors.name ? " invalid" : touched.name && !errors.name ? " valid" : ""}`}
          onFocus={() => setFocused("name")}
          onBlur={() => handleBlur("name")}
          onChange={(e) => {
            setForm((p) => ({ ...p, name: e.target.value }));
            if (touched.name)
              setErrors(validate({ ...form, name: e.target.value }));
          }}
        />
      </div>

      <div className="form-field" style={{ marginTop: "0.25rem" }}>
        <label className="form-label">
          Email (Contato)
          {touched.email && errors.email && (
            <span className="form-field-err">{errors.email}</span>
          )}
        </label>
        <input
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          className={`form-input${focused === "email" ? " focused" : ""}${touched.email && errors.email ? " invalid" : touched.email && !errors.email ? " valid" : ""}`}
          onFocus={() => setFocused("email")}
          onBlur={() => handleBlur("email")}
          onChange={(e) => {
            setForm((p) => ({ ...p, email: e.target.value }));
            if (touched.email)
              setErrors(validate({ ...form, email: e.target.value }));
          }}
        />
      </div>

      <div className="form-field" style={{ marginTop: "0.25rem", flexGrow: 1 }}>
        <label className="form-label">
          Mensagem
          {touched.msg && errors.msg && (
            <span className="form-field-err">{errors.msg}</span>
          )}
        </label>
        <textarea
          placeholder="Descreva seu projeto ou proposta..."
          value={form.msg}
          className={`form-input form-textarea${focused === "msg" ? " focused" : ""}${touched.msg && errors.msg ? " invalid" : touched.msg && !errors.msg ? " valid" : ""}`}
          style={{ height: "100%", minHeight: "60px" }}
          onFocus={() => setFocused("msg")}
          onBlur={() => handleBlur("msg")}
          onChange={(e) => {
            setForm((p) => ({ ...p, msg: e.target.value }));
            if (touched.msg)
              setErrors(validate({ ...form, msg: e.target.value }));
          }}
        />
      </div>

      <button
        className="form-submit"
        disabled={status === "sending"}
        onClick={handleSubmit}
        style={{
          marginTop: "auto",
          opacity: !canSubmit && Object.keys(touched).length > 0 ? 0.6 : 1,
        }}
      >
        {status === "sending" ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ animation: "spinSlow .8s linear infinite" }}
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
            </svg>
            Enviando...
          </span>
        ) : (
          "Enviar Mensagem →"
        )}
      </button>
    </div>
  );
}

/* ─── ThemeToggle ───────────────────────────────────────────────────────── */
function ThemeToggle({
  dark,
  onToggle,
}: {
  dark: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="Alternar tema"
    >
      <div className="toggle-track">
        <svg
          className="toggle-track-sun"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            color: dark ? "rgba(var(--accent-rgb),.3)" : "var(--accent)",
            opacity: dark ? 0.35 : 1,
          }}
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <svg
          className="toggle-track-moon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            color: dark ? "var(--accent)" : "rgba(var(--accent-rgb),.3)",
            opacity: dark ? 1 : 0.35,
          }}
        >
          <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <div className={`toggle-thumb${dark ? "" : " right"}`} />
      </div>
      <span className="toggle-label">{dark ? "Escuro" : "Claro"}</span>
    </button>
  );
}

/* ─── GitHubProjects ─────────────────────────────────────────────────────── */
interface GHRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
}

const REPO_META: Record<
  string,
  { title?: string; desc?: string; tags?: string[] }
> = {
  "IA-Analise-Veterinaria": {
    title: "IA para Análise Veterinária",
    tags: ["YOLOv8", "Visão Computacional", "Deep Learning"],
  },
  "Assistente-Produtividade": {
    title: "Assistente de Produtividade",
    tags: ["Python", "Desktop", "Tkinter"],
  },
  "Organizador-Automatico": {
    title: "Organizador Automático",
    tags: ["Python", "Automação", "Watchdog"],
  },
  Conversor_Moedas: { title: "Conversor de Moedas" },
  "Conversor-Moedas": { title: "Conversor de Moedas" },
  Cronometro_tcc: { title: "Cronômetro TCC" },
  "Cronometro-tcc": { title: "Cronômetro TCC" },
  Scrum_project_junior: {
    title: "Projeto Scrum Júnior",
    tags: ["Scrum", "Agile"],
  },
  "Scrum-project-junior": {
    title: "Projeto Scrum Júnior",
    tags: ["Scrum", "Agile"],
  },
  Projeto_Pessoal_Gastos: { title: "Gestão Financeira Pessoal" },
  "Projeto-Pessoal-Gastos": { title: "Gestão Financeira Pessoal" },
  Nexus_pim: {
    title: "Nexus — Gestão de Produtos",
    tags: ["Python", "Streamlit"],
  },
  "Nexus-pim": {
    title: "Nexus — Gestão de Produtos",
    tags: ["Python", "Streamlit"],
  },
  Devcommand: { title: "DevCommand — CLI Tools" },
};

const LANG_COLOR: Record<string, string> = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#2b7489",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Jupyter: "#DA5B0B",
};

function GitHubProjects() {
  const [repos, setRepos] = useState<GHRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("https://api.github.com/users/Hiann/repos?sort=updated&per_page=50")
      .then((r) => r.json())
      .then((data: GHRepo[]) => {
        const filtered = data
          .filter((r) => r.name.toLowerCase() !== "hiann")
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime(),
          );
        setRepos(filtered);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 22,
        }}
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-2)",
              height: 220,
              opacity: 0.4,
              animation: "pulse 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "3rem",
          color: "var(--text-3)",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        Não foi possível carregar os repositórios.{" "}
        <a
          href="https://github.com/Hiann?tab=repositories"
          target="_blank"
          rel="noreferrer"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          Ver no GitHub →
        </a>
      </div>
    );

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.2} }
        .proj-grid-dyn { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        @media(max-width:900px){ .proj-grid-dyn{ grid-template-columns:1fr !important; } }
        @media(min-width:901px) and (max-width:1100px){ .proj-grid-dyn{ grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
      <div className="proj-grid-dyn">
        {repos.map((repo, i) => {
          const meta = REPO_META[repo.name] ?? {};
          const year = new Date(repo.updated_at).getFullYear().toString();
          const langColor = repo.language
            ? (LANG_COLOR[repo.language] ?? "var(--text-3)")
            : null;
          const tags =
            meta.tags ??
            (repo.topics?.length
              ? repo.topics.slice(0, 3)
              : repo.language
                ? [repo.language]
                : []);
          const index = String(i + 1).padStart(2, "0");

          return (
            <Reveal key={repo.id} delay={Math.min(i, 5) * 80}>
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <div className="card-accent-top" />
                <div className="proj-header">
                  <div className="proj-header-left">
                    <div className="proj-gh-logo">
                      <svg
                        width="19"
                        height="19"
                        viewBox="0 0 24 24"
                        fill="var(--text-3)"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    </div>
                    <div className="proj-id-block">
                      <span className="card-id">SYS_{index}</span>
                      <span className="proj-year-badge">{year}</span>
                    </div>
                  </div>
                  <div className="proj-ext-icon">
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </div>
                </div>
                <div className="proj-body">
                  <div className="proj-title">
                    {meta.title ??
                      repo.name.replace(/-/g, " ").replace(/_/g, " ")}
                  </div>
                  <p className="proj-desc">
                    {meta.desc ??
                      repo.description ??
                      "Repositório disponível no GitHub."}
                  </p>
                  {tags.length > 0 && (
                    <div className="proj-tags">
                      {tags.map((t) => (
                        <span key={t} className="proj-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="proj-footer">
                    {langColor && (
                      <span className="proj-stat">
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: langColor,
                            display: "inline-block",
                            flexShrink: 0,
                          }}
                        />
                        {repo.language}
                      </span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span className="proj-stat">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {repo.stargazers_count}
                      </span>
                    )}
                    {repo.forks_count > 0 && (
                      <span className="proj-stat">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <circle cx="12" cy="18" r="3" />
                          <circle cx="6" cy="6" r="3" />
                          <circle cx="18" cy="6" r="3" />
                          <path d="M18 9v2a2 2 0 01-2 2H8a2 2 0 01-2-2V9" />
                          <line x1="12" y1="12" x2="12" y2="15" />
                        </svg>
                        {repo.forks_count}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            </Reveal>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
        <a
          href="https://github.com/Hiann?tab=repositories"
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            border: "1px solid var(--border-2)",
            color: "var(--text-2)",
            textDecoration: "none",
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            transition: "border-color .2s, color .2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "var(--accent)";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor =
              "var(--border-2)";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--text-2)";
          }}
        >
          Ver todos no GitHub
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      </div>
    </>
  );
}

/* ─── NavLinks — sliding indicator ─────────────────────────────────────── */
function NavLinks({
  NAV,
  section,
  go,
}: {
  NAV: { id: string; label: string }[];
  section: string;
  go: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ind, setInd] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const active = container.querySelector(
      ".nav-link.active",
    ) as HTMLElement | null;
    if (active) {
      setInd({ left: active.offsetLeft, width: active.offsetWidth });
    }
  }, [section]);

  return (
    <div className="nav-links" ref={containerRef}>
      <div
        className="nav-indicator"
        style={{ left: ind.left, width: ind.width }}
      />
      {NAV.map((l, i) => (
        <button
          key={l.id}
          className={`nav-link${section === l.id ? " active" : ""}`}
          onClick={() => go(l.id)}
        >
          <span className="nav-link-idx">{String(i + 1).padStart(2, "0")}</span>
          {l.label}
        </button>
      ))}
    </div>
  );
}

/* ─── MAIN APP COMPONENT ─────────────────────────────────────────────────── */
export default function Portfolio() {
  const [section, setSection] = useState("home");
  const [scrollPct, setScrollPct] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);

  // ── MÁGICA 0: Scroll Lock (Impede a tela de rolar sob o menu aberto) ──
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"; // Trava o scroll
    } else {
      document.body.style.overflow = ""; // Destrava o scroll
    }
    // Cleanup de segurança caso o componente desmonte
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // ── MÁGICA 1: Scroll Restoration ──
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const savedY = sessionStorage.getItem("devsys_scrollY");
    const restoreScroll = () => {
      if (savedY) {
        window.scrollTo({ top: parseInt(savedY, 10), behavior: "instant" });
      }
    };

    restoreScroll();
    const timeoutId = setTimeout(restoreScroll, 500);

    const onScroll = () => {
      const currentY = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      setScrollPct(max > 0 ? Math.min(100, (currentY / max) * 100) : 0);
      sessionStorage.setItem("devsys_scrollY", currentY.toString());

      for (const id of [
        "home",
        "sobre",
        "experiencia",
        "projetos",
        "skills",
        "contato",
      ].reverse()) {
        const el = document.getElementById(id);
        if (el && currentY >= el.offsetTop - 130) {
          setSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // ── MÁGICA 2: Leitura do Tema Inicial ──
  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setDark(theme !== "light");
  }, []);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    const nextTheme = nextDark ? "dark" : "light";
    localStorage.setItem("devsys_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const NAV = [
    { id: "home", label: "Home" },
    { id: "sobre", label: "Sobre" },
    { id: "experiencia", label: "Experiência" },
    { id: "projetos", label: "Projetos" },
    { id: "skills", label: "Skills" },
    { id: "contato", label: "Contato" },
  ];
  const SKILLS = [
    { name: "Python", level: 70, delay: 0 },
    { name: "Java", level: 40, delay: 80 },
    { name: "Deep Learning / YOLO", level: 70, delay: 160 },
    { name: "SQL Server / MySQL", level: 60, delay: 240 },
    { name: "MongoDB", level: 50, delay: 300 },
    { name: "Git & Scrum", level: 70, delay: 360 },
    { name: "HTML / CSS", level: 50, delay: 420 },
  ];

  return (
    <>
      {/* ── MÁGICA 3: O Fim do Flash no Reload ── */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('devsys_theme');
                if (theme === 'light') {
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />

      <div className="root" suppressHydrationWarning>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');

          :root[data-theme='dark'] {
            --bg:          #0b0b0f;
            --bg-alt:      #111118;
            --surface:     #16161e;
            --surface-2:   #1c1c26;
            --border:      rgba(255,255,255,0.07);
            --border-2:    rgba(255,255,255,0.12);
            --accent:      #f97316;
            --accent-2:    #fb923c;
            --accent-dim:  rgba(249,115,22,0.12);
            --accent-rgb:  249,115,22;
            --text-1:      #f1f1f5;
            --text-2:      #a0a0b0;
            --text-3:      #5a5a70;
            --text-inv:    #0b0b0f;
            --nav-bg:      rgba(11,11,15,0.88);
            --tag-bg:      rgba(255,255,255,0.06);
            --tag-text:    #a0a0b0;
            --glow:        0 0 14px rgba(249,115,22,0.4);
            --shadow:      0 4px 24px rgba(0,0,0,0.4);
          }
          
          :root[data-theme='light'] {
            --bg:          #e8e0d4;
            --bg-alt:      #ddd6c8;
            --surface:     #f5f0e8;
            --surface-2:   #ede7dc;
            --border:      rgba(100,80,50,0.13);
            --border-2:    rgba(100,80,50,0.22);
            --accent:      #d4691a;
            --accent-2:    #b85a12;
            --accent-dim:  rgba(212,105,26,0.1);
            --accent-rgb:  212,105,26;
            --text-1:      #1a1610;
            --text-2:      #3d3628;
            --text-3:      #8c8070;
            --text-inv:    #f5f0e8;
            --nav-bg:      rgba(232,224,212,0.96);
            --tag-bg:      rgba(100,80,50,0.07);
            --tag-text:    #3d3628;
            --glow:        0 0 12px rgba(212,105,26,0.28);
            --shadow:      0 4px 28px rgba(60,40,10,0.14);
          }

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html { scroll-behavior: smooth; }
          body { overflow-x: hidden; background: var(--bg); color: var(--text-2); font-family: 'JetBrains Mono', monospace; }
          ::selection { background: rgba(var(--accent-rgb),.28); }

          @keyframes blink       { 50% { opacity:0; } }
          @keyframes scanline    { 0% { top:-4px; } 100% { top:100vh; } }
          @keyframes float       { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
          @keyframes spinSlow    { to { transform:rotate(360deg); } }
          @keyframes pulseRing   { 0%{transform:scale(.85);opacity:1;} 100%{transform:scale(2.2);opacity:0;} }
          @keyframes marquee     { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
          @keyframes fadeSlideIn { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:none;} }

          .root {
            min-height: 100vh;
            background: var(--bg);
            color: var(--text-2);
            font-family: 'JetBrains Mono', monospace;
            transition: background .35s ease, color .35s ease;
            overflow-x: hidden;
            position: relative;
          }
          .mono  { font-family: 'JetBrains Mono', monospace; }
          .display { font-family: 'Space Grotesk', sans-serif; }

          .grid-bg {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background-image: radial-gradient(circle, var(--grid-dot) 1px, transparent 1px);
            background-size: 28px 28px;
            mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
            -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
            opacity: var(--grid-opacity);
            transition: opacity .35s ease;
          }
          :root[data-theme='dark'] .grid-bg { --grid-dot: rgba(255,255,255,0.12); --grid-opacity: 1; }
          :root[data-theme='light'] .grid-bg { --grid-dot: rgba(100,75,40,0.18);   --grid-opacity: 0.7; }
          .grid-bg { --grid-dot: rgba(255,255,255,0.12); --grid-opacity: 1; } /* default falback */

          .grid-glow {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
            background:
              radial-gradient(ellipse 60% 40% at 20% 20%, rgba(var(--accent-rgb),.04) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 80% 80%, rgba(var(--accent-rgb),.03) 0%, transparent 60%);
            transition: opacity .35s ease;
          }
          :root[data-theme='light'] .grid-glow { opacity: 0.5; }

          .scan {
            position: fixed; left:0; right:0; height:1px; z-index:2; pointer-events:none;
            background: linear-gradient(90deg, transparent 0%, rgba(var(--accent-rgb),.35) 50%, transparent 100%);
            animation: scanline 11s linear infinite;
            opacity: .6;
          }
          :root[data-theme='light'] .scan { opacity: .25; }

          .scroll-bar {
            position: fixed; top:0; left:0; height:2px; z-index:60;
            background: var(--accent); transition: width .1s linear;
          }

          .dot-nav { position:fixed; right:20px; top:50%; transform:translateY(-50%); z-index:50; display:flex; flex-direction:column; gap:10px; }
          .dot-btn {
            width:8px; height:8px; background:transparent;
            border:1px solid var(--text-3); cursor:pointer;
            transition:all .3s; padding:0;
          }
          .dot-btn.active { background:var(--accent); border-color:var(--accent); box-shadow:var(--glow); }

          @keyframes nav-glow-pulse { 0%,100% { opacity:.5; } 50% { opacity:1; } }
          @keyframes nav-status-blink { 0%,100% { opacity:1; } 50% { opacity:.3; } }

          .navbar {
            position: fixed; top:0; left:0; right:0; z-index:40;
            background: var(--nav-bg);
            backdrop-filter: blur(28px) saturate(1.6);
            border-bottom: 1px solid var(--border-2);
            transition: background .35s, border-color .35s;
          }
          .navbar::before {
            content: ''; position: absolute; top:0; left:0; right:0; height:1px;
            background: linear-gradient(90deg, transparent 0%, rgba(var(--accent-rgb),.0) 10%, rgba(var(--accent-rgb),.7) 40%, rgba(var(--accent-rgb),.7) 60%, rgba(var(--accent-rgb),.0) 90%, transparent 100%);
            animation: nav-glow-pulse 4s ease-in-out infinite;
          }
          .navbar::after {
            content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px;
            background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb),.08), transparent);
          }

          .navbar-inner {
            display: grid;
            grid-template-columns: auto 1fr auto;
            align-items: center;
            height: 64px; padding: 0 2rem; max-width: 1280px; margin: 0 auto;
            gap: 0;
          }

          .logo {
            display: flex; align-items: center; gap: 0;
            background: none; border: none; cursor: pointer; padding: 0;
            height: 64px; padding-right: 28px;
            border-right: 1px solid var(--border-2);
            position: relative;
          }

          .logo-mark { width: 32px; height: 32px; flex-shrink: 0; position: relative; margin-right: 12px; }
          .logo-mark::before {
            content: ''; position: absolute; inset: 0;
            border: 1.5px solid rgba(var(--accent-rgb),.35);
            transition: border-color .3s;
          }
          .logo-mark::after {
            content: ''; position: absolute; inset: 6px; background: var(--accent);
            box-shadow: 0 0 8px rgba(var(--accent-rgb),.5);
            transition: transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s;
          }
          .logo:hover .logo-mark::before, .logo:active .logo-mark::before { border-color: var(--accent); }
          .logo:hover .logo-mark::after, .logo:active .logo-mark::after  { transform: rotate(45deg); }

          .logo-cross-h, .logo-cross-v {
            position: absolute; background: rgba(var(--accent-rgb),.4);
            transition: background .3s;
          }
          .logo-cross-h { left: 0; right: 0; top: 50%; height: 1px; margin-top: -.5px; }
          .logo-cross-v { top: 0; bottom: 0; left: 50%; width: 1px; margin-left: -.5px; }
          .logo:hover .logo-cross-h, .logo:active .logo-cross-h,
          .logo:hover .logo-cross-v, .logo:active .logo-cross-v { background: rgba(var(--accent-rgb),.7); }

          .logo-text {
            font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700;
            color: var(--text-1); letter-spacing: .04em; transition: color .2s; white-space: nowrap;
          }
          .logo-accent { color: var(--accent); }
          .logo:hover .logo-text, .logo:active .logo-text { color: var(--text-1); }

          .logo-meta { display: flex; flex-direction: column; justify-content: center; gap: 2px; margin-left: 12px; padding-left: 12px; border-left: 1px solid var(--border-2); }
          .logo-meta-top { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; color: var(--accent); display: flex; align-items: center; gap: 5px; white-space: nowrap; }
          .logo-meta-dot { width: 4px; height: 4px; border-radius: 50%; background: #22c55e; flex-shrink: 0; box-shadow: 0 0 4px rgba(34,197,94,.8); animation: nav-status-blink 2.5s ease-in-out infinite; }
          .logo-meta-bot { font-family: 'JetBrains Mono', monospace; font-size: 8px; color: var(--text-3); letter-spacing: .12em; white-space: nowrap; }
          .logo-meta-bot-num { color: var(--text-2); font-weight: 700; }

          .nav-links { display: flex; align-items: center; justify-content: center; position: relative; height: 64px; }

          .nav-indicator {
            position: absolute; bottom: 0; height: 2px; background: var(--accent);
            box-shadow: 0 0 8px rgba(var(--accent-rgb),.6);
            transition: left .3s cubic-bezier(.4,0,.2,1), width .3s cubic-bezier(.4,0,.2,1);
            pointer-events: none;
          }

          .nav-link {
            position: relative; background: none; border: none; cursor: pointer;
            color: var(--text-3); padding: 0 18px; height: 64px;
            font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700;
            letter-spacing: .22em; text-transform: uppercase;
            transition: color .2s, background .2s; display: flex; align-items: center; gap: 6px; white-space: nowrap;
          }
          .nav-link:hover, .nav-link:active { color: var(--text-2); background: rgba(var(--accent-rgb),.04); }
          .nav-link.active { color: var(--text-1); }

          .nav-link-idx { font-size: 7px; color: var(--accent); font-weight: 700; letter-spacing: .08em; opacity: 0; transform: translateY(3px); transition: opacity .2s, transform .2s; }
          .nav-link.active .nav-link-idx, .nav-link:hover .nav-link-idx, .nav-link:active .nav-link-idx { opacity: 1; transform: translateY(0); }

          .nav-sep { width: 1px; height: 14px; background: var(--border-2); flex-shrink: 0; }

          .nav-right { display: flex; align-items: center; gap: 0; height: 64px; border-left: 1px solid var(--border-2); padding-left: 20px; }

          .nav-status-pill {
            display: flex; align-items: center; gap: 7px; padding: 5px 12px; margin-right: 14px;
            border: 1px solid rgba(34,197,94,.25); background: rgba(34,197,94,.05);
            cursor: pointer; transition: border-color .2s, background .2s; text-decoration: none;
          }
          .nav-status-pill:hover, .nav-status-pill:active { border-color: rgba(34,197,94,.5); background: rgba(34,197,94,.1); }
          .nav-status-pill-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; flex-shrink: 0; box-shadow: 0 0 5px rgba(34,197,94,.8); animation: nav-status-blink 2s ease-in-out infinite; }
          .nav-status-pill-text { font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #22c55e; white-space: nowrap; }

          .theme-toggle {
            display: flex; align-items: center; gap: 9px; padding: 6px 12px 6px 6px;
            background: var(--surface); border: 1px solid var(--border-2); cursor: pointer;
            transition: border-color .2s, box-shadow .2s; position: relative; overflow: hidden;
          }
          .theme-toggle:hover, .theme-toggle:active { border-color: rgba(var(--accent-rgb),.45); box-shadow: 0 0 0 1px rgba(var(--accent-rgb),.1); }
          
          .toggle-track {
            position: relative; width: 44px; height: 22px; background: var(--bg-alt);
            border: 1px solid var(--border-2); border-radius: 0; flex-shrink: 0; overflow: hidden;
            transition: background .3s, border-color .2s;
          }
          .theme-toggle:hover .toggle-track, .theme-toggle:active .toggle-track { border-color: rgba(var(--accent-rgb),.35); }
          
          .toggle-track-sun { position: absolute; left: 4px; top: 50%; transform: translateY(-50%); width: 13px; height: 13px; pointer-events: none; transition: opacity .3s; }
          .toggle-track-moon { position: absolute; right: 4px; top: 50%; transform: translateY(-50%); width: 12px; height: 12px; pointer-events: none; transition: opacity .3s; }
          .toggle-thumb {
            position: absolute; top: 3px; left: 3px; width: 14px; height: 14px;
            background: var(--accent); box-shadow: var(--glow);
            transition: left .28s cubic-bezier(.4,0,.2,1), background .3s; z-index: 1;
          }
          .toggle-thumb.right { left: 25px; }
          .toggle-label { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--text-2); white-space: nowrap; min-width: 36px; transition: color .2s; }
          .theme-toggle:hover .toggle-label, .theme-toggle:active .toggle-label { color: var(--accent); }

          /* ── MENU MOBILE ULTRA PREMIUM ── */
          .mobile-menu-btn { display: none; background: none; border: none; cursor: pointer; color: var(--text-1); padding: 12px 16px 12px 0; margin-left: -8px; z-index: 60; position: relative; }
          .mobile-menu-btn:hover, .mobile-menu-btn:active { color: var(--accent); }
          .mobile-menu-btn svg { transition: transform 0.3s ease; }
          .mobile-menu-btn:active svg { transform: scale(0.85); }
          
          .mobile-menu-overlay {
            position: fixed; top: 64px; left: 0; right: 0; bottom: 0;
            background: rgba(11, 11, 15, 0.85);
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            z-index: 55; display: flex; flex-direction: column;
            animation: fadeGlass 0.3s ease forwards;
            overflow-y: auto;
          }
          :root[data-theme='light'] .mobile-menu-overlay { background: rgba(245, 240, 232, 0.9); }
          
          .mobile-menu-inner { display: flex; flex-direction: column; justify-content: center; padding: 2rem; gap: 1.5rem; flex: 1; margin-top: -5vh; }
          
          .mobile-nav-link {
            background: none; border: none; text-align: left; cursor: pointer;
            font-family: 'Space Grotesk', sans-serif; font-size: 2.25rem; font-weight: 700;
            color: var(--text-3); letter-spacing: -0.02em; line-height: 1;
            display: flex; align-items: center; justify-content: space-between;
            padding: 0; opacity: 0; animation: fadeUpLink 0.5s ease forwards;
            transition: color 0.3s ease, transform 0.3s ease;
          }
          .mobile-nav-link-left { display: flex; align-items: center; gap: 1rem; }
          .mobile-nav-num { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--text-3); letter-spacing: 0.2em; opacity: 0.5; transition: color 0.3s ease, opacity 0.3s ease; font-weight: 700; }
          .mobile-nav-link:hover, .mobile-nav-link.active { color: var(--text-1); transform: translateX(12px); }
          .mobile-nav-link.active .mobile-nav-num { color: var(--accent); opacity: 1; }
          
          .mobile-nav-arrow { opacity: 0; transform: translateX(-15px); color: var(--accent); transition: all 0.3s ease; }
          .mobile-nav-link.active .mobile-nav-arrow, .mobile-nav-link:hover .mobile-nav-arrow { opacity: 1; transform: translateX(0); }

          .mobile-menu-footer {
            padding: 2rem; display: flex; align-items: center; justify-content: space-between;
            border-top: 1px solid rgba(255,255,255,0.06);
            opacity: 0; animation: fadeUpLink 0.5s ease forwards; animation-delay: 0.4s;
          }
          :root[data-theme='light'] .mobile-menu-footer { border-top: 1px solid rgba(0,0,0,0.06); }
          
          @keyframes fadeGlass { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeUpLink { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

          /* ───────────────────────────── */
/* ───────────────────────────── */
          /* 💎 THEME SWITCH ULTRA PREMIUM */
          /* ───────────────────────────── */

          .mobile-theme-item {
            margin-top: 1.2rem;
            padding-top: 1.6rem;
            border-top: 1px solid var(--border-2);
            cursor: default !important; /* Remove a mãozinha do texto */
          }

          /* Conteúdo */
          .mobile-theme-content {
            display: flex; flex-direction: column; gap: 4px;
          }

          .mobile-theme-item .mobile-nav-label {
            font-size: 1.05rem; color: var(--text-2); cursor: default;
          }

          .mobile-theme-sub {
            font-size: 0.75rem; color: var(--text-3);
            letter-spacing: 0.1em; text-transform: uppercase;
          }

          /* ── SWITCH (AGORA É UM BOTÃO ISOLADO) ── */
          button.mobile-theme-switch {
            width: 60px; height: 32px;
            border-radius: 999px; position: relative;
            background: rgba(255,255,255,0.08);
            border: 1px solid var(--border-2);
            transition: all 0.3s ease;
            display: flex; align-items: center;
            cursor: pointer; padding: 0; outline: none;
          }
          
          :root[data-theme='light'] button.mobile-theme-switch {
            background: rgba(0,0,0,0.06);
          }

          /* Thumb (A Bolinha do Sol/Lua) */
          .mobile-theme-thumb {
            width: 24px; height: 24px;
            border-radius: 50%;
            background: var(--surface);
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; position: absolute;
            left: 3px; /* Posição inicial grudada na esquerda */
            transform: translateX(0);
            
            /* Essa transição dá o efeito "elástico" (bounce) estilo iPhone */
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          }

          /* Estado ATIVO (dark mode = Bolinha vai para a direita) */
          button.mobile-theme-switch.active {
            background: rgba(var(--accent-rgb), 0.15);
            border-color: rgba(var(--accent-rgb), 0.4);
          }

          button.mobile-theme-switch.active .mobile-theme-thumb {
            transform: translateX(28px); /* Desliza matematicamente para a direita */
            background: var(--bg-alt);
            box-shadow: 0 0 12px rgba(var(--accent-rgb), 0.4);
          }

          /* Interações Físicas apenas no Switch */
          button.mobile-theme-switch:hover {
            border-color: var(--accent);
          }

          button.mobile-theme-switch:active {
            transform: scale(0.92); /* O botão afunda ao ser pressionado pelo dedo */
          }
            
          .slabel { display:flex; align-items:center; gap:14px; margin-bottom:48px; }
          .slabel-line { width:28px; height:2px; background:var(--accent); flex-shrink:0; }
          .slabel-text { font-size:10px; font-weight:700; letter-spacing:.4em; text-transform:uppercase; color:var(--accent); }

          /* ── CORREÇÃO DE ESPAÇAMENTO VERTICAL (Vazio do Modo Desktop no Mobile) ── */
          /* Removemos o min-height: 100vh que causa o "estouro" de altura e usamos paddings absolutos */
          .hero { position:relative; z-index:10; display:flex; align-items:center; padding:160px 2rem 80px; max-width:1120px; margin:0 auto; overflow-x:hidden; }
          
          /* Removemos o padding duplo que tinha aqui para concentrar tudo no .hero */
          .hero-grid { width:100%; display:grid; grid-template-columns:1.15fr 1fr; gap:3rem; align-items:center; }
          
          .hero-left { display:flex; flex-direction:column; gap:1.75rem; min-width:0; }

          .status-badge { display:inline-flex; align-items:center; gap:10px; padding:7px 14px; border:1px solid rgba(var(--accent-rgb),.28); background:rgba(var(--accent-rgb),.06); }
          .status-dot-wrap { position:relative; width:8px; height:8px; display:inline-block; flex-shrink:0; }
          .status-ping { position:absolute; inset:0; background:#22c55e; border-radius:50%; animation:pulseRing 1.6s ease-out infinite; opacity:.6; }
          .status-solid { position:relative; display:block; width:8px; height:8px; background:#22c55e; border-radius:50%; }
          .status-text { font-size:9px; font-weight:700; letter-spacing:.3em; text-transform:uppercase; color:var(--accent); }

          .hero-name { font-family:'Space Grotesk',sans-serif; font-size:clamp(3rem,7.5vw,6.5rem); font-weight:700; line-height:1; letter-spacing:-.03em; color:var(--text-1); }
          .hero-name-dim { color:var(--text-3); }
          .glitch-text { display:inline-block; transition:none; color:inherit; }
          .glitch-text.dim { color:var(--text-3); }
          .glitch-text.glitching { text-shadow:2px 0 var(--accent),-2px 0 #f0f; transform:skew(-2deg); }

          .tw-text { color:var(--accent); font-size:17px; font-weight:700; }
          .tw-cursor { animation:blink 1s step-end infinite; color:var(--accent); }

          .hero-bio { color:var(--text-2); max-width:560px; line-height:1.8; font-size:14px; border-left:3px solid var(--accent); padding-left:1.25rem; }

          .btn-primary { display:inline-flex; align-items:center; gap:10px; padding:13px 26px; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:11px; letter-spacing:.18em; text-transform:uppercase; background:var(--accent); color:var(--text-inv); border:none; cursor:pointer; text-decoration:none; transition:background .2s, box-shadow .2s; }
          .btn-primary:hover, .btn-primary:active { background:var(--accent-2); box-shadow:var(--glow); }
          
          .btn-outline { display:inline-flex; align-items:center; gap:10px; padding:13px 26px; font-family:'JetBrains Mono',monospace; font-weight:700; font-size:11px; letter-spacing:.18em; text-transform:uppercase; background:transparent; color:var(--text-1); border:1.5px solid var(--border-2); cursor:pointer; text-decoration:none; transition:border-color .2s, color .2s; }
          .btn-outline:hover, .btn-outline:active { border-color:var(--accent); color:var(--accent); }

          .hero-stats { display:flex; gap:36px; padding-top:16px; border-top:1px solid var(--border-2); flex-wrap:wrap; }
          .stat-num { font-family:'Space Grotesk',sans-serif; font-size:30px; font-weight:700; color:var(--text-1); }
          .stat-label { font-size:9px; font-weight:600; letter-spacing:.25em; text-transform:uppercase; color:var(--text-3); margin-top:4px; }

          .hero-right { display:flex; flex-direction:column; gap:1.25rem; min-width:0; }
          .profile-box { position: relative; border: 1px solid var(--border-2); overflow: hidden; aspect-ratio: 4/5; transition: border-color .35s ease; }
          .profile-box:hover, .profile-box:active { border-color: rgba(var(--accent-rgb),.4); }

          .profile-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; transition: transform .6s ease, filter .4s ease; }
          .profile-box:hover .profile-img, .profile-box:active .profile-img { transform: scale(1.03); }

          .profile-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 75%, rgba(0,0,0,.85) 100%); transition: opacity .35s ease; }
          :root[data-theme='light'] .profile-overlay { background: linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,.45) 75%, rgba(0,0,0,.72) 100%); }

          .profile-box:hover .profile-overlay, .profile-box:active .profile-overlay { background: linear-gradient(135deg, rgba(var(--accent-rgb),.08) 0%, rgba(0,0,0,0) 40%), linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,.55) 75%, rgba(0,0,0,.85) 100%); }

          .profile-info { position: absolute; bottom: 0; left: 0; right: 0; z-index: 2; padding: 1.5rem 1.75rem 1.5rem; display: flex; flex-direction: column; gap: 6px; }
          .profile-name { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -.02em; line-height: 1.1; }
          .profile-role { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; color: var(--accent); letter-spacing: .22em; text-transform: uppercase; }
          .profile-status { display: inline-flex; align-items: center; gap: 7px; margin-top: 4px; }
          .profile-status-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 6px rgba(34,197,94,.7); }
          .profile-status-text { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: rgba(255,255,255,.65); letter-spacing: .18em; text-transform: uppercase; }

          .corner { position:absolute; width:16px; height:16px; z-index: 3; }
          .corner.tl { top:-1px; left:-1px; border-top:2px solid var(--accent); border-left:2px solid var(--accent); }
          .corner.br { bottom:-1px; right:-1px; border-bottom:2px solid var(--accent); border-right:2px solid var(--accent); }
          .corner.tr { top:-1px; right:-1px; border-top:1px solid var(--border-2); border-right:1px solid var(--border-2); }
          .corner.bl { bottom:-1px; left:-1px; border-bottom:1px solid var(--border-2); border-left:1px solid var(--border-2); }

          .profile-scan { position: absolute; left: 0; right: 0; height: 1px; z-index: 3; background: linear-gradient(90deg, transparent, rgba(var(--accent-rgb),.6), transparent); top: -4px; opacity: 0; transition: opacity .3s; animation: none; }
          .profile-box:hover .profile-scan, .profile-box:active .profile-scan { opacity: 1; animation: scanline 3s linear infinite; }

         .terminal { background:var(--surface); border:1px solid var(--border-2); padding:1.25rem; font-size:12.5px; transition:background .35s ease, border-color .35s ease; overflow:hidden; }
          .terminal-bar { display:flex; align-items:center; gap:7px; margin-bottom:.875rem; padding-bottom:.75rem; border-bottom:1px solid var(--border); }
          .dot { width:9px; height:9px; border-radius:50%; display:block; }
          .dot.red    { background:rgba(239,68,68,.65); }
          .dot.yellow { background:rgba(234,179,8,.65); }
          .dot.green  { background:rgba(34,197,94,.65); }
          .terminal-title { margin-left:6px; font-size:9px; letter-spacing:.2em; text-transform:uppercase; color:var(--text-3); }
          .terminal-line { margin-bottom:5px; }
          .terminal-prompt { color:var(--accent); }
          .terminal-output { color:var(--text-2); padding-left:.875rem; margin-top:2px; word-break:break-word; }
          .terminal-cursor { color:var(--accent); animation:blink 1s step-end infinite; }

          .marquee-wrap { position:relative; z-index:10; overflow:hidden; border-top:1px solid var(--border-2); border-bottom:1px solid var(--border-2); padding:9px 0; background:var(--bg-alt); transition:background .35s ease; }
          .marquee-inner { display:flex; gap:44px; white-space:nowrap; animation:marquee 20s linear infinite; }
          .marquee-item { font-size:9px; letter-spacing:.3em; text-transform:uppercase; color:var(--text-3); display:inline-flex; align-items:center; gap:9px; }
          .marquee-dot { width:3px; height:3px; background:rgba(var(--accent-rgb),.5); border-radius:50%; display:inline-block; }

          /* Aproveitamos para alinhar a largura do site inteiro com o Hero (1120px) e reduzir o buraco entre as seções */
          .section { position:relative; z-index:10; max-width:1120px; margin:0 auto; padding:5.5rem 2rem; }
          .section-sm { padding-top:2rem; padding-bottom:4rem; }

          .card { background:var(--surface); border:1px solid var(--border-2); position:relative; transition:background .35s ease, border-color .3s ease, transform .3s ease, box-shadow .3s ease; }
          .card:hover, .card:active { border-color:rgba(var(--accent-rgb),.35); transform:translateY(-3px); box-shadow:var(--shadow); }
          .card:hover .card-id, .card:active .card-id { color:var(--accent) !important; }
          
          .card-accent-top { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg, var(--accent), transparent); opacity:0; transition:opacity .3s; }
          .card:hover .card-accent-top, .card:active .card-accent-top { opacity:1; }

          .about-box { padding:3rem; position:relative; }
          .about-tag { position:absolute; top:-1px; right:40px; padding:5px 14px; background:var(--accent); color:var(--text-inv); font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; }
          .about-grid { display:grid; grid-template-columns:1fr 1fr; gap:4rem; }
          .about-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(1.75rem,3vw,2.5rem); font-weight:700; color:var(--text-1); letter-spacing:-.02em; line-height:1.2; margin-bottom:1.25rem; }
          .about-p { color:var(--text-2); line-height:1.8; font-size:13.5px; margin-bottom:.875rem; }
          .info-row { display:flex; gap:14px; padding:7px 0; border-bottom:1px solid var(--border); }
          .info-key { font-size:10px; color:var(--text-3); text-transform:uppercase; letter-spacing:.15em; width:88px; flex-shrink:0; }
          .info-val { font-size:11px; color:var(--text-1); }
          .about-stack-title { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.2em; color:var(--text-1); margin-bottom:1.25rem; }

          .skill-row { margin-bottom:.875rem; }
          .skill-labels { display:flex; justify-content:space-between; font-size:10px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; margin-bottom:5px; }
          .skill-name { color:var(--text-1); }
          .skill-pct  { color:var(--accent); }
          .skill-track { height:2px; background:var(--border-2); overflow:hidden; }
          .skill-fill  { height:100%; background:var(--accent); transition:width 1s ease-out; }

          .tag-list { display:flex; flex-wrap:wrap; gap:7px; margin-top:1.25rem; }
          .tag { padding:5px 11px; font-size:9px; font-weight:700; letter-spacing:.15em; text-transform:uppercase; border:1px solid rgba(var(--accent-rgb),.25); background:rgba(var(--accent-rgb),.06); color:var(--accent); transition:background .2s; }
          .tag:hover, .tag:active { background:rgba(var(--accent-rgb),.14); }

          .timeline { position:relative; padding-left:28px; border-left:1px solid var(--border-2); }
          .timeline-dot { position:absolute; left:-7px; top:20px; width:13px; height:13px; border:2px solid var(--accent); background:var(--bg); display:flex; align-items:center; justify-content:center; }
          .timeline-dot-inner { width:4px; height:4px; background:var(--accent); }
          .exp-card { padding:1.875rem; margin-left:12px; }
          .exp-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.25rem; padding-bottom:1.25rem; border-bottom:1px solid var(--border); }
          .exp-badge { font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--accent); display:block; margin-bottom:6px; }
          .exp-title { font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:700; color:var(--text-1); }
          .exp-company { font-size:13px; font-weight:600; color:var(--accent); margin-top:4px; }
          .exp-period { font-size:10px; letter-spacing:.15em; text-transform:uppercase; color:var(--text-3); padding:7px 14px; border:1px solid var(--border-2); background:var(--bg-alt); white-space:nowrap; flex-shrink:0; margin-top:4px; transition:background .35s ease; }
          .exp-item { display:flex; gap:14px; margin-bottom:12px; }
          .exp-bullet { width:5px; height:5px; background:var(--accent); flex-shrink:0; margin-top:8px; }
          .exp-text { color:var(--text-2); line-height:1.75; font-size:13.5px; }

          .projects-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
          .proj-header { height: 110px; background: var(--bg-alt); border-bottom: 1px solid var(--border-2); display: flex; align-items: center; justify-content: space-between; padding: 0 1.5rem; position: relative; overflow: hidden; transition: background .35s ease; }
          .card:hover .proj-header, .card:active .proj-header { background: var(--bg-alt); }
          .proj-header::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 80% at 50% 120%, rgba(var(--accent-rgb),.1) 0%, transparent 70%); opacity: 0; transition: opacity .35s; }
          .card:hover .proj-header::before, .card:active .proj-header::before { opacity: 1; }

          .proj-header-left { display: flex; align-items: center; gap: 12px; z-index: 1; }
          .proj-gh-logo { width: 36px; height: 36px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: border-color .3s, background .3s; }
          .card:hover .proj-gh-logo, .card:active .proj-gh-logo { border-color: rgba(var(--accent-rgb),.5); background: rgba(var(--accent-rgb),.08); }
          .proj-gh-logo svg { transition: fill .3s; }
          .card:hover .proj-gh-logo svg, .card:active .proj-gh-logo svg { fill: var(--accent); }

          .proj-id-block { display: flex; flex-direction: column; gap: 3px; }
          .card-id { font-size: 9px; font-weight: 700; letter-spacing: .25em; color: var(--text-3); text-transform: uppercase; transition: color .3s; }
          .card:hover .card-id, .card:active .card-id { color: var(--accent); }
          
          .proj-year-badge { display: inline-flex; align-items: center; font-size: 9px; font-weight: 700; letter-spacing: .12em; color: var(--text-3); font-family: 'JetBrains Mono', monospace; }

          .proj-ext-icon { width: 28px; height: 28px; border: 1px solid var(--border-2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1; transition: border-color .3s, background .3s; color: var(--text-3); }
          .card:hover .proj-ext-icon, .card:active .proj-ext-icon { border-color: rgba(var(--accent-rgb),.5); color: var(--accent); background: rgba(var(--accent-rgb),.08); }

          .proj-body { padding: 1.375rem; flex: 1; display: flex; flex-direction: column; }
          .proj-title { font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: var(--text-1); margin-bottom: 8px; letter-spacing: -.01em; transition: color .3s; line-height: 1.3; }
          .card:hover .proj-title, .card:active .proj-title { color: var(--accent); }
          
          .proj-desc { color: var(--text-2); font-size: 12px; line-height: 1.7; flex: 1; margin-bottom: 14px; }
          .proj-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
          .proj-tag { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; padding: 3px 8px; border: 1px solid var(--border-2); background: var(--tag-bg); color: var(--tag-text); transition: border-color .2s, color .2s; }
          .card:hover .proj-tag, .card:active .proj-tag { border-color: rgba(var(--accent-rgb),.25); color: var(--accent); }
          
          .proj-footer { display: flex; align-items: center; gap: 14px; padding-top: 10px; border-top: 1px solid var(--border); }
          .proj-stat { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--text-3); }

          .skills-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 22px; }
          .skill-card { padding: 0; display: flex; flex-direction: column; height: 100%; overflow: hidden; position: relative; }
          .skill-card-top { padding: 1.5rem 1.75rem 1.25rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 14px; background: var(--bg-alt); transition: background .35s ease; position: relative; }
          .skill-card-top::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 0; height: 2px; background: var(--accent); transition: width .4s ease; }
          .card:hover .skill-card-top::after, .card:active .skill-card-top::after { width: 100%; }
          
          .skill-icon-wrap { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(var(--accent-rgb),.1); border: 1px solid rgba(var(--accent-rgb),.25); flex-shrink: 0; transition: background .3s, border-color .3s; }
          .card:hover .skill-icon-wrap, .card:active .skill-icon-wrap { background: rgba(var(--accent-rgb),.18); border-color: rgba(var(--accent-rgb),.5); }
          
          .skill-icon { font-size: 20px; color: var(--accent); line-height: 1; }
          .skill-cat-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .18em; color: var(--text-1); font-family: 'JetBrains Mono', monospace; }
          .skill-card-body { padding: 1.375rem 1.75rem; flex: 1; }
          .skill-list { list-style: none; display: flex; flex-direction: column; gap: 0; }
          .skill-item { display: flex; align-items: center; gap: 12px; color: var(--text-2); font-size: 13px; line-height: 1; padding: 9px 0; border-bottom: 1px solid var(--border); transition: color .2s, padding-left .2s; }
          .skill-item:last-child { border-bottom: none; }
          .card:hover .skill-item, .card:active .skill-item { color: var(--text-1); }
          
          .skill-dot { width: 5px; height: 5px; background: rgba(var(--accent-rgb),.5); flex-shrink: 0; transition: background .3s; }
          .card:hover .skill-dot, .card:active .skill-dot { background: var(--accent); }

          .contact-grid { display:grid; grid-template-columns:1fr 1fr; gap:4rem; align-items:stretch; }
          
          .contact-reveal-left { display:flex; flex-direction:column; height:100%; }
          .contact-left-wrapper { width: 100%; }
          .contact-links-box { display: flex; flex-direction: column; gap: 9px; width: 100%; }

          .contact-reveal-right { display:flex; flex-direction:column; height:100%; }

          .contact-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(2rem,4vw,3.5rem); font-weight:700; color:var(--text-1); letter-spacing:-.02em; line-height:1.15; margin-bottom:1.25rem; }
          .contact-title-accent { color:var(--accent); }
          .contact-desc { color:var(--text-2); line-height:1.8; font-size:13.5px; margin-bottom:2rem; }
          .ccard { display:flex; align-items:stretch; text-decoration:none; overflow:hidden; border:1px solid var(--border-2); background:var(--surface); transition:border-color .25s, transform .25s, background .35s ease; margin-bottom:9px; }
          .ccard:last-child { margin-bottom: 0; }
          
          .ccard:hover, .ccard:active { border-color:rgba(var(--accent-rgb),.4); transform:translateX(4px); }
          .ccard:hover .ccard-arr, .ccard:active .ccard-arr { color:var(--accent) !important; transform:translateX(3px); }
          
          .ccard-stripe { width:3px; flex-shrink:0; }
          .ccard-icon { width:52px; display:flex; align-items:center; justify-content:center; border-right:1px solid var(--border); flex-shrink:0; padding: 12px 0; }
          .ccard-body { padding:12px 14px; flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; }
          .ccard-label { font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:var(--text-3); margin-bottom:3px; }
          .ccard-value { font-size:12px; color:var(--text-1); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .ccard-arr { padding:0 14px; color:var(--text-3); font-size:14px; flex-shrink:0; display:flex; align-items:center; transition:color .2s, transform .2s; }

          .form-box { padding:1.25rem 1.5rem; position:relative; display:flex; flex-direction:column; height:100%; margin-top:auto; }
          .form-header { display:flex; align-items:center; gap:10px; margin-bottom:0.75rem; padding-bottom:.5rem; border-bottom:1px solid var(--border); }
          .form-header-dot { width:7px; height:7px; background:var(--accent); flex-shrink:0; }
          .form-header-text { font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--text-2); }
          
          .form-body { display:flex; flex-direction:column; gap:.75rem; flex-grow:1; }
          .form-field { display:flex; flex-direction:column; gap:4px; }
          
          .form-label { font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--text-3); }
          .form-field-err { float: right; font-size: 9px; font-weight: 600; color: #f87171; letter-spacing: .08em; text-transform: none; font-family: 'JetBrains Mono', monospace; }
          .form-input { width:100%; background:transparent; border:none; border-bottom:1.5px solid var(--border-2); padding:6px 4px; color:var(--text-1); font-size:12.5px; outline:none; font-family:'JetBrains Mono',monospace; transition:border-color .2s; resize:none; }
          .form-input::placeholder { color:var(--text-3); }
          .form-input.focused { border-bottom-color:var(--accent); }
          .form-input.invalid { border-bottom-color:#f87171; }
          .form-input.valid { border-bottom-color:var(--accent); }
          .form-textarea { resize:none; }
          .form-submit { width:100%; padding:.85rem; background:var(--accent); color:var(--text-inv); font-family:'JetBrains Mono',monospace; font-weight:700; font-size:10px; letter-spacing:.2em; text-transform:uppercase; border:none; cursor:pointer; transition:background .2s, box-shadow .2s; margin-top:auto; }
          .form-submit:hover:not(:disabled), .form-submit:active:not(:disabled) { background:var(--accent-2); box-shadow:var(--glow); }
          .form-submit:disabled { cursor:not-allowed; }

          .form-success { display: flex; flex-direction: column; padding: 1.5rem 0; gap: 20px; animation: fadeSlideIn .4s ease; height: 100%; justify-content: center; }
          .form-success-top { display: flex; align-items: center; gap: 16px; }
          .form-success-icon { position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: rgba(var(--accent-rgb),.08); border-radius: 50%; color: var(--accent); flex-shrink: 0; }
          .form-success-ring { position: absolute; inset: -4px; width: calc(100% + 8px); height: calc(100% + 8px); }
          .form-success-text { display: flex; flex-direction: column; gap: 4px; }
          .form-success-title { color: var(--text-1); font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -.01em; margin: 0; }
          .form-success-sub { color: var(--text-3); font-size: 10px; letter-spacing: .15em; text-transform: uppercase; margin: 0; }
          .form-success-stats { display: flex; gap: 16px; padding: 16px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
          .form-success-stat { flex: 1; display: flex; flex-direction: column; gap: 4px; text-align: center; }
          .form-success-stat-val { font-size: 14px; font-weight: 700; color: var(--text-1); font-family: 'Space Grotesk', sans-serif; }
          .form-success-stat-val.accent { color: var(--accent); }
          .form-success-stat-label { font-size: 9px; color: var(--text-3); text-transform: uppercase; letter-spacing: .1em; }
          
          .form-new-msg { display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 10px 18px; width: 100%; background: transparent; border: 1px solid var(--border-2); color: var(--text-3); font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; transition: border-color .2s, color .2s, background .2s; }
          .form-new-msg:hover, .form-new-msg:active { border-color: var(--accent); color: var(--accent); background: rgba(var(--accent-rgb),.05); }

          .form-error { display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1rem; gap: 8px; text-align: center; animation: fadeSlideIn .4s ease; height: 100%; justify-content: center; }
          .form-error-icon { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; border: 2px solid rgba(248,113,113,.35); color: #f87171; background: rgba(248,113,113,.06); margin-bottom: 6px; }
          .form-error-title { color: #f87171; font-size: 13px; font-weight: 700; letter-spacing: .05em; margin: 0; }
          .form-error-sub { color: var(--text-3); font-size: 11px; margin: 0; }
          .form-retry { display: inline-flex; align-items: center; gap: 7px; margin-top: 8px; padding: 8px 18px; background: transparent; border: 1px solid rgba(248,113,113,.3); color: #f87171; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; cursor: pointer; transition: background .2s; }
          .form-retry:hover, .form-retry:active { background: rgba(248,113,113,.08); }

          .footer { position:relative; z-index:10; border-top:1px solid var(--border-2); background:var(--bg); padding:1.75rem 2rem; transition:background .35s ease; text-align: center; }
          .footer-inner { max-width:1280px; margin:0 auto; display:flex; align-items:center; justify-content:center; width:100%; flex-wrap:wrap; gap:14px; }
          .footer-copy { font-size:9px; font-weight:700; letter-spacing:.3em; text-transform:uppercase; color:var(--text-3); margin:0 auto; text-align:center; width:100%; }
          .footer-links { display:flex; gap:28px; }
          .footer-link { font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:var(--text-3); text-decoration:none; transition:color .2s; }
          .footer-link:hover, .footer-link:active { color:var(--accent); }

          /* ── RESPONSIVE PREMIUM (Mobile First Refinado) ───────────────── */
@media (max-width: 900px) {

  /* Layout geral */
  .hero-grid, 
  .about-grid, 
  .projects-grid, 
  .skills-grid { 
    grid-template-columns: 1fr !important; 
  }

  /* ── CORREÇÃO DA EXPERIÊNCIA (MOBILE BLINDADO) ── */
  #experiencia .exp-header {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 14px !important;
  }
  
  #experiencia .exp-header > div {
    width: 100% !important;
  }

  #experiencia .exp-period {
    margin-top: 0 !important;
    align-self: flex-start !important;
    width: fit-content !important;
  }

  .nav-links { display:none !important; }
  .logo-meta { display: none; }
  .nav-right { border-left: none !important; padding-left: 0 !important; }
  .nav-right .theme-toggle { display: none !important; }
  .mobile-menu-btn { display:block !important; }
  .dot-nav { display:none; }

  .navbar-inner { 
    grid-template-columns: auto 1fr auto !important; 
    direction: rtl; 
  }

  .navbar-inner > * { direction: ltr; }

  .logo { 
    border-right: none !important; 
    padding-right: 0 !important; 
  }

 /* ───────────────────────────────────────────── */
/* 💎 CONTACT FIX (PADRÃO PROFISSIONAL) */
/* ───────────────────────────────────────────── */

/* Container único (ESSENCIAL) */
.contact-container {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Garante que tudo respeite a mesma largura */
.contact-links-box,
.form-box {
  width: 100%;
}

/* Remove qualquer limitação antiga */
.form-box {
  max-width: none !important;
}

/* Melhor espaçamento entre blocos */
.contact-links-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

/* Inputs mais profissionais */
.form-input,
.form-textarea {
  font-size: 16px;
  padding: 14px 12px;
  transition: all 0.2s ease;
}

/* Microinteração estilo Stripe */
.form-input:focus,
.form-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.15);
  transform: scale(1.01);
}

/* Botão premium */
.form-submit {
  width: 100%;
  padding: 16px;
  transition: all 0.25s ease;
}

.form-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
  
/* ── GRID BASE (DESKTOP FIRST) ───────────────── */
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: start;
  justify-content: center;
  gap: 4rem;
}

/* ── RESPONSIVO CORRETO ───────────────── */
@media (max-width: 900px) {

  .contact-grid {
    grid-template-columns: 1fr;
    justify-items: center;
    gap: 2.5rem;
    padding-inline: 1rem;
  }

}

.contact-reveal-left,
.contact-reveal-right {
  width: 100%;
  display: flex;
  justify-content: center;
}

.contact-left-wrapper {
  width: 100%;
  text-align: center;
}

.form-box {
  border-radius: 16px;
  overflow: hidden;
}



}
          }
        `}</style>

        <div className="grid-bg" />
        <div className="grid-glow" />
        <div className="scan" />
        <div className="scroll-bar" style={{ width: `${scrollPct}%` }} />

        <div className="dot-nav">
          {NAV.map((l) => (
            <button
              key={l.id}
              title={l.label}
              className={`dot-btn${section === l.id ? " active" : ""}`}
              onClick={() => go(l.id)}
            />
          ))}
        </div>

        <nav className="navbar">
          <div className="navbar-inner">
            <button className="logo" onClick={() => go("home")}>
              <div className="logo-mark">
                <span className="logo-cross-h" />
                <span className="logo-cross-v" />
              </div>
              <span className="logo-text">
                DEV<span className="logo-accent">.</span>SYS
              </span>
              <div className="logo-meta">
                <div className="logo-meta-bot">
                  sec&nbsp;
                  <span className="logo-meta-bot-num">
                    {String(
                      NAV.findIndex((l) => l.id === section) + 1,
                    ).padStart(2, "0")}
                  </span>
                  &nbsp;/&nbsp;{String(NAV.length).padStart(2, "0")}
                </div>
              </div>
            </button>

            <NavLinks NAV={NAV} section={section} go={go} />

            <div className="nav-right">
              <ThemeToggle dark={dark} onToggle={() => toggleTheme()} />
              <button
                className={`mobile-menu-btn ${mobileOpen ? "open" : ""}`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="8" x2="20" y2="8"></line>
                    <line x1="4" y1="16" x2="14" y2="16"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {mobileOpen && (
          <div
            className="mobile-menu-overlay"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="mobile-menu-inner"
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ marginBottom: "1.5rem", paddingLeft: "44px" }}>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    color: "var(--text-3)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                ></span>
              </div>

              {NAV.map((l, i) => (
                <button
                  key={l.id}
                  className={`mobile-nav-link ${section === l.id ? "active" : ""}`}
                  onClick={() => {
                    go(l.id);
                    setMobileOpen(false);
                  }}
                >
                  <div className="nav-text-wrapper">
                    <div
                      className="nav-text-inner"
                      style={{ animationDelay: `${i * 0.07}s` }}
                    >
                      <span className="mobile-nav-num">0{i + 1}</span>
                      <span className="mobile-nav-label">{l.label}</span>
                    </div>
                  </div>
                </button>
              ))}

              {/* 🔴 AQUI ESTÁ A ALTERAÇÃO: A div substitui o button, e o button vira o switch */}
              <div className="mobile-nav-link mobile-theme-item">
                <div className="nav-text-wrapper">
                  <div
                    className="nav-text-inner"
                    style={{ animationDelay: `${NAV.length * 0.07}s` }}
                  >
                    <span className="mobile-nav-num">0{NAV.length + 1}</span>

                    <div className="mobile-theme-content">
                      <span className="mobile-nav-label">Aparência</span>

                      <span className="mobile-theme-sub">
                        {dark ? "Modo Escuro" : "Modo Claro"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 🔥 O SWITCH É O VERDADEIRO BOTÃO AGORA */}
                <button
                  className={`mobile-theme-switch ${dark ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTheme();
                  }}
                  aria-label="Alternar tema"
                >
                  <div className="mobile-theme-thumb">{dark ? "🌙" : "☀️"}</div>
                </button>
              </div>
            </div>
          </div>
        )}

        <section id="home" className="hero">
          <div className="hero-grid">
            <div className="hero-left">
              <Reveal>
                <div className="status-badge">
                  <span className="status-dot-wrap">
                    <span className="status-ping" />
                    <span className="status-solid" />
                  </span>
                  <span className="status-text">
                    {" "}
                    Python Dev · Backend · IA
                  </span>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="hero-name">
                  <GlitchText text="Hiann" />
                  <br />
                  <span className="hero-name-dim">
                    <GlitchText text="Alexander" dim />
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <div>
                  <TypeWriter
                    words={[
                      "Programador Python",
                      "Dev Backend",
                      "Inteligência Artificial",
                      "Visão Computacional",
                    ]}
                  />
                </div>
              </Reveal>
              <Reveal delay={250}>
                <p className="hero-bio">
                  Recém-formado em Sistemas de Informação, busco consolidar meu
                  espaço no mercado de tecnologia atuando na programação e
                  análise de sistemas. Trago sólida base em Python, Java e Web
                  com integração a bancos de dados SQL e NoSQL, vivência em
                  metodologias ágeis (Scrum) e experiência acadêmica aplicada em
                  Deep Learning e Visão Computacional.
                </p>
              </Reveal>
              <Reveal delay={320}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                  <a
                    href="/Curriculo_Hiann_Alexander.pdf"
                    download
                    className="btn-primary"
                  >
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="square"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Baixar CV
                  </a>
                  <button className="btn-outline" onClick={() => go("contato")}>
                    Entrar em contato →
                  </button>
                </div>
              </Reveal>
              <Reveal delay={400}>
                <div className="hero-stats">
                  {[
                    { v: 10, s: "+", l: "Projetos" },
                    { v: 2, s: " anos", l: "Experiência" },
                    { v: 5, s: "+", l: "Tecnologias" },
                  ].map((s) => (
                    <div key={s.l}>
                      <div className="stat-num">
                        <Counter target={s.v} suffix={s.s} />
                      </div>
                      <div className="stat-label">{s.l}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div className="hero-right">
              <Reveal delay={150}>
                <div className="profile-box">
                  <div className="corner tl" />
                  <div className="corner br" />
                  <div className="corner tr" />
                  <div className="corner bl" />
                  <div className="profile-scan" />
                  <img
                    className="profile-img"
                    src="/profile.jpeg"
                    alt="Hiann Alexander"
                  />
                  <div className="profile-overlay" />
                  <div className="profile-info">
                    <div className="profile-role">Programador Python · IA</div>
                    <div className="profile-name">Hiann Alexander</div>
                    <div className="profile-status">
                      <span className="profile-status-dot" />
                      <span className="profile-status-text">
                        Disponível para projetos
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={300}>
                <Terminal />
              </Reveal>
            </div>
          </div>
        </section>

        <div className="marquee-wrap">
          <div style={{ display: "flex", overflow: "hidden" }}>
            <div className="marquee-inner">
              {[0, 1].map((n) => (
                <span key={n} style={{ display: "flex", gap: 44 }}>
                  {[
                    "Python",
                    "Machine Learning",
                    "Deep Learning",
                    "YOLOv8",
                    "SQL Server",
                    "MongoDB",
                    "Java",
                    "Git",
                    "Scrum",
                    "Visão Computacional",
                    "Automação",
                  ].map((t) => (
                    <span key={t} className="marquee-item">
                      <span className="marquee-dot" />
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section id="sobre" className="section">
          <Reveal>
            <div className="slabel">
              <div className="slabel-line" />
              <span className="slabel-text">01 — Sobre</span>
            </div>
          </Reveal>
          <div className="card">
            <div className="corner tl" />
            <div className="corner br" />
            <div className="about-box">
              <div className="about-tag">Visão Geral</div>
              <div className="about-grid">
                <Reveal>
                  <div>
                    <h3 className="about-title">
                      A Arquitetura
                      <br />
                      por Trás do Código
                    </h3>
                    <p className="about-p">
                      Recém-formado em Sistemas de Informação, busco consolidar
                      meu espaço no mercado de tecnologia atuando em programação
                      e análise de sistemas. Possuo experiência prática em
                      projetos acadêmicos e estágio utilizando Python, Java e
                      desenvolvimento Web (HTML/CSS), com integração a bancos de
                      dados como SQL Server, MySQL e MongoDB.
                    </p>
                    <p className="about-p">
                      Atua na manutenção de sistemas, correção de erros e
                      implementação de funcionalidades seguindo boas práticas de
                      código e metodologias ágeis (Scrum). Possui vivência
                      acadêmica em Inteligência Artificial, desenvolvendo
                      modelos de Deep Learning e Visão Computacional.
                    </p>
                    <div style={{ marginTop: "1.25rem" }}>
                      {[
                        ["Localização", "Goiânia – GO"],
                        ["Modalidade", "Remoto / Híbrido"],
                        ["Idiomas", "Português (Nativo), Inglês"],
                        ["Área de Foco", "Backend & Visão Computacional"],
                        ["Interesses", "Arquiteturas Escaláveis, Micro-SaaS"],
                      ].map(([k, v]) => (
                        <div key={k} className="info-row">
                          <span className="info-key">{k}</span>
                          <span className="info-val">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
                <Reveal delay={120}>
                  <div>
                    <p className="about-stack-title">Stack Principal</p>
                    {SKILLS.map((s) => (
                      <SkillBar key={s.name} {...s} />
                    ))}
                    <div className="tag-list">
                      {[
                        "Python",
                        "Java",
                        "SQL Server",
                        "MySQL",
                        "MongoDB",
                        "YOLO",
                        "Scrum",
                        "HTML/CSS",
                      ].map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: "2rem" }}>
                      <p className="about-stack-title">Formação</p>
                      {[
                        {
                          course: "Sistemas de Informação",
                          institution: "IF Goiano – Urutaí",
                          period: "Concluído: 2026",
                        },
                        {
                          course: "Técnico em Informática",
                          institution: "IF Goiano – Urutaí",
                          period: "Concluído: 2019",
                        },
                      ].map((f) => (
                        <div
                          key={f.course}
                          style={{
                            marginBottom: "0.75rem",
                            paddingBottom: "0.75rem",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "var(--text-1)",
                              fontFamily: "'Space Grotesk', sans-serif",
                            }}
                          >
                            {f.course}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--accent)",
                              marginTop: "2px",
                            }}
                          >
                            {f.institution}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "var(--text-3)",
                              letterSpacing: "0.1em",
                              marginTop: "2px",
                            }}
                          >
                            {f.period}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: "1.5rem" }}>
                      <p className="about-stack-title">Atividades</p>
                      {[
                        { label: "Palestrante", detail: "Python (2023)" },
                        { label: "Monitoria", detail: "Inglês (2020)" },
                      ].map((a) => (
                        <div key={a.label} className="info-row">
                          <span className="info-key">{a.label}</span>
                          <span className="info-val">{a.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        <section id="experiencia" className="section section-sm">
          <Reveal>
            <div className="slabel">
              <div className="slabel-line" />
              <span className="slabel-text">02 — Experiência</span>
            </div>
          </Reveal>
          <div className="timeline">
            <div className="timeline-dot">
              <div className="timeline-dot-inner" />
            </div>
            <Reveal>
              <div className="card exp-card">
                <div
                  className="corner tl"
                  style={{ borderColor: `rgba(var(--accent-rgb),.3)` }}
                />
                <div className="exp-header">
                  <div>
                    <span className="exp-badge">Estágio</span>
                    <div className="exp-title">Sistemas de Informação</div>
                    <div className="exp-company">Schults Consultoria</div>
                  </div>
                  <div className="exp-period">Jan/2025 – Mar/2025</div>
                </div>
                {[
                  "Apoio no desenvolvimento e manutenção de sistemas da empresa.",
                  "Correção de erros (bugs) e melhorias técnicas.",
                  "Atuação em ambiente ágil (Scrum) para organização de tarefas.",
                  "Uso de controle de versão (Git) no dia a dia.",
                ].map((t, i) => (
                  <div key={i} className="exp-item">
                    <span className="exp-bullet" />
                    <p className="exp-text">{t}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="projetos" className="section section-sm">
          <Reveal>
            <div className="slabel">
              <div className="slabel-line" />
              <span className="slabel-text">03 — Projetos</span>
            </div>
          </Reveal>
          <GitHubProjects />
        </section>

        <section id="skills" className="section section-sm">
          <Reveal>
            <div className="slabel">
              <div className="slabel-line" />
              <span className="slabel-text">04 — Competências</span>
            </div>
          </Reveal>
          <div className="skills-grid">
            {[
              {
                icon: "⬡",
                title: "Programação",
                items: ["Python", "Java", "HTML / CSS", "Automação de Tarefas"],
              },
              {
                icon: "◈",
                title: "Dados & IA",
                items: [
                  "SQL Server / MySQL",
                  "MongoDB",
                  "Deep Learning",
                  "Visão Computacional (YOLO)",
                  "Coleta e Rotulagem de Dados",
                ],
              },
              {
                icon: "◻",
                title: "Ferramentas & Métodos",
                items: [
                  "Git / GitHub",
                  "Scrum / Agile",
                  "Windows",
                  "Debugging & Code Review",
                  "Documentação Técnica",
                ],
              },
            ].map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className="card skill-card">
                  <div className="skill-card-top">
                    <div className="skill-icon-wrap">
                      <span className="skill-icon">{c.icon}</span>
                    </div>
                    <span className="skill-cat-title">{c.title}</span>
                  </div>
                  <div className="skill-card-body">
                    <ul className="skill-list">
                      {c.items.map((it) => (
                        <li key={it} className="skill-item">
                          <span className="skill-dot" />
                          {it}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section
          id="contato"
          className="section"
          style={{ borderTop: "1px solid var(--border-2)" }}
        >
          <Reveal>
            <div className="slabel">
              <div className="slabel-line" />
              <span className="slabel-text">05 — Contato</span>
            </div>
          </Reveal>

          {/* O contact-grid volta a ser o PAI DIRETO das duas colunas */}
          <div className="contact-grid">
            {/* ─── ESQUERDA ─── */}
            <Reveal className="contact-reveal-left">
              <div className="contact-left-wrapper">
                <h3 className="contact-title">
                  Vamos construir
                  <br />
                  <span className="contact-title-accent">algo juntos</span>
                </h3>

                <p className="contact-desc">
                  Disponível para projetos de IA, automações, arquiteturas de
                  sistema ou oportunidades de estágio/trabalho.
                </p>

                <div className="contact-links-box">
                  {[
                    {
                      label: "Email",
                      value: "hiannpdr1234@gmail.com",
                      href: "https://mail.google.com/mail/?view=cm&to=hiannpdr1234@gmail.com",
                      stripe: "linear-gradient(180deg,#ea4335,#fbbc05)",
                      icon: (
                        <svg
                          width="20"
                          height="16"
                          viewBox="0 0 24 18"
                          fill="none"
                        >
                          <rect
                            x=".5"
                            y=".5"
                            width="23"
                            height="17"
                            rx="1.5"
                            stroke="currentColor"
                            strokeOpacity=".3"
                          />
                          <path
                            d="M1 1.5L12 10L23 1.5"
                            stroke="#ea4335"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <line
                            x1="1"
                            y1="1.5"
                            x2="1"
                            y2="17"
                            stroke="#34a853"
                            strokeWidth="1.5"
                          />
                          <line
                            x1="23"
                            y1="1.5"
                            x2="23"
                            y2="17"
                            stroke="#fbbc05"
                            strokeWidth="1.5"
                          />
                        </svg>
                      ),
                    },
                    {
                      label: "Telefone",
                      value: "(64) 99281-4550",
                      href: "tel:+5564992814550",
                      stripe: "#22c55e",
                      icon: (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          style={{ color: "#22c55e" }}
                        >
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.7A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      ),
                    },
                    {
                      label: "GitHub",
                      value: "github.com/Hiann",
                      href: "https://github.com/Hiann",
                      stripe: "var(--text-3)",
                      icon: (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          style={{ color: "var(--text-3)" }}
                        >
                          <path
                            d="M12 .297c-6.63 0-12 5.373-12 12 
  0 5.303 3.438 9.8 8.205 11.385 
  .6.113.82-.258.82-.577 
  0-.285-.01-1.04-.015-2.04 
  -3.338.724-4.042-1.61-4.042-1.61 
  -.546-1.387-1.333-1.756-1.333-1.756 
  -1.089-.745.083-.729.083-.729 
  1.205.084 1.84 1.237 1.84 1.237 
  1.07 1.835 2.809 1.305 3.495.998 
  .108-.776.417-1.305.76-1.605 
  -2.665-.3-5.466-1.332-5.466-5.93 
  0-1.31.469-2.381 1.235-3.221 
  -.123-.303-.535-1.524.117-3.176 
  0 0 1.008-.322 3.301 1.23 
  .957-.266 1.983-.399 3.003-.404 
  1.02.005 2.047.138 3.006.404 
  2.291-1.552 3.297-1.23 3.297-1.23 
  .653 1.653.241 2.874.118 3.176 
  .77.84 1.235 1.911 1.235 3.221 
  0 4.609-2.807 5.625-5.479 5.921 
  .43.371.823 1.102.823 2.222 
  0 1.606-.014 2.898-.014 3.293 
  0 .319.216.694.825.576 
  C20.565 22.092 24 17.592 24 12.297 
  c0-6.627-5.373-12-12-12"
                          />
                        </svg>
                      ),
                    },
                    {
                      label: "LinkedIn",
                      value: "linkedin.com/in/hiann-alexander",
                      href: "https://linkedin.com/in/hiann-alexander",
                      stripe: "#0a66c2",
                      icon: (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="#0a66c2"
                        >
                          <path
                            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037
  -1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046
  c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286z
  M5.337 7.433a2.062 2.062 0 01-2.063-2.065 
  2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z
  M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542
  C0 23.227.792 24 1.771 24h20.451
  C23.2 24 24 23.227 24 22.271V1.729
  C24 .774 23.2 0 22.222 0h.003z"
                          />
                        </svg>
                      ),
                    },
                  ].map((c) => (
                    <a
                      key={c.label}
                      href={c.href}
                      target="_blank"
                      rel="noreferrer"
                      className="ccard"
                    >
                      <div
                        className="ccard-stripe"
                        style={{ background: c.stripe }}
                      />
                      <div
                        className="ccard-icon"
                        style={{ background: "var(--bg-alt)" }}
                      >
                        {c.icon}
                      </div>
                      <div className="ccard-body">
                        <div className="ccard-label">{c.label}</div>
                        <div className="ccard-value">{c.value}</div>
                      </div>
                      <div className="ccard-arr">↗</div>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* ─── DIREITA ─── */}
            <Reveal delay={140} className="contact-reveal-right">
              <div className="card form-box">
                <div
                  className="corner tl"
                  style={{ borderColor: `rgba(var(--accent-rgb),.3)` }}
                />

                <div className="form-header">
                  <div className="form-header-dot" />
                  <span className="form-header-text">Enviar Mensagem</span>
                </div>

                <ContactForm />
              </div>
            </Reveal>
          </div>
        </section>
        <footer className="footer" style={{ textAlign: "center" }}>
          <div
            className="footer-inner"
            style={{ justifyContent: "center", width: "100%" }}
          >
            <p
              className="footer-copy"
              style={{ margin: "0 auto", textAlign: "center" }}
            >
              © {new Date().getFullYear()} Hiann Alexander Mendes de Oliveira —
              Todos os direitos reservados
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
