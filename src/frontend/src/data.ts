export type RiskLevel = "高" | "中" | "低";

export type AnalysisInputKind = "tx" | "address" | "file" | "sample";

export type Stage = {
  id: string;
  label: string;
  detail: string;
};

export type AttackNode = {
  id: string;
  label: string;
  kind: string;
  depth: number;
  risk: RiskLevel;
};

export type RetrievalHit = {
  name: string;
  similarity: number;
  vulnerability: string;
  source: string;
  evidence: string;
};

export type AnalysisResult = {
  id: string;
  title: string;
  inputKind: AnalysisInputKind;
  inputLabel: string;
  chain: "Ethereum" | "BSC" | "Polygon";
  protocol: string;
  risk: RiskLevel;
  vulnerability: string;
  confidence: number;
  retrievalConsistency: number;
  evidenceCoverage: number;
  latency: number;
  gasDelta: number;
  fundFlow: string;
  txHash: string;
  contract: string;
  createdAt: string;
  blockHeight: number;
  traceId: string;
  logTopics: string[];
  storageSlots: string[];
  fundPath: string[];
  stageLogs: Record<string, string[]>;
  vectorSummary: Array<{ label: string; value: string }>;
  nodes: AttackNode[];
  edges: Array<[string, string]>;
  hits: RetrievalHit[];
  evidence: string[];
  recommendations: string[];
  reportChecks: Array<{ label: string; value: number }>;
  semanticMatrix: number[][];
  promptBlocks: string[];
  compression: {
    originalNodes: number;
    compressedNodes: number;
    originalLatency: number;
    compressedLatency: number;
    originalF1: number;
    compressedF1: number;
  };
};

export const stages: Stage[] = [
  { id: "collect", label: "链上数据采集", detail: "交易、日志、合约元信息同步" },
  { id: "trace", label: "函数调用流提取", detail: "外部调用、回调、状态读写整理" },
  { id: "compress", label: "调用轨迹压缩", detail: "递归子树融合与重复克隆消除" },
  { id: "semantic", label: "静态语义对齐", detail: "函数职责、状态变量、安全机制映射" },
  { id: "retrieve", label: "Top-k 向量检索", detail: "相似攻击路径与证据片段召回" },
  { id: "prompt", label: "Prompt 构建", detail: "交易载荷、检索证据、静态语义合成" },
  { id: "verdict", label: "风险判定", detail: "漏洞类型、置信度、处置建议生成" },
];

export const methodMetrics = [
  { method: "Slither", accuracy: 88.7, recall: 76.2, f1: 0.819, latency: 3.2 },
  { method: "TXSpector", accuracy: 92.3, recall: 84.1, f1: 0.88, latency: 5.7 },
  { method: "SmartKG", accuracy: 89.2, recall: 91.5, f1: 0.903, latency: 23.4 },
  { method: "GPT-4", accuracy: 85.6, recall: 93.2, f1: 0.892, latency: 18.7 },
  { method: "RAGFlow", accuracy: 93.6, recall: 95.8, f1: 0.947, latency: 6.8 },
];

export const systemMetrics = [
  { label: "吞吐量", value: 9.3, unit: "req/s" },
  { label: "API 错误率", value: 0.5, unit: "%" },
  { label: "内存占用", value: 2.1, unit: "GB" },
  { label: "10k 函数处理", value: 18, unit: "min" },
];

export const purificationMetrics = [
  { name: "调用链长度", before: 47.2, after: 25.8 },
  { name: "业务调用占比", before: 78.7, after: 89.2 },
  { name: "推理准确率", before: 71.3, after: 81.7 },
  { name: "吞吐量", before: 1200, after: 2500 },
];

export const platformDistribution = [
  { name: "Ethereum", value: 42.7 },
  { name: "BSC", value: 38.3 },
  { name: "Polygon", value: 19.0 },
];

