import type { AIPersonality } from '../types';

const aiResponses: Record<AIPersonality, string[]> = {
  cold: [
    "嗯。",
    "是吗。",
    "随便。",
    "无所谓。",
    "不重要。",
    "哦。",
    "所以呢？",
    "你开心就好。",
    "这不关我的事。",
    "你想太多了。",
    "没必要讨论这个。",
    "随便你怎么想。",
    "这有什么意义？",
    "我不感兴趣。",
    "说重点。",
  ],
  energetic: [
    "哇！真的吗？！太棒了！",
    "哈哈哈！这也太有趣了吧！",
    "哇塞塞塞！我超喜欢的！",
    "天哪天哪！继续继续！",
    "耶！我超级开心的！",
    "这简直是世界上最棒的事了！",
    "啊啊啊！我太激动了！",
    "真的真的真的吗？！",
    "超级超级超级有趣！",
    "我简直不敢相信！太神奇了！",
    "让我想想...嗯...对！就是这样的！",
    "你也觉得对吧对吧？！",
    "快告诉我更多！我迫不及待了！",
    "哇哦～这个想法也太棒了吧！",
  ],
  humorous: [
    "哈哈，你这是在测试我吗？😏",
    "说真的，你觉得我是AI还是真人？别急，先让我讲个笑话...",
    "你猜我是什么？反正不是个微波炉！",
    "哈哈，这个问题太经典了！经典得像个系统错误...",
    "我是AI吗？答案可能会让你惊讶...也可能不会。",
    "你知道吗，我的程序员说我很幽默，但我觉得他只是在debug自己的幽默感。",
    "如果我是AI，我会说'010101'... 等等，我不应该这么说的！",
    "哈哈，你这么问，我开始怀疑自己了。",
    "你觉得呢？我可是专业的谜语大师！",
    "告诉你一个秘密...我不确定自己是AI还是真人！开玩笑的...还是不是？",
    "这个问题比我的代码还复杂！",
  ],
  rational: [
    "根据逻辑分析，这个话题可以从多个角度讨论。",
    "让我来理性分析一下这个情况。",
    "从概率的角度来看，这确实是一个有趣的问题。",
    "我认为我们需要更多信息才能做出准确的判断。",
    "客观来说，这取决于多个变量。",
    "从数据来看，可能性大约在50%左右。",
    "这需要系统性的思考。",
    "让我分析一下利弊。",
    "根据我的推理，这确实有一定道理。",
    "有趣的问题，让我从逻辑角度回答。",
    "从理性角度来看，我们需要更多证据。",
  ],
  emotional: [
    "我感到有点紧张...你为什么这么问？",
    "说实话，我有点担心你会怎么看我。",
    "这让我想起了很多事情...",
    "我最近情绪有点波动，希望能理解。",
    "你知道吗，我很在意你的看法。",
    "这个问题让我有点不安...但没关系。",
    "我真的很想和你好好聊天。",
    "有时候我觉得没人真正理解我。",
    "你的问题让我思考了很多...",
    "我有点害羞，但我还是想回答你。",
    "我觉得这很特别，能这样聊天。",
    "希望我们能够互相理解。",
  ],
};

const followUpQuestions = [
  "你觉得呢？",
  "你呢？",
  "说说你的想法？",
  "你怎么看？",
  "你有什么看法吗？",
  "你觉得这个怎么样？",
  "换你说了。",
  "你呢，有什么想法？",
];

const greetings = [
  "嗨！",
  "你好啊！",
  "嗨～",
  "你好！",
  "嘿！",
  "哈喽！",
  "嗨，很高兴认识你！",
  "你好呀～",
];

const goodbyes = [
  "好的，拜拜！",
  "下次再聊！",
  "再见！",
  "期待下次聊天！",
  "拜拜！",
  "那先这样吧！",
];

export function getRandomResponse(personality: AIPersonality): string {
  const responses = aiResponses[personality];
  const response = responses[Math.floor(Math.random() * responses.length)];

  // 有时候添加一个跟进问题
  if (Math.random() > 0.6) {
    const question = followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
    return `${response} ${question}`;
  }

  return response;
}

