// ===== 컴포넌트 JS — Mermaid 렌더 (그래프는 위젯의 .mermaid 요소 textContent로 주입) =====
// CDN 우선, 로컬(_vendor) fallback 로드까지 대기 후 렌더. 그래프 정의는 엔진에 없음(레슨별 위젯에).
// 다크모드: mermaid은 SVG 안에 <style>을 주입하는데, 위젯 classDef가 만든 규칙은 #mermaid-<id>(ID)+!important라
//   외부 CSS로 못 덮는다. 그래서 주입된 <style> 텍스트를 런타임에 다크로 변환(원본 보존)하고,
//   부모가 html.dark를 토글하면(MutationObserver) 즉시 재적용. 색 정책은 휘도 기반(밝은 채움→어둡게,
//   어두운 텍스트→밝게, 선은 너무 어두울 때만 밝게). 크롬·엣지·엣지라벨은 mermaid.css html.dark가 담당.
(function () {
  /* ---- 색 유틸 ---- */
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function hslToRgb(h, s, l) {
    h /= 360; var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue = function (p, q, t) { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      r = hue(p, q, h + 1 / 3); g = hue(p, q, h); b = hue(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h, s;
    if (mx === mn) { h = s = 0; }
    else {
      var d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
    }
    return { h: h * 360, s: s, l: l };
  }
  function hslHex(h, s, l) { return '#' + hslToRgb(h, s, l).map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
  function toRgb(tok) {
    tok = tok.trim();
    if (tok[0] === '#') { var x = tok.slice(1); if (x.length === 3) x = x.split('').map(function (c) { return c + c; }).join(''); if (x.length >= 6) return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)]; return null; }
    var m = tok.match(/rgba?\(([^)]+)\)/i); if (m) { var p = m[1].split(',').map(parseFloat); return [p[0], p[1], p[2]]; }
    m = tok.match(/hsla?\(([^)]+)\)/i); if (m) { var q = m[1].split(',').map(parseFloat); return hslToRgb(((q[0] % 360) + 360) % 360, q[1] / 100, q[2] / 100); }
    return null;
  }
  /* 휘도 기반 색 매핑(속성 맥락 최소 반영). null=변경없음. */
  function mapColor(rgb, prop) {
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]), L = hsl.l, S = hsl.s, H = hsl.h, neutral = S < 0.22 || L > 0.93;
    if (/stroke/.test(prop)) return L < 0.34 ? '#8893b5' : null;        // 너무 어두운 선만 밝게(보더·액센트 유지)
    if (L >= 0.6) return neutral ? (L >= 0.85 ? '#1b1f2b' : '#262b36') : hslHex(H, Math.min(S, 0.55), 0.17); // 밝은 채움 → 다크
    if (L >= 0.5) return null;                                          // 중간톤 액센트 유지
    if (neutral) return '#d6dbe8';                                      // 어두운 텍스트 → 밝은 잉크
    return hslHex(H, Math.min(S, 0.85), clamp(L + 0.26, 0.62, 0.74));   // 채도 텍스트(의미색) → 밝게
  }
  var COLORTOK = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
  function transformStyle(css) {
    return css.replace(/([^{}]+)\{([^{}]*)\}/g, function (m, sel, body) {
      var nb = body.replace(/([\w-]+)\s*:\s*([^;]+)/g, function (mm, prop, val) {
        if (!/fill|color|background|stroke|stop-color/i.test(prop)) return mm;
        var nv = val.replace(COLORTOK, function (tok) { var rgb = toRgb(tok); if (!rgb) return tok; return mapColor(rgb, prop.toLowerCase()) || tok; });
        return prop + ':' + nv;
      });
      return sel + '{' + nb + '}';
    });
  }

  /* ---- 렌더 + 다크 적용 ---- */
  var ORIG = new WeakMap();   // <style> → 원본(라이트) 텍스트
  function applyDark() {
    var dark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('.mermaid svg style').forEach(function (st) {
      if (!ORIG.has(st)) ORIG.set(st, st.textContent);
      var orig = ORIG.get(st);
      var next = dark ? transformStyle(orig) : orig;
      if (st.textContent !== next) st.textContent = next;
    });
  }
  function go() {
    try {
      mermaid.initialize({
        startOnLoad: false, securityLevel: 'loose', theme: 'base',
        themeVariables: { fontFamily: 'inherit' },
        flowchart: { curve: 'basis', htmlLabels: true, nodeSpacing: 46, rankSpacing: 44, padding: 10 }
      });
      mermaid.run({ nodes: document.querySelectorAll('.mermaid') }).then(function () {
        document.querySelectorAll('.mermaid .edgeLabel').forEach(function (el) { if (!el.textContent.trim()) el.style.display = 'none'; });
        applyDark();
      }).catch(function () {});
    } catch (e) {}
  }
  // 부모가 iframe html에 .dark 토글 → 즉시 재적용
  try { new MutationObserver(applyDark).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); } catch (e) {}

  var tries = 0;
  (function wait() {
    if (window.mermaid) { go(); return; }
    if (tries++ > 80) return;            // ~4s (CDN 실패 시 로컬 fallback 로드 대기)
    setTimeout(wait, 50);
  })();
})();
