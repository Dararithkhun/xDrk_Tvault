/* Shared SVG icons + small UI primitives.
   Exposes Icons + helpers on window. */

const Icon = ({ name, size = 16, stroke = 1.6 }) => {
  const paths = {
    dashboard: "M3 12 12 4l9 8M5 10v10h14V10",
    journal: "M5 4h11l3 3v13H5zM5 4v16h14M9 9h7M9 13h7M9 17h4",
    calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
    stats: "M4 20V8M10 20V4M16 20v-7M22 20H2",
    chart: "M3 17l5-5 4 4 6-8 3 3M21 21H3",
    news: "M5 4h11l3 3v13H5zM8 9h8M8 13h8M8 17h5",
    calc: "M5 3h14v18H5zM9 7h6M8 11h2M12 11h2M16 11h2M8 15h2M12 15h2M16 15h2M8 19h6",
    compound: "M3 17h4l3-7 4 14 3-9h4",
    diary: "M6 3h11l3 3v15H6zM6 3v18M10 8h6M10 12h6M10 16h4",
    backtest: "M9 3h6l-1 4h-4zM7 7h10v14H7zM10 12h4M10 16h4",
    settings: "M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3M12 9a3 3 0 100 6 3 3 0 000-6z",
    plus: "M5 12h14M12 5v14",
    search: "M11 11a6 6 0 100-12 6 6 0 000 12zM21 21l-5-5",
    bell: "M6 8a6 6 0 0112 0v5l2 3H4l2-3zM10 19a2 2 0 004 0",
    expand: "M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6",
    chevronL: "M15 6l-6 6 6 6",
    chevronR: "M9 6l6 6-6 6",
    chevronD: "M6 9l6 6 6-6",
    edit: "M4 20h4l11-11-4-4L4 16zM14 6l4 4",
    trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
    download: "M12 3v12M7 10l5 5 5-5M5 21h14",
    upload: "M12 21V9M7 14l5-5 5 5M5 3h14",
    filter: "M3 5h18l-7 9v6l-4-2v-4z",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z",
    flame: "M12 2c1 4 4 5 4 9a4 4 0 11-8 0c0-3 3-3 4-9zM10 16a2 2 0 104 0",
    target: "M12 2v4M12 18v4M2 12h4M18 12h4M12 7a5 5 0 100 10 5 5 0 000-10z",
    book: "M4 4h7v16H6a2 2 0 01-2-2zM20 4h-7v16h5a2 2 0 002-2z",
    user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-7 8-7s8 3 8 7",
    refresh: "M21 12a9 9 0 11-3-6.7M21 4v5h-5",
    layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 18l9 5 9-5",
    play: "M6 4l14 8-14 8z",
    arrowU: "M12 19V5M5 12l7-7 7 7",
    arrowD: "M12 5v14M5 12l7 7 7-7",
    check: "M5 12l5 5L20 7",
    x: "M6 6l12 12M18 6L6 18",
    sparkle: "M12 2l2 7 7 2-7 2-2 7-2-7-7-2 7-2zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z",
    risk: "M12 3l9 16H3zM12 9v5M12 17v.01",
    clock: "M12 6v6l4 2M12 21a9 9 0 100-18 9 9 0 000 18z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] || ""} />
    </svg>
  );
};

window.Icon = Icon;

const fmt = {
  usd: (v, signed) => {
    if (v == null || isNaN(v)) return "—";
    const s = (Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(2));
    const n = Number(s).toLocaleString("en-US", { minimumFractionDigits: Math.abs(v) >= 1000 ? 0 : 2, maximumFractionDigits: 2 });
    if (signed && v > 0) return "+$" + n;
    if (v < 0) return "-$" + n.replace("-", "");
    return "$" + n;
  },
  pct: (v, digits = 1) => (v == null ? "—" : (v * 100).toFixed(digits) + "%"),
  num: (v, digits = 2) => v == null ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }),
  date: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  dateLong: (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  time: (d) => d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
};
window.fmt = fmt;

