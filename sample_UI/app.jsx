/* Trade modal + App shell + Tweaks panel */

const ASSET_TYPES = ["Crypto", "Gold (XAUUSD)", "Silver (XAGUSD)", "Major (XXX/USD)", "Major (USD/XXX)", "Minor / Cross", "Stock Index CFDs", "Stocks", "Oil / Energy"];
const EMOTIONS_FULL = ["Disciplined", "Confident", "FOMO", "Revenge", "Fear", "Overconfident", "Bored"];
const RULES_OPTS = ["Yes", "Partial", "No"];
const SESSIONS_FULL = ["Asian", "London", "London/NY Overlap", "New York", "After Hours"];
const STRATEGIES_FULL = ["ICT/SMC (FVG, OB)", "Liquidity Grab", "Break of Structure", "Order Block", "Silver Bullet", "Breakout", "Fakeout", "Trend Continuation"];

function TradeModal({ onClose, onSave }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = React.useState({
    status: "Open", assetType: "Crypto", symbol: "", direction: "Long",
    grade: "A", emotion: "Disciplined", rules: "Yes", session: "London/NY Overlap",
    entryDate: today, entryTime: "", exitDate: "", exitTime: "",
    quantity: "", entryPrice: "", stopPrice: "", exitPrice: "",
    commission: "", netPnl: "", risk: "", rr: "",
    strategy: "ICT/SMC (FVG, OB)", multiplier: 1, notes: "",
  });
  const [screenshot, setScreenshot] = React.useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto R:R when pnl + risk filled
  React.useEffect(() => {
    if (form.netPnl !== "" && form.risk !== "" && +form.risk > 0) {
      set("rr", (+form.netPnl / +form.risk).toFixed(2));
    }
  }, [form.netPnl, form.risk]);

  // Auto-calc P&L from prices
  React.useEffect(() => {
    const { entryPrice: ep, exitPrice: xp, quantity: q, direction, multiplier, stopPrice: sp } = form;
    if (ep && xp && q) {
      const m = +multiplier || 1;
      const diff = (+xp - +ep) * (direction === "Long" ? 1 : -1);
      set("netPnl", (diff * +q * m).toFixed(2));
    }
    if (ep && sp && q) {
      const m = +multiplier || 1;
      const dist = Math.abs(+ep - +sp);
      set("risk", (dist * +q * m).toFixed(2));
    }
  }, [form.entryPrice, form.exitPrice, form.quantity, form.direction, form.multiplier, form.stopPrice]);

  const handleScreenshot = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setScreenshot(r.result);
    r.readAsDataURL(f);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <h2>Add Trade</h2>
          <button className="close" onClick={onClose}><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body">
          {/* Section 1 — Classification */}
          <div className="form-section">
            <div className="form-section-title">Classification</div>
            <div className="form-grid f4">
              <div><label className="label">Status</label><select className="select" style={{ width: "100%" }} value={form.status} onChange={e => set("status", e.target.value)}><option>Open</option><option>Finished</option><option>Cancelled</option></select></div>
              <div><label className="label">Asset Type</label><select className="select" style={{ width: "100%" }} value={form.assetType} onChange={e => set("assetType", e.target.value)}>{ASSET_TYPES.map(a => <option key={a}>{a}</option>)}</select></div>
              <div><label className="label">Symbol</label><input className="input input-mono" style={{ width: "100%", textTransform: "uppercase" }} placeholder="e.g. ETHUSDT" value={form.symbol} onChange={e => set("symbol", e.target.value.toUpperCase())} /></div>
              <div>
                <label className="label">Direction</label>
                <div className="toggle-group">
                  <button className={form.direction === "Long" ? "active up" : ""} onClick={() => set("direction", "Long")}>↑ Long</button>
                  <button className={form.direction === "Short" ? "active down" : ""} onClick={() => set("direction", "Short")}>↓ Short</button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 — Grading */}
          <div className="form-section">
            <div className="form-section-title">Grading & Mindset</div>
            <div className="form-grid f4">
              <div>
                <label className="label">Grade</label>
                <div style={{ display: "flex", gap: 4 }}>
                  {TV.GRADES.map(g => (
                    <button key={g} type="button" onClick={() => set("grade", g)} style={{
                      flex: 1, padding: "7px 0",
                      background: form.grade === g ? "var(--accent-soft)" : "var(--bg-3)",
                      border: `1px solid ${form.grade === g ? "var(--accent)" : "var(--line)"}`,
                      color: form.grade === g ? "var(--accent)" : "var(--fg-2)",
                      borderRadius: 5, cursor: "pointer", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12.5
                    }}>{g}</button>
                  ))}
                </div>
              </div>
              <div><label className="label">Emotion</label><select className="select" style={{ width: "100%" }} value={form.emotion} onChange={e => set("emotion", e.target.value)}>{EMOTIONS_FULL.map(e => <option key={e}>{e}</option>)}</select></div>
              <div><label className="label">Rules Followed</label><select className="select" style={{ width: "100%" }} value={form.rules} onChange={e => set("rules", e.target.value)}>{RULES_OPTS.map(r => <option key={r}>{r}</option>)}</select></div>
              <div><label className="label">Session</label><select className="select" style={{ width: "100%" }} value={form.session} onChange={e => set("session", e.target.value)}>{SESSIONS_FULL.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
          </div>

          {/* Section 3 — Timing */}
          <div className="form-section">
            <div className="form-section-title">Timing</div>
            <div className="form-grid f4">
              <div><label className="label">Entry Date</label><input className="input input-mono" style={{ width: "100%" }} type="date" value={form.entryDate} onChange={e => set("entryDate", e.target.value)} /></div>
              <div><label className="label">Entry Time</label><input className="input input-mono" style={{ width: "100%" }} type="time" value={form.entryTime} onChange={e => set("entryTime", e.target.value)} /></div>
              <div><label className="label">Exit Date</label><input className="input input-mono" style={{ width: "100%" }} type="date" value={form.exitDate} onChange={e => set("exitDate", e.target.value)} /></div>
              <div><label className="label">Exit Time</label><input className="input input-mono" style={{ width: "100%" }} type="time" value={form.exitTime} onChange={e => set("exitTime", e.target.value)} /></div>
            </div>
          </div>

          {/* Section 4 — Prices & Size */}
          <div className="form-section">
            <div className="form-section-title">Price & Size</div>
            <div className="form-grid f4">
              <div><label className="label">Quantity / Lots</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.quantity} onChange={e => set("quantity", e.target.value)} /></div>
              <div><label className="label">Entry Price ($)</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.entryPrice} onChange={e => set("entryPrice", e.target.value)} /></div>
              <div><label className="label">Stop Price ($)</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.stopPrice} onChange={e => set("stopPrice", e.target.value)} /></div>
              <div><label className="label">Exit Price ($)</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.exitPrice} onChange={e => set("exitPrice", e.target.value)} /></div>
            </div>
          </div>

          {/* Section 5 — P&L */}
          <div className="form-section">
            <div className="form-section-title">P&L & Risk</div>
            <div className="form-grid f4">
              <div><label className="label">Commission ($)</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.commission} onChange={e => set("commission", e.target.value)} /></div>
              <div><label className="label">Net P&L ($)</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.netPnl} onChange={e => set("netPnl", e.target.value)} /></div>
              <div><label className="label">Risk ($)</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.risk} onChange={e => set("risk", e.target.value)} /></div>
              <div><label className="label">R:R (auto)</label><input className="input input-mono" style={{ width: "100%", opacity: 0.7 }} type="number" step="any" value={form.rr} readOnly /></div>
            </div>
          </div>

          {/* Section 6 — Strategy & Misc */}
          <div className="form-section">
            <div className="form-section-title">Strategy</div>
            <div className="form-grid f2">
              <div><label className="label">Strategy</label><select className="select" style={{ width: "100%" }} value={form.strategy} onChange={e => set("strategy", e.target.value)}>{STRATEGIES_FULL.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><label className="label">Multiplier</label><input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={form.multiplier} onChange={e => set("multiplier", e.target.value)} /></div>
            </div>
          </div>

          {/* Notes */}
          <div className="form-section">
            <label className="label">Comments / Notes</label>
            <textarea className="input" style={{ width: "100%", minHeight: 80, resize: "vertical" }} placeholder="Setup, mistakes, lessons…" value={form.notes} onChange={e => set("notes", e.target.value)}></textarea>
          </div>

          {/* Screenshot */}
          <div className="form-section">
            <label className="label">Screenshot (stored in cloud)</label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <label className="btn" style={{ cursor: "pointer" }}>
                <Icon name="upload" size={13} /> Upload image
                <input type="file" accept="image/*" onChange={handleScreenshot} style={{ display: "none" }} />
              </label>
              {screenshot && (
                <div style={{ position: "relative" }}>
                  <img src={screenshot} alt="" style={{ height: 64, borderRadius: 5, border: "1px solid var(--line)" }} />
                  <button onClick={() => setScreenshot(null)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "var(--down)", color: "#fff", border: "none", cursor: "pointer", fontSize: 10 }}>×</button>
                </div>
              )}
            </div>
          </div>

          {/* Auto hint */}
          {(form.entryPrice && form.stopPrice && form.quantity) && (
            <div style={{ marginTop: 4, padding: "10px 12px", background: "var(--bg-3)", borderRadius: 6, fontSize: 12, color: "var(--fg-3)", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="sparkle" size={13} />
              Auto-calculated: Risk ${form.risk || "—"} · {form.netPnl ? `Net P&L $${form.netPnl}` : "P&L pending exit"} {form.rr && `· R:R ${form.rr}`}
            </div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}><Icon name="check" size={13} stroke={2.2} /> Save Trade</button>
        </div>
      </div>
    </div>
  );
}

/* ========================== APP SHELL ========================== */

const NAV_ITEMS = [
  { id: "dash", label: "Dashboard", icon: "dashboard", group: "Trade" },
  { id: "journal", label: "Journal", icon: "journal", group: "Trade" },
  { id: "calendar", label: "Calendar", icon: "calendar", group: "Trade" },
  { id: "stats", label: "Statistics", icon: "stats", group: "Analyze" },
  { id: "chart", label: "Chart", icon: "chart", group: "Analyze" },
  { id: "news", label: "News", icon: "news", group: "Analyze" },
  { id: "calc", label: "Calculator", icon: "calc", group: "Tools" },
  { id: "comp", label: "Compound", icon: "compound", group: "Tools" },
  { id: "diary", label: "Diary", icon: "diary", group: "Tools" },
  { id: "backtest", label: "Backtester", icon: "backtest", group: "Tools" },
  { id: "settings", label: "Settings", icon: "settings", group: "System" },
];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accentHue": 165,
  "density": "default",
  "railCollapsed": false,
  "monoNumerics": true
}/*EDITMODE-END*/;

