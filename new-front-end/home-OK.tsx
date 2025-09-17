import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * mentorX — HomeOnly（搜索导师 + 热搜导师 + 详情 + Create New + 底部导航）
 * ------------------------------------------------------------------
 * 仅包含"第二页"主页；没有 Landing。默认导出 Home 组件。
 * 纯 React（DOM）+ 行内样式，避免外部依赖导致的打包问题。
 * 风格：白底、圆角、轻阴影、丝滑过渡；简洁易用，贴近 Apple/Google 质感。
 * ------------------------------------------------------------------
 */

// 添加CSS动画样式
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes scrollCards {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  
  @keyframes wordFade {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes wordFadeIn {
    0% { opacity: 0; transform: translateY(-10px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  /* 搜索框聚焦效果 */
  .search-input:focus {
    border-color: #0A84FF !important;
    box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.1) !important;
    background: #FFFFFF !important;
  }
  
  /* 下拉框项目悬停效果 */
  .dropdown-item:hover {
    background-color: #F9FAFB !important;
  }
  
  /* 加载动画 */
  .loading-spinner {
    animation: spin 1s linear infinite;
  }
  
  /* 成功提示动画 */
  .success-overlay {
    animation: fadeIn 0.3s ease-out;
  }
  
  /* 文字渐变动画 */
  .word-fade {
    animation: wordFade 1.2s ease-in-out;
  }
  
  /* 文字渐现动画 */
  .word-fade-in {
    animation: wordFadeIn 0.5s ease-out;
  }
  
`;
document.head.appendChild(styleSheet);

// ---------------------- 类型与数据 ----------------------

type Review = { id: string; user: string; text: string; rating: number };

type Mentor = {
  id: string;
  name: string;
  school: string;
  courses: string[];
  reviews: Review[];
};

const initialMentors: Mentor[] = [
  {
    id: "m1",
    name: "Dr. Alice Chen",
    school: "Stanford University",
    courses: ["CS229: Machine Learning", "CS224N: NLP"],
    reviews: [
      { id: "r1", user: "匿名学⽣A", text: "讲课清晰，作业有挑战。", rating: 5 },
      { id: "r2", user: "匿名学⽣B", text: "办公时间很耐心。", rating: 4 },
    ],
  },
  {
    id: "m2",
    name: "Prof. Michael Zhang",
    school: "University of California, Berkeley",
    courses: ["EECS 70: Discrete Math", "CS 188: AI"],
    reviews: [
      { id: "r3", user: "匿名学⽣C", text: "考试偏难，但收获大。", rating: 4 },
      { id: "r4", user: "匿名学⽣D", text: "项目很实战。", rating: 5 },
    ],
  },
  {
    id: "m3",
    name: "Dr. Sofia Rivera",
    school: "MIT",
    courses: ["6.824: Distributed Systems", "6.006: Algorithms"],
    reviews: [
      { id: "r5", user: "匿名学⽣E", text: "节奏较快，建议预习。", rating: 4 },
    ],
  },
  {
    id: "m4",
    name: "Prof. David Kim",
    school: "Harvard University",
    courses: ["CS50: Introduction to Computer Science", "CS161: Algorithms"],
    reviews: [
      { id: "r6", user: "匿名学⽣F", text: "课程设计很棒，老师很专业。", rating: 5 },
      { id: "r7", user: "匿名学⽣G", text: "作业难度适中，很有收获。", rating: 4 },
    ],
  },
  {
    id: "m5",
    name: "Dr. Emma Wilson",
    school: "Oxford University",
    courses: ["CS101: Programming Fundamentals", "CS201: Data Structures"],
    reviews: [
      { id: "r8", user: "匿名学⽣H", text: "讲解详细，适合初学者。", rating: 5 },
    ],
  },
  {
    id: "m6",
    name: "Prof. James Liu",
    school: "Tsinghua University",
    courses: ["CS106A: Programming Methodology", "CS229: Machine Learning"],
    reviews: [
      { id: "r9", user: "匿名学⽣I", text: "课程内容丰富，老师经验丰富。", rating: 4 },
      { id: "r10", user: "匿名学⽣J", text: "项目实践性强。", rating: 5 },
    ],
  },
  {
    id: "m7",
    name: "Dr. Maria Garcia",
    school: "ETH Zurich",
    courses: ["CS107: Computer Systems", "CS161: Algorithms"],
    reviews: [
      { id: "r11", user: "匿名学⽣K", text: "系统性强，逻辑清晰。", rating: 4 },
    ],
  },
  {
    id: "m8",
    name: "Prof. Robert Brown",
    school: "Cambridge University",
    courses: ["CS110: Principles of Computer Systems", "CS229: Machine Learning"],
    reviews: [
      { id: "r12", user: "匿名学⽣L", text: "理论与实践结合得很好。", rating: 5 },
      { id: "r13", user: "匿名学⽣M", text: "老师很耐心，答疑及时。", rating: 4 },
    ],
  },
  {
    id: "m9",
    name: "Dr. Lisa Wang",
    school: "Peking University",
    courses: ["CS106B: Programming Abstractions", "CS161: Algorithms"],
    reviews: [
      { id: "r14", user: "匿名学⽣N", text: "课程设计合理，循序渐进。", rating: 5 },
    ],
  },
  {
    id: "m10",
    name: "Prof. Thomas Anderson",
    school: "Caltech",
    courses: ["CS124: From Languages to Information", "CS229: Machine Learning"],
    reviews: [
      { id: "r15", user: "匿名学⽣O", text: "内容前沿，很有启发性。", rating: 4 },
      { id: "r16", user: "匿名学⽣P", text: "作业有挑战性，但很有价值。", rating: 5 },
    ],
  },
];

// ---------------------- 工具函数 ----------------------

const uid = () => Math.random().toString(36).slice(2);

const avgRating = (m: Mentor) => {
  if (!m.reviews.length) return 0;
  const s = m.reviews.reduce((a, b) => a + b.rating, 0);
  return Math.round((s / m.reviews.length) * 10) / 10;
};

function filterMentors(list: Mentor[], q: string) {
  const k = q.trim().toLowerCase();
  if (!k) return list;
  return list.filter(
    (m) =>
      m.name.toLowerCase().includes(k) ||
      m.school.toLowerCase().includes(k) ||
      m.courses.some((c) => c.toLowerCase().includes(k))
  );
}

// ---------------------- 运行时轻量测试（不要删除） ----------------------
(function runModelTests() {
  try {
    console.assert(
      avgRating({ id: "x", name: "", school: "", courses: [], reviews: [] }) === 0,
      "avgRating 空数组应为 0"
    );
    const m: Mentor = {
      id: "y",
      name: "",
      school: "",
      courses: [],
      reviews: [
        { id: "1", user: "u", text: "", rating: 5 },
        { id: "2", user: "u", text: "", rating: 4 },
      ],
    };
    console.assert(avgRating(m) === 4.5, "avgRating 期望 4.5");
  } catch (e) {
    console.error("Model tests failed:", e);
  }
})();

(function runFilterTests() {
  try {
    const list = initialMentors;
    // 空查询返回全部
    const r0 = filterMentors(list, "");
    console.assert(r0.length === list.length, "空查询应返回全部");
    // 学校命中（MIT）
    const r1 = filterMentors(list, "mit");
    console.assert(r1.some((m) => m.school === "MIT"), "应能通过学校命中 MIT");
    // 课程命中（CS229）
    const r2 = filterMentors(list, "cs229");
    console.assert(r2.some((m) => m.courses.some((c) => /cs229/i.test(c))), "应能通过课程命中 CS229");
    // 学校命中（Berkeley）
    const r3 = filterMentors(list, "berkeley");
    console.assert(r3.some((m) => /berkeley/i.test(m.school)), "应能通过学校命中 Berkeley");
  } catch (e) {
    console.error("Filter tests failed:", e);
  }
})();

// ---------------------- UI 小组件 ----------------------

// 轮播文字组件
const RotatingText: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFadeIn, setShowFadeIn] = useState(false);
  
  const words = ['anonymous', 'objective', 'permanent', 'on XION'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setIsAnimating(false);
        setShowFadeIn(true);
        // 渐现动画完成后重置
        setTimeout(() => setShowFadeIn(false), 500);
      }, 600); // 动画持续时间的一半
    }, 2000); // 每2秒切换一次
    
    return () => clearInterval(interval);
  }, [words.length]);
  
  const currentWord = words[currentIndex];
  
  return (
    <div style={styles.rotatingTextContainer as React.CSSProperties}>
      <span style={styles.brandPrefix as React.CSSProperties}>mentorX is</span>
      <div style={styles.wordContainer as React.CSSProperties}>
        <span 
          className={`${isAnimating ? 'word-fade' : ''} ${showFadeIn ? 'word-fade-in' : ''}`}
          style={styles.rotatingWord as React.CSSProperties}
        >
          {currentWord}
        </span>
      </div>
    </div>
  );
};

// 数字评分气泡（替代星星）
const ScorePill: React.FC<{ value: number; size?: "sm" | "md" }> = ({ value, size = "md" }) => {
  const fontSize = size === "sm" ? 12 : 14;
  const pad = size === "sm" ? "4px 8px" : "6px 10px";
  const v = typeof value === "number" ? Math.round(value * 10) / 10 : 0;
  return (
    <span
      style={{
        display: "inline-block",
        padding: pad,
        borderRadius: 999,
        border: "1px solid #E5E7EB",
        background: "#FFFFFF",
        color: "#0A84FF",
        fontWeight: 700,
        fontSize,
        minWidth: 56,
        textAlign: "center" as const,
      }}
    >
      {v} / 5
    </span>
  );
};

const StarPicker: React.FC<{ value: number; onChange: (n:number)=>void }> = ({ value, onChange }) => {
  const options = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  
  return (
    <div style={styles.sliderContainer as React.CSSProperties}>
      <div style={styles.sliderTrack as React.CSSProperties}>
        <div 
          style={{
            ...styles.sliderThumb as React.CSSProperties,
            left: `${(value / 5) * 100}%`,
            transform: 'translateX(-50%)',
          }}
        />
        <div 
          style={{
            ...styles.sliderProgress as React.CSSProperties,
            width: `${(value / 5) * 100}%`,
          }}
        />
      </div>
      <div style={styles.sliderLabels as React.CSSProperties}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            style={{
              ...styles.sliderLabel as React.CSSProperties,
              color: value === option ? '#0A84FF' : '#6B7280',
              fontWeight: value === option ? 600 : 400,
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// 搜索下拉框组件
const SearchDropdown: React.FC<{ 
  mentors: Mentor[]; 
  visible: boolean; 
  onSelect: (mentor: Mentor) => void;
  onClose: () => void;
}> = ({ mentors, visible, onSelect, onClose }) => {
  if (!visible || mentors.length === 0) return null;
  
  return (
    <>
      <div onClick={onClose} style={styles.dropdownBackdrop as React.CSSProperties} />
      <div style={styles.searchDropdown as React.CSSProperties}>
        {mentors.slice(0, 5).map(mentor => (
          <button
            key={mentor.id}
            className="dropdown-item"
            onClick={() => onSelect(mentor)}
            style={styles.dropdownItem as React.CSSProperties}
          >
            <div style={styles.dropdownItemName as React.CSSProperties}>{mentor.name}</div>
            <div style={styles.dropdownItemSchool as React.CSSProperties}>{mentor.school}</div>
            <div style={styles.dropdownItemCourses as React.CSSProperties}>
              {mentor.courses.slice(0, 2).join(' · ')}
            </div>
          </button>
        ))}
        {mentors.length > 5 && (
          <div style={styles.dropdownMore as React.CSSProperties}>
            还有 {mentors.length - 5} 位导师...
          </div>
        )}
      </div>
    </>
  );
};


const Backdrop: React.FC<{ visible: boolean; onClose: ()=>void }> = ({ visible, onClose }) => (
  visible ? <div onClick={onClose} style={styles.modalBackdrop as React.CSSProperties} /> : null
);

const BottomSheet: React.FC<{ visible: boolean; children: React.ReactNode }> = ({ visible, children }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(()=>{
    const el = ref.current; if (!el) return;
    el.style.transition = 'transform 240ms cubic-bezier(0.22,0.61,0.36,1)';
    el.style.transform = visible ? 'translateY(0)' : 'translateY(24px)';
  },[visible]);
  if(!visible) return null;
  return <div ref={ref} style={styles.sheet as React.CSSProperties}>{children}</div>;
};

const MentorDetailSheet: React.FC<{ mentor: Mentor|null; visible: boolean; onClose: ()=>void; onAdd: (r: Review)=>void }> = ({ mentor, visible, onClose, onAdd }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(()=>{ 
    if(visible){ 
      setText(''); 
      setRating(5);
      setIsSubmitting(false);
      setShowSuccess(false);
    } 
  },[visible]);
  if(!mentor) return null;
  return (
    <>
      <Backdrop visible={visible} onClose={onClose} />
      <BottomSheet visible={visible}>
        <div style={{ width:44, height:4, background:'#E5E7EB', borderRadius:2, margin:'0 auto 12px' }} />
        <div style={{ paddingBottom: 100 }}>
          <div style={styles.sheetTitle as React.CSSProperties}>{mentor.name}</div>
          <div style={styles.sheetSub as React.CSSProperties}>{mentor.school}</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:6 }}>
            <ScorePill value={avgRating(mentor)} />
            <span style={styles.caption as React.CSSProperties}>（{mentor.reviews.length} 条评价）</span>
          </div>

          <div style={{ marginTop:16 }}>
            <div style={styles.sectionTitle as React.CSSProperties}>课程</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {mentor.courses.map(c => (
                <span key={c} style={styles.pill as React.CSSProperties}>{c}</span>
              ))}
            </div>
          </div>

          <div style={{ marginTop:16 }}>
            <div style={styles.sectionTitle as React.CSSProperties}>学生评价</div>
            {mentor.reviews.map(r => (
              <div key={r.id} style={styles.reviewItem as React.CSSProperties}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={styles.reviewUser as React.CSSProperties}>{r.user}</span>
                  <ScorePill value={r.rating} size="sm" />
                </div>
                <div style={styles.reviewText as React.CSSProperties}>{r.text}</div>
              </div>
            ))}

            <div style={{ height:8 }} />
            <div style={styles.sectionTitle as React.CSSProperties}>我也来评价</div>
            <StarPicker value={rating} onChange={setRating} />
            <div style={styles.evalSection as React.CSSProperties}>
              <textarea 
                value={text} 
                onChange={(e)=>setText(e.target.value)} 
                placeholder="留下您的心声" 
                style={styles.evalTextarea as React.CSSProperties} 
              />
              <button 
                onClick={async ()=>{
                  if(!text.trim() || isSubmitting) return; 
                  
                  setIsSubmitting(true);
                  
                  // 模拟提交过程
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  
                  onAdd({ id: uid(), user:'匿名学⽣', text, rating }); 
                  setText('');
                  setIsSubmitting(false);
                  setShowSuccess(true);
                  
                  // 3秒后关闭成功提示
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 3000);
                }} 
                style={{
                  ...styles.evalSubmitBtn as React.CSSProperties,
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                disabled={isSubmitting}
              >
                <span style={styles.evalSubmitBtnText as React.CSSProperties}>
                  {isSubmitting ? '提交中...' : '提交评价'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </BottomSheet>
      
      {/* 加载状态覆盖层 */}
      {isSubmitting && (
        <div style={styles.loadingOverlay as React.CSSProperties}>
          <div style={styles.loadingContent as React.CSSProperties}>
            <div style={styles.loadingText as React.CSSProperties}>
              正在提交，由XION为您隐私续航
            </div>
            <div className="loading-spinner" style={styles.loadingSpinner as React.CSSProperties}></div>
          </div>
        </div>
      )}
      
      {/* 成功提示 */}
      {showSuccess && (
        <div className="success-overlay" style={styles.successOverlay as React.CSSProperties}>
          <div style={styles.successContent as React.CSSProperties}>
            <div style={styles.successIcon as React.CSSProperties}>✓</div>
            <div style={styles.successText as React.CSSProperties}>
              评价提交成功！
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const CreateMentorOverlay: React.FC<{ visible: boolean; onClose: ()=>void; onCreate: (m: Mentor)=>void }> = ({ visible, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [courses, setCourses] = useState('');
  const [firstRating, setFirstRating] = useState(5);
  const [firstText, setFirstText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if(!visible) return null;
  return (
    <>
      <Backdrop visible={visible} onClose={onClose} />
      <div style={styles.createBox as React.CSSProperties}>
        <div style={styles.sheetTitle as React.CSSProperties}>创建导师</div>
        
        <div style={styles.inputRow as React.CSSProperties}>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="导师姓名" style={styles.inputHalf as React.CSSProperties} />
          <input value={school} onChange={(e)=>setSchool(e.target.value)} placeholder="所属学校" style={styles.inputHalf as React.CSSProperties} />
        </div>
        
        <input value={courses} onChange={(e)=>setCourses(e.target.value)} placeholder="课程（逗号分隔）" style={styles.input as React.CSSProperties} />
        
        <div style={styles.sectionTitle as React.CSSProperties}>创建第一条评价</div>
        <StarPicker value={firstRating} onChange={setFirstRating} />
        <div style={styles.inputRow as React.CSSProperties}>
          <textarea value={firstText} onChange={(e)=>setFirstText(e.target.value)} placeholder="留下您的心声" style={styles.inputAreaHalf as React.CSSProperties} />
        </div>
        
        <div style={styles.buttonRow as React.CSSProperties}>
          <button onClick={onClose} style={styles.cancelBtn as React.CSSProperties}>
            <span style={styles.cancelBtnText as React.CSSProperties}>取消</span>
          </button>
          <button
            onClick={async ()=>{
              if(!name.trim() || !school.trim() || !firstText.trim() || isSubmitting) return;
              
              setIsSubmitting(true);
              
              // 模拟提交过程
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              const m: Mentor = {
                id: uid(),
                name: name.trim(),
                school: school.trim(),
                courses: courses.split(',').map(s=>s.trim()).filter(Boolean),
                reviews: [{ id: uid(), user:'匿名学⽣', text:firstText.trim(), rating:firstRating }],
              };
              onCreate(m);
              setIsSubmitting(false);
              setShowSuccess(true);
              
              // 3秒后关闭成功提示和弹窗
              setTimeout(() => {
                setShowSuccess(false);
                onClose();
                // 重置表单
                setName('');
                setSchool('');
                setCourses('');
                setFirstRating(5);
                setFirstText('');
              }, 3000);
            }}
            style={{
              ...styles.primaryBtn as React.CSSProperties,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
            disabled={isSubmitting}
          >
            <span style={styles.primaryBtnText as React.CSSProperties}>
              {isSubmitting ? '创建中...' : 'Create'}
            </span>
          </button>
        </div>
      </div>
      
      {/* 加载状态覆盖层 */}
      {isSubmitting && (
        <div style={styles.loadingOverlay as React.CSSProperties}>
          <div style={styles.loadingContent as React.CSSProperties}>
            <div style={styles.loadingText as React.CSSProperties}>
              正在提交，由XION为您隐私续航
            </div>
            <div className="loading-spinner" style={styles.loadingSpinner as React.CSSProperties}></div>
          </div>
        </div>
      )}
      
      {/* 成功提示 */}
      {showSuccess && (
        <div className="success-overlay" style={styles.successOverlay as React.CSSProperties}>
          <div style={styles.successContent as React.CSSProperties}>
            <div style={styles.successIcon as React.CSSProperties}>✓</div>
            <div style={styles.successText as React.CSSProperties}>
              导师创建成功！
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ---------------------- 主页面（仅此导出） ----------------------

const Home: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>(initialMentors);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detail, setDetail] = useState<Mentor|null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(()=> filterMentors(mentors, query), [mentors, query]);

  return (
    <div style={styles.root as React.CSSProperties}>
      {/* 页面中心搜索区域 */}
      <div style={styles.centerSearchArea as React.CSSProperties}>
        {/* 轮播品牌文字 */}
        <RotatingText />
        
        {/* 搜索框 */}
        <div style={styles.searchWrap as React.CSSProperties}>
          <input
            className="search-input"
            placeholder="搜索导师、学校或课程"
            value={query}
            onChange={(e)=>{
              setQuery(e.target.value);
              setShowDropdown(e.target.value.trim() !== '');
            }}
            onFocus={()=>{
              if(query.trim() !== '') setShowDropdown(true);
            }}
            style={styles.searchInput as React.CSSProperties}
          />
          
          {/* 搜索下拉框 */}
          <SearchDropdown
            mentors={filtered}
            visible={showDropdown}
            onSelect={(mentor) => {
              setDetail(mentor);
              setDetailOpen(true);
              setShowDropdown(false);
              setQuery('');
            }}
            onClose={() => setShowDropdown(false)}
          />
        </div>
        
        {/* 空状态提示 */}
        {filtered.length === 0 && query.trim() !== '' ? (
          <div style={styles.emptyState as React.CSSProperties}>
            <div style={styles.emptyStateText as React.CSSProperties}>没有找到匹配的导师</div>
            <button onClick={()=>setCreateOpen(true)} style={styles.createBtn as React.CSSProperties}>
              <span style={styles.createBtnText as React.CSSProperties}>Create New</span>
            </button>
          </div>
        ) : null}
      </div>

      {/* 创建/详情 */}
      <CreateMentorOverlay visible={createOpen} onClose={()=>setCreateOpen(false)} onCreate={(m)=> setMentors(prev=>[m,...prev])} />
      <MentorDetailSheet mentor={detail} visible={detailOpen} onClose={()=>setDetailOpen(false)} onAdd={(r)=>{
        if(!detail) return; setMentors(prev => prev.map(m => m.id === detail.id ? { ...m, reviews:[r, ...m.reviews] } : m));
      }} />

      {/* 底部三按钮 */}
      <div style={styles.tabBar as React.CSSProperties}>
        <button style={{ ...(styles.tabItem as any), opacity: 0.5, cursor:'not-allowed' }} title="圈子（稍后提供）">
          <div style={styles.tabIcon as React.CSSProperties}>◎</div>
          <div style={styles.tabLabel as React.CSSProperties}>圈子</div>
        </button>
        <button style={{ ...(styles.tabItem as any) }}>
          <div style={{ ...(styles.tabIcon as any), color:'#0A84FF' }}>⌂</div>
          <div style={{ ...(styles.tabLabel as any), color:'#0A84FF', fontWeight:700 }}>主页</div>
        </button>
        <button style={{ ...(styles.tabItem as any), opacity: 0.5, cursor:'not-allowed' }} title="Profile（稍后提供）">
          <div style={styles.tabIcon as React.CSSProperties}>☻</div>
          <div style={styles.tabLabel as React.CSSProperties}>Profile</div>
        </button>
      </div>
    </div>
  );
};

export default Home;

// ---------------------- 样式 ----------------------

const styles = {
  root: {
    background: '#FFFFFF',
    minHeight: '100vh',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    color: '#111827',
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
  },
  topBrand: { fontSize: 18, fontWeight: 800, letterSpacing: 0.5 },

  centerSearchArea: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 16px',
    gap: 24,
    position: 'relative',
    transform: 'translateY(-1.5cm)',
  },
  centerBrand: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: 1,
    color: '#111827',
    marginBottom: 8,
  },
  
  // 轮播文字样式
  rotatingTextContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: 1,
    color: '#111827',
    marginBottom: 8,
    whiteSpace: 'nowrap',
    width: '100%',
  },
  brandPrefix: {
    color: '#111827',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-100%)',
    marginRight: '8px',
    whiteSpace: 'nowrap',
  },
  wordContainer: {
    position: 'absolute',
    left: '50%',
    marginLeft: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 40,
  },
  rotatingWord: {
    display: 'inline-block',
    color: '#0A84FF',
    whiteSpace: 'nowrap',
  },
  searchWrap: {
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    height: 48,
    background: '#F9FAFB',
    border: '2px solid #E5E7EB',
    borderRadius: 24,
    padding: '0 20px',
    fontSize: 16,
    outline: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'all 0.2s ease',
  },

  sectionTitle: { fontSize: 16, fontWeight: 700, color: '#111827', margin: '12px 0' },
  caption: { color: '#6B7280', fontSize: 12 },
  
  // 空状态样式
  emptyState: {
    textAlign: 'center' as const,
    position: 'absolute',
    top: 'calc(50% + 80px)', // 在搜索框下方固定位置
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 400,
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 12,
  },
  createBtn: {
    background: '#0A84FF',
    borderRadius: 12,
    padding: '10px 20px',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  createBtnText: {
    color: '#FFFFFF',
  },
  
  // 搜索下拉框样式
  dropdownBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 999,
    background: 'transparent',
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: 1000,
    maxHeight: 300,
    overflowY: 'auto',
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: '1px solid #F3F4F6',
    transition: 'background-color 0.2s ease',
  },
  dropdownItemName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 2,
  },
  dropdownItemSchool: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dropdownItemCourses: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  dropdownMore: {
    padding: '8px 16px',
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    background: '#F9FAFB',
  },

  hCard: {
    minWidth: 260,
    maxWidth: 320,
    background: '#FFFFFF',
    border: '1px solid #F3F4F6',
    borderRadius: 14,
    padding: 14,
    margin: '8px 0',
    boxShadow: '0 6px 10px rgba(0,0,0,0.04)',
    cursor: 'pointer',
  },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#111827' },
  cardSub: { color: '#6B7280', marginTop: 2 },
  pill: {
    display: 'inline-block',
    background: '#F3F4F6',
    borderRadius: 999,
    padding: '6px 10px',
    fontSize: 12,
    color: '#374151',
  },
  reviewItem: {
    background: '#F9FAFB',
    border: '1px solid #F3F4F6',
    borderRadius: 12,
    padding: 12,
    margin: '6px 0',
  },
  reviewUser: { fontWeight: 600, color: '#111827' },
  reviewText: { color: '#111827', marginTop: 6, lineHeight: '20px' },

  input: {
    height: 42,
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '0 12px',
    background: '#FFFFFF',
    marginTop: 10,
    outline: 'none',
  },
  inputArea: {
    minHeight: 88,
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 12,
    background: '#FFFFFF',
    marginTop: 10,
    resize: 'vertical' as const,
  },

  primaryBtn: {
    background: '#0A84FF',
    borderRadius: 14,
    padding: '10px 16px',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: 700 },

  evalRow: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  
  // 滑动评分选择器样式
  sliderContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  sliderTrack: {
    position: 'relative',
    height: 6,
    background: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 12,
  },
  sliderProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: '#0A84FF',
    borderRadius: 3,
    transition: 'width 0.2s ease',
  },
  sliderThumb: {
    position: 'absolute',
    top: '50%',
    width: 20,
    height: 20,
    background: '#0A84FF',
    borderRadius: '50%',
    border: '3px solid #FFFFFF',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'left 0.2s ease',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderLabel: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 400,
    padding: '4px 2px',
    transition: 'all 0.2s ease',
  },
  
  // 评价区域样式
  evalSection: {
    marginTop: 8,
  },
  evalTextarea: {
    width: '100%',
    minHeight: 88,
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 12,
    background: '#FFFFFF',
    resize: 'vertical',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  },
  evalSubmitBtn: {
    background: '#0A84FF',
    borderRadius: 12,
    padding: '12px 24px',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    marginTop: 12,
    width: '100%',
  },
  evalSubmitBtnText: {
    color: '#FFFFFF',
  },
  
  // 加载状态样式
  loadingOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    textAlign: 'center',
    padding: '24px',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 16,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #0A84FF',
    borderRadius: '50%',
    margin: '0 auto',
  },
  
  // 成功提示样式
  successOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(255, 255, 255, 0.95)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    textAlign: 'center',
    padding: '24px',
    background: '#FFFFFF',
    borderRadius: 16,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  },
  successIcon: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: '#10B981',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  successText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#111827',
  },

  // bottom sheet & overlays
  sheet: {
    position: 'fixed' as const,
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    background: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderTop: '1px solid #F3F4F6',
    zIndex: 1001,
  },
  sheetTitle: { fontSize: 18, fontWeight: 800, color: '#111827' },
  sheetSub: { marginTop: 4, color: '#6B7280' },
  createBox: {
    position: 'fixed' as const,
    left: 16,
    right: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    border: '1px solid #F3F4F6',
    zIndex: 1002,
    boxShadow: '0 10px 16px rgba(0,0,0,0.08)',
    maxHeight: '80vh',
    overflowY: 'auto' as const,
  },
  
  // 输入行样式
  inputRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 12,
  },
  inputHalf: {
    flex: 1,
    height: 42,
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '0 12px',
    background: '#FFFFFF',
    outline: 'none',
    fontSize: 14,
  },
  inputAreaHalf: {
    flex: 1,
    minHeight: 88,
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: 12,
    background: '#FFFFFF',
    resize: 'vertical',
    fontSize: 14,
    outline: 'none',
    fontFamily: 'inherit',
  },
  
  // 按钮行样式
  buttonRow: {
    display: 'flex',
    gap: 12,
    marginTop: 20,
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    background: '#F3F4F6',
    borderRadius: 12,
    padding: '10px 20px',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  cancelBtnText: {
    color: '#6B7280',
  },
  modalBackdrop: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(17,24,39,0.35)',
    zIndex: 1000,
  },

  // 横向列表（热搜导师）
  hList: {
    display: 'flex',
    gap: 12,
    overflowX: 'auto' as const,
    paddingBottom: 8,
    WebkitOverflowScrolling: 'touch' as const,
  },
  
  // 动画卡片容器
  animatedCardContainer: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: 120,
  },
  animatedCardTrack: {
    display: 'flex',
    gap: 12,
    animation: 'scrollCards 20s linear infinite',
    width: '200%', // 因为有两组卡片
  },

  // bottom bar
  tabBar: {
    position: 'fixed' as const,
    left: 0,
    right: 0,
    bottom: 0,
    height: 56,
    display: 'flex',
    background: '#FFFFFF',
    borderTop: '1px solid #F3F4F6',
    zIndex: 1002,
  },
  tabItem: { flex: 1, background:'transparent', border:'none', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 },
  tabIcon: { fontSize: 16, color: '#9CA3AF' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
} as const;