// Tiny SVG sparkline
function Sparkline({ values, color = "currentColor", w = 70, h = 28, fill = false }) {
  if (!values || !values.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * step).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ");
  const area = `M0,${h} L${pts.replaceAll(" ", " L")} L${w},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {fill && <path d={area} fill={color} fillOpacity="0.18" />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
window.Sparkline = Sparkline;

// Equity curve area chart
function EquityCurve({ points, color = "var(--accent)", height = 180 }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(600);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const h = height;
  const padL = 44, padR = 8, padT = 12, padB = 22;
  const innerW = Math.max(50, w - padL - padR);
  const innerH = h - padT - padB;
  const min = Math.min(...points.map(p => p.bal));
  const max = Math.max(...points.map(p => p.bal));
  const range = max - min || 1;
  const stepX = innerW / Math.max(1, points.length - 1);
  const ptsXY = points.map((p, i) => [padL + i * stepX, padT + (1 - (p.bal - min) / range) * innerH]);
  const path = ptsXY.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = path + ` L${padL + innerW},${padT + innerH} L${padL},${padT + innerH} Z`;
  const ticks = 4;
  return (
    <div ref={ref} style={{ width: "100%", height: h }}>
      <svg width={w} height={h} style={{ display: "block" }}>
        <defs>
          <linearGradient id="eqfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const y = padT + (i / ticks) * innerH;
          const v = max - (i / ticks) * range;
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="var(--line)" strokeDasharray="2 4" strokeWidth="1" />
              <text x={padL - 8} y={y + 3} fontSize="9.5" fill="var(--fg-3)" textAnchor="end" fontFamily="var(--font-mono)">${v.toFixed(0)}</text>
            </g>
          );
        })}
        <path d={area} fill="url(#eqfill)" />
        <path d={path} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
window.EquityCurve = EquityCurve;

// Bar chart
function BarChart({ data, color = "var(--accent)", height = 160, signed = false }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(400);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const h = height, padL = 40, padR = 8, padT = 8, padB = 26;
  const innerW = Math.max(50, w - padL - padR);
  const innerH = h - padT - padB;
  const max = Math.max(...data.map(d => d.value), 0);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = (max - min) || 1;
  const zeroY = padT + (max / range) * innerH;
  const barW = innerW / data.length * 0.6;
  const gap = innerW / data.length * 0.4;
  return (
    <div ref={ref} style={{ width: "100%", height: h }}>
      <svg width={w} height={h} style={{ display: "block" }}>
        <line x1={padL} y1={zeroY} x2={padL + innerW} y2={zeroY} stroke="var(--line-2)" strokeWidth="1" />
        {data.map((d, i) => {
          const x = padL + (i + 0.5) * (innerW / data.length) - barW / 2;
          const isNeg = d.value < 0;
          const barH = Math.abs(d.value) / range * innerH;
          const y = isNeg ? zeroY : zeroY - barH;
          const fill = signed ? (d.value >= 0 ? "var(--up)" : "var(--down)") : color;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={fill} rx="2" />
              <text x={x + barW / 2} y={h - 8} fontSize="10" fill="var(--fg-3)" textAnchor="middle">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
window.BarChart = BarChart;

// Donut chart
function DonutChart({ slices, size = 160, label = "" }) {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const r = size / 2 - 6;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const arcs = slices.map((s, i) => {
    const portion = s.value / total;
    const ang2 = angle + portion * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(ang2), y2 = cy + r * Math.sin(ang2);
    const large = portion > 0.5 ? 1 : 0;
    const d = `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    angle = ang2;
    return <path key={i} d={d} fill={s.color} />;
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width={size} height={size}>
        {arcs}
        <circle cx={cx} cy={cy} r={r * 0.62} fill="var(--bg-2)" />
        <text x={cx} y={cy - 2} fontSize="11" fill="var(--fg-3)" textAnchor="middle" fontWeight="600" letterSpacing="0.1em">TOTAL</text>
        <text x={cx} y={cy + 16} fontSize="18" fill="var(--fg)" textAnchor="middle" fontWeight="700" fontFamily="var(--font-mono)">{total}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {slices.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ color: "var(--fg-2)" }}>{s.label}</span>
            <span className="mono" style={{ marginLeft: "auto", color: "var(--fg)" }}>{s.value}</span>
            <span className="mono" style={{ color: "var(--fg-3)", fontSize: 11 }}>{((s.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
window.DonutChart = DonutChart;

// Candlestick chart (mock)
function Candles({ candles, trades = [], height = 460, accent = "var(--accent)" }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(800);
  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const h = height, padL = 8, padR = 64, padT = 8, padB = 22;
  const innerW = Math.max(100, w - padL - padR);
  const innerH = h - padT - padB;
  const lo = Math.min(...candles.map(c => c.l));
  const hi = Math.max(...candles.map(c => c.h));
  const range = hi - lo || 1;
  const cw = innerW / candles.length;
  const bw = Math.max(2, cw * 0.7);
  const scaleY = (v) => padT + (1 - (v - lo) / range) * innerH;
  return (
    <div ref={ref} style={{ width: "100%", height: h, position: "relative" }}>
      <svg width={w} height={h} style={{ display: "block" }}>
        {/* Grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const v = lo + (i / 4) * range;
          const y = scaleY(v);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke="var(--line)" strokeDasharray="2 5" />
              <text x={padL + innerW + 6} y={y + 3.5} fontSize="10" fill="var(--fg-3)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
            </g>
          );
        })}
        {candles.map((c, i) => {
          const x = padL + i * cw + cw / 2;
          const up = c.c >= c.o;
          const color = up ? "var(--up)" : "var(--down)";
          const yH = scaleY(c.h), yL = scaleY(c.l);
          const yO = scaleY(c.o), yC = scaleY(c.c);
          const top = Math.min(yO, yC), bot = Math.max(yO, yC);
          return (
            <g key={i}>
              <line x1={x} y1={yH} x2={x} y2={yL} stroke={color} strokeWidth="1" />
              <rect x={x - bw / 2} y={top} width={bw} height={Math.max(1, bot - top)} fill={color} />
            </g>
          );
        })}
        {/* Trade markers */}
        {trades.map((t, i) => {
          const y = scaleY(t.entry);
          return (
            <g key={"tr" + i}>
              <line x1={padL} y1={y} x2={padL + innerW} y2={y} stroke={accent} strokeDasharray="3 3" strokeWidth="1" opacity="0.7" />
              <rect x={padL + 4} y={y - 9} width={50} height={16} fill="var(--bg-3)" stroke={accent} rx="3" />
              <text x={padL + 8} y={y + 3} fontSize="10" fill={accent} fontFamily="var(--font-mono)">{t.dir === "Long" ? "↑" : "↓"} {t.entry.toFixed(2)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
window.Candles = Candles;

// Generate fake candles
function genCandles(n = 80, base = 70000, vol = 0.012) {
  const out = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    const ch = (Math.random() - 0.48) * vol * p;
    const o = p;
    const c = p + ch;
    const wick = Math.abs(ch) * (0.5 + Math.random() * 1.2);
    const h = Math.max(o, c) + wick * Math.random();
    const l = Math.min(o, c) - wick * Math.random();
    out.push({ o, c, h, l });
    p = c;
  }
  return out;
}
window.genCandles = genCandles;
