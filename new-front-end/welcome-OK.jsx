import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * mentorX — Page 1: 首页（Landing）
 * ------------------------------------------------------------------
 * 仍保持纯 React + DOM 的 TSX（无外部依赖），避免 jsDelivr/Rollup 解析问题。
 * 本次根据你的需求再次微调：
 *  - Shimmer 动画方向：改为 **从左到右**。
 *  - Tooltip：改为 **问号下方的白色浮窗**，带 **渐现**（淡入+上移2~4px）效果。
 *  - 其余保持不变（副标题/页脚/视觉）。
 * ------------------------------------------------------------------
 */

// ---- 小工具 & 常量 ----
const BRAND = "mentorX" as const;
const TOOLTIP_TEXT = "我们发挥XION链抽象技术前所未有的优势，为你分配一个完全随机的隐私身份。在mentorX，任何人都是夜行侠，现实中没有人会知道这个隐私身份是谁，以保护你的隐私与表达自由";

function isMobileUA() {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// 为品牌文字注入“擦亮”关键帧样式（仅注入一次）
function ensureShimmerCSS() {
  if (typeof document === "undefined") return;
  const id = "mx-shimmer-style";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    /* 改为从左到右：背景位置从 200% 逐步移动到 -200% 会让高亮由左向右经过文字 */
    @keyframes mxShimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .mx-shimmer {
      background-image: linear-gradient(90deg, #111827 0%, #111827 28%, #0A84FF 50%, #111827 72%, #111827 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: mxShimmer 2.6s ease-in-out infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .mx-shimmer { animation: none; color: #111827; background-image: none; }
    }
  `;
  document.head.appendChild(style);
}

// 运行时小测试（确保常量/函数不被意外改坏）
(function runLandingSmokeTests() {
  try {
    console.assert(BRAND === "mentorX", "BRAND 应为 mentorX");
    // 新提示文本应包含 XION 与 “隐私身份” 关键词
    console.assert(TOOLTIP_TEXT.includes("XION"), "TOOLTIP_TEXT 应包含 XION");
    console.assert(TOOLTIP_TEXT.includes("隐私身份"), "TOOLTIP_TEXT 应包含 隐私身份");
    console.assert(typeof isMobileUA() === "boolean", "isMobileUA 返回布尔值");
    // 额外测试：样式注入存在 & 关键字检查
    ensureShimmerCSS();
    const el = typeof document !== 'undefined' ? document.getElementById('mx-shimmer-style') : null;
    console.assert(!!el, "Shimmer 样式应已注入");
  } catch (e) {
    console.error("Landing smoke tests failed:", e);
  }
})();

// 确保关键帧在模块加载时即被注入（以及在 App 初次挂载时再兜底注入一次）
ensureShimmerCSS();

// ---- 动画容器：淡入 + 细微缩放 ----
const FadeScale: React.FC<{ active: boolean; children: React.ReactNode }> = ({
  active,
  children,
}) => {
  const [mounted, setMounted] = useState(active);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (active) setMounted(true);
  }, [active]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // 应用过渡
    el.style.transition = "opacity 220ms cubic-bezier(0.22,0.61,0.36,1), transform 220ms cubic-bezier(0.22,0.61,0.36,1)";
    // 初始值
    el.style.opacity = active ? "1" : "0";
    el.style.transform = active ? "scale(1)" : "scale(0.98)";

    if (!active) {
      const timer = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!mounted) return null;
  return (
    <div ref={ref} style={{ opacity: 0, transform: "scale(0.98)" }}>
      {children}
    </div>
  );
};

// ---- Tooltip（Hover / LongPress）----
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({
  text,
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={!isMobileUA() ? show : undefined}
      onMouseLeave={!isMobileUA() ? hide : undefined}
      onTouchStart={() => {
        // 移动端长按 300ms 出现
        longPressTimer.current = window.setTimeout(show, 300);
      }}
      onTouchEnd={() => {
        if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
        hide();
      }}
    >
      {children}
      {/* 改为“问号下方白色浮窗”，并常驻渲染用于过渡（opacity/translateY）*/}
      <div
        style={{
          ...(styles.tooltipContainer as React.CSSProperties),
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, ${visible ? '0px' : '4px'})`,
          transition: 'opacity 160ms ease, transform 160ms ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <span style={styles.tooltipText as React.CSSProperties}>{text}</span>
      </div>
    </div>
  );
};

// ---- 首页（Landing）----
const Landing: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <div style={styles.container as React.CSSProperties}>
      {/* 顶部留白 */}
      <div style={{ height: 12 }} />

      {/* 中心内容 */}
      <div style={styles.centerBox as React.CSSProperties}>
        <div className="mx-shimmer" style={styles.brand as React.CSSProperties}>{BRAND}</div>
        <div style={styles.subtitle as React.CSSProperties}>匿名、客观、永久储存的导师评价网</div>

        <div style={{ height: 28 }} />
        <button
          onClick={onEnter}
          style={styles.heroBtn as React.CSSProperties}
          onMouseDown={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseUp={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span style={styles.heroBtnText as React.CSSProperties}>匿名进入</span>
        </button>

        <div style={{ height: 12 }} />
        <Tooltip text={TOOLTIP_TEXT}>
          <div style={styles.infoDot as React.CSSProperties}>?</div>
        </Tooltip>
      </div>

      {/* 页脚 */}
      <div style={styles.footerCopy as React.CSSProperties}>Powered by XION</div>
    </div>
  );
};

// ---- 根组件（此页只展示 Landing；点击后先占位提示）----
const App: React.FC = () => {
  const [entered, setEntered] = useState(false);

  useEffect(() => { ensureShimmerCSS(); }, []);

  return (
    <div style={styles.root as React.CSSProperties}>
      {/* 顶部品牌条 */}
      <div style={styles.topBar as React.CSSProperties}>
        <div style={styles.topBrand as React.CSSProperties}>{BRAND}</div>
      </div>

      {/* 页面切换动画容器 */}
      <FadeScale active={!entered}>
        <Landing onEnter={() => setEntered(true)} />
      </FadeScale>

      <FadeScale active={entered}>
        <div style={styles.nextPlaceholder as React.CSSProperties}>
          <div style={styles.nextTitle as React.CSSProperties}>已进入（占位）</div>
          <div style={styles.caption as React.CSSProperties}>接下来我们将按你的步骤实现“主页（搜索+热门导师）”。</div>
        </div>
      </FadeScale>
    </div>
  );
};

export default App;

// ---- 样式 ----
const styles = {
  root: {
    background: "#FFFFFF",
    minHeight: "100vh",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    color: "#111827",
  },
  container: {
    minHeight: "calc(100vh - 48px)",
    background: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  topBar: {
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "1px solid #F3F4F6",
    background: "#FFFFFF",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
  },
  topBrand: { fontSize: 18, fontWeight: 800, letterSpacing: 0.5 },
  centerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 24px",
  },
  // 更大字号 + 与 .mx-shimmer 配合
  brand: { fontSize: 56, fontWeight: 900, letterSpacing: 1 },
  subtitle: { marginTop: 6, fontSize: 14, color: "#6B7280" },
  heroBtn: {
    padding: "14px 28px",
    background: "#0A84FF",
    borderRadius: 28,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 10px 14px rgba(10,132,255,0.20)",
    transition: "opacity 120ms ease-out, transform 120ms ease-out",
  },
  heroBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: 800, letterSpacing: 0.3 },
  infoDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    border: "2px solid #0A84FF",
    color: "#0A84FF",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none" as const,
  },
  // 更新为下方白色浮窗（居中于问号），默认不可点，visible 时恢复
  tooltipContainer: {
    position: "absolute" as const,
    top: 28,
    left: "50%",
    transform: "translate(-50%, 4px)",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    padding: "10px 12px",
    borderRadius: 12,
    width: "min(58vw, 372px)",
    minWidth: 280,
    maxWidth: 372,
    color: "#111827",
    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
    fontSize: 12,
    lineHeight: "18px",
    textAlign: "left" as const,
    overflowWrap: "break-word" as const,
    wordBreak: "break-word" as const,
    whiteSpace: "normal" as const,
  },
  tooltipText: { color: "#111827" },
  footerCopy: { textAlign: "center" as const, color: "#9CA3AF", margin: "16px 0" },
  caption: { color: "#6B7280", fontSize: 12 },
  nextPlaceholder: {
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  nextTitle: { fontSize: 18, fontWeight: 800 },
} as const;

// 额外测试：宽度收窄为当前设置的 2/3 左右（上限 ≤ 380px，最小值 ≤ 300px）
(function runTooltipWidthTest(){
  try{
    const t = (styles as any).tooltipContainer;
    console.assert(t.minWidth <= 300, "Tooltip minWidth should be ≤ 300px (narrowed)");
    console.assert(t.maxWidth <= 380, "Tooltip maxWidth should be ≤ 380px (narrowed)");
  }catch(e){
    console.error("Tooltip width test failed (narrow):", e);
  }
})();
