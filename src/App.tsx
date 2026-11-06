import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, Check, Download, Maximize, Minimize, Monitor, Settings2, Sparkles, Undo2, Upload } from "lucide-react";
import EventHeader from "@/components/scoreboard/EventHeader";
import Leaderboard from "@/components/scoreboard/Leaderboard";
import OperatorPanel from "@/components/scoreboard/OperatorPanel";
import SettingsPanel from "@/components/scoreboard/SettingsPanel";
import TimerPanel from "@/components/scoreboard/TimerPanel";
import TimerOverlay from "@/components/scoreboard/TimerOverlay";
import { useScoreboard, type Scoreboard } from "@/hooks/use-scoreboard";
import { decodeState } from "@/lib/shared-state";

function Background({ variant }: {variant: string}) {
  return <div className="scene" data-variant={variant} aria-hidden="true">{[1,2,3,4,5].map(n => <span key={n} className={`blob blob-${n}`}/>)}</div>;
}
function PodiumView({ sb }: {sb: Scoreboard}) {
  const [size, setSize] = useState({width: window.innerWidth, height: window.innerHeight});
  const [controls, setControls] = useState(true);
  const [fullscreen, setFullscreen] = useState(!!document.fullscreenElement);
  const [notice, setNotice] = useState("");
  const hide = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toolbar = useRef<HTMLDivElement>(null);
  const reveal = () => {
    setControls(true);
    clearTimeout(hide.current);
    hide.current = setTimeout(() => {if (!toolbar.current?.contains(document.activeElement)) setControls(false);}, 2500);
  };
  useEffect(() => {
    const resize = () => setSize({width: window.innerWidth, height: window.innerHeight});
    const fs = () => setFullscreen(!!document.fullscreenElement);
    window.addEventListener("resize", resize); document.addEventListener("fullscreenchange", fs);
    reveal();
    return () => {window.removeEventListener("resize", resize); document.removeEventListener("fullscreenchange", fs); clearTimeout(hide.current);};
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen();
    } catch {setNotice("Fullscreen belum diizinkan. Gunakan F11 pada browser desktop.");}
  };
  const scale = Math.min(size.width / 1600, size.height / 900);
  return <main className={`podium-view ${controls ? "show-controls" : ""} ${sb.teams.length > 3 ? "has-extra-teams" : ""}`} onPointerMove={reveal} onPointerDown={reveal}>
    <div className="cosmic-scene" data-variant={sb.settings.background} aria-hidden="true"/>
    <div className="stage-canvas" style={{transform: `translate(-50%, -50%) scale(${scale})`}}>
      <EventHeader settings={sb.settings}/>
      <Leaderboard teams={sb.teams} settings={sb.settings} deltas={sb.deltas}/>
      <footer className="stage-footer"><span className="footer-line"/><span><i/>SEMANGAT BERLOMBA, RAIH PRESTASI</span><span className="footer-line"/></footer>
    </div>
    <div ref={toolbar} className="display-toolbar glass" onFocus={reveal} onBlur={reveal} onClick={() => {
      // Activated controls release focus; Tab navigation still keeps them visible.
      if (document.activeElement instanceof HTMLElement && toolbar.current?.contains(document.activeElement)) document.activeElement.blur();
      reveal();
    }}>
      <a href="?view=operator" target="gemass-operator" title="Buka panel operator di tab terpisah"><Settings2 size={16}/>Panel operator<ArrowUpRight size={14}/></a>
      <span/>
      <button onClick={toggleFullscreen} aria-label={fullscreen ? "Keluar fullscreen" : "Fullscreen podium"}>{fullscreen ? <Minimize size={17}/> : <Maximize size={17}/>}<span>{fullscreen ? "Keluar fullscreen" : "Fullscreen"}</span></button>
    </div>
    {notice && <button className="display-notice" onClick={() => setNotice("")}>{notice} ×</button>}
    <TimerOverlay timer={sb.timer}/>
  </main>;
}
function OperatorView({ sb }: {sb: Scoreboard}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const upload = useRef<HTMLInputElement>(null);
  const backup = () => {
    const url = URL.createObjectURL(new Blob([sb.exportState()], {type:"application/json"}));
    const a = document.createElement("a"); a.href = url; a.download = `gemass-cadangan-${new Date().toISOString().slice(0,10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importBackup = async (file: File | undefined) => {
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Cadangan maksimal 5 MB.");
      const next = decodeState(await file.text());
      if (!next) throw new Error("Format cadangan tidak valid. Pilih file JSON hasil unduh dari aplikasi ini.");
      if (!window.confirm("Ganti tim, skor, logo, dan pengaturan dengan isi cadangan ini?")) return;
      // Imported timers are stopped to prevent accidentally running an old question.
      next.timer = {endsAt: null, runId: null};
      if (sb.replaceState(next)) setMessage("Cadangan berhasil dipulihkan.");
    } catch(e) {setMessage(e instanceof Error ? e.message : "Cadangan gagal dibaca.");}
  };
  return <main className="operator-view">
    <Background variant={sb.settings.background}/>
    <header className="operator-nav"><a className="brand" href="?"><span className="brand-symbol"><Sparkles size={22}/></span><span>GEMASS<small>PODIUM CONTROL</small></span></a><div className="nav-actions"><button className="secondary-button" onClick={() => setSettingsOpen(true)}><Settings2 size={17}/><span>Pengaturan</span></button><a className="primary-button" href="?" target="gemass-podium"><Monitor size={17}/>Buka layar podium<ArrowUpRight size={16}/></a></div></header>
    <div className="operator-content">
      <div className="operator-title"><div><span className="eyebrow">DI BALIK PANGGUNG</span><h1>Panel operator<span>.</span></h1><p>Atur poin di sini. Biarkan podium jadi pusat perhatian.</p></div><span className="sync-badge"><i/>Sinkron antar-tab</span></div>
      <div className="setup-hint"><span className="hint-number">i</span><p>Buka <strong>layar podium</strong> di tab atau jendela lain, pindahkan ke proyektor, lalu klik <strong>Fullscreen</strong>. Gunakan browser dan profil yang sama.</p><Check size={19}/></div>
      {(sb.error || message) && <div className="operator-alert" role="alert"><span>{sb.error || message}</span><button onClick={() => {sb.clearError(); setMessage("");}} aria-label="Tutup pesan">×</button></div>}
      <div className="operator-layout"><div className="score-column"><div className="score-tools"><span className="eyebrow">KONTROL SKOR</span><button onClick={sb.undo} disabled={!sb.history.length} className="undo-button"><Undo2 size={15}/>Urungkan terakhir</button></div><OperatorPanel teams={sb.teams} settings={sb.settings} deltas={sb.deltas} adjustScore={sb.adjustScore} resetScore={sb.resetScore} setScore={sb.setScore}/></div>
        <aside className="operator-sidebar"><TimerPanel sb={sb}/>
          <section className="history-panel glass"><div className="section-heading"><h2>Aktivitas skor</h2><span className="small-badge">TERBARU</span></div>
            {sb.history.length ? <ul>{sb.history.slice(-5).reverse().map(action => <li key={action.id}><span><strong>{action.teamName}</strong><small>{new Date(action.at).toLocaleTimeString("id-ID", {hour:"2-digit",minute:"2-digit",second:"2-digit"})}</small></span><span className={action.after > action.before ? "positive" : "negative"}>{action.after > action.before ? "+" : ""}{action.after - action.before}<small>{action.before} → {action.after}</small></span></li>)}</ul> : <div className="history-empty"><span>Belum ada perubahan skor</span><p>Penambahan dan pengurangan poin akan tercatat di sini.</p></div>}
          </section>
          <section className="backup-panel"><div><h2>Cadangan acara</h2><p>Simpan skor, pengaturan, dan semua logo.</p></div><div><button onClick={backup}><Download size={16}/>Unduh</button><button onClick={() => upload.current?.click()}><Upload size={16}/>Pulihkan</button><input ref={upload} hidden type="file" accept="application/json,.json" aria-label="Pulihkan cadangan" onChange={e => {void importBackup(e.target.files?.[0]); e.target.value = "";}}/></div></section>
          <button className="reset-scores" onClick={() => {if(window.confirm("Kembalikan semua skor ke skor awal masing-masing tim?")) sb.resetAllScores();}}>Reset seluruh skor ke skor awal</button>
        </aside>
      </div>
      <footer className="operator-footer"><a href="?"><ArrowLeft size={14}/>Kembali ke podium</a><span>GEMASS · DESA SRUNI</span></footer>
    </div>
    <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} settings={sb.settings} teams={sb.teams} updateSettings={sb.updateSettings} updateEventLogo={sb.updateEventLogo} updateTeam={sb.updateTeam} addTeam={sb.addTeam} removeTeam={sb.removeTeam} resetAll={sb.resetAll}/>
  </main>;
}
export default function App() {
  const sb = useScoreboard();
  const isOperator = new URLSearchParams(window.location.search).get("view") === "operator";
  useEffect(() => {document.title = isOperator ? "Panel Operator — GEMASS" : "GEMASS — Podium Cerdas Cermat";}, [isOperator]);
  return <div style={{"--theme": sb.settings.themeColor} as CSSProperties}>{isOperator ? <OperatorView sb={sb}/> : <PodiumView sb={sb}/>}</div>;
}
