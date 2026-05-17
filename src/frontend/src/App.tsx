import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Blocks,
  Check,
  ChevronRight,
  CircleDot,
  Database,
  Download,
  FileCode2,
  FileText,
  Fingerprint,
  Gauge,
  GitBranch,
  Hexagon,
  KeyRound,
  Layers3,
  Library,
  Link2,
  LockKeyhole,
  LogIn,
  Network,
  Radar,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Sparkles,
  Upload,
  Workflow,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar as RadarShape,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AnalysisInputKind,
  AnalysisResult,
  createAnalysisResult,
  librarySamples,
  methodMetrics,
  platformDistribution,
  purificationMetrics,
  stages,
  systemMetrics,
} from "./data";

type Shell = "home" | "auth" | "app";
type AuthMode = "login" | "register";
type NavKey = "工作台" | "调用链" | "语义检索" | "风险报告" | "指标" | "样本库";
type RunState = "idle" | "running" | "complete";
type InputMode = "tx" | "address" | "file" | "sample";

const navItems: Array<{ key: NavKey; icon: typeof Activity }> = [
  { key: "工作台", icon: Activity },
  { key: "调用链", icon: GitBranch },
  { key: "语义检索", icon: Database },
  { key: "风险报告", icon: FileText },
  { key: "指标", icon: BarChart3 },
  { key: "样本库", icon: Library },
];

const allowedFileTypes = [".sol", ".json", ".txt", ".log"];
const pieColors = ["#1f6f61", "#8d5b21", "#a23f2b"];

function isTxHash(value: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(value.trim());
}

function isAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function fileExtension(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

function clampProgress(stageIndex: number) {
  return Math.round(((stageIndex + 1) / stages.length) * 100);
}

function MetricNumber({ value, suffix = "" }: { value: string | number; suffix?: string }) {
  return (
    <span className="metric-number">
      {value}
      {suffix && <small>{suffix}</small>}
    </span>
  );
}

function App() {
  const [shell, setShell] = useState<Shell>("home");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeNav, setActiveNav] = useState<NavKey>("工作台");
  const [inputMode, setInputMode] = useState<InputMode>("tx");
  const [query, setQuery] = useState("");
  const [selectedSample, setSelectedSample] = useState(librarySamples[0].tx);
  const [error, setError] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");
  const [stageIndex, setStageIndex] = useState(-1);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (runState !== "running") return;
    setStageIndex(0);
    const timers = stages.map((_, index) =>
      window.setTimeout(() => {
        setStageIndex(index);
        if (index === stages.length - 1) setRunState("complete");
      }, 520 + index * 620),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [runState]);

  function startAnalysis(kind: AnalysisInputKind, label: string) {
    const next = createAnalysisResult(kind, label);
    setResult(next);
    setHistory((items) => [next, ...items].slice(0, 6));
    setError("");
    setRunState("running");
    setActiveNav("工作台");
  }

  function submitAnalysis(event?: FormEvent) {
    event?.preventDefault();
    if (inputMode === "tx") {
      if (isTxHash(query)) {
        startAnalysis("tx", query.trim());
        return;
      }
      setError("交易哈希格式为 0x 加 64 位十六进制字符");
      return;
    }
    if (inputMode === "address") {
      if (isAddress(query)) {
        startAnalysis("address", query.trim());
        return;
      }
      setError("合约地址格式为 0x 加 40 位十六进制字符");
      return;
    }
    if (inputMode === "sample") {
      startAnalysis("sample", selectedSample);
    }
  }

  function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = fileExtension(file.name);
    if (allowedFileTypes.includes(extension)) {
      startAnalysis("file", file.name);
      return;
    }
    setError(`支持格式：${allowedFileTypes.join(" / ")}`);
  }

  function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthenticated(true);
    setShell("app");
  }

  if (shell === "home") {
    return <Home onEnter={() => (authenticated ? setShell("app") : setShell("auth"))} onOpenSystem={() => setShell("auth")} />;
  }

  if (shell === "auth") {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onSubmit={authenticate}
        onBack={() => setShell("home")}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand-button" onClick={() => setShell("home")} aria-label="返回主页">
          <span className="brand-mark">
            <Hexagon size={18} />
          </span>
          <span>
            <b>御链先知</b>
            <small>RAGFlow</small>
          </span>
        </button>
        <nav className="nav-list" aria-label="系统导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className={activeNav === item.key ? "nav-item active" : "nav-item"}
                onClick={() => setActiveNav(item.key)}
              >
                <Icon size={17} />
                <span>{item.key}</span>
              </button>
            );
          })}
        </nav>
        <div className="side-status">
          <span className="status-dot" />
          <div>
            <b>索引在线</b>
            <small>ETHBench v2.0 / 184k paths</small>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">智能合约攻击检测</p>
            <h1>{activeNav}</h1>
          </div>
          <div className="topbar-actions">
            <button className="ghost-button" onClick={() => setShell("home")}>
              作品主页
            </button>
            <button className="icon-button" aria-label="导出当前报告">
              <Download size={18} />
            </button>
          </div>
        </header>

        <OperationsRibbon result={result} runState={runState} stageIndex={stageIndex} />

        {activeNav === "工作台" && (
          <Workbench
            inputMode={inputMode}
            setInputMode={setInputMode}
            query={query}
            setQuery={setQuery}
            selectedSample={selectedSample}
            setSelectedSample={setSelectedSample}
            onSubmit={submitAnalysis}
            onUpload={() => fileRef.current?.click()}
            fileRef={fileRef}
            onFileChange={handleFileUpload}
            error={error}
            runState={runState}
            stageIndex={stageIndex}
            result={result}
            onOpenNav={setActiveNav}
          />
        )}
        {activeNav === "调用链" && <CallChain result={result} stageIndex={stageIndex} />}
        {activeNav === "语义检索" && <SemanticRetrieval result={result} />}
        {activeNav === "风险报告" && <RiskReport result={result} />}
        {activeNav === "指标" && <MetricsPage result={result} />}
        {activeNav === "样本库" && <SampleLibrary result={result} history={history} onRun={startAnalysis} />}
      </main>
    </div>
  );
}

