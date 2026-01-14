export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="#10b981" />
      <path
        d="M16 7L8 25h4l1.5-4h5l1.5 4h4L16 7zm0 6l2 6h-4l2-6z"
        fill="white"
      />
      <circle cx="24" cy="10" r="3" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

export function LogoMark({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 3L4 21h4l1.5-4h5l1.5 4h4L12 3zm0 6l2 6h-4l2-6z"
        fill="#10b981"
      />
      <circle cx="18" cy="6" r="2.5" fill="#10b981" />
    </svg>
  );
}
