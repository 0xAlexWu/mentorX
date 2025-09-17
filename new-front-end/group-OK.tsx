import React, { useEffect, useRef, useState } from "react";

/**
 * mentorX — Circles Joined（加入成功后的圈子界面）单文件 TSX
 * ------------------------------------------------------------------
 * 仅包含“加入成功后的页面”——圈子树洞（不含验证流程）。
 * 风格与主页一致：白底、圆角、轻阴影、蓝色主色（#0A84FF）。
 * 默认学校为 MIT（如需接入路由/参数再传入实际学校）。
 * ------------------------------------------------------------------
 */

// ---------- 动画样式注入 ----------
function ensureGlobalCSS() {
  if (typeof document === 'undefined') return;
  const id = 'mx-circles-joined-style';
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `
    @keyframes fadeInUp {
      0% { opacity: 0; transform: translateY(6px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ---------- 数据模型 & 例子 ----------

type Post = { id: string; user: string; text: string; ts: number; school: string };

const DEFAULT_SCHOOL = 'MIT';

const seedPosts: Record<string, Post[]> = {
  'MIT': [
    { id: uid(), user: '匿名学⽣-7Q', text: '6.824 作业硬核但收获很大，大家互相加油～', ts: Date.now() - 1000 * 60 * 45, school: 'MIT' },
    { id: uid(), user: '匿名学⽣-MM', text: '校图书馆新开通了数据库访问，记得试试！', ts: Date.now() - 1000 * 60 * 120, school: 'MIT' },
  ],
  'Stanford University': [
    { id: uid(), user: '匿名学⽣-G9', text: 'CS229 的project想找人组队，擅长PyTorch的来～', ts: Date.now() - 1000 * 60 * 60 * 5, school: 'Stanford University' },
  ],
};

// ---------- 工具函数 ----------

function uid() { return Math.random().toString(36).slice(2); }

function formatTime(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
}

function canPostText(s: string) {
  const n = s.trim().length;
  return n > 0 && n <= 500;
}

// ---------- 轻量测试（不要删除） ----------
(function runJoinedTests(){
  try {
    console.assert(canPostText(' hi ') === true, '去除空白后非空应允许发帖');
    console.assert(canPostText('') === false, '空文本不应允许发帖');
    console.assert(canPostText('x'.repeat(501)) === false, '超过 500 字不应允许发帖');
    console.assert(/天前$/.test(formatTime(Date.now() - 3*24*60*60*1000)), '3 天前断言');
    const before = 2; const after = addPostTest(before);
    console.assert(after === before + 1, 'addPost 应该追加 1 条帖子');
  } catch(e) { console.error('Joined page tests failed:', e); }
})();

function addPostTest(n: number){ const arr: Post[] = Array.from({length:n}).map((_,i)=>({id:String(i), user:'u', text:'x', ts:Date.now(), school:DEFAULT_SCHOOL})); const next = [{id:'z', user:'u', text:'y', ts:Date.now(), school:DEFAULT_SCHOOL}, ...arr]; return next.length; }

// ---------- 小组件 ----------

const FadeWrap: React.FC<{ show: boolean; children: React.ReactNode }> = ({ show, children }) => {
  const ref = useRef<HTMLDivElement|null>(null);
  const [mounted, setMounted] = useState(show);
  useEffect(()=>{ if (show) setMounted(true); }, [show]);
  useEffect(()=>{
    const el = ref.current; if(!el) return;
    el.style.transition = 'opacity 220ms cubic-bezier(0.22,0.61,0.36,1), transform 220ms cubic-bezier(0.22,0.61,0.36,1)';
    el.style.opacity = show ? '1' : '0';
    el.style.transform = show ? 'scale(1)' : 'scale(0.98)';
    if (!show) { const t = setTimeout(()=>setMounted(false), 220); return ()=>clearTimeout(t); }
  },[show]);
  if (!mounted) return null;
  return <div ref={ref} style={{ opacity: 0, transform:'scale(0.98)' }}>{children}</div>;
};

// 成功加入后的欢迎浮层（对话框）
const WelcomeOverlay: React.FC<{ school: string; nick: string; onClose: () => void }> = ({ school, nick, onClose }) => {
  return (
    <div role="dialog" aria-modal style={styles.welcomeBackdrop as React.CSSProperties} onClick={onClose}>
      <div style={styles.welcomeCard as React.CSSProperties} onClick={(e)=>e.stopPropagation()}>
        <div style={styles.checkIcon as React.CSSProperties}>✓</div>
        <div style={styles.welcomeTitle as React.CSSProperties}>已加入 {school} 圈子</div>
        <div style={styles.welcomeSub as React.CSSProperties}>你的匿名身份 <b>{nick}</b> 已就绪</div>
        <ul style={styles.welcomeList as React.CSSProperties}>
          <li>友善交流，尊重事实</li>
          <li>客观理性，拒绝人身攻击</li>
          <li>不泄露任何可识别个人信息</li>
        </ul>
        <button onClick={onClose} style={styles.primaryBtn as React.CSSProperties}>
          <span style={styles.primaryBtnText as React.CSSProperties}>开始发帖</span>
        </button>
      </div>
    </div>
  );
};

// ---------- 主界面（仅加入成功后的树洞） ----------

const CirclesJoined: React.FC = () => {
  const [school] = useState<string>(DEFAULT_SCHOOL);
  const [posts, setPosts] = useState<Post[]>(() => seedPosts[school] ? [...seedPosts[school]] : []);
  const [text, setText] = useState('');
  const [nick] = useState(() => `夜行侠-${Math.random().toString(36).slice(2,6)}`);
  const [showWelcome, setShowWelcome] = useState(true); // 初次进入显示欢迎层

  useEffect(()=>{ ensureGlobalCSS(); },[]);

  const canPost = canPostText(text);

  return (
    <div style={styles.root as React.CSSProperties}>
      {/* Top Bar */}
      <div style={styles.topBar as React.CSSProperties}>
        <div style={styles.topBrand as React.CSSProperties}>mentorX</div>
      </div>

      {/* Header */}
      <div style={styles.circleHeader as React.CSSProperties}>
        <div style={styles.circleTitle as React.CSSProperties}>{school}</div>
        <div style={styles.circleSub as React.CSSProperties}>匿名树洞 · 你的发言将以隐私身份 <b>{nick}</b> 展示</div>
      </div>

      {/* Composer */}
      <div style={styles.composer as React.CSSProperties}>
        <textarea
          value={text}
          onChange={(e)=>setText(e.target.value)}
          placeholder="聊聊课程、选课、社团、生活……保持友善与客观"
          style={styles.textarea as React.CSSProperties}
        />
        <div style={styles.composerBar as React.CSSProperties}>
          <div style={styles.counter as React.CSSProperties}>{text.trim().length} / 500</div>
          <button
            onClick={()=>{
              if(!canPost) return;
              const p: Post = { id: uid(), user: nick, text: text.trim(), ts: Date.now(), school };
              setPosts(prev => [p, ...prev]);
              setText('');
            }}
            style={{ ...(styles.primaryBtn as any), opacity: canPost ? 1 : 0.6, cursor: canPost ? 'pointer' : 'not-allowed' }}
            disabled={!canPost}
          >
            <span style={styles.primaryBtnText as React.CSSProperties}>发表</span>
          </button>
        </div>
      </div>

      {/* Posts */}
      <div style={styles.list as React.CSSProperties}>
        {posts.map(p => (
          <div key={p.id} style={styles.postCard as React.CSSProperties}>
            <div style={styles.postHead as React.CSSProperties}>
              <span style={styles.postUser as React.CSSProperties}>{p.user}</span>
              <span style={styles.postTime as React.CSSProperties}>{formatTime(p.ts)}</span>
            </div>
            <div style={styles.postText as React.CSSProperties}>{p.text}</div>
          </div>
        ))}
        {posts.length === 0 ? (
          <div style={styles.empty as React.CSSProperties}>圈子里还没有内容，来发第一条吧～</div>
        ) : null}
      </div>

      {/* 欢迎浮层 */}
      <FadeWrap show={showWelcome}>
        {showWelcome ? <WelcomeOverlay school={school} nick={nick} onClose={()=>setShowWelcome(false)} /> : null}
      </FadeWrap>

      {/* Bottom Bar */}
      <div style={styles.tabBar as React.CSSProperties}>
        <button style={{ ...(styles.tabItem as any) }}>
          <div style={{ ...(styles.tabIcon as any), color:'#0A84FF' }}>◎</div>
          <div style={{ ...(styles.tabLabel as any), color:'#0A84FF', fontWeight:700 }}>圈子</div>
        </button>
        <button style={{ ...(styles.tabItem as any), opacity: 0.5, cursor:'not-allowed' }} title="主页（另见 Home 文件）">
          <div style={styles.tabIcon as React.CSSProperties}>⌂</div>
          <div style={styles.tabLabel as React.CSSProperties}>主页</div>
        </button>
        <button style={{ ...(styles.tabItem as any), opacity: 0.5, cursor:'not-allowed' }} title="Profile（稍后提供）">
          <div style={styles.tabIcon as React.CSSProperties}>☻</div>
          <div style={styles.tabLabel as React.CSSProperties}>Profile</div>
        </button>
      </div>
    </div>
  );
};

export default CirclesJoined;

// ---------- 样式 ----------

const styles = {
  root: {
    background: '#FFFFFF',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    color: '#111827',
    padding: '0 16px 96px',
  },
  topBar: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #F3F4F6',
    background: '#FFFFFF',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    margin: '0 -16px',
  },
  topBrand: { fontSize: 18, fontWeight: 800, letterSpacing: 0.5 },

  circleHeader: { maxWidth: 720, margin: '12px auto' },
  circleTitle: { fontSize: 20, fontWeight: 900, letterSpacing: 0.3, color: '#111827' },
  circleSub: { marginTop: 4, color: '#6B7280', fontSize: 12 },

  composer: { maxWidth: 720, margin: '8px auto', background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 16, padding: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.05)' },
  textarea: { width: '100%', minHeight: 96, border: '1px solid #E5E7EB', borderRadius: 12, padding: 12, outline: 'none', resize: 'vertical' as const, fontFamily: 'inherit', background: '#FFFFFF', fontSize: 14 },
  composerBar: { marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  counter: { color: '#9CA3AF', fontSize: 12 },

  list: { maxWidth: 720, margin: '12px auto 0' },
  postCard: { background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 16, padding: 12, margin: '10px 0', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' },
  postHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  postUser: { fontWeight: 700, color: '#111827', fontSize: 13 },
  postTime: { color: '#9CA3AF', fontSize: 12 },
  postText: { marginTop: 8, color: '#111827', lineHeight: '20px', whiteSpace: 'pre-wrap' as const, wordBreak: 'break-word' as const },
  empty: { textAlign: 'center' as const, color: '#6B7280', marginTop: 24, fontSize: 13 },

  // 欢迎浮层
  welcomeBackdrop: { position: 'fixed' as const, inset: 0, background: 'rgba(17,24,39,0.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 1100 },
  welcomeCard: { width:'100%', maxWidth: 520, background:'#FFFFFF', border:'1px solid #F3F4F6', borderRadius: 16, padding: 20, boxShadow:'0 12px 24px rgba(0,0,0,0.08)', animation:'fadeInUp 220ms ease-out' },
  checkIcon: { width: 48, height: 48, borderRadius: 24, border:'2px solid #10B981', color:'#10B981', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, margin:'0 auto 12px', fontSize: 24 },
  welcomeTitle: { textAlign:'center' as const, fontSize:18, fontWeight:900, color:'#111827' },
  welcomeSub: { textAlign:'center' as const, color:'#6B7280', fontSize:12, marginTop:4 },
  welcomeList: { marginTop: 10, marginBottom: 6, color:'#374151', fontSize:12, lineHeight:'20px' },

  // Bottom Bar
  tabBar: { position: 'fixed' as const, left: 0, right: 0, bottom: 0, height: 56, display: 'flex', background: '#FFFFFF', borderTop: '1px solid #F3F4F6', zIndex: 1002, margin: '0 -16px' },
  tabItem: { flex: 1, background:'transparent', border:'none', display:'flex', flexDirection:'column' as const, alignItems:'center', justifyContent:'center', gap:2 },
  tabIcon: { fontSize: 16, color: '#9CA3AF' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
} as const;
