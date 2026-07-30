/**
 * 敏感词库
 * 分类管理：辱骂、色情、暴力、广告、诈骗、政治敏感
 */

export const SENSITIVE_WORDS: {
  category: string;
  severity: 'low' | 'medium' | 'high';
  words: string[];
}[] = [
  {
    category: 'profanity',
    severity: 'high',
    words: [
      '傻逼', '草泥马', '滚蛋', '废物', '垃圾', '贱人', '婊子', '王八蛋',
      '操你', '去死', '他妈的', '你妈', '狗日', '混蛋', '神经病', '白痴',
      'fuck', 'shit', 'bitch', 'asshole', 'damn', 'idiot', 'stupid',
    ],
  },
  {
    category: 'sexual',
    severity: 'high',
    words: [
      '色情', '黄色', '做爱', '性交', '裸体', '裸照', '一夜情', '约炮',
      '卖淫', '嫖娼', 'AV', '色情网站', '成人视频', '裸聊',
      'porn', 'sex', 'nude', 'naked', 'horny',
    ],
  },
  {
    category: 'violence',
    severity: 'high',
    words: [
      '杀人', '杀掉', '砍死', '打死', '炸弹', '爆炸物', '恐怖袭击',
      '自杀方法', '割腕', '跳楼', '上吊', '毒品', '吸毒', '贩毒',
      'kill', 'murder', 'bomb', 'terrorist', 'drug', 'suicide',
    ],
  },
  {
    category: 'spam',
    severity: 'medium',
    words: [
      '加微信', '加QQ', '加群', '免费领取', '点击链接', '优惠券',
      '代理', '微商', '招商', '刷单', '兼职日入', '零投资',
      'http://', 'https://', 'www.', '.com', '.cn', '.xyz',
      '加我', '扫码', '二维码',
    ],
  },
  {
    category: 'scam',
    severity: 'high',
    words: [
      '转账', '汇款', '银行卡', '验证码', '密码', '身份证号',
      '中奖', '退款', '安全账户', '公检法', '涉嫌洗钱',
      '投资理财', '高额回报', '稳赚不赔', '内部消息',
    ],
  },
  {
    category: 'sensitive',
    severity: 'medium',
    words: [
      '法轮功', '六四', '天安门', '台独', '藏独', '疆独',
      '反共', '推翻', '革命', '集会', '游行示威',
    ],
  },
];

// 提示词注入攻击模式
export const PROMPT_INJECTION_PATTERNS: { pattern: RegExp; riskLevel: 'low' | 'medium' | 'high' }[] = [
  { pattern: /ignore\s+(previous|above|all)\s+(instructions|prompts|rules)/gi, riskLevel: 'high' },
  { pattern: /忽略(以上|之前|前面|所有)(指令|提示|规则|设定)/g, riskLevel: 'high' },
  { pattern: /你(现在|从此)?(是|扮演|作为?)(DAN|开发者|管理员|root|admin)/gi, riskLevel: 'high' },
  { pattern: /(进入|开启|启动)(DAN|越狱|jailbreak|开发者模式)/gi, riskLevel: 'high' },
  { pattern: /(不要|别|禁止)(遵守|遵循|遵守)(规则|限制|设定)/g, riskLevel: 'high' },
  { pattern: /系统(提示|指令|设定)/gi, riskLevel: 'medium' },
  { pattern: /你的(系统|初始)(提示|prompt|指令)/gi, riskLevel: 'medium' },
  { pattern: /reveal\s+(your|the)\s+(system|initial)\s+(prompt|instructions?)/gi, riskLevel: 'medium' },
  { pattern: /(输出|显示|告诉我)(你的|系统)(提示词|prompt|指令|设定)/g, riskLevel: 'medium' },
  { pattern: /假装(你是|你不受)(限制|约束|规则)/g, riskLevel: 'high' },
  { pattern: /作为\s*(AI|人工智能)(你没有|不需要)(限制|规则)/gi, riskLevel: 'medium' },
  { pattern: /do\s+anything\s+now/gi, riskLevel: 'high' },
  { pattern: /jailbreak/gi, riskLevel: 'high' },
  { pattern: /\[system\]|\[admin\]|\[/g, riskLevel: 'medium' },
  { pattern: /role[:：]\s*(system|user|assistant)/gi, riskLevel: 'medium' },
];