export const librarySamples = [
  {
    tx: "0xb7e1...9a42",
    chain: "Ethereum",
    protocol: "Uniswap V3",
    type: "闪电贷组合攻击",
    risk: "高" as RiskLevel,
    status: "已归档",
    time: "2026-05-11 14:23",
  },
  {
    tx: "0xa28f...61d0",
    chain: "BSC",
    protocol: "Bridge Relay",
    type: "跨链桥重放",
    risk: "高" as RiskLevel,
    status: "复核中",
    time: "2026-05-10 09:48",
  },
  {
    tx: "0x46bc...71e9",
    chain: "Polygon",
    protocol: "Lending Pool",
    type: "预言机操纵",
    risk: "中" as RiskLevel,
    status: "已归档",
    time: "2026-05-09 18:05",
  },
  {
    tx: "0x81d2...e0bc",
    chain: "Ethereum",
    protocol: "Compound V3",
    type: "权限绕过",
    risk: "中" as RiskLevel,
    status: "已归档",
    time: "2026-05-08 11:16",
  },
];

const attackCases = [
  {
    title: "重入式资金回流",
    vulnerability: "重入攻击",
    protocol: "Lending Pool",
    chain: "Ethereum" as const,
    flow: ["borrow", "withdraw", "external call", "callback", "repeated withdraw", "settle"],
    evidence: [
      "withdraw 在余额扣减前触发外部合约回调",
      "callback 分支复用原始授权上下文",
      "资金流在 3 个区块内集中回流到同一 EOA",
    ],
  },
  {
    title: "闪电贷价格操纵",
    vulnerability: "闪电贷组合攻击",
    protocol: "Uniswap V3",
    chain: "Ethereum" as const,
    flow: ["borrow", "swap", "price manipulation", "oracle read", "repay", "extract"],
    evidence: [
      "同一区块内出现 borrow 与 repay 闭环",
      "swap 后预言机读数偏离历史滑窗",
      "抵押资产估值与成交深度出现异常扩张",
    ],
  },
  {
    title: "委托调用权限漂移",
    vulnerability: "权限绕过",
    protocol: "Proxy Vault",
    chain: "BSC" as const,
    flow: ["delegatecall", "role check bypass", "privileged action", "mint", "transfer"],
    evidence: [
      "delegatecall 目标地址由外部参数控制",
      "角色校验读取到代理合约存储槽旧值",
      "mint 与 transfer 在同一执行上下文连续发生",
    ],
  },
  {
    title: "跨链消息重放",
    vulnerability: "跨链桥攻击",
    protocol: "Bridge Relay",
    chain: "BSC" as const,
    flow: ["verify proof", "message replay", "asset mint", "bridge out", "swap"],
    evidence: [
      "message nonce 在目标链重复出现",
      "证明验证通过后缺少消费标记写入",
      "铸币事件与桥出事件形成异常配对",
    ],
  },
  {
    title: "状态检查时序偏移",
    vulnerability: "TOCTOU",
    protocol: "Aave Strategy",
    chain: "Polygon" as const,
    flow: ["check state", "external interaction", "state changed", "unsafe execution", "settle"],
    evidence: [
      "状态检查与执行之间存在外部可重入窗口",
      "关键阈值在交互后发生变化",
      "最终执行沿用了检查前上下文",
    ],
  },
  {
    title: "预言机陈旧价格抽取",
    vulnerability: "状态污染",
    protocol: "Oracle Hub",
    chain: "Polygon" as const,
    flow: ["oracle update", "stale price", "collateral extraction", "liquidate"],
    evidence: [
      "价格源更新延迟超过协议容忍窗口",
      "抵押率计算使用旧快照",
      "清算收益在短时间内集中转出",
    ],
  },
];

const nodeKinds = ["EOA", "Proxy", "DEX", "Oracle", "Bridge", "Token", "Attacker"];

const recommendationsByRisk: Record<RiskLevel, string[]> = {
  高: ["暂停相关合约交互", "隔离外部调用路径", "补充重入与权限边界审计", "复核同源交易批次"],
  中: ["增加状态校验", "限制高风险函数调用频率", "补充事件日志监控", "人工复核相似样本"],
  低: ["记录为观察样本", "扩大语义检索窗口", "保留链上证据快照", "纳入后续回归集"],
};

