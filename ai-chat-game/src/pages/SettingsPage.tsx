import { motion } from 'framer-motion';
import { useState } from 'react';
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
} from 'lucide-react';

// iOS 风格开关组件
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

// 设置行：左侧图标 + 标题 + 右侧控件
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
      <div className="flex items-center gap-1 pr-2">
        {right}
      </div>
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

// 设置分组（带圆角的白色卡片）
interface SettingGroupProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
}

function SettingGroup({ children, header, footer }: SettingGroupProps) {
  return (
    <div className="mb-7">
      {header && (
        <h3 className="px-5 mb-1.5 text-[13px] text-ios-gray uppercase tracking-wide font-medium">
          {header}
        </h3>
      )}
      <div className="mx-3 bg-white rounded-[12px] overflow-hidden shadow-sm">
        {children}
      </div>
      {footer && (
        <p className="px-5 mt-1.5 text-[13px] text-ios-gray leading-relaxed">
          {footer}
        </p>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  // 状态
  const [notifications, setNotifications] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);
  const [sound, setSound] = useState(true);
  const [vibrate, setVibrate] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoDark, setAutoDark] = useState(true);
  const [boldText, setBoldText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [readReceipts, setReadReceipts] = useState(true);
  const [showOnline, setShowOnline] = useState(true);
  const [dataCollection, setDataCollection] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [wifiOnly, setWifiOnly] = useState(false);

  return (
    <div className="min-h-screen w-full bg-ios-bg flex flex-col" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Helvetica Neue", sans-serif' }}>
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

      {/* ===== 主要内容 ===== */}
      <main className="flex-1 overflow-y-auto pb-10">
        <div className="pt-4" />

        {/* ===== 1. 账户 ===== */}
        <SettingGroup header="账户">
          <SettingRow
            iconBg="linear-gradient(135deg, #5AC8FA 0%, #007AFF 50%, #5856D6 100%)"
            icon={<User className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="挑战者 · 857"
            right={
              <>
                <span className="text-[15px] text-ios-gray">Apple ID</span>
                <ChevronRight className="w-[14px] h-[14px] text-ios-gray/60 ml-1" strokeWidth={2.5} />
              </>
            }
            onClick={() => alert('个人资料')}
          />
        </SettingGroup>

        {/* ===== 2. 通知 ===== */}
        <SettingGroup
          header="通知"
          footer="选择希望接收哪些通知，以及通知的显示方式。建议保持消息通知开启，以免错过挑战。"
        >
          <SettingRow
            iconBg="#FF3B30"
            icon={<Bell className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="允许通知"
            right={
              <IosToggle checked={notifications} onChange={setNotifications} />
            }
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<MessageSquare className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="消息预览"
            right={
              <IosToggle checked={messagePreview} onChange={setMessagePreview} />
            }
          />
          <SettingRow
            iconBg="#5AC8FA"
            icon={<Volume2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="声音"
            right={
              <IosToggle checked={sound} onChange={setSound} />
            }
          />
          <SettingRow
            iconBg="#AF52DE"
            icon={<Smartphone className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="振动"
            right={<IosToggle checked={vibrate} onChange={setVibrate} />}
            isLast
          />
        </SettingGroup>

        {/* ===== 3. 外观 ===== */}
        <SettingGroup
          header="外观"
          footer="深色模式可减少眼睛疲劳，并延长屏幕续航时间。"
        >
          <SettingRow
            iconBg="#1D1D1F"
            icon={<Moon className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="深色模式"
            right={
              <IosToggle checked={darkMode} onChange={setDarkMode} />
            }
          />
          <SettingRow
            iconBg="#5856D6"
            icon={<Globe className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="自动切换"
            right={
              <IosToggle checked={autoDark} onChange={setAutoDark} />
            }
          />
          <SettingRow
            iconBg="#FF2D92"
            icon={<Palette className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="粗体文本"
            right={
              <IosToggle checked={boldText} onChange={setBoldText} />
            }
          />
          <SettingRow
            iconBg="#34C759"
            icon={<Eye className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="减弱动态效果"
            right={<IosToggle checked={reduceMotion} onChange={setReduceMotion} />}
            isLast
          />
        </SettingGroup>

        {/* ===== 4. 聊天设置 ===== */}
        <SettingGroup header="聊天" footer="自定义聊天界面的显示方式与内容可见性。">
          <SettingRow
            iconBg="#007AFF"
            icon={<MessageSquare className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="发送已读回执"
            right={
              <IosToggle checked={readReceipts} onChange={setReadReceipts} />
            }
          />
          <SettingRow
            iconBg="#34C759"
            icon={<User className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="显示在线状态"
            right={
              <IosToggle checked={showOnline} onChange={setShowOnline} />
            }
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<Trash2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="自动保存聊天记录"
            right={<IosToggle checked={autoSave} onChange={setAutoSave} />}
            isLast
          />
        </SettingGroup>

        {/* ===== 5. 隐私 ===== */}
        <SettingGroup
          header="隐私"
          footer="我们非常重视你的数据隐私。所有挑战数据均在本地加密。"
        >
          <SettingRow
            iconBg="#007AFF"
            icon={<Shield className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="数据收集"
            right={
              <IosToggle checked={dataCollection} onChange={setDataCollection} />
            }
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<Globe className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="仅在 Wi-Fi 下加载内容"
            right={
              <IosToggle checked={wifiOnly} onChange={setWifiOnly} />
            }
          />
          <SettingRow
            iconBg="#AF52DE"
            icon={<Info className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="隐私政策"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => alert('隐私政策')}
          />
          <SettingRow
            iconBg="#5856D6"
            icon={<Settings className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="数据与权限"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => alert('数据与权限')}
            isLast
          />
        </SettingGroup>

        {/* ===== 6. 通用 ===== */}
        <SettingGroup header="通用">
          <SettingRow
            iconBg="#8E8E93"
            icon={<Settings className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="语言"
            right={
              <>
                <span className="text-[15px] text-ios-gray">简体中文</span>
                <ChevronRight className="w-[14px] h-[14px] text-ios-gray/60 ml-1" strokeWidth={2.5} />
              </>
            }
            onClick={() => alert('语言设置')}
          />
          <SettingRow
            iconBg="#34C759"
            icon={<Info className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="关于本机"
            right={
              <>
                <span className="text-[15px] text-ios-gray">v1.0.0</span>
                <ChevronRight className="w-[14px] h-[14px] text-ios-gray/60 ml-1" strokeWidth={2.5} />
              </>
            }
            onClick={() => alert('关于')}
            isLast
          />
        </SettingGroup>

        {/* ===== 7. 帮助反馈 ===== */}
        <SettingGroup header="帮助与反馈">
          <SettingRow
            iconBg="#007AFF"
            icon={<HelpCircle className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="使用帮助"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => alert('使用帮助')}
          />
          <SettingRow
            iconBg="#FF9500"
            icon={<Mail className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="提交反馈"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => alert('提交反馈')}
          />
          <SettingRow
            iconBg="#5856D6"
            icon={<Star className="w-[18px] h-[18px] text-white" fill="white" strokeWidth={1.8} />}
            title="评分 App Store"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => alert('前往评分')}
          />
          <SettingRow
            iconBg="#34C759"
            icon={<Share2 className="w-[18px] h-[18px] text-white" strokeWidth={1.8} />}
            title="推荐给朋友"
            right={<ChevronRight className="w-[14px] h-[14px] text-ios-gray/60" strokeWidth={2.5} />}
            onClick={() => alert('分享')}
            isLast
          />
        </SettingGroup>

        {/* ===== 8. 退出登录 ===== */}
        <div className="mx-3 mb-7">
          <button
            onClick={() => {
              if (confirm('确定要退出登录吗？')) {
                alert('已退出登录');
                navigate('/');
              }
            }}
            className="w-full h-[46px] bg-white rounded-[12px] flex items-center justify-center gap-2 text-[17px] text-ios-red active:bg-black/[0.04] shadow-sm"
          >
            <LogOut className="w-[20px] h-[20px]" strokeWidth={1.8} />
            退出登录
          </button>
        </div>

        {/* 底部版本信息 */}
        <div className="text-center text-[12px] text-ios-gray/80 pb-6 space-y-0.5">
          <p>AI Challenge Center</p>
          <p>Version 1.0.0 · Build 240730</p>
        </div>
      </main>
    </div>
  );
}
