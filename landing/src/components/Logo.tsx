export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="logoGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>

      {/* Outer ring with gradient */}
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="url(#logoGradient)"
        strokeWidth="2"
        fill="none"
      />

      {/* Inner annotation marker shape */}
      <path
        d="M24 8C15.163 8 8 15.163 8 24c0 8.837 7.163 16 16 16 2.5 0 4.867-.573 6.979-1.596L38 42l-2.404-7.021C37.786 32.133 40 28.29 40 24c0-8.837-7.163-16-16-16z"
        fill="url(#logoGradient)"
        opacity="0.9"
      />

      {/* Comment dots */}
      <circle cx="17" cy="24" r="2.5" fill="white" />
      <circle cx="24" cy="24" r="2.5" fill="white" />
      <circle cx="31" cy="24" r="2.5" fill="white" />
    </svg>
  );
}

export function LogoMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="markGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>

      {/* Stylized 'A' with annotation bubble */}
      <path
        d="M16 2L4 28h6l2-5h8l2 5h6L16 2zm0 10l3 8h-6l3-8z"
        fill="url(#markGradient)"
      />

      {/* Small annotation dot */}
      <circle cx="26" cy="8" r="4" fill="url(#markGradient)" />
      <circle cx="26" cy="8" r="2" fill="white" />
    </svg>
  );
}