function App() {
  const [tab, setTab] = React.useState("dash");
  const [showModal, setShowModal] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = tweaks.theme;
    root.dataset.density = tweaks.density;
    root.dataset.rail = tweaks.railCollapsed ? "collapsed" : "default";
    root.style.setProperty("--acc-h", tweaks.accentHue);
  }, [tweaks]);

  const s = TV.stats(TV.trades);

  const view = (() => {
    switch (tab) {
      case "dash": return <Dashboard trades={TV.trades} />;
      case "journal": return <Journal trades={TV.trades} onAdd={() => setShowModal(true)} />;
      case "calendar": return <Calendar trades={TV.trades} />;
      case "stats": return <Stats trades={TV.trades} />;
      case "chart": return <ChartView />;
      case "news": return <News />;
      case "calc": return <Calc />;
      case "comp": return <Compound />;
      case "diary": return <Diary />;
      case "backtest": return <Backtest />;
      case "settings": return <Settings />;
      default: return null;
    }
  })();

  const groupedNav = NAV_ITEMS.reduce((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  const currentNav = NAV_ITEMS.find(n => n.id === tab);

  const goTo = (id) => { setTab(id); setMobileNavOpen(false); };

  return (
    <div className={`app ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
      {mobileNavOpen && <div className="mobile-overlay" onClick={() => setMobileNavOpen(false)} />}

      <aside className="rail" data-screen-label="Side Rail">
        <div className="rail-brand">
          <div className="rail-mark">xD</div>
          <div className="rail-name">
            <div className="top">TradeVault</div>
            <div className="sub">v3 · synced</div>
          </div>
          <button className="icon-btn rail-close" onClick={() => setMobileNavOpen(false)}><Icon name="x" size={14} /></button>
        </div>
        <div className="rail-nav">
          {Object.entries(groupedNav).map(([grp, items]) => (
            <React.Fragment key={grp}>
              <div className="rail-section-label">{grp}</div>
              {items.map(item => (
                <button key={item.id} className={`rail-item ${tab === item.id ? "active" : ""}`} onClick={() => goTo(item.id)}>
                  <span className="icon"><Icon name={item.icon} size={15} /></span>
                  <span className="lbl">{item.label}</span>
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="rail-foot">
          <div className="rail-acct">
            <div className="acct-avatar">XD</div>
            <div className="acct-info">
              <div className="name">xDrk</div>
              <div className="status">Synced · cloud</div>
            </div>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <button className="icon-btn topbar-menu" onClick={() => setMobileNavOpen(true)}>
          <Icon name="layers" size={15} />
        </button>
        <button className="icon-btn topbar-collapse" onClick={() => setTweak("railCollapsed", !tweaks.railCollapsed)}>
          <Icon name="layers" size={15} />
        </button>
        <div className="topbar-title">
          <span className="crumb">{currentNav?.group}</span> / <span style={{ marginLeft: 6 }}>{currentNav?.label}</span>
        </div>

        <div className="topbar-stats">
          <div className="tb-stat"><span className="lbl">Balance</span><span className="val">${(1000 + s.totalPL).toFixed(0)}</span></div>
          <div className="tb-stat"><span className="lbl">Today</span><span className={`val ${s.totalPL >= 0 ? "up" : "down"}`}>{fmt.usd(s.finished.slice(-3).reduce((a,t)=>a+t.pl,0), true)}</span></div>
          <div className="tb-stat"><span className="lbl">Open</span><span className="val">{TV.trades.filter(t => t.status === "Open").length}</span></div>
          <div className="tb-stat"><span className="lbl">Win Rate</span><span className="val">{fmt.pct(s.wr)}</span></div>
        </div>

        <div className="topbar-actions">
          <button className="icon-btn"><Icon name="search" size={15} /></button>
          <button className="icon-btn"><Icon name="bell" size={15} /></button>
          <button className="btn btn-primary topbar-add" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={13} stroke={2.4} /> <span className="lbl-full">New Trade</span>
          </button>
        </div>
      </header>

      <main className="main">
        <div className="main-inner">
          {view}
        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="mobile-tabbar">
        {[
          { id: "dash", icon: "dashboard", label: "Home" },
          { id: "journal", icon: "journal", label: "Journal" },
          { id: "newtrade", icon: "plus", label: "Trade" },
          { id: "stats", icon: "stats", label: "Stats" },
          { id: "chart", icon: "chart", label: "Chart" },
        ].map(t => {
          if (t.id === "newtrade") {
            return (
              <button key={t.id} className="mobile-tab fab" onClick={() => setShowModal(true)}>
                <span className="ic"><Icon name={t.icon} size={20} stroke={2.4} /></span>
              </button>
            );
          }
          return (
            <button key={t.id} className={`mobile-tab ${tab === t.id ? "active" : ""}`} onClick={() => goTo(t.id)}>
              <span className="ic"><Icon name={t.icon} size={18} /></span>
              <span className="lb">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {showModal && <TradeModal onClose={() => setShowModal(false)} onSave={() => setShowModal(false)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={tweaks.theme} onChange={v => setTweak("theme", v)} options={[
            { value: "dark", label: "Dark" },
            { value: "midnight", label: "Midnight" },
            { value: "paper", label: "Paper" },
          ]} />
          <TweakSlider label="Accent Hue" value={tweaks.accentHue} onChange={v => setTweak("accentHue", v)} min={0} max={360} step={1} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Density" value={tweaks.density} onChange={v => setTweak("density", v)} options={[
            { value: "compact", label: "Compact" },
            { value: "default", label: "Default" },
            { value: "comfy", label: "Comfy" },
          ]} />
          <TweakToggle label="Collapse side rail" value={tweaks.railCollapsed} onChange={v => setTweak("railCollapsed", v)} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
