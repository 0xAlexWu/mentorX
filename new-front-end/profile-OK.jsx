import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * mentorX — Profile（个人中心）
 * ------------------------------------------------------------------
 * 独立页面文件：展示头像（默认“夜行侠”）、XION 区块链地址、
 * CAO 积分余额，以及“备份账户”等功能。
 *
 * 设计语言与 Home 页面保持一致：
 * 白底、圆角、轻阴影、苹果/谷歌式细腻过渡；纯 React + 行内样式，
 * 不依赖外部样式/库，便于直接打包使用。
 * ------------------------------------------------------------------
 * 用法示例：
 * <Profile
 *   address="xion1q....xyz"
 *   caoPoints={1280}
 *   privateKey="0xYOUR_PRIVATE_KEY"
 *   avatarUrl={undefined} // 如提供 URL 将显示图片头像
 *   displayName="夜行侠"
 *   onNavigateHome={() => console.log('go home')}
 * />
 */

// --- 注入少量全局动画样式，保持与首页一致的动效语感 ---
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0) } 100% { transform: rotate(360deg) } }
  .focus-ring:focus { outline: none; box-shadow: 0 0 0 3px rgba(10,132,255,0.12) }
`;
if (!document.head.querySelector('style[data-profile-style]')) {
  styleSheet.setAttribute('data-profile-style', '1');
  document.head.appendChild(styleSheet);
}

// ---------------------- Props & Helpers ----------------------

type ProfileProps = {
  address?: string;                // XION 地址
  caoPoints?: number;              // CAO 积分余额
  privateKey?: string;             // 明文私钥（仅在需要展示/导出时传入）
  avatarUrl?: string;              // 自定义头像
  displayName?: string;            // 显示昵称（默认“夜行侠”）
  onNavigateHome?: () => void;     // 底部导航：回到主页
};

const shorten = (s?: string, head = 6, tail = 4) => !s ? '' : (s.length <= head + tail + 3 ? s : `${s.slice(0, head)}...${s.slice(-tail)}`);

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // 兜底：创建临时 textarea
    try {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
};

// ---------------------- 轻提示 Toast ----------------------

const Toast: React.FC<{ text: string; visible: boolean }> = ({ text, visible }) => {
  if (!visible) return null;
  return (
    <div style={styles.toast as React.CSSProperties}>
      {text}
    </div>
  );
};

// ---------------------- 简易模态框 ----------------------

const Modal: React.FC<{ open: boolean; onClose: ()=>void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <div style={styles.modalBackdrop as React.CSSProperties} onClick={onClose} />
      <div style={styles.modal as React.CSSProperties}>
        {children}
      </div>
    </>
  );
};

// ---------------------- 主组件 ----------------------

const Profile: React.FC<ProfileProps> = ({
  address = 'xion1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  caoPoints = 0,
  privateKey,
  avatarUrl,
  displayName = '夜行侠',
  onNavigateHome,
}) => {
  const [toast, setToast] = useState<string>('');
  const [toastVisible, setToastVisible] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [ack, setAck] = useState(false);
  const [revealed, setRevealed] = useState(false);

  // Toast 2 秒后自动隐藏
  useEffect(() => {
    if (!toast) return;
    setToastVisible(true);
    const t = setTimeout(() => setToastVisible(false), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (t: string) => setToast(t);

  const doCopyAddress = async () => {
    const ok = await copyToClipboard(address);
    showToast(ok ? '地址已复制' : '复制失败');
  };

  const doCopyPK = async () => {
    if (!privateKey) { showToast('未提供私钥'); return; }
    const ok = await copyToClipboard(privateKey);
    showToast(ok ? '私钥已复制（请妥善保管）' : '复制失败');
  };

  const doExportPK = () => {
    if (!privateKey) { showToast('未提供私钥'); return; }
    const blob = new Blob([
      `# XION Private Key Backup\n# 导入钱包前请确认来源可信，切勿泄露给任何人。\n\n${privateKey}\n`
    ], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `xion_private_key_backup_${Date.now()}.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('已导出 .txt 文件');
  };

  return (
    <div style={styles.root as React.CSSProperties}>
      {/* 顶部栏 */}
      <div style={styles.topBar as React.CSSProperties}>
        <div style={styles.topBrand as React.CSSProperties}>Profile</div>
      </div>

      {/* 头像卡片 */}
      <div style={styles.section as React.CSSProperties}>
        <div style={styles.card as React.CSSProperties}>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" style={styles.avatarImg as React.CSSProperties} />
            ) : (
              <div style={styles.avatar as React.CSSProperties} title={displayName}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF' }}>夜</span>
              </div>
            )}
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color:'#111827' }}>{displayName}</div>
              <div style={{ fontSize: 12, color:'#6B7280', marginTop:4 }}>匿名、客观、可留存 · on XION</div>
            </div>
          </div>
        </div>
      </div>

      {/* 地址卡片 */}
      <div style={styles.section as React.CSSProperties}>
        <div style={styles.card as React.CSSProperties}>
          <div style={styles.cardHeader as React.CSSProperties}>
            <div style={styles.cardTitle as React.CSSProperties}>XION 区块链地址</div>
            <button style={styles.chipBtn as React.CSSProperties} className="focus-ring" onClick={doCopyAddress}>复制</button>
          </div>
          <div style={{ marginTop:8, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize:14, color:'#111827' }}>
            {shorten(address, 10, 8)}
          </div>
        </div>
      </div>

      {/* 积分卡片 */}
      <div style={styles.section as React.CSSProperties}>
        <div style={styles.card as React.CSSProperties}>
          <div style={styles.cardHeader as React.CSSProperties}>
            <div style={styles.cardTitle as React.CSSProperties}>CAO 积分余额</div>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:8 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color:'#0A84FF' }}>{caoPoints}</div>
            <div style={{ fontSize: 12, color:'#6B7280' }}>points</div>
          </div>
        </div>
      </div>

      {/* 备份账户（导出私钥） */}
      <div style={styles.section as React.CSSProperties}>
        <div style={{ ...styles.card as React.CSSProperties }}>
          <div style={styles.cardHeader as React.CSSProperties}>
            <div style={styles.cardTitle as React.CSSProperties}>备份账户（导出私钥）</div>
          </div>

          <div style={styles.warnBox as React.CSSProperties}>
            <div style={{ fontSize:14, color:'#92400E' }}>⚠️ 重要安全提示</div>
            <div style={{ fontSize:12, color:'#B45309', marginTop:6, lineHeight:'18px' }}>
              私钥是您在不同设备之间恢复mentorX账户的唯一钥匙。私钥若遭泄露，他人即可完全控制您的mentorX账户。请仅在离线或安全环境下备份，切勿上传到云端或发送给他人。
            </div>
          </div>

          {/* 明文区域 */}
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:12, color:'#6B7280', marginBottom:6 }}>私钥</div>
            <div style={styles.secretBox as React.CSSProperties}>
              <span style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace', fontSize:14, color:'#111827' }}>
                {revealed ? (privateKey || '（未提供）') : '•••• •••• •••• •••• •••• ••••'}
              </span>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  className="focus-ring"
                  style={{ ...styles.ghostBtn as React.CSSProperties, minWidth:72 }}
                  onClick={() => setRevealOpen(true)}
                >{revealed ? '隐藏' : '显示'}</button>
                <button
                  className="focus-ring"
                  style={{ ...styles.ghostBtn as React.CSSProperties, minWidth:72 }}
                  onClick={doCopyPK}
                >复制</button>
              </div>
            </div>
            <button
              className="focus-ring"
              style={{ ...styles.primaryBtn as React.CSSProperties, marginTop:10 }}
              onClick={doExportPK}
            >导出为 .txt</button>
          </div>
        </div>
      </div>

      {/* 底部三按钮（与首页一致，但当前高亮 Profile） */}
      <div style={styles.tabBar as React.CSSProperties}>
        <button style={{ ...(styles.tabItem as any), opacity: 0.5, cursor:'not-allowed' }} title="圈子（稍后提供）">
          <div style={styles.tabIcon as React.CSSProperties}>◎</div>
          <div style={styles.tabLabel as React.CSSProperties}>圈子</div>
        </button>
        <button style={{ ...(styles.tabItem as any) }} onClick={onNavigateHome}>
          <div style={{ ...(styles.tabIcon as any), color:'#9CA3AF' }}>⌂</div>
          <div style={{ ...(styles.tabLabel as any) }}>主页</div>
        </button>
        <button style={{ ...(styles.tabItem as any) }}>
          <div style={{ ...(styles.tabIcon as any), color:'#0A84FF' }}>☻</div>
          <div style={{ ...(styles.tabLabel as any), color:'#0A84FF', fontWeight:700 }}>Profile</div>
        </button>
      </div>

      {/* Reveal 确认弹窗 */}
      <Modal open={revealOpen} onClose={() => { setRevealOpen(false); setAck(false); }}>
        <div style={{ fontSize:18, fontWeight:800, color:'#111827' }}>安全确认</div>
        <div style={{ fontSize:13, color:'#6B7280', marginTop:8, lineHeight:'20px' }}>
          即将显示您的明文私钥。请确保周围无人、无屏幕录制，且网络环境安全。
        </div>
        <label style={{ display:'flex', gap:8, alignItems:'center', marginTop:12 }}>
          <input type="checkbox" checked={ack} onChange={(e)=>setAck(e.target.checked)} />
          <span style={{ fontSize:13, color:'#374151' }}>我已知晓并愿意自行承担风险</span>
        </label>
        <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:16 }}>
          <button className="focus-ring" style={styles.cancelBtn as React.CSSProperties} onClick={() => { setRevealOpen(false); setAck(false); }}>取消</button>
          <button
            className="focus-ring"
            style={{ ...(styles.primaryBtn as React.CSSProperties), opacity: ack ? 1 : 0.6, cursor: ack ? 'pointer' : 'not-allowed' }}
            disabled={!ack}
            onClick={() => { setRevealed(v => !v); setRevealOpen(false); setAck(false); }}
          >{revealed ? '隐藏' : '显示明文'}</button>
        </div>
      </Modal>

      {/* Toast */}
      <Toast text={toast} visible={toastVisible} />
    </div>
  );
};

export default Profile;

// ---------------------- 样式 ----------------------

const styles = {
  root: {
    background: '#FFFFFF',
    minHeight: '100vh',
    paddingBottom: 80,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    color: '#111827',
  },
  topBar: {
    height: 48,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderBottom: '1px solid #F3F4F6', background: '#FFFFFF', position: 'sticky' as const, top: 0, zIndex: 10,
  },
  topBrand: { fontSize: 18, fontWeight: 800, letterSpacing: 0.5 },

  section: { padding: '16px 16px 0' },
  card: {
    background:'#FFFFFF', border: '1px solid #F3F4F6', borderRadius: 16, padding: 16,
    boxShadow: '0 8px 16px rgba(0,0,0,0.04)'
  },
  cardHeader: { display:'flex', alignItems:'center', justifyContent:'space-between' },
  cardTitle: { fontSize: 14, fontWeight: 700, color:'#111827' },

  avatar: {
    width: 48, height: 48, borderRadius: '50%', background: '#0A84FF',
    display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 10px rgba(10,132,255,0.25)'
  },
  avatarImg: { width: 48, height: 48, borderRadius: '50%', objectFit:'cover', border:'2px solid #E5E7EB' },

  chipBtn: {
    background:'#F3F4F6', border:'1px solid #E5E7EB', borderRadius: 999, padding:'6px 10px', fontSize:12,
    color:'#374151', cursor:'pointer'
  },

  warnBox: {
    background:'#FEF3C7', border:'1px solid #FDE68A', borderRadius: 12, padding: 12, marginTop: '0.5cm',
  },

  secretBox: {
    display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
    border:'1px solid #E5E7EB', borderRadius: 12, padding:'10px 12px', background:'#F9FAFB'
  },

  ghostBtn: {
    background:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius: 10, padding:'8px 12px', fontSize:12, cursor:'pointer'
  },
  primaryBtn: {
    background:'#0A84FF', border:'none', borderRadius: 12, padding:'10px 16px', color:'#FFFFFF', fontSize:14, fontWeight:700, cursor:'pointer'
  },
  cancelBtn: {
    background:'#F3F4F6', border:'none', borderRadius: 10, padding:'8px 12px', color:'#6B7280', fontSize:12, fontWeight:700, cursor:'pointer'
  },

  // Modal
  modalBackdrop: { position:'fixed' as const, inset:0, background:'rgba(17,24,39,0.35)', zIndex:1000 },
  modal: {
    position:'fixed' as const, left:16, right:16, top:'50%', transform:'translateY(-50%)',
    background:'#FFFFFF', borderRadius:16, padding:16, border:'1px solid #F3F4F6', zIndex:1001,
    boxShadow:'0 10px 16px rgba(0,0,0,0.08)'
  },

  // Toast
  toast: {
    position:'fixed' as const, left:'50%', bottom:86, transform:'translateX(-50%)',
    background:'#111827', color:'#FFFFFF', borderRadius:12, padding:'8px 12px', fontSize:12, zIndex:1100,
    boxShadow:'0 8px 16px rgba(0,0,0,0.15)'
  },

  // bottom bar
  tabBar: {
    position:'fixed' as const, left:0, right:0, bottom:0, height:56, display:'flex', background:'#FFFFFF',
    borderTop:'1px solid #F3F4F6', zIndex:1002
  },
  tabItem: { flex:1, background:'transparent', border:'none', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 },
  tabIcon: { fontSize:16, color:'#9CA3AF' },
  tabLabel: { fontSize:11, color:'#9CA3AF' },
} as const;
