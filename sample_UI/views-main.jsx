/* Main views: Dashboard, Journal, Calendar, Stats */

function Dashboard({ trades }) {
  const s = TV.stats(trades);
  const eq = TV.equityPoints(trades);
  const recent = [...trades].sort((a,b) => b.date - a.date).slice(0, 8);
  const open = trades.filter(t => t.status === "Open");
  const monthGoal = 1000;
  const monthPL = trades.filter(t => t.status === "Finished" && (Date.now() - t.date) < 30*86400000).reduce((a,t) => a + t.pl, 0);

  const cards = [
    { lbl: "Total P&L", val: fmt.usd(s.totalPL, true), sub: `${s.finished.length} trades`, cls: s.totalPL >= 0 ? "up" : "down", spark: eq.slice(-30).map(p => p.bal), sparkColor: s.totalPL >= 0 ? "var(--up)" : "var(--down)" },
    { lbl: "Win Rate", val: fmt.pct(s.wr), sub: `${s.wins.length}W · ${s.losses.length}L` },
    { lbl: "Profit Factor", val: s.profitFactor.toFixed(2), sub: s.profitFactor >= 1.5 ? "Healthy edge" : "Below target" },
    { lbl: "Avg R:R", val: (s.avgWin / (s.avgLoss || 1)).toFixed(2), sub: "Win / Loss" },
    { lbl: "Expectancy", val: fmt.usd(s.expectancy, true), sub: "Per trade" },
    { lbl: "Best Day", val: fmt.usd(Math.max(...eq.map((p,i,a) => i ? p.bal - a[i-1].bal : p.bal)), true), sub: "30D" },
  ];

  return (
    <div>
      <div className="title-block">
        <h1>Dashboard</h1>
        <div className="sub">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</div>
      </div>

      <div style={{ background: "var(--warn-dim)", border: "1px solid oklch(0.36 0.1 80)", borderRadius: 7, padding: "10px 14px", color: "var(--warn)", fontSize: 12.5, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <Icon name="risk" size={15} />
        <strong>Daily loss limit at 62%</strong>
        <span style={{ color: "var(--fg-3)" }}>·  -$18.40 of -$30 daily max ·  one more loss could trigger lockout</span>
      </div>

      <div className="stat-grid">
        {cards.map((c, i) => (
          <div key={i} className="stat-card">
            <div className="lbl">{c.lbl}</div>
            <div className={`val ${c.cls || ""}`}>{c.val}</div>
            <div className="sub">{c.sub}</div>
            {c.spark && (
              <div className="spark">
                <Sparkline values={c.spark} color={c.sparkColor} fill />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="row-2-1">
        <div className="card">
          <div className="card-head">
            <h3>Equity Curve</h3>
            <span className="sub">Starting $1,000</span>
            <div className="actions">
              <div className="seg">
                <button>1W</button>
                <button>1M</button>
                <button className="active">3M</button>
                <button>YTD</button>
                <button>ALL</button>
              </div>
            </div>
          </div>
          <div style={{ padding: 12 }}>
            <EquityCurve points={eq} color={s.totalPL >= 0 ? "var(--up)" : "var(--down)"} height={220} />
          </div>
        </div>
        <div className="stack">
          <div className="card card-pad">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)" }}>Monthly Goal</h3>
              <span className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{Math.round(monthPL/monthGoal*100)}%</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)" }} className={monthPL >= 0 ? "up" : "down"}>{fmt.usd(monthPL, true)}</div>
            <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 4 }}>of {fmt.usd(monthGoal)} target</div>
            <div style={{ marginTop: 12, height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, Math.max(0, monthPL/monthGoal*100))}%`, height: "100%", background: "var(--accent)" }} />
            </div>
          </div>

          <div className="card card-pad">
            <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)", marginBottom: 10 }}>Open Positions · {open.length}</h3>
            {open.length === 0 ? (
              <div style={{ color: "var(--fg-3)", fontSize: 12, padding: "16px 0" }}>No open positions</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {open.slice(0, 4).map(t => (
                  <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 10, padding: 8, background: "var(--bg-3)", borderRadius: 6 }}>
                    <div>
                      <div className="mono" style={{ fontWeight: 700, fontSize: 12.5 }}>{t.symbol}</div>
                      <div style={{ fontSize: 10.5, color: "var(--fg-3)", marginTop: 2 }}>Qty {t.qty} · Entry ${t.entry.toFixed(2)}</div>
                    </div>
                    <span className={`chip ${t.dir === "Long" ? "chip-up" : "chip-down"}`}>{t.dir.toUpperCase()}</span>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600 }}>R {t.rr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="row-2">
        <div className="card">
          <div className="card-head"><h3>Recent Trades</h3><div className="actions"><button className="btn btn-sm btn-ghost">View all</button></div></div>
          <table className="tbl">
            <thead><tr><th>SYM</th><th>Dir</th><th>Grade</th><th className="num">P&L</th><th className="num">R</th><th>Date</th></tr></thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td className="mono" style={{ fontWeight: 600 }}>{t.symbol}</td>
                  <td><span className={`chip ${t.dir === "Long" ? "chip-up" : "chip-down"}`}>{t.dir === "Long" ? "L" : "S"}</span></td>
                  <td><span className={`grade ${t.grade.toLowerCase().replace("+", "-plus")}`}>{t.grade}</span></td>
                  <td className={`num ${t.pl > 0 ? "up" : t.pl < 0 ? "down" : "muted"}`}>{t.status === "Finished" ? fmt.usd(t.pl, true) : "—"}</td>
                  <td className="num muted">{t.rr}</td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{fmt.date(t.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head"><h3>Active Rules · 7</h3><div className="actions"><span className="chip chip-up chip-dot">5 followed</span><span className="chip chip-down chip-dot">2 broken</span></div></div>
          <div style={{ padding: "8px 4px" }}>
            {[
              { t: "No trade before 7 AM EST", ok: true },
              { t: "Max 3 trades per day", ok: true },
              { t: "1% risk per setup", ok: true },
              { t: "No revenge trades after SL", ok: false, note: "Broken Tue · -$24" },
              { t: "Wait for HTF confluence", ok: true },
              { t: "Stop loss in market, always", ok: true },
              { t: "Journal entry within 1hr of close", ok: false, note: "Skipped 2x this week" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid var(--line)" }}>
                <span style={{
                  width: 18, height: 18, borderRadius: 4,
                  display: "grid", placeItems: "center",
                  background: r.ok ? "var(--up-dim)" : "var(--down-dim)",
                  color: r.ok ? "var(--up)" : "var(--down)"
                }}>
                  <Icon name={r.ok ? "check" : "x"} size={11} stroke={2.4} />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5 }}>{r.t}</div>
                  {r.note && <div style={{ fontSize: 10.5, color: "var(--down)", marginTop: 2 }}>{r.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
window.Dashboard = Dashboard;

/* ============================== JOURNAL ============================== */
function Journal({ trades, onAdd }) {
  const [search, setSearch] = React.useState("");
  const [fStatus, setFStatus] = React.useState("");
  const [fDir, setFDir] = React.useState("");
  const [fGrade, setFGrade] = React.useState("");

  const filtered = trades.filter(t => {
    if (search && !t.symbol.toLowerCase().includes(search.toLowerCase()) && !t.strategy.toLowerCase().includes(search.toLowerCase())) return false;
    if (fStatus && t.status !== fStatus) return false;
    if (fDir && t.dir !== fDir) return false;
    if (fGrade && t.grade !== fGrade) return false;
    return true;
  });
  const totalPL = filtered.filter(t => t.status === "Finished").reduce((a,t) => a + t.pl, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
        <div className="title-block" style={{ marginBottom: 0 }}>
          <h1>Trade Journal</h1>
          <div className="sub">{filtered.length} trades · {fmt.usd(totalPL, true)} net</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn"><Icon name="download" size={13} /> Export</button>
          <button className="btn btn-primary" onClick={onAdd}><Icon name="plus" size={13} stroke={2.2} /> New Trade</button>
        </div>
      </div>

      <div className="card" style={{ padding: "10px 12px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--fg-3)" }}><Icon name="search" size={13} /></span>
          <input className="input" style={{ paddingLeft: 28, width: 220 }} placeholder="Symbol or strategy…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">All status</option>
          <option>Finished</option><option>Open</option><option>Cancelled</option>
        </select>
        <select className="select" value={fDir} onChange={e => setFDir(e.target.value)}>
          <option value="">All directions</option>
          <option>Long</option><option>Short</option>
        </select>
        <select className="select" value={fGrade} onChange={e => setFGrade(e.target.value)}>
          <option value="">All grades</option>
          {TV.GRADES.map(g => <option key={g}>{g}</option>)}
        </select>
        <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--fg-3)" }}>
          <span className="kbd">⌘</span> <span className="kbd">K</span> for command palette
        </span>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Symbol</th>
                <th>Dir</th>
                <th>Grade</th>
                <th>Setup</th>
                <th>Session</th>
                <th>Mood</th>
                <th>Rules</th>
                <th className="num">Qty</th>
                <th className="num">Entry</th>
                <th className="num">Stop</th>
                <th className="num">Exit</th>
                <th className="num">R:R</th>
                <th className="num">Risk</th>
                <th className="num">Net P&L</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 30).map(t => (
                <tr key={t.id}>
                  <td className="mono muted">{t.id}</td>
                  <td>
                    <span className={`chip ${t.status === "Finished" ? "chip-up" : t.status === "Open" ? "chip-info" : ""}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="mono" style={{ fontWeight: 600 }}>{t.symbol}</td>
                  <td><span className={t.dir === "Long" ? "up" : "down"} style={{ fontWeight: 600, fontSize: 11.5 }}>{t.dir === "Long" ? "↑ LONG" : "↓ SHORT"}</span></td>
                  <td><span className={`grade ${t.grade.toLowerCase().replace("+", "-plus")}`}>{t.grade}</span></td>
                  <td style={{ color: "var(--fg-2)" }}>{t.strategy}</td>
                  <td style={{ color: "var(--fg-2)" }}>{t.session}</td>
                  <td style={{ color: "var(--fg-3)" }}>{t.emotion}</td>
                  <td>
                    {t.rules
                      ? <span style={{ color: "var(--up)" }}><Icon name="check" size={14} stroke={2.4} /></span>
                      : <span style={{ color: "var(--down)" }}><Icon name="x" size={14} stroke={2.4} /></span>}
                  </td>
                  <td className="num">{t.qty}</td>
                  <td className="num">{t.entry.toFixed(2)}</td>
                  <td className="num muted">{t.stop.toFixed(2)}</td>
                  <td className="num">{t.exit ? t.exit.toFixed(2) : "—"}</td>
                  <td className="num muted">{t.rr}</td>
                  <td className="num muted">{fmt.usd(t.risk)}</td>
                  <td className={`num ${t.pl > 0 ? "up" : t.pl < 0 ? "down" : "muted"}`} style={{ fontWeight: 600 }}>{t.status === "Finished" ? fmt.usd(t.pl, true) : "—"}</td>
                  <td className="muted" style={{ fontSize: 11.5 }}>{fmt.date(t.date)}</td>
                  <td>
                    <span className="row-actions">
                      <button title="View"><Icon name="eye" size={12} /></button>
                      <button title="Edit"><Icon name="edit" size={12} /></button>
                      <button title="Delete"><Icon name="trash" size={12} /></button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
window.Journal = Journal;

/* ============================== CALENDAR ============================== */
function Calendar({ trades }) {
  const [cursor, setCursor] = React.useState(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startDay = (first.getDay() + 6) % 7; // Mon=0
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  while (days.length % 7) days.push(null);

  // Aggregate per day
  const byDay = {};
  trades.forEach(t => {
    if (t.status !== "Finished") return;
    const k = `${t.date.getFullYear()}-${t.date.getMonth()}-${t.date.getDate()}`;
    byDay[k] = byDay[k] || { pl: 0, count: 0 };
    byDay[k].pl += t.pl;
    byDay[k].count += 1;
  });
  const monthTrades = trades.filter(t => t.status === "Finished" && t.date.getMonth() === month && t.date.getFullYear() === year);
  const monthPL = monthTrades.reduce((a,t) => a + t.pl, 0);
  const monthWins = monthTrades.filter(t => t.pl > 0).length;
  const wr = monthTrades.length ? (monthWins / monthTrades.length) : 0;

  const today = new Date();
  const isToday = (d) => d && d.toDateString() === today.toDateString();

  const weeks = [];
  for (let w = 0; w < days.length / 7; w++) weeks.push(days.slice(w * 7, w * 7 + 7));

  return (
    <div>
      <div className="title-block">
        <h1>Trading Calendar</h1>
        <div className="sub">Daily P&L grid · weekly + monthly summaries</div>
      </div>

      <div className="cal-month-bar">
        <button className="icon-btn" onClick={() => setCursor(new Date(year, month - 1, 1))}><Icon name="chevronL" size={14} /></button>
        <h2>{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
        <button className="icon-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}><Icon name="chevronR" size={14} /></button>
        <button className="btn btn-sm" onClick={() => setCursor(new Date())}>Today</button>
        <div className="mtot">
          <div><div className="lbl">Net P&L</div><div className={`val ${monthPL >= 0 ? "up" : "down"}`}>{fmt.usd(monthPL, true)}</div></div>
          <div><div className="lbl">Trades</div><div className="val">{monthTrades.length}</div></div>
          <div><div className="lbl">Win Rate</div><div className="val">{fmt.pct(wr)}</div></div>
        </div>
      </div>

      <div className="cal">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d} className="head">{d}</div>)}
        <div className="head" style={{ textAlign: "right" }}>Week</div>
        {weeks.map((wk, wi) => {
          const wkPL = wk.reduce((a,d) => {
            if (!d) return a;
            const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            return a + (byDay[k]?.pl || 0);
          }, 0);
          const wkCount = wk.reduce((a,d) => {
            if (!d) return a;
            const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            return a + (byDay[k]?.count || 0);
          }, 0);
          return (
            <React.Fragment key={wi}>
              {wk.map((d, di) => {
                if (!d) return <div key={di} className="cal-day muted" />;
                const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                const data = byDay[k];
                const cls = data ? (data.pl > 0 ? "win" : data.pl < 0 ? "loss" : "") : "";
                return (
                  <div key={di} className={`cal-day ${data ? "has-trade" : ""} ${cls} ${isToday(d) ? "today" : ""}`}>
                    <div className="num">{d.getDate()}</div>
                    {data && (
                      <>
                        <div className={`pl ${data.pl >= 0 ? "up" : "down"}`}>{fmt.usd(data.pl, true)}</div>
                        <div className="ct">{data.count} {data.count === 1 ? "trade" : "trades"}</div>
                      </>
                    )}
                  </div>
                );
              })}
              <div className="cal-week-total">
                <div className={`pl ${wkPL >= 0 ? "up" : "down"}`}>{wkPL ? fmt.usd(wkPL, true) : "—"}</div>
                <div className="ct">{wkCount} trades</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ marginTop: 18 }} className="card">
        <div className="card-head"><h3>Annual Heatmap · {year}</h3><span className="sub">Each cell = one trading day</span></div>
        <div style={{ padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(53, 1fr)", gap: 3 }}>
            {Array.from({ length: 53 * 7 }).map((_, i) => {
              const d = new Date(year, 0, 1);
              d.setDate(d.getDate() + i);
              const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const v = byDay[k]?.pl;
              let bg = "var(--bg-3)";
              if (v != null) {
                const intensity = Math.min(1, Math.abs(v) / 50);
                bg = v > 0
                  ? `oklch(${0.32 + intensity * 0.42} ${0.08 + intensity * 0.1} 165)`
                  : `oklch(${0.32 + intensity * 0.42} ${0.08 + intensity * 0.12} 15)`;
              }
              return <div key={i} style={{ aspectRatio: "1", borderRadius: 2, background: bg }} />;
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 12, fontSize: 10.5, color: "var(--fg-3)" }}>
            <span>Less</span>
            {[0.2, 0.4, 0.6, 0.8, 1].map((i, idx) => <span key={idx} style={{ width: 12, height: 12, borderRadius: 2, background: `oklch(${0.32 + i * 0.42} ${0.08 + i * 0.1} 165)` }} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
window.Calendar = Calendar;

/* ============================== STATS ============================== */
function Stats({ trades }) {
  const s = TV.stats(trades);
  const eq = TV.equityPoints(trades);

  // P&L by day of week
  const dows = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dowData = dows.map((d, i) => ({
    label: d.slice(0,3),
    value: s.finished.filter(t => t.date.getDay() === i).reduce((a,t) => a + t.pl, 0)
  }));

  // P&L by session
  const sesData = TV.SESSIONS.map(ses => ({
    label: ses,
    value: s.finished.filter(t => t.session === ses).reduce((a,t) => a + t.pl, 0)
  }));

  // P&L by grade
  const gradeData = TV.GRADES.map(g => ({
    label: g,
    value: s.finished.filter(t => t.grade === g).reduce((a,t) => a + t.pl, 0)
  }));

  // P&L by emotion
  const emoData = TV.EMOTIONS.map(e => ({
    label: e.slice(0,4),
    value: s.finished.filter(t => t.emotion === e).reduce((a,t) => a + t.pl, 0)
  }));

  // By symbol
  const symMap = {};
  s.finished.forEach(t => {
    symMap[t.symbol] = symMap[t.symbol] || { count: 0, pl: 0, wins: 0 };
    symMap[t.symbol].count++;
    symMap[t.symbol].pl += t.pl;
    if (t.pl > 0) symMap[t.symbol].wins++;
  });
  const symRows = Object.entries(symMap).sort((a,b) => b[1].pl - a[1].pl);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
        <div className="title-block" style={{ marginBottom: 0 }}>
          <h1>Statistics</h1>
          <div className="sub">Edge measurement · last 90 days</div>
        </div>
        <div style={{ marginLeft: "auto" }} className="seg">
          <button>Week</button>
          <button>Month</button>
          <button className="active">90D</button>
          <button>YTD</button>
          <button>All</button>
        </div>
      </div>

      <div className="stat-grid">
        {[
          { lbl: "Net P&L", val: fmt.usd(s.totalPL, true), cls: s.totalPL >= 0 ? "up" : "down", sub: `${s.finished.length} trades closed` },
          { lbl: "Win Rate", val: fmt.pct(s.wr), sub: `${s.wins.length}W / ${s.losses.length}L` },
          { lbl: "Avg Win", val: fmt.usd(s.avgWin, true), cls: "up" },
          { lbl: "Avg Loss", val: fmt.usd(-s.avgLoss, true), cls: "down" },
          { lbl: "Profit Factor", val: s.profitFactor.toFixed(2), sub: s.profitFactor >= 1.5 ? "Strong" : "Improve" },
          { lbl: "Expectancy", val: fmt.usd(s.expectancy, true), sub: "Per trade" },
          { lbl: "Largest Win", val: fmt.usd(Math.max(...s.wins.map(t => t.pl), 0), true), cls: "up" },
          { lbl: "Largest Loss", val: fmt.usd(Math.min(...s.losses.map(t => t.pl), 0), true), cls: "down" },
        ].map((c,i) => (
          <div key={i} className="stat-card">
            <div className="lbl">{c.lbl}</div>
            <div className={`val ${c.cls || ""}`}>{c.val}</div>
            {c.sub && <div className="sub">{c.sub}</div>}
          </div>
        ))}
      </div>

      <div className="row-2-1">
        <div className="card">
          <div className="card-head"><h3>Equity Curve</h3><span className="sub">{fmt.usd(eq[0]?.bal || 0)} → {fmt.usd(eq[eq.length-1]?.bal || 0)}</span></div>
          <div style={{ padding: 12 }}><EquityCurve points={eq} color="var(--accent)" height={240} /></div>
        </div>
        <div className="card card-pad">
          <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--fg-2)", marginBottom: 16 }}>Win / Loss / BE</h3>
          <DonutChart
            slices={[
              { label: "Wins", value: s.wins.length, color: "var(--up)" },
              { label: "Losses", value: s.losses.length, color: "var(--down)" },
              { label: "Breakeven", value: Math.max(0, s.finished.length - s.wins.length - s.losses.length), color: "var(--bg-5)" },
            ]}
            size={150}
          />
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="row-2">
        <div className="card">
          <div className="card-head"><h3>P&L by Day of Week</h3></div>
          <div style={{ padding: 12 }}><BarChart data={dowData} signed height={180} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>P&L by Session</h3></div>
          <div style={{ padding: 12 }}><BarChart data={sesData} signed height={180} /></div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="row-2">
        <div className="card">
          <div className="card-head"><h3>P&L by Grade</h3></div>
          <div style={{ padding: 12 }}><BarChart data={gradeData} signed height={170} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>P&L by Emotion</h3></div>
          <div style={{ padding: 12 }}><BarChart data={emoData} signed height={170} /></div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="card-head"><h3>By Symbol</h3><span className="sub">Sorted by net P&L</span></div>
        <table className="tbl">
          <thead><tr><th>Symbol</th><th className="num">Trades</th><th className="num">Win Rate</th><th className="num">Net P&L</th><th>Performance</th></tr></thead>
          <tbody>
            {symRows.map(([sym, d]) => {
              const wr = d.wins / d.count;
              const max = Math.max(...symRows.map(r => Math.abs(r[1].pl)));
              return (
                <tr key={sym}>
                  <td className="mono" style={{ fontWeight: 600 }}>{sym}</td>
                  <td className="num">{d.count}</td>
                  <td className="num">{fmt.pct(wr)}</td>
                  <td className={`num ${d.pl >= 0 ? "up" : "down"}`} style={{ fontWeight: 600 }}>{fmt.usd(d.pl, true)}</td>
                  <td style={{ width: 200 }}>
                    <div style={{ height: 6, background: "var(--bg-3)", borderRadius: 3, overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${Math.abs(d.pl)/max*100}%`, background: d.pl >= 0 ? "var(--up)" : "var(--down)" }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
window.Stats = Stats;