function OperationsRibbon({
  result,
  runState,
  stageIndex,
}: {
  result: AnalysisResult | null;
  runState: RunState;
  stageIndex: number;
}) {
  const activeStage = stageIndex >= 0 ? stages[stageIndex]?.label : "等待任务";
  const items = [
    { label: "索引规模", value: "184k", hint: "attack paths" },
    { label: "检索命中", value: result ? `${result.retrievalConsistency.toFixed(1)}%` : "--", hint: "Top-k" },
    { label: "链路状态", value: runState === "running" ? activeStage : result ? result.risk + "风险" : "就绪", hint: "pipeline" },
    { label: "证据覆盖", value: result ? `${result.evidenceCoverage.toFixed(1)}%` : "--", hint: "coverage" },
  ];
  return (
    <section className="ops-ribbon" aria-label="系统态势">
      {items.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <b>{item.value}</b>
          <small>{item.hint}</small>
        </div>
      ))}
      <div className="ops-stream">
        <span className="status-dot" />
        <p>
          {result
            ? `${result.chain} / ${result.protocol} / ${result.vulnerability} / ${result.txHash.slice(0, 10)}...${result.txHash.slice(-6)}`
            : "链上交易、调用流、语义索引、风险报告通道在线"}
        </p>
      </div>
    </section>
  );
}

