type Props = {
  size?: number;
  className?: string;
};

/** The baseball mark — sits directly on the paper background, no box behind it. */
export function Logo({ size = 40, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="46"
        fill="var(--color-paper-bright)"
        stroke="var(--color-navy)"
        strokeWidth="3"
      />
      <path
        d="M26,15 C13,32 13,68 26,85"
        fill="none"
        stroke="var(--color-stitch-red)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="3 4.5"
      />
      <path
        d="M74,15 C87,32 87,68 74,85"
        fill="none"
        stroke="var(--color-stitch-red)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeDasharray="3 4.5"
      />
    </svg>
  );
}
