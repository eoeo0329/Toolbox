import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Type, Eye, MessageSquare, Trash2, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../store/Store';
import { useState } from 'react';

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className={`toggle ${on ? 'on' : ''}`} />
  );
}

export default function SettingsPage() {
  const nav = useNavigate();
  const { state, dispatch } = useStore();
  const [notif, setNotif] = useState(state.settings.notifications);
  const [readReceipts, setReadReceipts] = useState(state.settings.readReceipts);

  const clearData = () => {
    if (confirm('确定要清除所有对话和本地数据吗？')) {
      localStorage.removeItem('aura_chat_state_v1');
      location.reload();
    }
  };

  const logout = () => {
    if (confirm('确定要退出登录吗？')) {
      dispatch({ type: 'LOGOUT' });
      nav('/login');
    }
  };

  return (
    <div>
      <div className="glass pt-safe sticky top-0 z-30">
        <div className="flex items-center px-3 py-2">
          <button
            onClick={() => nav(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center tap-scale"
          >
            <ArrowLeft size={22} className="text-ios-blue" />
          </button>
          <h1 className="text-base font-semibold text-ios-label flex-1 text-center pr-10">设置</h1>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Account */}
        <div>
          <div className="text-xs text-ios-label3 mb-2 px-1">账户</div>
          <div className="cell-group">
            <div className="cell cursor-pointer" onClick={() => nav('/profile')}>
              <div className="w-10 h-10 rounded-full grad-1 flex items-center justify-center text-white font-semibold">
                {state.user ? state.user.name.slice(0, 1) : '?'}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-ios-label">{state.user?.name || '未登录'}</div>
                <div className="text-xs text-ios-label3">{state.user?.email || '点击登录 / 绑定账号'}</div>
              </div>
              <ChevronRight size={16} className="text-ios-label3" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <div className="text-xs text-ios-label3 mb-2 px-1">通知</div>
          <div className="cell-group">
            <div className="cell">
              <div className="w-9 h-9 rounded-lg bg-ios-red flex items-center justify-center text-white">
                <Bell size={16} />
              </div>
              <div className="flex-1 font-medium text-ios-label">允许通知</div>
              <Toggle on={notif} onChange={(v) => { setNotif(v); dispatch({ type: 'SET_SETTINGS', patch: { notifications: v } }); }} />
            </div>
            <div className="cell">
              <div className="w-9 h-9 rounded-lg bg-ios-orange flex items-center justify-center text-white">
                <MessageSquare size={16} />
              </div>
              <div className="flex-1 font-medium text-ios-label">已读状态</div>
              <Toggle on={readReceipts} onChange={(v) => { setReadReceipts(v); dispatch({ type: 'SET_SETTINGS', patch: { readReceipts: v } }); }} />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <div className="text-xs text-ios-label3 mb-2 px-1">外观</div>
          <div className="cell-group">
            <div className="cell">
              <div className="w-9 h-9 rounded-lg bg-ios-label flex items-center justify-center text-white">
                <Moon size={16} />
              </div>
              <div className="flex-1 font-medium text-ios-label">深色模式（跟随系统）</div>
              <Toggle on={false} onChange={() => {}} />
            </div>
            <div className="cell">
              <div className="w-9 h-9 rounded-lg bg-ios-pink flex items-center justify-center text-white">
                <Type size={16} />
              </div>
              <div className="flex-1 font-medium text-ios-label">粗体文本</div>
              <Toggle on={false} onChange={() => {}} />
            </div>
            <div className="cell">
              <div className="w-9 h-9 rounded-lg bg-ios-green flex items-center justify-center text-white">
                <Eye size={16} />
              </div>
              <div className="flex-1 font-medium text-ios-label">减弱动态效果</div>
              <Toggle on={false} onChange={() => {}} />
            </div>
          </div>
        </div>

        {/* Data */}
        <div>
          <div className="text-xs text-ios-label3 mb-2 px-1">数据</div>
          <div className="cell-group">
            <div className="cell cursor-pointer" onClick={clearData}>
              <div className="w-9 h-9 rounded-lg bg-ios-red flex items-center justify-center text-white">
                <Trash2 size={16} />
              </div>
              <div className="flex-1 font-medium text-ios-label">清除所有数据</div>
              <ChevronRight size={16} className="text-ios-label3" />
            </div>
            {state.user && (
              <div className="cell cursor-pointer" onClick={logout}>
                <div className="w-9 h-9 rounded-lg bg-ios-orange flex items-center justify-center text-white">
                  <LogOut size={16} />
                </div>
                <div className="flex-1 font-medium text-ios-label">退出登录</div>
                <ChevronRight size={16} className="text-ios-label3" />
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div>
          <div className="text-xs text-ios-label3 mb-2 px-1">关于</div>
          <div className="cell-group">
            <div className="cell">
              <div className="flex-1 font-medium text-ios-label">版本</div>
              <div className="text-sm text-ios-label3">1.0.0</div>
            </div>
            <div className="cell cursor-pointer">
              <div className="flex-1 font-medium text-ios-label">用户协议</div>
              <ChevronRight size={16} className="text-ios-label3" />
            </div>
            <div className="cell cursor-pointer">
              <div className="flex-1 font-medium text-ios-label">隐私政策</div>
              <ChevronRight size={16} className="text-ios-label3" />
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-ios-label3 pt-4">
          Aura · AI 角色社区
          <br />
          Made with ♥ in React + Tailwind
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}
