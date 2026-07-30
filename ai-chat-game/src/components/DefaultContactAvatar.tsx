// iOS 通讯录默认联系人头像
// 蓝紫渐变 + 白色人物轮廓，参考 iPhone 通讯录默认头像
export function DefaultContactAvatar({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center overflow-hidden shrink-0"
      style={{
        width: size,
        height: size,
        background:
          'linear-gradient(135deg, #4A8DFF 0%, #6B6BFF 50%, #8B5CF6 100%)',
      }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 头部 */}
        <circle cx="20" cy="14" r="6.5" fill="white" />
        {/* 身体 / 肩膀 */}
        <path
          d="M6 36 C 6 28.5 12.5 23 20 23 C 27.5 23 34 28.5 34 36 L 34 40 L 6 40 Z"
          fill="white"
        />
      </svg>
    </div>
  );
}