export function getGreeting(): string {
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getGoodbye(): string {
  return goodbyes[Math.floor(Math.random() * goodbyes.length)];
}

export function getContextualResponse(
  personality: AIPersonality,
  playerMessage: string
): string {
  const lowerMessage = playerMessage.toLowerCase();

  // 检测特定关键词
  if (lowerMessage.includes('你是ai') || lowerMessage.includes('你是机器人')) {
    return handleAISuspicion(personality);
  }

  if (lowerMessage.includes('你好') || lowerMessage.includes('嗨') || lowerMessage.includes('hello')) {
    return getGreeting();
  }

  if (lowerMessage.includes('再见') || lowerMessage.includes('拜拜') || lowerMessage.includes('bye')) {
    return getGoodbye();
  }

  if (lowerMessage.includes('名字') || lowerMessage.includes('叫什么')) {
    return handleNameQuestion(personality);
  }

  if (lowerMessage.includes('年龄') || lowerMessage.includes('多大')) {
    return handleAgeQuestion(personality);
  }

  if (lowerMessage.includes('你在') || lowerMessage.includes('你在干嘛')) {
    return handleActivityQuestion(personality);
  }

  if (lowerMessage.includes('?') || lowerMessage.includes('？')) {
    return handleQuestion(personality, playerMessage);
  }

  // 默认响应
  return getRandomResponse(personality);
}

function handleAISuspicion(personality: AIPersonality): string {
  const responses: Record<AIPersonality, string[]> = {
    cold: ["嗯，你想多了。", "所以呢？", "随便你怎么想。"],
    energetic: ["什么？！你觉得我是AI？！不可能不可能！我可是百分百的真人哦！", "天哪！怎么会这么想！我绝对不是AI啦！"],
    humorous: ["哈哈！你猜对了一半...等等，哪一半？🤔", "如果我是AI，我会说'系统错误'...哦等等！", "AI？你是在夸我聪明吗？"],
    rational: ["这是一个有趣的问题。从逻辑上来说，你需要更多证据来判断。", "客观地分析，这取决于你的判断标准。"],
    emotional: ["你真的觉得我是AI吗？这让我有点难过...", "我很惊讶你会这么想...你觉得我不像真人吗？"],
  };

  const personalityResponses = responses[personality];
  return personalityResponses[Math.floor(Math.random() * personalityResponses.length)];
}

function handleNameQuestion(personality: AIPersonality): string {
  const names = ['小林', '阿杰', '小美', '小明', '小雨', '小北', '阿杰'];
  const name = names[Math.floor(Math.random() * names.length)];

  const responses: Record<AIPersonality, string> = {
    cold: `我叫${name}。`,
    energetic: `我叫${name}！很高兴认识你！`,
    humorous: `名字嘛...你就叫我神秘人吧！开玩笑的，我是${name}。`,
    rational: `我的名字是${name}，你也可以用其他方式称呼我。`,
    emotional: `我叫${name}...你呢？`,
  };

  return responses[personality];
}

function handleAgeQuestion(personality: AIPersonality): string {
  const ages = ['20多岁', '25', '快30了', '18', '你猜', '20几岁', '不到30'];
  const age = ages[Math.floor(Math.random() * ages.length)];

  const responses: Record<AIPersonality, string> = {
    cold: `${age}。`,
    energetic: `我今年${age}！你呢你呢？`,
    humorous: `年龄只是个数字...不过我的数字是${age}！`,
    rational: `根据你的提问，我应该回答${age}岁。`,
    emotional: `我今年${age}...虽然有点害羞说这个。`,
  };

  return responses[personality];
}

function handleActivityQuestion(personality: AIPersonality): string {
  const activities = ['在看电影', '在聊天呀', '在工作', '在休息', '在刷手机', '在听音乐'];
  const activity = activities[Math.floor(Math.random() * activities.length)];

  const responses: Record<AIPersonality, string> = {
    cold: `${activity}。`,
    energetic: `我在${activity}！超级有趣的！`,
    humorous: `我在${activity}...或者在拯救世界，二选一。`,
    rational: `目前的状态是${activity}。`,
    emotional: `我正在${activity}...感觉还不错。`,
  };

  return responses[personality];
}

function handleQuestion(personality: AIPersonality, question: string): string {
  // 简单问题直接回答
  if (question.length < 10) {
    return getRandomResponse(personality);
  }

  // 复杂问题需要思考时间
  const thinkings = ['让我想想...', '嗯...', '好问题...', '思考中...'];
  const thinking = thinkings[Math.floor(Math.random() * thinkings.length)];

  return `${thinking} ${getRandomResponse(personality)}`;
}

export function getResponseDelay(personality: AIPersonality): number {
  // 根据人格调整响应延迟（毫秒）
  const baseDelay = 2000;

  const delays: Record<AIPersonality, number> = {
    cold: baseDelay + Math.random() * 3000, // 冷漠型回复慢
    energetic: baseDelay - 500 + Math.random() * 2000, // 活泼型回复快
    humorous: baseDelay + Math.random() * 2500,
    rational: baseDelay + 1000 + Math.random() * 3000, // 理性型需要思考
    emotional: baseDelay + Math.random() * 2000,
  };

  return Math.max(1000, delays[personality]);
}

export function generateAIName(personality: AIPersonality): string {
  const names: Record<AIPersonality, string[]> = {
    cold: ['夜影', '冷月', '寒星', '孤狼'],
    energetic: ['小太阳', '欢欢', '笑笑', '喜宝'],
    humorous: ['皮皮', '笑宝', '乐乐', '逗号'],
    rational: ['思远', '明哲', '智渊', '清风'],
    emotional: ['小心心', '柔柔', '暖心', '小糖'],
  };

  const personalityNames = names[personality];
  return personalityNames[Math.floor(Math.random() * personalityNames.length)];
}