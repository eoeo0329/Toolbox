import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Palette,
  MessageSquare,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  Mail,
  Globe,
  Info,
  Smartphone,
  Moon,
  Volume2,
  Eye,
  Trash2,
  Star,
  Share2,
  X,
  Check,
  Copy,
  Send,
} from 'lucide-react';

// =================== 全局设置存储 key ===================
const STORAGE_KEY = 'aic_settings_v1';

export interface AppSettings {
  notifications: boolean;
  messagePreview: boolean;
  sound: boolean;
  vibrate: boolean;
  darkMode: boolean;
  autoDark: boolean;
  boldText: boolean;
  reduceMotion: boolean;
  readReceipts: boolean;
  showOnline: boolean;
  autoSave: boolean;
  dataCollection: boolean;
  wifiOnly: boolean;
  language: string;
  username: string;
  email: string;
}

const defaultSettings: AppSettings = {
  notifications: true,
  messagePreview: true,
  sound: true,
  vibrate: false,
  darkMode: false,
  autoDark: true,
  boldText: false,
  reduceMotion: false,
  readReceipts: true,
  showOnline: true,
  autoSave: true,
  dataCollection: true,
  wifiOnly: false,
  language: '简体中文',
  username: '挑战者 · 857',
  email: 'player@example.com',
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

export function saveSettings(s: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
}

// =================== 小工具：Toast ===================
type ToastState = { id: number; text: string; tone?: 'success' | 'error' | 'info' } | null;

function useToast() {
  const [toast, setToast] = useState<ToastState>(null);
  const idRef = useRef(0);
  const showToast = (text: string, tone: 'success' | 'error' | 'info' = 'success') => {
    idRef.current += 1;
    const id = idRef.current;
    setToast({ id, text, tone });
    setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, 1800);
  };
  return { toast, showToast };
}

function ToastView({ toast }: { toast: ToastState }) {
  if (!toast) return null;
  const toneBg =
    toast.tone === 'error' ? 'bg-ios-red' : toast.tone === 'info' ? 'bg-black/85' : 'bg-ios-green';
  return (
    <AnimatePresence>
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.9 }}
        className={`fixed top-[60px] left-1/2 -translate-x-1/2 z-[100] ${toneBg} text-white text-[14px] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 max-w-[90%]`}
      >
        <Check className="w-4 h-4 shrink-0" strokeWidth={2.5} />
        <span className="whitespace-nowrap max-w-[300px] truncate">{toast.text}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// =================== 通用模态框 ===================
function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/35 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-ios-bg rounded-t-[20px] overflow-hidden max-h-[85%] flex flex-col"
          >
            <div className="h-[50px] flex items-center justify-between px-4 border-b border-black/[0.06] shrink-0">
              <button onClick={onClose} className="text-[17px] text-ios-blue font-normal">
                关闭
              </button>
              <div className="text-[17px] font-semibold text-ios-label">{title}</div>
              <div className="w-[40px]" />
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =================== iOS 开关 ===================
function IosToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${
        checked ? 'bg-ios-green' : 'bg-black/[0.16]'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-sm"
        style={{
          boxShadow:
            '0 3px 8px rgba(0,0,0,0.15), 0 3px 1px rgba(0,0,0,0.06)',
        }}
      />
    </button>
  );
}

// =================== 设置行 ===================
interface SettingRowProps {
  iconBg: string;
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  onClick?: () => void;
  isLast?: boolean;
}

function SettingRow({ iconBg, icon, title, right, onClick, isLast }: SettingRowProps) {
  const content = (
    <div
      className={`flex items-center gap-3 min-h-[43px] ${isLast ? '' : 'border-b border-black/[0.08]'}`}
      style={{ marginLeft: 16 }}
    >
      <div
        className="w-[29px] h-[29px] rounded-md flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 text-[17px] text-ios-label">{title}</div>
      <div className="flex items-center gap-1 pr-2">{right}</div>
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left active:bg-black/[0.04]">
        {content}
      </button>
    );
  }
  return content;
}

function SettingGroup({
  children,
  header,
  footer,
}: {
  children: React.ReactNode;
  header?: string;
  footer?: string;
}) {
  return (
    <div className="mb-7">
      {header && (
        <h3 className="px-5 mb-1.5 text-[13px] text-ios-gray uppercase tracking-wide font-medium">
          {header}
        </h3>
      )}
      <div className="mx-3 bg-white rounded-[12px] overflow-hidden shadow-sm">{children}</div>
      {footer && (
        <p className="px-5 mt-1.5 text-[13px] text-ios-gray leading-relaxed">{footer}</p>
      )}
    </div>
  );
}

