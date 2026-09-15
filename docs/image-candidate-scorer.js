(function (root) {
  const sourceWeights = { structured: 60, opengraph: 45, main: 35, responsive: 25, fallback: 5 };

  function scoreCandidate(candidate) {
    const width = Math.max(0, Number(candidate.width) || 0);
    const height = Math.max(0, Number(candidate.height) || 0);
    let score = sourceWeights[candidate.source] || 0;
    score += Math.min(30, Math.log2(Math.max(1, width * height)));
    if (candidate.primary) score += 25;
    if (candidate.related) score -= 45;
    if (candidate.avatar || (width <= 256 && height <= 256 && Math.abs(width - height) <= 8)) score -= 55;
    if (!/^https:\/\//i.test(String(candidate.url || ""))) score -= 100;
    return Math.round(score * 10) / 10;
  }

  function rankCandidates(candidates) {
    return candidates.map((candidate) => ({ ...candidate, score: scoreCandidate(candidate) }))
      .sort((a, b) => b.score - a.score);
  }

  root.imageCandidateScorer = { scoreCandidate, rankCandidates };

  if (typeof document !== "undefined") {
    document.getElementById("score").addEventListener("click", () => {
      const rows = [...document.querySelectorAll("tbody tr")].map((row) => ({
        url: row.querySelector("[name=url]").value,
        source: row.querySelector("[name=source]").value,
        width: row.querySelector("[name=width]").value,
        height: row.querySelector("[name=height]").value,
        primary: row.querySelector("[name=primary]").checked,
        related: row.querySelector("[name=related]").checked,
        avatar: row.querySelector("[name=avatar]").checked,
      }));
      const ranked = rankCandidates(rows);
      document.getElementById("result").textContent = ranked
        .map((item, index) => `${index + 1}. ${item.score} — ${item.url || "unnamed candidate"}`)
        .join("\n");
    });
  }
})(typeof globalThis === "undefined" ? this : globalThis);