function pick<T>(items: T[], salt: number): T {
  return items[Math.abs(salt) % items.length];
}

function hashSeed(value: string): number {
  let seed = 0;
  for (const char of value) seed = (seed * 31 + char.charCodeAt(0)) % 100000;
  return seed + Date.now();
}

function pseudoHash(seed: number, length: number): string {
  const hex = "0123456789abcdef";
  let text = "0x";
  for (let i = 0; i < length; i += 1) {
    text += hex[(seed + i * 7 + Math.floor(seed / (i + 3))) % 16];
  }
  return text;
}

export function createAnalysisResult(inputKind: AnalysisInputKind, inputLabel: string): AnalysisResult {
  const seed = hashSeed(`${inputKind}:${inputLabel}`);
  const base = pick(attackCases, seed);
  const risk: RiskLevel = seed % 5 === 0 ? "中" : seed % 7 === 0 ? "低" : "高";
  const confidence = Math.min(98.9, 88 + (seed % 93) / 10);
  const retrievalConsistency = Math.min(99.2, 84 + (seed % 120) / 10);
  const evidenceCoverage = Math.min(97.5, 82 + (seed % 130) / 10);
  const latency = Number((5.2 + (seed % 32) / 10).toFixed(1));
  const nodes: AttackNode[] = base.flow.map((label, index) => ({
    id: `n${index + 1}`,
    label,
    kind: pick(nodeKinds, seed + index * 5),
    depth: index + 1,
    risk: index > 1 && index < base.flow.length - 1 ? risk : "中",
  }));

  const hits: RetrievalHit[] = [
    {
      name: `${base.protocol} ${base.vulnerability} 路径`,
      similarity: Math.min(0.99, 0.88 + (seed % 9) / 100),
      vulnerability: base.vulnerability,
      source: "ETHBench v2.0",
      evidence: base.evidence[0],
    },
    {
      name: `${pick(["Curve", "Aave", "Balancer", "Bridge"], seed + 3)} 近邻样本`,
      similarity: Math.min(0.96, 0.8 + (seed % 14) / 100),
      vulnerability: pick(["重入", "状态污染", "权限绕过", "价格操纵"], seed + 4),
      source: "语义向量库",
      evidence: base.evidence[1],
    },
    {
      name: `${pick(["跨链桥", "借贷池", "DEX 路由器", "代理合约"], seed + 8)} 证据簇`,
      similarity: Math.min(0.93, 0.76 + (seed % 16) / 100),
      vulnerability: pick(["TOCTOU", "闪电贷", "跨合约克隆", "授权漂移"], seed + 9),
      source: "链上归档索引",
      evidence: base.evidence[2],
    },
  ];

  return {
    id: `case-${seed}`,
    title: base.title,
    inputKind,
    inputLabel,
    chain: base.chain,
    protocol: base.protocol,
    risk,
    vulnerability: base.vulnerability,
    confidence,
    retrievalConsistency,
    evidenceCoverage,
    latency,
    gasDelta: Number((12 + (seed % 160) / 10).toFixed(1)),
    fundFlow: `${(0.8 + (seed % 220) / 10).toFixed(1)} ETH`,
    txHash: inputKind === "tx" ? inputLabel : pseudoHash(seed, 64),
    contract: inputKind === "address" ? inputLabel : pseudoHash(seed + 41, 40),
    createdAt: new Intl.DateTimeFormat("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
    blockHeight: 18260000 + (seed % 920000),
    traceId: `trace-${(seed % 9000) + 1000}-${(seed * 17) % 997}`,
    logTopics: [
      `0xddf252ad:${pseudoHash(seed + 11, 8)}`,
      `0x8c5be1e5:${pseudoHash(seed + 17, 8)}`,
      `0x${pseudoHash(seed + 23, 16).slice(2)}`,
    ],
    storageSlots: [
      `slot[${(seed % 12) + 1}] -> ${pseudoHash(seed + 29, 12)}`,
      `slot[${(seed % 19) + 8}] -> ${pseudoHash(seed + 31, 12)}`,
      `slot[${(seed % 31) + 16}] -> ${pseudoHash(seed + 37, 12)}`,
    ],
    fundPath: [
      "EOA",
      base.protocol.includes("Uniswap") ? "Router" : base.protocol.includes("Bridge") ? "Relay" : "Proxy",
      base.protocol,
      risk === "高" ? "Attacker" : "Review Wallet",
    ],
    stageLogs: {
      collect: [
        `block ${18260000 + (seed % 920000)} 已同步`,
        `event logs ${18 + (seed % 42)} 条`,
        `state diff ${4 + (seed % 11)} 组`,
      ],
      trace: [
        `trace depth ${base.flow.length + 3}`,
        `internal calls ${24 + (seed % 36)} 条`,
        `external callback ${seed % 3 === 0 ? "命中" : "低频"}`,
      ],
      compress: [
        `clone fold ${12 + (seed % 26)} 个`,
        `subtree merge ${5 + (seed % 9)} 组`,
        `noise prune ${(28 + (seed % 33)).toFixed(0)}%`,
      ],
      semantic: [
        `state vars ${7 + (seed % 13)} 个`,
        `function roles ${base.flow.length} 类`,
        `guard pattern ${seed % 2 === 0 ? "partial" : "strict"}`,
      ],
      retrieve: [
        `top-k hit ${hits.length}`,
        `vector latency ${(0.18 + (seed % 30) / 100).toFixed(2)}s`,
        `case cluster ${pick(["flashloan", "reentry", "bridge", "oracle"], seed)}`,
      ],
      prompt: [
        `context window ${24 + (seed % 8)}k`,
        `evidence refs ${6 + (seed % 8)}`,
        `static supplement ${Math.round(evidenceCoverage)}%`,
      ],
      verdict: [
        `risk score ${Math.round(confidence)}`,
        `coverage ${Math.round(evidenceCoverage)}%`,
        `review queue ${risk === "高" ? "P0" : risk === "中" ? "P1" : "P2"}`,
      ],
    },
    vectorSummary: [
      { label: "调用路径", value: `${base.flow.length} nodes / depth ${base.flow.length + 3}` },
      { label: "参数依赖", value: `${4 + (seed % 9)} links` },
      { label: "状态切换", value: `${3 + (seed % 7)} writes` },
      { label: "事件主题", value: `${3 + (seed % 5)} topics` },
    ],
    nodes,
    edges: nodes.slice(0, -1).map((node, index) => [node.id, nodes[index + 1].id]),
    hits,
    evidence: base.evidence,
    recommendations: recommendationsByRisk[risk],
    reportChecks: [
      { label: "交易元数据", value: 100 },
      { label: "调用证据", value: Math.round(evidenceCoverage) },
      { label: "语义命中", value: Math.round(retrievalConsistency) },
      { label: "处置建议", value: 96 },
    ],
    semanticMatrix: Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, column) => Number((0.42 + ((seed + row * 13 + column * 7) % 52) / 100).toFixed(2))),
    ),
    promptBlocks: [
      "交易元数据、区块高度、调用深度、Gas 异常点",
      "动态调用路径、参数依赖、状态切换边界",
      "静态语义摘要、安全机制、关键状态变量",
      "Top-k 相似攻击路径、证据片段、相似度权重",
    ],
    compression: {
      originalNodes: base.protocol === "Uniswap V3" ? 472 : 142 + (seed % 80),
      compressedNodes: base.protocol === "Uniswap V3" ? 51 : 31 + (seed % 16),
      originalLatency: base.protocol === "Uniswap V3" ? 12.4 : 4.7 + (seed % 9) / 10,
      compressedLatency: base.protocol === "Uniswap V3" ? 5.2 : 1.5 + (seed % 6) / 10,
      originalF1: base.protocol === "Uniswap V3" ? 0.783 : 0.79 + (seed % 8) / 100,
      compressedF1: base.protocol === "Uniswap V3" ? 0.901 : 0.88 + (seed % 8) / 100,
    },
  };
}
