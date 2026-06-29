interface CartVerseLogoProps {
  size?: number;
  showText?: boolean;
  textSize?: string;
  className?: string;
}

export default function CartVerseLogo({
  size = 38,
  showText = true,
  textSize = 'text-xl',
  className = '',
}: CartVerseLogoProps) {
  const id = `logo-grad-${size}`;
  const id2 = `logo-inner-${size}`;

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="CartVerse logo"
      >
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6366f1" />
            <stop offset="55%"  stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id={id2} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6366f1" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>

        {/* Rounded square background */}
        <rect width="44" height="44" rx="12" fill={`url(#${id})`} />

        {/* Subtle inner glow */}
        <rect width="44" height="44" rx="12" fill="white" opacity="0.06" />

        {/* Shopping bag handle */}
        <path
          d="M16 19 C16 13 28 13 28 19"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />

        {/* Shopping bag body */}
        <rect x="11" y="19" width="22" height="15" rx="3" fill="white" opacity="0.95" />

        {/* "V" checkmark inside bag */}
        <path
          d="M17 25.5 L21 30 L27 22"
          stroke={`url(#${id2})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Sparkle dots (cosmic/verse feel) */}
        <circle cx="35" cy="9"  r="2"   fill="white" opacity="0.65" />
        <circle cx="39" cy="5"  r="1.2" fill="white" opacity="0.4"  />
        <circle cx="31" cy="5"  r="1"   fill="white" opacity="0.35" />
        <circle cx="38" cy="13" r="0.8" fill="white" opacity="0.3"  />
      </svg>

      {showText && (
        <span className={`font-bold ${textSize} tracking-tight leading-none`}>
          <span className="gradient-text">Cart</span>
          <span className="text-gray-900 dark:text-white">Verse</span>
        </span>
      )}
    </div>
  );
}
