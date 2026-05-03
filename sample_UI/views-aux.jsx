/* Secondary views: Chart, News, Calc, Compound, Diary, Backtest, Settings */

function ChartView() {
  const [sym, setSym] = React.useState("BTCUSDT");
  const [tf, setTf] = React.useState("1h");
  const [candles] = React.useState(() => genCandles(80, 71240));
  const last = candles[candles.length - 1];
  const first = candles[0];
  const chg = ((last.c - first.c) / first.c) * 100;
  const tradesOnChart = TV.trades.filter(t => t.symbol === sym).slice(0, 3).map(t => ({ ...t, entry: candles[Math.floor(Math.random() * candles.length)].c }));

  // Mock orderbook
  const book = React.useMemo(() => {
    const bids = [], asks = [];
    for (let i = 0; i < 10; i++) {
      bids.push({ px: last.c - (i + 1) * 4, sz: (Math.random() * 3 + 0.1).toFixed(3) });
      asks.push({ px: last.c + (i + 1) * 4, sz: (Math.random() * 3 + 0.1).toFixed(3) });
    }
    return { bids, asks };
  }, [sym]);

  return (
    <div>
      <div className="title-block">
        <h1>Chart</h1>
        <div className="sub">Live candlesticks with your trade markers</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 14 }}>
        {TV.watchlist.map(w => (
          <button key={w.sym} onClick={() => setSym(w.sym)} style={{
            background: sym === w.sym ? "var(--bg-3)" : "var(--bg-2)",
            border: `1px solid ${sym === w.sym ? "var(--accent)" : "var(--line)"}`,
            borderRadius: 7,
            padding: "10px 12px",
            cursor: "pointer",
            textAlign: "left",
            color: "var(--fg)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12.5 }}>{w.sym}</span>
              <span className={w.chg >= 0 ? "up" : "down"} style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600 }}>{w.chg >= 0 ? "+" : ""}{w.chg.toFixed(2)}%</span>
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>${w.price.toLocaleString()}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, alignItems: "stretch" }}>
        <div className="chart-shell">
          <div className="chart-toolbar">
            <div className="sym-display">
              <span className="sym">{sym}</span>
              <span className="price mono">${last.c.toFixed(2)}</span>
              <span className={`chg ${chg >= 0 ? "chip-up" : "chip-down"} chip`}>{chg >= 0 ? "+" : ""}{chg.toFixed(2)}%</span>
            </div>
            <div className="tf-row">
              {["1m","5m","15m","1h","4h","1d","1w"].map(t => (
                <button key={t} className={`tf ${tf === t ? "active" : ""}`} onClick={() => setTf(t)}>{t.toUpperCase()}</button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button className="icon-btn" title="Indicators"><Icon name="layers" size={14} /></button>
              <button className="icon-btn" title="Fullscreen"><Icon name="expand" size={14} /></button>
              <button className="icon-btn" title="Refresh"><Icon name="refresh" size={14} /></button>
            </div>
          </div>
          <Candles candles={candles} trades={tradesOnChart} height={460} />
        </div>

        <div className="chart-shell" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card-head"><h3>Order Book</h3></div>
          <div style={{ overflowY: "auto", flex: 1, paddingTop: 6 }}>
            {book.asks.slice().reverse().map((b, i) => (
              <div key={"a" + i} className="depth-row ask">
                <span className="depth-bar" style={{ width: `${Math.min(100, parseFloat(b.sz) * 30)}%`, right: 0, left: "auto" }} />
                <span className="px">{b.px.toFixed(2)}</span><span className="sz">{b.sz}</span>
              </div>
            ))}
            <div style={{ padding: "8px 12px", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", background: "var(--bg-3)" }}>
              <span className="mono up" style={{ fontSize: 14, fontWeight: 700 }}>${last.c.toFixed(2)}</span>
              <span className="muted mono" style={{ fontSize: 11 }}>spread $4.00</span>
            </div>
            {book.bids.map((b, i) => (
              <div key={"b" + i} className="depth-row bid">
                <span className="depth-bar" style={{ width: `${Math.min(100, parseFloat(b.sz) * 30)}%` }} />
                <span className="px">{b.px.toFixed(2)}</span><span className="sz">{b.sz}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="card-head"><h3>Trades on {sym}</h3></div>
        <table className="tbl">
          <thead><tr><th>#</th><th>Dir</th><th className="num">Entry</th><th className="num">Exit</th><th className="num">Net P&L</th><th>Date</th></tr></thead>
          <tbody>
            {TV.trades.filter(t => t.symbol === sym).slice(0, 5).map(t => (
              <tr key={t.id}>
                <td className="mono muted">{t.id}</td>
                <td><span className={t.dir === "Long" ? "up" : "down"} style={{ fontWeight: 600, fontSize: 11.5 }}>{t.dir}</span></td>
                <td className="num">{t.entry.toFixed(2)}</td>
                <td className="num">{t.exit ? t.exit.toFixed(2) : "—"}</td>
                <td className={`num ${t.pl > 0 ? "up" : "down"}`} style={{ fontWeight: 600 }}>{t.status === "Finished" ? fmt.usd(t.pl, true) : "—"}</td>
                <td className="muted">{fmt.date(t.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.ChartView = ChartView;

/* ============================== NEWS ============================== */
function News() {
  const grouped = { Today: TV.news.filter(n => n.time !== "—"), Released: TV.news.filter(n => n.time === "—") };
  return (
    <div>
      <div className="title-block">
        <h1>Economic Calendar</h1>
        <div className="sub">High-impact events affecting your active markets</div>
      </div>

      <div className="row-3" style={{ marginBottom: 14 }}>
        {[
          { lbl: "Today's Events", val: TV.news.length, sub: "3 high impact" },
          { lbl: "Next Release", val: "08:30", sub: "USD · Non-Farm Payrolls" },
          { lbl: "Affected Symbols", val: 4, sub: "EURUSD, GBPUSD, XAUUSD, NAS100" },
        ].map((c, i) => (
          <div key={i} className="stat-card">
            <div className="lbl">{c.lbl}</div>
            <div className="val">{c.val}</div>
            <div className="sub">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div className="card-head">
          <h3>Upcoming Today</h3>
          <div className="actions">
            <div className="seg">
              <button className="active">All</button>
              <button>High</button>
              <button>USD</button>
              <button>EUR</button>
            </div>
          </div>
        </div>
        {TV.news.map((n, i) => (
          <div key={i} className="news-row">
            <div className="time">{n.time}</div>
            <div className="ccy">{n.ccy}</div>
            <div>
              <div style={{ fontWeight: 500 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>
                Forecast {n.forecast}{n.actual ? ` · Actual ${n.actual}` : ""}
              </div>
            </div>
            <div className={`impact ${n.impact}`}>
              <i /><i /><i />
              <span style={{ marginLeft: 8, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: n.impact === "high" ? "var(--down)" : n.impact === "med" ? "var(--warn)" : "var(--fg-3)" }}>{n.impact}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
window.News = News;

/* ============================== CALC ============================== */
function Calc() {
  const [bal, setBal] = React.useState(1000);
  const [riskPct, setRiskPct] = React.useState(1);
  const [rr, setRr] = React.useState(2);
  const [entry, setEntry] = React.useState(70000);
  const [stop, setStop] = React.useState(69300);
  const [dir, setDir] = React.useState("Long");
  const [inst, setInst] = React.useState("Crypto");

  const riskAmt = bal * (riskPct / 100);
  const dist = Math.abs(entry - stop);
  const target = dir === "Long" ? entry + dist * rr : entry - dist * rr;
  const units = dist > 0 ? riskAmt / dist : 0;
  const reward = riskAmt * rr;

  return (
    <div>
      <div className="title-block">
        <h1>Position Calculator</h1>
        <div className="sub">Risk-based sizing · works with all instruments</div>
      </div>

      <div className="row-2-1">
        <div className="card card-pad">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label className="label">Instrument</label>
              <select className="select" style={{ width: "100%" }} value={inst} onChange={e => setInst(e.target.value)}>
                <option>Crypto</option><option>Forex (XXX/USD)</option><option>Forex (USD/XXX)</option><option>Gold (XAUUSD)</option><option>Indices</option><option>Stocks</option>
              </select>
            </div>
            <div>
              <label className="label">Direction</label>
              <div className="toggle-group">
                <button className={dir === "Long" ? "active up" : ""} onClick={() => setDir("Long")}>↑ Long</button>
                <button className={dir === "Short" ? "active down" : ""} onClick={() => setDir("Short")}>↓ Short</button>
              </div>
            </div>
            <div>
              <label className="label">Account Balance ($)</label>
              <input className="input input-mono" style={{ width: "100%" }} type="number" value={bal} onChange={e => setBal(+e.target.value)} />
            </div>
            <div>
              <label className="label">Risk per Trade (%)</label>
              <input className="input input-mono" style={{ width: "100%" }} type="number" step="0.1" value={riskPct} onChange={e => setRiskPct(+e.target.value)} />
            </div>
            <div>
              <label className="label">R:R Ratio</label>
              <input className="input input-mono" style={{ width: "100%" }} type="number" step="0.5" value={rr} onChange={e => setRr(+e.target.value)} />
            </div>
            <div>
              <label className="label">Risk Amount ($)</label>
              <input className="input input-mono" style={{ width: "100%", color: "var(--warn)" }} value={riskAmt.toFixed(2)} readOnly />
            </div>
            <div>
              <label className="label">Entry Price</label>
              <input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={entry} onChange={e => setEntry(+e.target.value)} />
            </div>
            <div>
              <label className="label">Stop Price</label>
              <input className="input input-mono" style={{ width: "100%" }} type="number" step="any" value={stop} onChange={e => setStop(+e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 18, background: "var(--bg-3)", borderRadius: 8, padding: 16, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <div><div className="label">Position Size</div><div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{units.toFixed(4)} <span style={{ fontSize: 11, color: "var(--fg-3)" }}>units</span></div></div>
            <div><div className="label">Stop Distance</div><div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>${dist.toFixed(2)}</div></div>
            <div><div className="label">Take Profit</div><div className="mono up" style={{ fontSize: 18, fontWeight: 700 }}>${target.toFixed(2)}</div></div>
            <div><div className="label">Reward at TP</div><div className="mono up" style={{ fontSize: 18, fontWeight: 700 }}>+${reward.toFixed(2)}</div></div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--fg-3)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span><Icon name="risk" size={11} /> Risk {fmt.pct(riskPct/100)} of equity</span>
            <span>Max loss <span className="down mono">-${riskAmt.toFixed(2)}</span></span>
            <span>Notional <span className="mono">${(units * entry).toFixed(0)}</span></span>
          </div>
        </div>

        <div className="stack">
          <div className="card card-pad">
            <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)", marginBottom: 12 }}>Quick Risk Table</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginBottom: 8 }}>
              {[0.25, 0.5, 1, 1.5, 2].map(p => (
                <div key={p} style={{ textAlign: "center", padding: "8px 4px", background: p === riskPct ? "var(--accent-soft)" : "var(--bg-3)", borderRadius: 5, cursor: "pointer", border: `1px solid ${p === riskPct ? "var(--accent)" : "transparent"}` }} onClick={() => setRiskPct(p)}>
                  <div style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{p}%</div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>${(bal * p / 100).toFixed(0)}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)", marginBottom: 12 }}>Reference</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
              {[
                ["Crypto", "Direct USD · Units = Risk / SL distance"],
                ["Forex XXX/USD", "1 lot = 100k · $10/pip"],
                ["Gold (XAUUSD)", "1 lot = 100oz · $1 move = $100"],
                ["Indices", "Per-index point value (varies)"],
              ].map(([t, s], i) => (
                <div key={i} style={{ background: "var(--bg-3)", padding: 10, borderRadius: 6 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{t}</div>
                  <div style={{ color: "var(--fg-3)" }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Calc = Calc;

/* ============================== COMPOUND ============================== */
function Compound() {
  const [accounts] = React.useState([
    { id: 1, name: "Conservative", start: 1000, riskPct: 1, winR: 2, winRate: 0.55, days: 90, color: "var(--accent)" },
    { id: 2, name: "Aggressive", start: 1000, riskPct: 2, winR: 3, winRate: 0.5, days: 90, color: "var(--info)" },
    { id: 3, name: "Realistic", start: 1000, riskPct: 1.5, winR: 2.5, winRate: 0.52, days: 90, color: "var(--warn)" },
  ]);

  const compute = (a) => {
    const points = [{ d: 0, bal: a.start }];
    let bal = a.start;
    let seed = a.id * 31;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    for (let d = 1; d <= a.days; d++) {
      const win = rand() < a.winRate;
      const r = bal * a.riskPct / 100;
      bal += win ? r * a.winR : -r;
      points.push({ d, bal });
    }
    return points;
  };

  const allCurves = accounts.map(a => ({ a, pts: compute(a) }));
  const allValues = allCurves.flatMap(c => c.pts.map(p => p.bal));
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);

  return (
    <div>
      <div style={{ display: "flex", marginBottom: 16 }}>
        <div className="title-block" style={{ marginBottom: 0 }}>
          <h1>Compounding Lab</h1>
          <div className="sub">Project account growth across scenarios</div>
        </div>
        <button className="btn btn-primary" style={{ marginLeft: "auto" }}><Icon name="plus" size={13} stroke={2.2} /> New Scenario</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginBottom: 14 }}>
        {allCurves.map(({ a, pts }) => {
          const last = pts[pts.length - 1].bal;
          const gain = last - a.start;
          return (
            <div key={a.id} className="card card-pad">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: a.color }} />
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <span className="chip" style={{ marginLeft: "auto" }}>{a.days}d</span>
              </div>
              <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 10, letterSpacing: "-0.02em" }}>${last.toFixed(0)}</div>
              <div className="mono up" style={{ fontSize: 12, fontWeight: 600 }}>+${gain.toFixed(0)} (+{((last/a.start - 1)*100).toFixed(1)}%)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 14, fontSize: 11 }}>
                <div><div style={{ color: "var(--fg-3)" }}>Risk</div><div className="mono">{a.riskPct}%</div></div>
                <div><div style={{ color: "var(--fg-3)" }}>R:R</div><div className="mono">{a.winR}</div></div>
                <div><div style={{ color: "var(--fg-3)" }}>Win</div><div className="mono">{(a.winRate*100).toFixed(0)}%</div></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-head"><h3>Growth Comparison</h3></div>
        <div style={{ padding: 16, height: 300, position: "relative" }}>
          <svg width="100%" height="100%" viewBox="0 0 800 280" preserveAspectRatio="none">
            <defs></defs>
            {[0.25, 0.5, 0.75, 1].map((p, i) => (
              <line key={i} x1="0" y1={p * 260 + 10} x2="800" y2={p * 260 + 10} stroke="var(--line)" strokeDasharray="2 4" />
            ))}
            {allCurves.map(({ a, pts }) => {
              const path = pts.map((p, i) => {
                const x = (i / (pts.length - 1)) * 800;
                const y = 270 - ((p.bal - min) / (max - min || 1)) * 260;
                return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ");
              return <path key={a.id} d={path} fill="none" stroke={a.color} strokeWidth="2" />;
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
window.Compound = Compound;

/* ============================== DIARY ============================== */
function Diary() {
  const [sel, setSel] = React.useState(TV.diaryEntries[0].id);
  const entry = TV.diaryEntries.find(e => e.id === sel);
  const moods = ["😌","😎","😰","🔥","😴","💢"];
  const moodLabel = ["Calm","Confident","Anxious","FOMO","Bored","Revenge"];

  return (
    <div>
      <div className="title-block">
        <h1>Trading Diary</h1>
        <div className="sub">Daily mindset log · post-session reviews</div>
      </div>

      <div className="diary-grid">
        <div className="diary-list-shell">
          <div style={{ padding: 10, borderBottom: "1px solid var(--line)" }}>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}><Icon name="plus" size={13} stroke={2.2} /> New Entry</button>
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {TV.diaryEntries.map(e => (
              <div key={e.id} className={`diary-list-row ${e.id === sel ? "active" : ""}`} onClick={() => setSel(e.id)}>
                <div className="d">{fmt.dateLong(e.date)}</div>
                <div className="t">{e.title}</div>
                <div className="preview">{e.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ overflowY: "auto" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--fg-3)", fontSize: 11.5, marginBottom: 8 }}>
              <span><Icon name="calendar" size={12} /></span>
              <span>{fmt.dateLong(entry.date)}</span>
              <span>·</span>
              <span>{fmt.time(entry.date)}</span>
            </div>
            <input className="input" style={{ width: "100%", background: "transparent", border: "none", padding: 0, fontSize: 22, fontWeight: 600 }} value={entry.title} readOnly />
          </div>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--line)" }}>
            <div className="label" style={{ marginBottom: 8 }}>Mood</div>
            <div className="mood-strip">
              {moods.map((m, i) => (
                <button key={i} className={moodLabel[i] === entry.mood ? "active" : ""}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <textarea className="input" style={{ width: "100%", minHeight: 280, lineHeight: 1.65, fontSize: 13.5, resize: "vertical" }} defaultValue={entry.body} />
          </div>
          <div style={{ padding: "14px 22px", borderTop: "1px solid var(--line)", display: "flex", gap: 8 }}>
            <button className="btn btn-primary"><Icon name="check" size={13} stroke={2.2} /> Save</button>
            <button className="btn">Cancel</button>
            <button className="btn btn-danger" style={{ marginLeft: "auto" }}><Icon name="trash" size={13} /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Diary = Diary;

/* ============================== BACKTEST ============================== */
function Backtest() {
  const [winR, setWinR] = React.useState(3);
  const [lossR, setLossR] = React.useState(-1);
  const [cap, setCap] = React.useState(100);
  const [risk, setRisk] = React.useState(2);
  const [riskMode, setRiskMode] = React.useState("percentage");
  const [session, setSession] = React.useState("Asia");
  const [history, setHistory] = React.useState([
    { ses: "Asia", outcome: "win", pl: 6 },
    { ses: "London", outcome: "win", pl: 6 },
    { ses: "London", outcome: "loss", pl: -2 },
    { ses: "New York", outcome: "win", pl: 6.12 },
    { ses: "New York", outcome: "be", pl: 0 },
    { ses: "Asia", outcome: "skip", pl: 0 },
    { ses: "London", outcome: "win", pl: 6.24 },
  ]);

  const eq = [{ d: 0, bal: cap }];
  history.forEach((h, i) => eq.push({ d: i + 1, bal: eq[eq.length - 1].bal + h.pl }));
  const balance = eq[eq.length - 1].bal;
  const wins = history.filter(h => h.outcome === "win").length;
  const losses = history.filter(h => h.outcome === "loss").length;
  const total = wins + losses;
  const wr = total ? wins / total : 0;
  const sessions = ["Asia", "London", "New York"];

  const log = (outcome) => {
    const r = riskMode === "percentage" ? balance * risk / 100 : risk;
    const pl = outcome === "win" ? r * winR : outcome === "loss" ? r * lossR : 0;
    setHistory([...history, { ses: session, outcome, pl }]);
    const idx = sessions.indexOf(session);
    setSession(sessions[(idx + 1) % sessions.length]);
  };

  const sesData = sessions.map(s => ({
    label: s.split(" ")[0],
    value: history.filter(h => h.ses === s).reduce((a,h) => a + h.pl, 0)
  }));

  return (
    <div>
      <div className="title-block">
        <h1>Backtester</h1>
        <div className="sub">Session-driven simulation · live equity curve</div>
      </div>

      <div className="row-2" style={{ marginBottom: 14 }}>
        <div className="card card-pad">
          <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)", marginBottom: 14 }}>Trade Settings</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--fg-2)" }}>Win R</span>
              <input className="input input-mono" style={{ width: 90 }} type="number" step="0.1" value={winR} onChange={e => setWinR(+e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--fg-2)" }}>Loss R</span>
              <input className="input input-mono" style={{ width: 90 }} type="number" step="0.1" value={lossR} onChange={e => setLossR(+e.target.value)} />
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)", marginBottom: 14 }}>Capital</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--fg-2)" }}>Initial ($)</span>
              <input className="input input-mono" style={{ width: 90 }} type="number" value={cap} onChange={e => setCap(+e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--fg-2)" }}>Risk Mode</span>
              <select className="select" value={riskMode} onChange={e => setRiskMode(e.target.value)} style={{ width: 130 }}>
                <option value="constant">Fixed $</option>
                <option value="percentage">% of Balance</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12.5, color: "var(--fg-2)" }}>Risk {riskMode === "percentage" ? "%" : "$"}</span>
              <input className="input input-mono" style={{ width: 90 }} type="number" step="0.1" value={risk} onChange={e => setRisk(+e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {sessions.map(s => (
            <button key={s} className={`btn ${session === s ? "btn-primary" : ""}`} onClick={() => setSession(s)}>{s}</button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { lbl: "Win", outcome: "win", color: "var(--up)", val: `+${(riskMode === "percentage" ? balance * risk / 100 : risk) * winR | 0}` },
            { lbl: "Loss", outcome: "loss", color: "var(--down)", val: `${((riskMode === "percentage" ? balance * risk / 100 : risk) * lossR) | 0}` },
            { lbl: "Breakeven", outcome: "be", color: "var(--fg-3)", val: "0" },
            { lbl: "Skip", outcome: "skip", color: "var(--fg-3)", val: "—" },
          ].map(b => (
            <button key={b.outcome} className="outcome-btn" onClick={() => log(b.outcome)}>
              <div className="lbl">{b.lbl}</div>
              <div className="val" style={{ color: b.color }}>{b.val}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
          <button className="btn" onClick={() => setHistory(history.slice(0, -1))}>← Undo</button>
          <button className="btn" onClick={() => setHistory([])}><Icon name="refresh" size={13} /> Restart</button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="lbl">Balance</div><div className="val">{fmt.usd(balance)}</div></div>
        <div className="stat-card"><div className="lbl">Net P&L</div><div className={`val ${balance - cap >= 0 ? "up" : "down"}`}>{fmt.usd(balance - cap, true)}</div></div>
        <div className="stat-card"><div className="lbl">Win Rate</div><div className="val">{fmt.pct(wr)}</div></div>
        <div className="stat-card"><div className="lbl">Trades</div><div className="val">{history.length}</div></div>
      </div>

      <div className="row-2">
        <div className="card">
          <div className="card-head"><h3>Total Equity</h3></div>
          <div style={{ padding: 12 }}><EquityCurve points={eq} color="var(--accent)" height={200} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>By Session</h3></div>
          <div style={{ padding: 12 }}><BarChart data={sesData} signed height={200} /></div>
        </div>
      </div>
    </div>
  );
}
window.Backtest = Backtest;

/* ============================== SETTINGS ============================== */
function Settings() {
  // Account
  const [capital, setCapital] = React.useState(1000);
  const [riskPct, setRiskPct] = React.useState(1);
  // Risk Management
  const [dLoss, setDLoss] = React.useState(30);
  const [wLoss, setWLoss] = React.useState(100);
  const [mLoss, setMLoss] = React.useState(300);
  const [maxTrades, setMaxTrades] = React.useState(3);
  // Goals
  const [wGoal, setWGoal] = React.useState(50);
  const [mGoal, setMGoal] = React.useState(200);
  // Lists
  const [rules, setRules] = React.useState([
    "Trade only A+ and A setups",
    "Never risk more than 1% per trade",
    "No trading during major news events",
    "Stop trading after 2 consecutive losses",
    "Always define stop loss before entry",
  ]);
  const [sessions, setSessions] = React.useState([
    { name: "Asian", time: "00:00 – 08:00 GMT" },
    { name: "London", time: "07:00 – 16:00 GMT" },
    { name: "London/NY Overlap", time: "13:00 – 16:00 GMT" },
    { name: "New York", time: "13:00 – 22:00 GMT" },
    { name: "After Hours", time: "22:00 – 00:00 GMT" },
  ]);
  const [strategies, setStrategies] = React.useState([
    "ICT/SMC (FVG, OB)",
    "Liquidity Grab",
    "Break of Structure",
    "Order Block",
    "Silver Bullet",
    "Breakout",
  ]);
  // Watchlist
  const [watchlist, setWatchlist] = React.useState(["BTCUSDT", "ETHUSDT", "XAUUSD"]);
  const [newSym, setNewSym] = React.useState("");
  // Security
  const [pw1, setPw1] = React.useState("");
  const [pw2, setPw2] = React.useState("");
  // Save toast
  const [saved, setSaved] = React.useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const numField = (label, val, setter, ph) => (
    <div>
      <label className="label">{label}</label>
      <input className="input input-mono" style={{ width: "100%" }} type="number" placeholder={ph} value={val} onChange={e => setter(e.target.value === "" ? "" : +e.target.value)} />
    </div>
  );

  return (
    <div style={{ maxWidth: 880 }}>
      <div className="title-block">
        <h1>Settings</h1>
        <div className="sub">Risk limits, goals & trading rules — saved to cloud</div>
      </div>

      <div className="settings-section">
        <h3><Icon name="user" size={14} /> Account</h3>
        <div className="settings-grid-2">
          {numField("Starting Capital ($)", capital, setCapital)}
          <div>
            <label className="label">Default Risk % per Trade</label>
            <input className="input input-mono" style={{ width: "100%" }} type="number" step="0.1" value={riskPct} onChange={e => setRiskPct(e.target.value === "" ? "" : +e.target.value)} />
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3><Icon name="risk" size={14} /> Risk Management <span className="badge">Auto-lockout when hit</span></h3>
        <div className="settings-grid-2">
          {numField("Daily Loss Limit ($)", dLoss, setDLoss, "e.g. 30")}
          {numField("Weekly Loss Limit ($)", wLoss, setWLoss, "e.g. 100")}
          {numField("Monthly Loss Limit ($)", mLoss, setMLoss, "e.g. 300")}
          {numField("Max Trades per Day", maxTrades, setMaxTrades, "e.g. 3")}
        </div>
      </div>

      <div className="settings-section">
        <h3><Icon name="target" size={14} /> Goals</h3>
        <div className="settings-grid-2">
          {numField("Weekly Profit Target ($)", wGoal, setWGoal, "e.g. 50")}
          {numField("Monthly Profit Target ($)", mGoal, setMGoal, "e.g. 200")}
        </div>
      </div>

      <div className="settings-section">
        <h3><Icon name="check" size={14} /> Trading Rules <span className="badge">{rules.length} active</span></h3>
        {rules.map((r, i) => (
          <div key={i} className="rule-row">
            <span className="rule-num">{i + 1}.</span>
            <input value={r} onChange={e => { const next = [...rules]; next[i] = e.target.value; setRules(next); }} />
            <button className="x" onClick={() => setRules(rules.filter((_, j) => j !== i))}><Icon name="x" size={13} /></button>
          </div>
        ))}
        <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setRules([...rules, "New trading rule"])}><Icon name="plus" size={11} stroke={2.4} /> Add Rule</button>
      </div>

      <div className="settings-section">
        <h3><Icon name="clock" size={14} /> Sessions</h3>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 10 }}>Custom trading sessions shown in the Add Trade dropdown</div>
        {sessions.map((s, i) => (
          <div key={i} className="rule-row">
            <span className="rule-num">{i + 1}.</span>
            <input style={{ flex: "1.4" }} value={s.name} onChange={e => { const next = [...sessions]; next[i] = { ...next[i], name: e.target.value }; setSessions(next); }} placeholder="Session name" />
            <input style={{ flex: "1" }} className="input-mono" value={s.time} onChange={e => { const next = [...sessions]; next[i] = { ...next[i], time: e.target.value }; setSessions(next); }} placeholder="Time range" />
            <button className="x" onClick={() => setSessions(sessions.filter((_, j) => j !== i))}><Icon name="x" size={13} /></button>
          </div>
        ))}
        <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setSessions([...sessions, { name: "New Session", time: "00:00 – 00:00 GMT" }])}><Icon name="plus" size={11} stroke={2.4} /> Add Session</button>
      </div>

      <div className="settings-section">
        <h3><Icon name="target" size={14} /> Strategies</h3>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 10 }}>Custom strategies shown in the Add Trade dropdown</div>
        {strategies.map((s, i) => (
          <div key={i} className="rule-row">
            <span className="rule-num">{i + 1}.</span>
            <input value={s} onChange={e => { const next = [...strategies]; next[i] = e.target.value; setStrategies(next); }} />
            <button className="x" onClick={() => setStrategies(strategies.filter((_, j) => j !== i))}><Icon name="x" size={13} /></button>
          </div>
        ))}
        <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={() => setStrategies([...strategies, "New strategy"])}><Icon name="plus" size={11} stroke={2.4} /> Add Strategy</button>
      </div>

      <div className="settings-section">
        <h3><Icon name="eye" size={14} /> Watchlist</h3>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 10 }}>Symbols tracked on your dashboard & chart pages</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {watchlist.map((sym, i) => (
            <span key={i} className="chip">
              <span className="mono" style={{ fontWeight: 600 }}>{sym}</span>
              <button className="chip-x" onClick={() => setWatchlist(watchlist.filter((_, j) => j !== i))}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="input input-mono" style={{ flex: 1, textTransform: "uppercase" }} placeholder="ADD SYMBOL e.g. SOLUSDT" value={newSym} onChange={e => setNewSym(e.target.value.toUpperCase())} onKeyDown={e => { if (e.key === "Enter" && newSym) { setWatchlist([...watchlist, newSym]); setNewSym(""); } }} />
          <button className="btn btn-sm" onClick={() => { if (newSym) { setWatchlist([...watchlist, newSym]); setNewSym(""); } }}><Icon name="plus" size={11} stroke={2.4} /> Add</button>
        </div>
      </div>

      <div className="settings-section">
        <h3><Icon name="user" size={14} /> Security</h3>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 12 }}>Logged in as <strong style={{ color: "var(--fg)" }}>xdrk@vault.io</strong></div>
        <div className="settings-grid-2">
          <div>
            <label className="label">New Password</label>
            <input className="input" style={{ width: "100%" }} type="password" placeholder="••••••••" value={pw1} onChange={e => setPw1(e.target.value)} />
          </div>
          <div>
            <label className="label">Confirm Password</label>
            <input className="input" style={{ width: "100%" }} type="password" placeholder="••••••••" value={pw2} onChange={e => setPw2(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-sm" style={{ marginTop: 10 }} disabled={!pw1 || pw1 !== pw2}><Icon name="check" size={11} stroke={2.4} /> Change Password</button>
        {pw1 && pw2 && pw1 !== pw2 && <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--down)" }}>Passwords do not match</div>}
      </div>

      <div className="settings-section settings-danger">
        <h3 style={{ color: "var(--down)" }}><Icon name="risk" size={14} /> Danger Zone</h3>
        <div style={{ fontSize: 12, color: "var(--fg-3)", marginBottom: 12 }}>These actions are permanent and cannot be undone.</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-danger">Reset All Trades</button>
          <button className="btn btn-danger">Export & Delete Data</button>
          <button className="btn btn-danger">Delete Account</button>
        </div>
      </div>

      <div className="settings-savebar">
        <div className="settings-savebar-info">
          {saved ? <><Icon name="check" size={13} stroke={2.4} /> <span style={{ color: "var(--up)" }}>Settings saved to cloud</span></> : <span style={{ color: "var(--fg-3)" }}>Changes save when you click below</span>}
        </div>
        <button className="btn btn-primary" onClick={save}><Icon name="check" size={13} stroke={2.4} /> Save Settings</button>
      </div>
    </div>
  );
}
window.Settings = Settings;