function Home({ onEnter, onOpenSystem }: { onEnter: () => void; onOpenSystem: () => void }) {
  return (
    <div className="home-page">
      <header className="home-nav">
        <div className="home-brand">
          <span className="brand-mark">
            <Hexagon size={18} />
          </span>
          <b>御链先知 / RAGFlow</b>
        </div>
        <div className="home-links">
          <a href="#route">技术路线</a>
          <a href="#metrics">指标</a>
          <button onClick={onOpenSystem}>进入系统</button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy reveal">
          <p className="eyebrow">跨模态语义增强智能合约攻击检测系统</p>
          <h1>御链先知</h1>
          <p>
            围绕交易哈希、函数调用流、静态语义资料与向量检索证据，形成面向链上攻击检测的 RAGFlow
            分析闭环。
          </p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onEnter}>
              进入系统 <ArrowRight size={17} />
            </button>
            <a className="text-link" href="#route">
              查看技术路线
            </a>
          </div>
        </div>

        <div className="hero-visual reveal delay-1" aria-label="系统核心流程">
          <div className="orbit-panel">
            {["交易", "调用", "语义", "检索", "报告"].map((item, index) => (
              <span key={item} className={`orbit-node node-${index + 1}`}>
                {item}
              </span>
            ))}
            <div className="orbit-core">
              <ShieldCheck size={30} />
              <b>RAGFlow</b>
              <small>93.6% Accuracy</small>
            </div>
          </div>
        </div>
      </section>

      <section className="metric-strip reveal delay-2" id="metrics">
        <div>
          <MetricNumber value="93.6" suffix="%" />
          <span>准确率</span>
        </div>
        <div>
          <MetricNumber value="95.8" suffix="%" />
          <span>召回率</span>
        </div>
        <div>
          <MetricNumber value="0.947" />
          <span>F1</span>
        </div>
        <div>
          <MetricNumber value="6.8" suffix="s" />
          <span>平均时延</span>
        </div>
      </section>

      <section className="home-section two-column" id="route">
        <div>
          <p className="eyebrow">技术流程</p>
          <h2>从交易到风险结论的七段闭环</h2>
        </div>
        <div className="route-line">
          {stages.map((stage, index) => (
            <div key={stage.id} className="route-step">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{stage.label}</b>
              <small>{stage.detail}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section insight-grid">
        {[
          { icon: Workflow, title: "调用路径压缩", text: "递归子树融合、跨合约克隆消除、结构相似调用折叠。" },
          { icon: Database, title: "双层语义检索", text: "动态行为向量与静态函数语义共同进入 Top-k 证据召回。" },
          { icon: Radar, title: "攻击链解释", text: "输出漏洞类型、资金路径、证据片段、处置建议与报告完整性。" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="plain-feature">
              <Icon size={22} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function AuthScreen({
  mode,
  onModeChange,
  onSubmit,
  onBack,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}) {
  return (
    <div className="auth-page">
      <section className="auth-intel">
        <button className="brand-button" onClick={onBack}>
          <span className="brand-mark">
            <Hexagon size={18} />
          </span>
          <span>
            <b>御链先知</b>
            <small>RAGFlow</small>
          </span>
        </button>
        <div className="auth-map">
          {[
            ["链上交易", "Trace / Event / State"],
            ["函数调用", "Depth / Calldata / Storage"],
            ["语义检索", "Vector / Evidence / Prompt"],
            ["风险报告", "Verdict / Path / Action"],
          ].map(([title, text]) => (
            <div key={title}>
              <CircleDot size={16} />
              <b>{title}</b>
              <small>{text}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={onSubmit}>
          <p className="eyebrow">安全团队入口</p>
          <h1>{mode === "login" ? "登录工作台" : "创建团队空间"}</h1>
          <label>
            邮箱
            <input type="email" required placeholder="security@example.com" />
          </label>
          {mode === "register" && (
            <label>
              组织名称
              <input type="text" required placeholder="Protocol Security Lab" />
            </label>
          )}
          <label>
            密码
            <input type="password" required minLength={6} placeholder="输入访问密码" />
          </label>
          {mode === "register" && (
            <label>
              邀请码
              <input type="text" required placeholder="RAGFLOW-TEAM" />
            </label>
          )}
          <button className="primary-button full" type="submit">
            <LogIn size={17} />
            {mode === "login" ? "进入系统" : "完成注册"}
          </button>
          <button
            className="text-link form-switch"
            type="button"
            onClick={() => onModeChange(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "注册团队空间" : "已有账号登录"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Workbench({
  inputMode,
  setInputMode,
  query,
  setQuery,
  selectedSample,
  setSelectedSample,
  onSubmit,
  onUpload,
  fileRef,
  onFileChange,
  error,
  runState,
  stageIndex,
  result,
  onOpenNav,
}: {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  query: string;
  setQuery: (query: string) => void;
  selectedSample: string;
  setSelectedSample: (sample: string) => void;
  onSubmit: (event?: FormEvent) => void;
  onUpload: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error: string;
  runState: RunState;
  stageIndex: number;
  result: AnalysisResult | null;
  onOpenNav: (nav: NavKey) => void;
}) {
  const progress = stageIndex >= 0 ? clampProgress(stageIndex) : 0;
  return (
    <div className="workbench-grid">
      <section className="panel input-panel">
        <div className="panel-title">
          <Search size={18} />
          <h2>分析入口</h2>
        </div>
        <div className="segmented">
          {[
            ["tx", "交易"],
            ["address", "合约"],
            ["file", "文件"],
            ["sample", "样本"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              className={inputMode === mode ? "active" : ""}
              onClick={() => setInputMode(mode as InputMode)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="analysis-form">
          {inputMode === "file" ? (
            <>
              <button className="upload-zone" type="button" onClick={onUpload}>
                <Upload size={22} />
                <b>上传合约材料</b>
                <span>{allowedFileTypes.join(" / ")}</span>
              </button>
              <input ref={fileRef} type="file" accept={allowedFileTypes.join(",")} onChange={onFileChange} hidden />
            </>
          ) : inputMode === "sample" ? (
            <>
              <label>
                样本
                <select value={selectedSample} onChange={(event) => setSelectedSample(event.target.value)}>
                  {librarySamples.map((sample) => (
                    <option key={sample.tx} value={sample.tx}>
                      {sample.protocol} / {sample.type}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary-button full" type="submit">
                <Zap size={17} />
                分析样本
              </button>
            </>
          ) : (
            <>
              <label>
                {inputMode === "tx" ? "交易哈希" : "合约地址"}
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={inputMode === "tx" ? "0x + 64 位十六进制" : "0x + 40 位十六进制"}
                />
              </label>
              <button className="primary-button full" type="submit">
                <Search size={17} />
                开始分析
              </button>
            </>
          )}
        </form>
        {error && <div className="error-line">{error}</div>}
        <div className="format-list">
          <b>输入约束</b>
          <span>交易哈希：66 字符</span>
          <span>合约地址：42 字符</span>
          <span>文件：Solidity / JSON / Log</span>
        </div>
      </section>

      <section className="panel process-panel">
        <div className="panel-title">
          <Workflow size={18} />
          <h2>分析流程</h2>
          <span className="progress-badge">{progress}%</span>
        </div>
        <div className="stage-stack">
          {stages.map((stage, index) => {
            const complete = stageIndex > index || runState === "complete";
            const active = stageIndex === index && runState === "running";
            return (
              <div key={stage.id} className={`stage-row ${complete ? "complete" : ""} ${active ? "active" : ""}`}>
                <span className="stage-index">{index + 1}</span>
                <div>
                  <b>{stage.label}</b>
                  <small>{stage.detail}</small>
                </div>
                {complete ? <Check size={16} /> : active ? <span className="pulse-dot" /> : <span className="quiet-dot" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel result-panel">
        <div className="panel-title">
          <ShieldQuestion size={18} />
          <h2>当前结论</h2>
        </div>
        {result ? (
          <div className="result-stack">
            <div className={`risk-banner risk-${result.risk}`}>
              <span>{result.risk}风险</span>
              <b>{result.vulnerability}</b>
              <small>{result.confidence.toFixed(1)}% 置信度</small>
            </div>
            <div className="risk-gauge" aria-label="风险指标环">
              <span style={{ "--score": `${result.confidence}%` } as React.CSSProperties} />
              <div>
                <b>{Math.round(result.confidence)}</b>
                <small>risk score</small>
              </div>
            </div>
            <div className="mini-metrics">
              <div>
                <MetricNumber value={result.retrievalConsistency.toFixed(1)} suffix="%" />
                <span>检索一致性</span>
              </div>
              <div>
                <MetricNumber value={result.latency} suffix="s" />
                <span>推理时延</span>
              </div>
              <div>
                <MetricNumber value={result.fundFlow} />
                <span>资金异常</span>
              </div>
            </div>
            <div className="action-row">
              <button onClick={() => onOpenNav("调用链")}>调用链</button>
              <button onClick={() => onOpenNav("语义检索")}>证据</button>
              <button onClick={() => onOpenNav("风险报告")}>报告</button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Layers3}
            title="等待输入"
            text="左侧提交交易、合约、文件或样本后，流程、图谱、证据和报告会同步更新。"
          />
        )}
      </section>

      <section className="panel chain-panel">
        <div className="panel-title">
          <Blocks size={18} />
          <h2>链与合约</h2>
        </div>
        {result ? (
          <div className="chain-detail-grid">
            <dl className="definition-list">
              <div>
                <dt>链</dt>
                <dd>{result.chain}</dd>
              </div>
              <div>
                <dt>协议</dt>
                <dd>{result.protocol}</dd>
              </div>
              <div>
                <dt>合约</dt>
                <dd>{result.contract.slice(0, 12)}...{result.contract.slice(-6)}</dd>
              </div>
              <div>
                <dt>Gas 偏移</dt>
                <dd>{result.gasDelta}%</dd>
              </div>
            </dl>
            <div className="event-stream">
              {result.nodes.slice(0, 4).map((node, index) => (
                <p key={node.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {node.label}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <div className="skeleton-list">
            <span />
            <span />
            <span />
            <span />
          </div>
        )}
      </section>
    </div>
  );
}

function CallChain({ result, stageIndex }: { result: AnalysisResult | null; stageIndex: number }) {
  const compressedData = result
    ? [
        { name: "节点数", before: result.compression.originalNodes, after: result.compression.compressedNodes },
        { name: "时延", before: result.compression.originalLatency, after: result.compression.compressedLatency },
        { name: "F1", before: result.compression.originalF1, after: result.compression.compressedF1 },
      ]
    : [];
  return (
    <div className="page-grid call-grid">
      <section className="panel graph-panel">
        <div className="panel-title">
          <Network size={18} />
          <h2>攻击路径图</h2>
        </div>
        {result ? (
          <div className="call-graph">
            {result.nodes.map((node, index) => (
              <button
                key={node.id}
                className={`graph-node risk-${node.risk} ${stageIndex >= index % stages.length ? "lit" : ""}`}
                style={{ "--x": `${8 + index * (82 / Math.max(1, result.nodes.length - 1))}%`, "--y": `${index % 2 === 0 ? 28 : 62}%` } as React.CSSProperties}
              >
                <small>{node.kind}</small>
                <b>{node.label}</b>
                <span>depth {node.depth}</span>
              </button>
            ))}
            <svg className="edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
              {result.nodes.slice(0, -1).map((node, index) => {
                const x1 = 8 + index * (82 / Math.max(1, result.nodes.length - 1));
                const x2 = 8 + (index + 1) * (82 / Math.max(1, result.nodes.length - 1));
                const y1 = index % 2 === 0 ? 32 : 66;
                const y2 = (index + 1) % 2 === 0 ? 32 : 66;
                return <path key={node.id} d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`} />;
              })}
            </svg>
          </div>
        ) : (
          <EmptyState icon={Network} title="暂无调用链" text="提交分析后显示合约、函数、事件与资金路径节点。" />
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <GitBranch size={18} />
          <h2>压缩效果</h2>
        </div>
        {result ? (
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={compressedData}>
              <CartesianGrid stroke="#e7dfd1" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="before" name="压缩前" fill="#9b6f42" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="压缩后" fill="#1f6f61" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={BarChart3} title="等待压缩指标" text="轨迹压缩完成后生成前后对比。" />
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <Fingerprint size={18} />
          <h2>节点详情</h2>
        </div>
        {result ? (
          <div className="node-table">
            {result.nodes.map((node) => (
              <div key={node.id}>
                <b>{node.label}</b>
                <span>{node.kind}</span>
                <em>{node.risk}</em>
              </div>
            ))}
          </div>
        ) : (
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        )}
      </section>
    </div>
  );
}

function SemanticRetrieval({ result }: { result: AnalysisResult | null }) {
  const matrixData = result?.semanticMatrix.flatMap((row, rowIndex) =>
    row.map((value, columnIndex) => ({ row: rowIndex + 1, column: columnIndex + 1, value })),
  );
  return (
    <div className="page-grid semantic-grid">
      <section className="panel evidence-panel">
        <div className="panel-title">
          <Database size={18} />
          <h2>Top-k 证据</h2>
        </div>
        {result ? (
          <div className="hit-list">
            {result.hits.map((hit) => (
              <article key={hit.name}>
                <div>
                  <b>{hit.name}</b>
                  <small>{hit.source} / {hit.vulnerability}</small>
                </div>
                <MetricNumber value={(hit.similarity * 100).toFixed(1)} suffix="%" />
                <p>{hit.evidence}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={Database} title="暂无检索结果" text="分析完成后显示相似攻击路径、来源和证据片段。" />
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <Sparkles size={18} />
          <h2>Prompt 上下文</h2>
        </div>
        {result ? (
          <div className="prompt-stack">
            {result.promptBlocks.map((block, index) => (
              <div key={block}>
                <span>{index + 1}</span>
                <b>{block}</b>
              </div>
            ))}
          </div>
        ) : (
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        )}
      </section>

      <section className="panel matrix-panel">
        <div className="panel-title">
          <Radar size={18} />
          <h2>语义对齐矩阵</h2>
        </div>
        {matrixData ? (
          <div className="matrix-grid">
            {matrixData.map((cell) => (
              <span
                key={`${cell.row}-${cell.column}`}
                style={{ opacity: 0.25 + cell.value * 0.75 }}
                title={`${cell.value}`}
              >
                {cell.value.toFixed(2)}
              </span>
            ))}
          </div>
        ) : (
          <EmptyState icon={Radar} title="暂无矩阵" text="静态语义与动态行为对齐后生成矩阵。" />
        )}
      </section>
    </div>
  );
}

function RiskReport({ result }: { result: AnalysisResult | null }) {
  return (
    <div className="page-grid report-grid">
      <section className="panel report-main">
        <div className="panel-title">
          <AlertTriangle size={18} />
          <h2>风险结论</h2>
        </div>
        {result ? (
          <>
            <div className={`risk-summary risk-${result.risk}`}>
              <span>{result.risk}风险</span>
              <h2>{result.vulnerability}</h2>
              <p>{result.title} / {result.chain} / {result.protocol}</p>
            </div>
            <div className="timeline">
              {result.nodes.map((node) => (
                <div key={node.id}>
                  <span />
                  <b>{node.label}</b>
                  <small>{node.kind} / depth {node.depth}</small>
                </div>
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon={FileText} title="暂无报告" text="完成分析后生成风险等级、攻击路径、证据来源与处置建议。" />
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <KeyRound size={18} />
          <h2>证据来源</h2>
        </div>
        {result ? (
          <div className="evidence-list">
            {result.evidence.map((item) => (
              <p key={item}>
                <ChevronRight size={14} />
                {item}
              </p>
            ))}
          </div>
        ) : (
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <ShieldCheck size={18} />
          <h2>处置建议</h2>
        </div>
        {result ? (
          <div className="recommend-list">
            {result.recommendations.map((item) => (
              <button key={item}>
                <Check size={15} />
                {item}
              </button>
            ))}
          </div>
        ) : (
          <div className="skeleton-list">
            <span />
            <span />
            <span />
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-title">
          <Gauge size={18} />
          <h2>完整性</h2>
        </div>
        {result ? (
          <div className="check-list">
            {result.reportChecks.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <b>{item.value}%</b>
                <meter min={0} max={100} value={item.value} />
              </div>
            ))}
          </div>
        ) : (
          <div className="skeleton-list">
            <span />
            <span />
          </div>
        )}
      </section>
    </div>
  );
}

function MetricsPage({ result }: { result: AnalysisResult | null }) {
  const radarData = methodMetrics.map((item) => ({
    method: item.method,
    accuracy: item.accuracy,
    recall: item.recall,
    f1: item.f1 * 100,
  }));
  const runtimeData = result
    ? [
        { name: "置信度", value: result.confidence },
        { name: "一致性", value: result.retrievalConsistency },
        { name: "覆盖率", value: result.evidenceCoverage },
        { name: "Gas 偏移", value: result.gasDelta },
      ]
    : [];
  return (
    <div className="page-grid metrics-grid">
      <section className="panel metrics-wide">
        <div className="panel-title">
          <BarChart3 size={18} />
          <h2>方法对比</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={methodMetrics}>
            <CartesianGrid stroke="#e7dfd1" vertical={false} />
            <XAxis dataKey="method" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} domain={[70, 100]} />
            <Tooltip />
            <Bar dataKey="accuracy" name="准确率" fill="#1f6f61" radius={[4, 4, 0, 0]} />
            <Bar dataKey="recall" name="召回率" fill="#9b6f42" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <div className="panel-title">
          <Radar size={18} />
          <h2>综合雷达</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e7dfd1" />
            <PolarAngleAxis dataKey="method" />
            <RadarShape dataKey="f1" fill="#1f6f61" fillOpacity={0.22} stroke="#1f6f61" />
          </RadarChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <div className="panel-title">
          <Activity size={18} />
          <h2>系统性能</h2>
        </div>
        <div className="system-metrics">
          {systemMetrics.map((item) => (
            <div key={item.label}>
              <MetricNumber value={item.value} suffix={item.unit} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <Layers3 size={18} />
          <h2>日志净化</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={purificationMetrics}>
            <CartesianGrid stroke="#e7dfd1" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="before" name="净化前" stroke="#9b6f42" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="after" name="净化后" stroke="#1f6f61" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <div className="panel-title">
          <Link2 size={18} />
          <h2>平台分布</h2>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie dataKey="value" data={platformDistribution} innerRadius={46} outerRadius={82} paddingAngle={3}>
              {platformDistribution.map((entry, index) => (
                <Cell key={entry.name} fill={pieColors[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </section>

      <section className="panel">
        <div className="panel-title">
          <Gauge size={18} />
          <h2>当前样本</h2>
        </div>
        {result ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={runtimeData} layout="vertical">
              <XAxis type="number" hide domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={72} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1f6f61" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={Gauge} title="等待当前样本" text="工作台分析后显示本次风险指标。" />
        )}
      </section>
    </div>
  );
}

function SampleLibrary({
  result,
  history,
  onRun,
}: {
  result: AnalysisResult | null;
  history: AnalysisResult[];
  onRun: (kind: AnalysisInputKind, label: string) => void;
}) {
  const rows = useMemo(() => {
    const currentRows = history.map((item) => ({
      tx: `${item.txHash.slice(0, 8)}...${item.txHash.slice(-4)}`,
      chain: item.chain,
      protocol: item.protocol,
      type: item.vulnerability,
      risk: item.risk,
      status: "已生成",
      time: item.createdAt,
      raw: item.txHash,
    }));
    return [
      ...currentRows,
      ...librarySamples.map((item) => ({ ...item, raw: item.tx })),
    ];
  }, [history]);

  return (
    <div className="page-grid library-grid">
      <section className="panel library-table-wrap">
        <div className="panel-title">
          <Library size={18} />
          <h2>安全样本</h2>
        </div>
        <div className="filter-row">
          {["全部链", "高风险", "闪电贷", "跨链桥", "权限"].map((item) => (
            <button key={item}>{item}</button>
          ))}
        </div>
        <div className="library-table">
          <div className="table-head">
            <span>交易</span>
            <span>链</span>
            <span>协议</span>
            <span>类型</span>
            <span>风险</span>
            <span>状态</span>
          </div>
          {rows.map((row) => (
            <button key={`${row.tx}-${row.time}`} className="table-row" onClick={() => onRun("sample", row.raw)}>
              <span>{row.tx}</span>
              <span>{row.chain}</span>
              <span>{row.protocol}</span>
              <span>{row.type}</span>
              <span className={`risk-pill risk-${row.risk}`}>{row.risk}</span>
              <span>{row.status}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <FileCode2 size={18} />
          <h2>样本详情</h2>
        </div>
        {result ? (
          <div className="sample-detail">
            <b>{result.title}</b>
            <span>{result.txHash}</span>
            <p>{result.evidence[0]}</p>
            <div className="code-block">
              calldata: {result.nodes.map((node) => node.label).join(" -> ")}
            </div>
          </div>
        ) : (
          <EmptyState icon={FileCode2} title="选择样本" text="点击左侧样本行后生成关联交易、调用链摘要与结论。" />
        )}
      </section>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: typeof Activity; title: string; text: string }) {
  return (
    <div className="empty-state">
      <Icon size={26} />
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

export default App;
