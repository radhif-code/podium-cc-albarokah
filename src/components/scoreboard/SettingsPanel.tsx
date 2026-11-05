import { useEffect, useRef, useState } from "react";
import { prepareLogo } from "@/lib/logo-upload";
import { MAX_TEAMS } from "@/lib/shared-state";
import { AnimatePresence, motion } from "framer-motion";
import {
  BACKGROUND_PRESETS,
  TEAM_COLORS,
  THEME_PRESETS,
  type EventLogo,
  type Settings,
  type Team,
} from "@/lib/scoreboard";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-input px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring";

/** slot editor: index-based, 0 = unused slot (hidden button) */
function setSlot(values: number[], i: number, raw: string): number[] {
  const next = [...values];
  next[i] = raw === "" ? 0 : Math.max(1, Number.parseInt(raw, 10) || 0);
  return next;
}

export default function SettingsPanel({
  open,
  onClose,
  settings,
  teams,
  updateSettings,
  updateEventLogo,
  updateTeam,
  addTeam,
  removeTeam,
  resetAll,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  teams: Team[];
  updateSettings: (patch: Partial<Settings>) => void;
  updateEventLogo: (id: string, patch: Partial<EventLogo>) => void;
  updateTeam: (teamId: string, patch: Partial<Team>) => void;
  addTeam: () => void;
  removeTeam: (teamId: string) => void;
  resetAll: () => void;
}) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const modalRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () => Array.from(modalRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select, [tabindex="0"]') ?? []);
    focusables()[0]?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const nodes = focusables();
        const first = nodes[0], last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", handleKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {document.removeEventListener("keydown", handleKey); document.body.style.overflow = oldOverflow; previous?.focus();};
  }, [open]);

  const onLogoPicked = async (target: string, file: File | undefined, eventLogo = false) => {
    if (!file) return;
    setUploadError(""); setUploading(true);
    try {
      const src = await prepareLogo(file);
      if (eventLogo) updateEventLogo(target, {src});
      else updateTeam(target, {logo: src});
    } catch (e) {setUploadError(e instanceof Error ? e.message : "Gagal mengunggah logo.");}
    finally {setUploading(false);}
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="absolute inset-0 bg-white/30 backdrop-blur-sm"
          />
          <motion.aside
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="glass absolute right-0 top-0 flex h-full w-full max-w-md flex-col rounded-l-3xl !bg-white/75"
          >
            <div className="flex items-center justify-between border-b border-white/70 px-5 py-4">
              <h2 id="settings-title" className="font-display text-lg font-extrabold">⚙ Pengaturan</h2>
              <button
                onClick={onClose}
                className="rounded-xl bg-white/80 px-3 py-1.5 text-sm font-bold shadow-sm transition hover:bg-white active:scale-95"
              >
                Tutup
              </button>
            </div>

            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
              {uploadError && <p role="alert" className="upload-error">{uploadError}</p>}
              <section className="space-y-3">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">Logo di atas podium</h3>
                <p className="text-xs text-muted-foreground">Ketiga logo asli LDII, GEMASS, dan PPG sudah terpasang. Kamu dapat mengganti atau menghapusnya di sini. PNG transparan disarankan; JPG/WebP juga didukung (maks. 10 MB).</p>
                <div className="event-logo-settings">
                  {settings.eventLogos.map(logo => <div key={logo.id} className="event-logo-slot">
                    <div className="logo-preview">{logo.src ? <img src={logo.src} alt={logo.label}/> : <span>+ Logo</span>}</div>
                    <label><span className="sr-only">Nama logo {logo.label}</span><input className={inputCls} value={logo.label} maxLength={70} onChange={e => updateEventLogo(logo.id, {label: e.target.value})}/></label>
                    <label className={`logo-upload-button ${uploading ? "is-disabled" : ""}`}><span>{uploading ? "Memproses…" : logo.src ? "Ganti logo" : "Unggah logo"}</span><input className="sr-only" type="file" disabled={uploading} aria-label={`Unggah logo ${logo.label}`} accept="image/png,image/jpeg,image/webp" onChange={e => {void onLogoPicked(logo.id, e.target.files?.[0], true); e.target.value = "";}}/></label>
                    {logo.src && <button className="remove-logo" onClick={() => updateEventLogo(logo.id, {src: null})}>Hapus logo {logo.label}</button>}
                  </div>)}
                </div>
              </section>
              {/* Identitas */}
              <section className="space-y-3">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                  Identitas Acara
                </h3>
                <Field label="Nama Kompetisi">
                  <input
                    className={inputCls}
                    value={settings.competitionName}
                    maxLength={70}
                    onChange={(e) => updateSettings({ competitionName: e.target.value })}
                  />
                </Field>
                <Field label="Lokasi / Desa">
                  <input
                    className={inputCls}
                    value={settings.location}
                    maxLength={70}
                    onChange={(e) => updateSettings({ location: e.target.value })}
                  />
                </Field>
                <Field label="Teks Badge">
                  <input
                    className={inputCls}
                    value={settings.badgeText}
                    maxLength={90}
                    onChange={(e) => updateSettings({ badgeText: e.target.value })}
                  />
                </Field>
              </section>

              {/* Tampilan */}
              <section className="space-y-3">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                  Tampilan
                </h3>
                <Field label="Warna Tema">
                  <div className="flex flex-wrap items-center gap-2">
                    {THEME_PRESETS.map((p) => (
                      <button
                        key={p.color}
                        title={p.label}
                        onClick={() => updateSettings({ themeColor: p.color })}
                        className={`h-8 w-8 rounded-full shadow-md ring-2 transition-transform hover:scale-110 ${
                          settings.themeColor === p.color ? "ring-foreground/60" : "ring-white"
                        }`}
                        style={{ backgroundColor: p.color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={settings.themeColor}
                      onChange={(e) => updateSettings({ themeColor: e.target.value })}
                      className="h-8 w-10 cursor-pointer rounded-lg border border-border bg-white/80"
                    />
                  </div>
                </Field>
                <Field label="Background">
                  <div className="grid grid-cols-2 gap-2">
                    {BACKGROUND_PRESETS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => updateSettings({ background: b.id })}
                        className={`rounded-2xl p-1.5 text-left shadow-md ring-2 transition ${
                          settings.background === b.id
                            ? "ring-theme"
                            : "ring-white hover:ring-white/60"
                        }`}
                      >
                        <span className={`block h-12 w-full rounded-xl bgprev-${b.id}`} />
                        <span className="mt-1 block px-1 text-xs font-bold">{b.label}</span>
                      </button>
                    ))}
                  </div>
                </Field>
              </section>

              {/* Skor */}
              <section className="space-y-3">
                <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                  Skor
                </h3>
                <Field label="Nilai Tombol Tambah (+)">
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        type="number"
                        min={0}
                        placeholder="—"
                        className={`${inputCls} text-center`}
                        value={settings.plusValues[i] || ""}
                        onChange={(e) =>
                          updateSettings({ plusValues: setSlot(settings.plusValues, i, e.target.value) })
                        }
                      />
                    ))}
                  </div>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Kosong = tanpa tombol (maks. 4 tombol)
                  </span>
                </Field>
                <Field label="Nilai Tombol Kurang (−)">
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((i) => (
                      <input
                        key={i}
                        type="number"
                        min={0}
                        placeholder="—"
                        className={`${inputCls} text-center`}
                        value={settings.minusValues[i] || ""}
                        onChange={(e) =>
                          updateSettings({ minusValues: setSlot(settings.minusValues, i, e.target.value) })
                        }
                      />
                    ))}
                  </div>
                </Field>
                <Field label="Skor Maksimum (kosong = tanpa batas)">
                  <input
                    type="number"
                    min={1}
                    className={inputCls}
                    value={settings.maxScore ?? ""}
                    onChange={(e) => {
                      const v = Number.parseInt(e.target.value, 10);
                      updateSettings({ maxScore: Number.isNaN(v) ? null : Math.max(1, v) });
                    }}
                  />
                </Field>
              </section>

              {/* Tim */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-extrabold uppercase tracking-widest text-muted-foreground">
                    Tim ({teams.length})
                  </h3>
                  <button
                    onClick={addTeam}
                    disabled={teams.length >= MAX_TEAMS}
                    className="rounded-xl bg-theme px-3 py-1.5 text-sm font-bold text-theme-foreground shadow-md transition hover:brightness-110 active:scale-95"
                  >
                    + Tambah Tim
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">2–8 tim. Skor sama mengikuti urutan tim. Skor awal diterapkan lewat Reset Skor.</p>
                {teams.map((team) => (
                  <div key={team.id} className="glass-soft space-y-3 rounded-2xl p-3.5">
                    <div className="flex items-center gap-3">
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt={team.name}
                          className="h-11 w-11 rounded-full bg-white object-contain p-1 shadow ring-2 ring-white/80"
                        />
                      ) : (
                        <div
                          className="grid h-11 w-11 place-items-center rounded-full font-display text-sm font-extrabold text-white shadow ring-2 ring-white/80"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <input
                        className={inputCls}
                        value={team.name}
                        maxLength={60}
                        aria-label={`Nama tim ${team.name}`}
                        onChange={(e) => updateTeam(team.id, { name: e.target.value })}
                        placeholder="Nama tim"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={(el) => {
                          fileRefs.current[team.id] = el;
                        }}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={uploading}
                        aria-label={`Unggah logo tim ${team.name}`}
                        className="hidden"
                        onChange={(e) => {void onLogoPicked(team.id, e.target.files?.[0]); e.target.value = "";}}
                      />
                      <button
                        disabled={uploading}
                        onClick={() => fileRefs.current[team.id]?.click()}
                        className="rounded-xl bg-white/80 px-3 py-1.5 text-xs font-bold shadow-sm transition hover:bg-white active:scale-95"
                      >
                        ⬆ Logo
                      </button>
                      {team.logo && (
                        <button
                          onClick={() => updateTeam(team.id, { logo: null })}
                          className="rounded-xl bg-white/80 px-3 py-1.5 text-xs font-bold shadow-sm transition hover:bg-white active:scale-95"
                        >
                          Hapus Logo
                        </button>
                      )}
                      <div className="flex items-center gap-1.5">
                        {TEAM_COLORS.map((c) => (
                          <button
                            key={c}
                            title={`Warna tim ${c}`}
                            aria-label={`Warna tim ${c}`}
                            onClick={() => updateTeam(team.id, { color: c })}
                            className={`h-6 w-6 rounded-full shadow ring-2 transition-transform hover:scale-110 ${
                              team.color === c ? "ring-foreground/60" : "ring-white"
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">Skor awal</span>
                        <input
                          type="number"
                          min={0}
                          className={`${inputCls} w-20 text-center`}
                          value={team.initialScore}
                          max={999999}
                          aria-label={`Skor awal ${team.name}`}
                          onChange={(e) => {
                            const v = Number.parseInt(e.target.value, 10);
                            const initial = Number.isNaN(v) ? 0 : Math.max(0, v);
                            updateTeam(team.id, { initialScore: initial });
                          }}
                        />
                      </div>
                    </div>
                    {teams.length > 2 && (
                      <button
                        onClick={() => removeTeam(team.id)}
                        className="rounded-xl bg-minus/10 px-3 py-1.5 text-xs font-bold text-minus shadow-sm transition hover:bg-minus/20 active:scale-95"
                      >
                        🗑 Hapus Tim
                      </button>
                    )}
                  </div>
                ))}
              </section>

              {/* Danger */}
              <section>
                <button
                  onClick={() => {
                    if (window.confirm("Reset semua pengaturan, tim, dan skor ke awal?")) {
                      resetAll();
                      onClose();
                    }
                  }}
                  className="w-full rounded-2xl bg-minus/10 px-4 py-2.5 font-display text-sm font-extrabold text-minus shadow-sm transition hover:bg-minus/20 active:scale-95"
                >
                  ⟲ Reset Semua ke Awal
                </button>
              </section>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