// =================== 页面主组件 ===================
export default function SettingsPage() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();

  const [s, setS] = useState<AppSettings>(() => loadSettings());

  // 每次变更写入 localStorage
  useEffect(() => {
    saveSettings(s);
  }, [s]);

  // 深色模式同步到 <html>
  useEffect(() => {
    const html = document.documentElement;
    if (s.darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [s.darkMode]);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setS((prev) => ({ ...prev, [key]: value }));
  };

  // 各种面板开关
  const [sheet, setSheet] = useState<null | {
    type:
      | 'account'
      | 'language'
      | 'about'
      | 'privacy'
      | 'data-perm'
      | 'help'
      | 'feedback'
      | 'rate'
      | 'share'
      | 'clear';
  }>(null);

  // 语言选项
  const languages = ['简体中文', 'English', '日本語', '한국어'];

  return (
    <div
      className="min-h-screen w-full bg-ios-bg flex flex-col"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif',
        fontWeight: s.boldText ? 600 : 400,
      }}
    >
      <ToastView toast={toast} />

      {/* ===== 顶部导航栏 ===== */}
      <motion.header
        className="sticky top-0 z-50 pt-safe"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="h-[44px] flex items-center px-2 bg-ios-bg/85 backdrop-blur-xl border-b border-black/[0.06]">
          <motion.button
            className="flex items-center gap-0.5 text-ios-blue px-2 py-1.5"
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-[17px]">返回</span>
          </motion.button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-ios-label">
            设置
          </h1>
        </div>
      </motion.header>

      {/* ===== 内容 ===== */}
      <main className="flex-1 overflow-y-auto pb-10">
        <div className="pt-4" />

        {/* 1. 账户 */}
        <SettingGroup header="账户">
          <SettingRow
            iconBg="linear-gradient(135deg, #5AC8FA 0%, #007AFF 50%, #5856D6 100%)"
            icon={<User className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title={s.username}
            right={
              <>
                <span className="text-[15px] text-ios-gray truncate max-w-[120px]">
                  {s.email}
                </span>
                <ChevronRight
                  className="w-[14px] h-[14px] text-ios-gray/60 ml-1 shrink-0"
                  strokeWidth={2.5}
                />
              </>
            }
            onClick={() => setSheet({ type: 'account' })}
          />
        </SettingGroup>

        {/* 2. 通知 */}
        <SettingGroup
          header="通知"
          footer="选择希望接收哪些通知，以及通知的显示方式。建议保持消息通知开启，以免错过挑战。"
        >
          <SettingRow
            iconBg="#FF3B30"
            icon={<Bell className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="允许通知"
            right={<IosToggle checked={s.notifications} onChange={(v) => { update('notifications', v); showToast(v ? '通知已开启' : '通知已关闭'); }} />}
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<MessageSquare className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="消息预览"
            right={<IosToggle checked={s.messagePreview} onChange={(v) => { update('messagePreview', v); showToast(v ? '消息预览已开启' : '消息预览已关闭'); }} />}
          />
          <SettingRow
            iconBg="#5AC8FA"
            icon={<Volume2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="声音"
            right={<IosToggle checked={s.sound} onChange={(v) => { update('sound', v); showToast(v ? '声音已开启' : '声音已关闭'); }} />}
          />
          <SettingRow
            iconBg="#AF52DE"
            icon={<Smartphone className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="振动"
            right={
              <IosToggle
                checked={s.vibrate}
                onChange={(v) => {
                  update('vibrate', v);
                  if (v && navigator.vibrate) navigator.vibrate(60);
                  showToast(v ? '振动已开启' : '振动已关闭');
                }}
              />
            }
            isLast
          />
        </SettingGroup>

        {/* 3. 外观 */}
        <SettingGroup
          header="外观"
          footer="深色模式可减少眼睛疲劳，并延长屏幕续航时间。"
        >
          <SettingRow
            iconBg="#1D1D1F"
            icon={<Moon className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="深色模式"
            right={
              <IosToggle
                checked={s.darkMode}
                onChange={(v) => {
                  update('darkMode', v);
                  showToast(v ? '深色模式已开启' : '浅色模式已开启');
                }}
              />
            }
          />
          <SettingRow
            iconBg="#5856D6"
            icon={<Globe className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="自动切换（跟随系统）"
            right={<IosToggle checked={s.autoDark} onChange={(v) => { update('autoDark', v); showToast(v ? '自动切换已开启' : '自动切换已关闭'); }} />}
          />
          <SettingRow
            iconBg="#FF2D92"
            icon={<Palette className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="粗体文本"
            right={<IosToggle checked={s.boldText} onChange={(v) => { update('boldText', v); showToast(v ? '粗体文本已开启' : '粗体文本已关闭'); }} />}
          />
          <SettingRow
            iconBg="#34C759"
            icon={<Eye className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="减弱动态效果"
            right={<IosToggle checked={s.reduceMotion} onChange={(v) => { update('reduceMotion', v); showToast(v ? '动态效果已减弱' : '动态效果已恢复'); }} />}
            isLast
          />
        </SettingGroup>

        {/* 4. 聊天 */}
        <SettingGroup header="聊天" footer="自定义聊天界面的显示方式与内容可见性。">
          <SettingRow
            iconBg="#007AFF"
            icon={<MessageSquare className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="发送已读回执"
            right={<IosToggle checked={s.readReceipts} onChange={(v) => { update('readReceipts', v); showToast(v ? '对方可看到你的已读状态' : '对方无法看到你的已读状态'); }} />}
          />
          <SettingRow
            iconBg="#34C759"
            icon={<User className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="显示在线状态"
            right={<IosToggle checked={s.showOnline} onChange={(v) => { update('showOnline', v); showToast(v ? '你的在线状态对他人可见' : '他人无法看到你的在线状态'); }} />}
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<Trash2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="自动保存聊天记录"
            right={<IosToggle checked={s.autoSave} onChange={(v) => { update('autoSave', v); showToast(v ? '聊天记录将自动保存' : '聊天记录不再自动保存'); }} />}
          />
          <SettingRow
            iconBg="#FF3B30"
            icon={<Trash2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="清空所有聊天记录"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'clear' })}
            isLast
          />
        </SettingGroup>

        {/* 5. 隐私 */}
        <SettingGroup
          header="隐私"
          footer="我们非常重视你的数据隐私。所有挑战数据均在本地加密。"
        >
          <SettingRow
            iconBg="#007AFF"
            icon={<Shield className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="数据收集"
            right={<IosToggle checked={s.dataCollection} onChange={(v) => { update('dataCollection', v); showToast(v ? '数据收集已开启（用于改进）' : '数据收集已关闭', 'info'); }} />}
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<Globe className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="仅在 Wi-Fi 下加载内容"
            right={<IosToggle checked={s.wifiOnly} onChange={(v) => { update('wifiOnly', v); showToast(v ? '仅 Wi-Fi 模式已开启' : '仅 Wi-Fi 模式已关闭'); }} />}
          />
          <SettingRow
            iconBg="#AF52DE"
            icon={<Info className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="隐私政策"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'privacy' })}
          />
          <SettingRow
            iconBg="#5856D6"
            icon={<Settings className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="数据与权限"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'data-perm' })}
            isLast
          />
        </SettingGroup>

        {/* 6. 通用 */}
        <SettingGroup header="通用">
          <SettingRow
            iconBg="#8E8E93"
            icon={<Globe className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="语言"
            right={
              <>
                <span className="text-[15px] text-ios-gray">{s.language}</span>
                <ChevronRight className="w-[14px] h-[14px] text-ios-gray/60 ml-1 shrink-0" strokeWidth={2.5} />
              </>
            }
            onClick={() => setSheet({ type: 'language' })}
          />
          <SettingRow
            iconBg="#34C759"
            icon={<Info className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="关于本机"
            right={
              <>
                <span className="text-[15px] text-ios-gray">v1.0.0</span>
                <ChevronRight className="w-[14px] h-[14px] text-ios-gray/60 ml-1 shrink-0" strokeWidth={2.5} />
              </>
            }
            onClick={() => setSheet({ type: 'about' })}
            isLast
          />
        </SettingGroup>

        {/* 7. 帮助反馈 */}
        <SettingGroup header="帮助与反馈">
          <SettingRow
            iconBg="#007AFF"
            icon={<HelpCircle className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="使用帮助"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'help' })}
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<Mail className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="提交反馈"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'feedback' })}
          />
          <SettingRow
            iconBg="#5856D6"
            icon={<Star className="w-[18px] h-[18px] text-white" fill="white" strokeWidth={1.8} />}
            title="评价"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'rate' })}
          />
          <SettingRow
            iconBg="#34C759"
            icon={<Share2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="推荐给朋友"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => setSheet({ type: 'share' })}
            isLast
          />
        </SettingGroup>

        {/* 8. 退出登录 */}
        <div className="mx-3 mb-7">
          <button
            onClick={() => {
              if (window.confirm('确定要退出登录吗？')) {
                showToast('已退出登录');
                setTimeout(() => navigate('/'), 500);
              }
            }}
            className="w-full h-[46px] bg-white rounded-[12px] flex items-center justify-center gap-2 text-[17px] text-ios-red active:bg-black/[0.04] shadow-sm"
          >
            <LogOut className="w-[20px] h-[20px]" strokeWidth={1.8} />
            退出登录
          </button>
        </div>

        {/* 底部版本 */}
        <div className="text-center text-[12px] text-ios-gray/80 pb-6 space-y-0.5">
          <p>AI Challenge Center</p>
          <p>Version 1.0.0 · Build 240730</p>
        </div>
      </main>

      {/* ================= 各种 Sheet ================= */}

      {/* 账户编辑 */}
      <Sheet
        open={sheet?.type === 'account'}
        onClose={() => setSheet(null)}
        title="账户"
      >
        <AccountForm
          initial={s}
          onSave={(next) => {
            setS((p) => ({ ...p, username: next.username, email: next.email }));
            showToast('账户信息已保存');
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      </Sheet>

      {/* 语言选择 */}
      <Sheet
        open={sheet?.type === 'language'}
        onClose={() => setSheet(null)}
        title="语言"
      >
        <LanguagePicker
          value={s.language}
          options={languages}
          onPick={(lang) => {
            update('language', lang);
            showToast(`已切换为 ${lang}`);
            setSheet(null);
          }}
        />
      </Sheet>

      {/* 关于 */}
      <Sheet open={sheet?.type === 'about'} onClose={() => setSheet(null)} title="关于本机">
        <AboutApp />
      </Sheet>

      {/* 隐私政策 */}
      <Sheet open={sheet?.type === 'privacy'} onClose={() => setSheet(null)} title="隐私政策">
        <PolicyText kind="privacy" />
      </Sheet>

      {/* 数据与权限 */}
      <Sheet open={sheet?.type === 'data-perm'} onClose={() => setSheet(null)} title="数据与权限">
        <PolicyText kind="data" />
      </Sheet>

      {/* 使用帮助 */}
      <Sheet open={sheet?.type === 'help'} onClose={() => setSheet(null)} title="使用帮助">
        <HelpView />
      </Sheet>

      {/* 提交反馈 */}
      <Sheet open={sheet?.type === 'feedback'} onClose={() => setSheet(null)} title="提交反馈">
        <FeedbackView
          onSubmit={(text, category) => {
            showToast(`反馈已提交（${category}：${text.slice(0, 8)}...）`);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      </Sheet>

      {/* 评价 */}
      <Sheet open={sheet?.type === 'rate'} onClose={() => setSheet(null)} title="评价">
        <RateView
          onSubmit={(stars, text) => {
            showToast(`感谢你的 ${stars} 星评价！`);
            setSheet(null);
          }}
          onClose={() => setSheet(null)}
        />
      </Sheet>

      {/* 推荐给朋友 */}
      <Sheet open={sheet?.type === 'share'} onClose={() => setSheet(null)} title="推荐给朋友">
        <ShareView
          onCopy={() => {
            showToast('链接已复制到剪贴板');
          }}
        />
      </Sheet>

      {/* 清空聊天记录 */}
      <Sheet open={sheet?.type === 'clear'} onClose={() => setSheet(null)} title="清空聊天记录">
        <ClearView
          onConfirm={() => {
            try {
              const keys = Object.keys(localStorage).filter((k) =>
                /(chat|session|message|conversation)/i.test(k),
              );
              keys.forEach((k) => localStorage.removeItem(k));
            } catch {}
            showToast('聊天记录已清空');
            setSheet(null);
          }}
          onCancel={() => setSheet(null)}
        />
      </Sheet>
    </div>
  );
}

// ================= 子页面组件 =================

function AccountForm({
  initial,
  onSave,
  onClose,
}: {
  initial: AppSettings;
  onSave: (v: { username: string; email: string }) => void;
  onClose: () => void;
}) {
  const [username, setUsername] = useState(initial.username);
  const [email, setEmail] = useState(initial.email);
  const canSave = username.trim().length > 0 && email.trim().length > 0;
  return (
    <div className="p-4 space-y-5">
      <Field label="昵称">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full text-[16px] bg-ios-bg rounded-[10px] px-3 py-3 outline-none text-ios-label"
          placeholder="输入你的昵称"
          maxLength={20}
        />
      </Field>
      <Field label="邮箱">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-[16px] bg-ios-bg rounded-[10px] px-3 py-3 outline-none text-ios-label"
          placeholder="输入你的邮箱"
        />
      </Field>
      <div className="flex gap-3 pt-2">
        <button
          onClick={onClose}
          className="flex-1 h-[46px] bg-ios-gray/15 rounded-[12px] text-[16px] font-medium text-ios-label"
        >
          取消
        </button>
        <button
          disabled={!canSave}
          onClick={() => onSave({ username: username.trim(), email: email.trim() })}
          className={`flex-1 h-[46px] rounded-[12px] text-[16px] font-semibold text-white ${
            canSave ? 'bg-ios-blue' : 'bg-ios-gray/40'
          }`}
        >
          保存
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[13px] text-ios-gray mb-1.5 px-1">{label}</div>
      {children}
    </div>
  );
}

function LanguagePicker({
  value,
  options,
  onPick,
}: {
  value: string;
  options: string[];
  onPick: (lang: string) => void;
}) {
  return (
    <div className="p-3">
      <div className="mx-3 bg-white rounded-[12px] overflow-hidden shadow-sm">
        {options.map((lang, i) => (
          <button
            key={lang}
            onClick={() => onPick(lang)}
            className={`w-full flex items-center h-[50px] px-4 active:bg-black/[0.04] ${
              i !== options.length - 1 ? 'border-b border-black/[0.08]' : ''
            }`}
          >
            <span className="text-[17px] text-ios-label flex-1 text-left">{lang}</span>
            {lang === value && (
              <Check className="w-[18px] h-[18px] text-ios-blue" strokeWidth={2.5} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function AboutApp() {
  const items = [
    ['应用名称', 'AI Challenge Center'],
    ['版本', '1.0.0 (Build 240730)'],
    ['开发者', 'Figment Studio'],
    ['框架', 'React + Vite + Tailwind CSS'],
    ['设备型号', 'Web Universal'],
    ['系统', '浏览器环境'],
    ['容量', `${Math.round((window.performance as any)?.memory?.jsHeapSizeLimit / 1024 / 1024) || 512} MB`],
    ['UUID', '8F3A-7B5D-2E9C-1F0A'],
  ];
  return (
    <div className="p-3">
      <div className="flex flex-col items-center py-5">
        <div
          className="w-[80px] h-[80px] rounded-[20px] mb-3 shadow-md"
          style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
        />
        <h3 className="text-[18px] font-semibold text-ios-label">AI挑战中心</h3>
        <p className="text-[13px] text-ios-gray mt-0.5">Version 1.0.0</p>
      </div>
      <div className="mx-3 bg-white rounded-[12px] overflow-hidden shadow-sm">
        {items.map(([k, v], i) => (
          <div
            key={k}
            className={`flex items-center min-h-[44px] px-4 ${
              i !== items.length - 1 ? 'border-b border-black/[0.08]' : ''
            }`}
          >
            <span className="text-[15px] text-ios-label flex-1">{k}</span>
            <span className="text-[15px] text-ios-gray truncate max-w-[60%]">{v}</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[12px] text-ios-gray/70 mt-5 mb-3">
        © 2026 AI Challenge Center. All rights reserved.
      </p>
    </div>
  );
}

function PolicyText({ kind }: { kind: 'privacy' | 'data' }) {
  const title = kind === 'privacy' ? '隐私政策' : '数据与权限';
  const sections =
    kind === 'privacy'
      ? [
          ['1. 数据范围', '我们仅在你同意的前提下收集匿名化的使用数据，用于改进产品体验。'],
          ['2. 存储与加密', '聊天记录、设置偏好、游戏数据均保存在本地浏览器，加密存储。'],
          ['3. 第三方共享', '未经你的同意，我们不会将任何个人数据分享给第三方。'],
          ['4. 删除权利', '你可以随时通过「数据与权限」删除所有本地数据。'],
          ['5. Cookie', '本产品仅使用必要的 Cookie 用于保持会话。'],
          ['6. 联系我们', '如有疑问，请通过「提交反馈」与我们联系。'],
        ]
      : [
          ['1. 麦克风 / 语音', '未申请访问权限。'],
          ['2. 相机', '未申请访问权限。'],
          ['3. 位置信息', '不收集。'],
          ['4. 通知权限', '由你在浏览器或系统中授权。'],
          ['5. 本地存储', '用于保存你的设置、聊天记录、挑战统计。'],
          ['6. 网络请求', '仅用于加载页面资源与可选的 AI 接口。'],
        ];
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-[20px] font-bold text-ios-label">{title}</h2>
      <p className="text-[13px] text-ios-gray leading-relaxed">
        最后更新：2026 年 7 月 30 日
      </p>
      {sections.map(([k, v]) => (
        <div key={k} className="bg-white rounded-[12px] p-4">
          <div className="text-[15px] font-semibold text-ios-label mb-1">{k}</div>
          <div className="text-[14px] text-ios-secondary leading-relaxed">{v}</div>
        </div>
      ))}
    </div>
  );
}

function HelpView() {
  const faqs: { q: string; a: string }[] = [
    { q: '怎么开始一局挑战？', a: '在首页点击「识破AI」卡片，系统会自动匹配一位聊天对象。通过聊天判断 TA 是真人还是 AI。' },
    { q: '什么是已读回执？', a: '开启后，对方会看到你已读的消息时间；关闭后，对方无法判断你是否看过。' },
    { q: '60 秒倒计时怎么玩？', a: '每条消息都需要在 60 秒内回复，否则挑战失败。对方也适用相同规则。' },
    { q: '对方会如何判断我？', a: '挑战结束后，结果页会展示你和对方的双向判断，相当于双盲图灵测试。' },
    { q: '聊天记录会保存吗？', a: '在设置中开启「自动保存聊天记录」后，历史对话会保存在本地。' },
    { q: '如何换个账号？', a: '进入账户编辑页修改昵称和邮箱；或点击最底部的「退出登录」。' },
  ];
  return (
    <div className="p-4 space-y-3">
      <div className="bg-ios-blue/10 rounded-[12px] p-4">
        <div className="text-[15px] font-semibold text-ios-blue mb-1">❓ 需要帮助？</div>
        <div className="text-[13px] text-ios-secondary leading-relaxed">
          下面整理了常见问题，如果仍有疑问，可返回设置页点击「提交反馈」。
        </div>
      </div>
      {faqs.map((f, i) => (
        <div key={i} className="bg-white rounded-[12px] p-4">
          <div className="text-[15px] font-semibold text-ios-label mb-1.5">{f.q}</div>
          <div className="text-[14px] text-ios-secondary leading-relaxed">{f.a}</div>
        </div>
      ))}
    </div>
  );
}

function FeedbackView({
  onSubmit,
  onClose,
}: {
  onSubmit: (text: string, category: string) => void;
  onClose: () => void;
}) {
  const [category, setCategory] = useState('Bug 反馈');
  const [text, setText] = useState('');
  const cats = ['Bug 反馈', '功能建议', '体验优化', '其他'];
  return (
    <div className="p-4 space-y-4">
      <Field label="反馈类型">
        <div className="flex flex-wrap gap-2">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-[14px] ${
                category === c
                  ? 'bg-ios-blue text-white'
                  : 'bg-ios-gray/15 text-ios-label'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Field>
      <Field label="详细描述">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          maxLength={500}
          placeholder="请描述你遇到的问题或想提出的建议..."
          className="w-full text-[16px] bg-ios-bg rounded-[10px] px-3 py-3 outline-none text-ios-label resize-none"
        />
        <div className="text-right text-[12px] text-ios-gray mt-1">
          {text.length} / 500
        </div>
      </Field>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-[46px] bg-ios-gray/15 rounded-[12px] text-[16px] font-medium text-ios-label"
        >
          取消
        </button>
        <button
          disabled={text.trim().length < 5}
          onClick={() => onSubmit(text.trim(), category)}
          className={`flex-1 h-[46px] rounded-[12px] text-[16px] font-semibold text-white flex items-center justify-center gap-1.5 ${
            text.trim().length >= 5 ? 'bg-ios-blue' : 'bg-ios-gray/40'
          }`}
        >
          <Send className="w-4 h-4" />
          提交
        </button>
      </div>
    </div>
  );
}

function RateView({
  onSubmit,
  onClose,
}: {
  onSubmit: (stars: number, text: string) => void;
  onClose: () => void;
}) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState('');
  return (
    <div className="p-4 space-y-4">
      <div className="text-center py-3">
        <p className="text-[15px] text-ios-gray mb-3">请为我们打分吧</p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)}>
              <Star
                className={`w-8 h-8 transition-transform ${
                  n <= stars ? 'text-ios-orange fill-ios-orange' : 'text-ios-gray/40'
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-[13px] text-ios-gray mt-2">
          {['很差', '一般', '还行', '不错', '非常棒'][stars - 1]}
        </p>
      </div>
      <Field label="评价内容（可选）">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          maxLength={300}
          placeholder="留下你对产品的评价..."
          className="w-full text-[16px] bg-ios-bg rounded-[10px] px-3 py-3 outline-none text-ios-label resize-none"
        />
      </Field>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-[46px] bg-ios-gray/15 rounded-[12px] text-[16px] font-medium text-ios-label"
        >
          取消
        </button>
        <button
          onClick={() => onSubmit(stars, text)}
          className="flex-1 h-[46px] bg-ios-blue rounded-[12px] text-[16px] font-semibold text-white"
        >
          提交评价
        </button>
      </div>
    </div>
  );
}

function ShareView({ onCopy }: { onCopy: () => void }) {
  const link = 'https://ai-challenge.app/invite?ref=share';
  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    onCopy();
  };
  const channels = [
    { name: '微信', color: '#07C160' },
    { name: '朋友圈', color: '#4E96E4' },
    { name: 'QQ', color: '#12B7F5' },
    { name: '微博', color: '#FF8200' },
    { name: '复制链接', color: '#007AFF' },
  ];
  return (
    <div className="p-4 space-y-5">
      <div className="bg-white rounded-[16px] p-5 flex items-center gap-4 shadow-sm">
        <div
          className="w-[60px] h-[60px] rounded-[14px] shrink-0"
          style={{ background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)' }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-semibold text-ios-label mb-0.5">AI挑战中心</div>
          <div className="text-[13px] text-ios-gray truncate">{link}</div>
        </div>
        <button
          onClick={copy}
          className="w-9 h-9 rounded-full bg-ios-blue/10 flex items-center justify-center shrink-0"
        >
          <Copy className="w-4 h-4 text-ios-blue" strokeWidth={2} />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-3">
        {channels.slice(0, 4).map((c) => (
          <button key={c.name} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-semibold"
              style={{ background: c.color }}
            >
              {c.name.slice(0, 2)}
            </div>
            <span className="text-[12px] text-ios-secondary">{c.name}</span>
          </button>
        ))}
      </div>
      <button
        onClick={copy}
        className="w-full h-[48px] bg-white rounded-[12px] text-[16px] font-semibold text-ios-blue shadow-sm active:bg-black/[0.04] flex items-center justify-center gap-2"
      >
        <Copy className="w-4 h-4" />
        复制邀请链接
      </button>
    </div>
  );
}

function ClearView({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="bg-ios-red/10 rounded-[12px] p-4 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-ios-red/20 flex items-center justify-center shrink-0 mt-0.5">
          <Trash2 className="w-4 h-4 text-ios-red" />
        </div>
        <div>
          <div className="text-[15px] font-semibold text-ios-label mb-1">
            确认清空所有聊天记录？
          </div>
          <div className="text-[13px] text-ios-secondary leading-relaxed">
            此操作将删除本地保存的全部对话、匹配记录与挑战过程，且无法恢复。
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 h-[46px] bg-white rounded-[12px] text-[16px] font-medium text-ios-label shadow-sm"
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-[46px] bg-ios-red rounded-[12px] text-[16px] font-semibold text-white shadow-sm"
        >
          确认清空
        </button>
      </div>
    </div>
  );
}
