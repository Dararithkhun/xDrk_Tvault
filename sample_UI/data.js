/* Mock data + helpers — exposed on window */
(function () {
  const STRATEGIES = ["FVG Reversal", "Liquidity Grab", "Order Block", "ICT Silver Bullet", "Breakout", "Fakeout"];
  const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "NAS100", "SPX500"];
  const SESSIONS = ["Asia", "London", "New York"];
  const EMOTIONS = ["Calm", "Confident", "Anxious", "FOMO", "Bored", "Revenge"];
  const GRADES = ["A+", "A", "B", "C", "D"];

  function rand(seed) {
    let s = seed | 0 || 1;
    return () => {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  function genTrades(n = 64) {
    const r = rand(7);
    const trades = [];
    const today = new Date();
    let bal = 1000;
    for (let i = n - 1; i >= 0; i--) {
      const days = Math.floor(r() * 90);
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      const sym = SYMBOLS[Math.floor(r() * SYMBOLS.length)];
      const dir = r() > 0.45 ? "Long" : "Short";
      const status = i < 4 ? "Open" : (r() > 0.05 ? "Finished" : "Cancelled");
      const entry = +(50 + r() * 4000).toFixed(2);
      const stopDist = entry * (0.005 + r() * 0.02);
      const stop = dir === "Long" ? entry - stopDist : entry + stopDist;
      const rr = +(0.8 + r() * 3).toFixed(1);
      const isWin = r() > 0.42;
      const exit = isWin
        ? (dir === "Long" ? entry + stopDist * rr : entry - stopDist * rr)
        : (dir === "Long" ? entry - stopDist * (0.7 + r() * 0.3) : entry + stopDist * (0.7 + r() * 0.3));
      const qty = +(0.05 + r() * 1.2).toFixed(3);
      const pl = status === "Finished" ? +((dir === "Long" ? 1 : -1) * (exit - entry) * qty * 100).toFixed(2) : 0;
      const risk = +(stopDist * qty * 100).toFixed(2);
      const grade = GRADES[Math.floor(r() * GRADES.length)];
      const session = SESSIONS[Math.floor(r() * SESSIONS.length)];
      const strategy = STRATEGIES[Math.floor(r() * STRATEGIES.length)];
      const emotion = EMOTIONS[Math.floor(r() * EMOTIONS.length)];
      const rules = r() > 0.25;
      bal += pl;
      trades.push({
        id: 1000 + i,
        date: d,
        symbol: sym,
        dir,
        status,
        entry,
        stop,
        exit: status === "Finished" ? +exit.toFixed(2) : null,
        qty,
        pl,
        risk,
        rr,
        grade,
        session,
        strategy,
        emotion,
        rules,
        balance: bal,
      });
    }
    return trades.reverse();
  }

  const trades = genTrades(72);

  // Aggregate stats
  function stats(trades) {
    const finished = trades.filter(t => t.status === "Finished");
    const wins = finished.filter(t => t.pl > 0);
    const losses = finished.filter(t => t.pl < 0);
    const totalPL = finished.reduce((a, t) => a + t.pl, 0);
    const wr = finished.length ? wins.length / finished.length : 0;
    const avgWin = wins.length ? wins.reduce((a, t) => a + t.pl, 0) / wins.length : 0;
    const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + t.pl, 0) / losses.length) : 0;
    const profitFactor = avgLoss ? (wins.reduce((a, t) => a + t.pl, 0) / Math.abs(losses.reduce((a, t) => a + t.pl, 0))) : 0;
    const expectancy = wr * avgWin - (1 - wr) * avgLoss;
    return { finished, wins, losses, totalPL, wr, avgWin, avgLoss, profitFactor, expectancy };
  }

  // Equity curve
  function equityPoints(trades, start = 1000) {
    let bal = start;
    return trades
      .filter(t => t.status === "Finished")
      .sort((a, b) => a.date - b.date)
      .map(t => ({ d: t.date, bal: (bal += t.pl) }));
  }

  // Watchlist mock
  const watchlist = [
    { sym: "BTCUSDT", price: 71240.55, chg: 1.84, vol: "2.4B" },
    { sym: "ETHUSDT", price: 3892.10, chg: -0.42, vol: "1.1B" },
    { sym: "SOLUSDT", price: 184.23, chg: 3.21, vol: "412M" },
    { sym: "XAUUSD", price: 2384.60, chg: 0.18, vol: "—" },
    { sym: "EURUSD", price: 1.0842, chg: -0.09, vol: "—" },
    { sym: "NAS100", price: 18420.33, chg: 0.74, vol: "—" },
  ];

  // News mock
  const news = [
    { time: "08:30", ccy: "USD", impact: "high", title: "Non-Farm Payrolls", forecast: "175K", actual: null },
    { time: "10:00", ccy: "USD", impact: "high", title: "ISM Services PMI", forecast: "52.8", actual: null },
    { time: "12:00", ccy: "EUR", impact: "med", title: "ECB President Lagarde Speaks", forecast: "—", actual: null },
    { time: "14:30", ccy: "GBP", impact: "low", title: "BOE Quarterly Bulletin", forecast: "—", actual: null },
    { time: "20:00", ccy: "JPY", impact: "med", title: "BOJ Core CPI y/y", forecast: "2.5%", actual: null },
    { time: "—", ccy: "CAD", impact: "high", title: "Employment Change", forecast: "20.5K", actual: "32.4K" },
    { time: "—", ccy: "AUD", impact: "low", title: "RBA Assist Gov Hauser Speaks", forecast: "—", actual: "—" },
  ];

  // Diary mock
  const diaryEntries = [
    {
      id: 1, date: new Date(Date.now() - 0), title: "London session — clean A+ on EU",
      mood: "Confident",
      body: "Took the FVG sweep below Asia low at 8:14 GMT, ran straight to liquidity at 1.0865. Stuck to the plan, didn't add. R:R 3.2.\n\nNotes: hesitation on entry cost ~0.3R. Need to trust pre-market levels.",
    },
    {
      id: 2, date: new Date(Date.now() - 86400000), title: "Skipped NY — choppy after CPI",
      mood: "Calm",
      body: "Flagged the 13:30 release. Stayed flat. Watched price chop for 90min — would have been stopped twice.\n\nDecision: glad I sat out. Sometimes the best trade is no trade.",
    },
    {
      id: 3, date: new Date(Date.now() - 86400000 * 2), title: "Revenge trade caught me",
      mood: "Anxious",
      body: "After SL on first trade, jumped into a counter-trend setup without confirmation. Took -1.4R.\n\nRule violation: 'No re-entry within 30min of stop-loss'. Disabled trading for the rest of the day.",
    },
  ];

  window.TV = { trades, stats, equityPoints, watchlist, news, diaryEntries, SESSIONS, STRATEGIES, SYMBOLS, EMOTIONS, GRADES };
})();
