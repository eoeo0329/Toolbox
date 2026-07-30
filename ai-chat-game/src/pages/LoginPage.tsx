import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Apple, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../store/Store';

export default function LoginPage() {
  const nav = useNavigate();
  const { dispatch } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const submit = () => {
    const displayName = name || email.split('@')[0] || 'Aura 用户';
    dispatch({
      type: 'LOGIN',
      payload: {
        id: 'u_' + Date.now(),
        name: displayName,
        email,
        bio: mode === 'register' ? '欢迎来到 Aura！' : '很高兴再次见到你',
        joinedAt: Date.now(),
      },
    });
    nav(-1);
  };

  return (
    <div className="min-h-screen aurora flex flex-col">
      <div className="safe-top px-5 pt-3">
        <button
          onClick={() => nav(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/60 backdrop-blur"
        >
          <ArrowLeft size={20} className="text-ios-blue" />
        </button>
      </div>

      <div className="flex-1 px-8 py-10 flex flex-col">
        <div className="w-20 h-20 rounded-3xl grad-1 mx-auto flex items-center justify-center text-white text-4xl mb-4 shadow-pop">
          ✨
        </div>
        <h1 className="text-3xl font-bold text-center text-ios-label">欢迎回来</h1>
        <p className="text-sm text-center text-ios-label3 mt-1">登录后同步你的对话与收藏</p>

        <div className="mt-8 space-y-3">
          {mode === 'register' && (
            <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-inner2">
              <Mail size={18} className="text-ios-label3" />
              <input
                className="flex-1 ios-input"
                placeholder="昵称"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-inner2">
            <Mail size={18} className="text-ios-label3" />
            <input
              className="flex-1 ios-input"
              type="email"
              placeholder="邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-inner2">
            <Lock size={18} className="text-ios-label3" />
            <input
              className="flex-1 ios-input"
              type={showPwd ? 'text' : 'password'}
              placeholder="密码"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <button onClick={() => setShowPwd((v) => !v)} className="text-ios-label3">
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          onClick={submit}
          className="mt-6 w-full py-3.5 rounded-2xl bg-ios-blue text-white font-semibold text-base tap-scale shadow-lg"
        >
          {mode === 'login' ? '登录' : '注册账号'}
        </button>

        <div className="mt-4 text-center text-sm text-ios-label3">
          {mode === 'login' ? (
            <>
              还没有账号？
              <button className="text-ios-blue ml-1 font-medium" onClick={() => setMode('register')}>
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？
              <button className="text-ios-blue ml-1 font-medium" onClick={() => setMode('login')}>
                去登录
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-[11px] text-ios-label3">
          — 或使用第三方登录 —
        </div>

        <div className="mt-3 flex gap-3 justify-center">
          <button className="w-12 h-12 rounded-full bg-white shadow-inner2 flex items-center justify-center tap-scale">
            <Apple size={22} className="text-ios-label" />
          </button>
          <button className="w-12 h-12 rounded-full bg-white shadow-inner2 flex items-center justify-center tap-scale text-ios-blue font-bold text-sm">
            G
          </button>
          <button className="w-12 h-12 rounded-full bg-white shadow-inner2 flex items-center justify-center tap-scale text-green-500 font-bold text-sm">
            微
          </button>
        </div>

        <p className="mt-auto text-center text-[11px] text-ios-label3 pt-8">
          登录即表示同意《用户协议》和《隐私政策》
        </p>
      </div>
    </div>
  );
}
