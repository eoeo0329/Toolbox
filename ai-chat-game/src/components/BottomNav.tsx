import { NavLink } from 'react-router-dom';
import { Compass, Home, MessageCirclePlus, MessageSquare, User } from 'lucide-react';

const items = [
  { to: '/', label: '首页', Icon: Home },
  { to: '/explore', label: '发现', Icon: Compass },
  { to: '/create', label: '创建', Icon: MessageCirclePlus },
  { to: '/chats', label: '对话', Icon: MessageSquare },
  { to: '/profile', label: '我的', Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 glass-strong border-t border-black/5 pb-safe no-select">
      <div className="grid grid-cols-5 pt-2 px-2 max-w-[430px] mx-auto">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-ios-blue' : 'text-ios-label3'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`w-6 h-6 flex items-center justify-center ${
                    isActive ? 'scale-110' : ''
                  } transition-transform`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.6 : 2} />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
