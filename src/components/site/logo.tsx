export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-brand-deep text-white shadow-sm ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="h-[82%] w-[82%]">
        <text
          x="18.5"
          y="26"
          textAnchor="middle"
          fontFamily="Urbanist, 'Segoe UI', sans-serif"
          fontWeight="800"
          fontSize="26"
          fill="#ffffff"
        >
          B
        </text>
        <path
          d="M5 32 H14 L17 27 L21 37 L24 30 H35"
          stroke="var(--accent-bright)"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="leading-tight">
          <span className="block font-sans text-[15px] font-extrabold tracking-tight text-foreground">
            BloodWorks Health
          </span>
          <span className="block text-[10px] font-medium tracking-[0.14em] uppercase text-muted">
            Lab report intelligence
          </span>
        </span>
      )}
    </span>
  );
}
