type Props = { className?: string };

/** Red dashed, gently curved divider — replaces plain <hr>/border rules between major sections. */
export function StitchDivider({ className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 400 12"
      preserveAspectRatio="none"
      className={`h-3 w-full ${className}`}
      aria-hidden="true"
    >
      <path
        d="M0,8 Q200,0 400,8"
        fill="none"
        stroke="var(--color-stitch-red)"
        strokeWidth="2"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
    </svg>
  );
}
