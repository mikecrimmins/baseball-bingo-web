/** Small rotated rubber-stamp label — status badges (Host, Caller, Called). */
export function StampBadge({ label }: { label: string }) {
  return (
    <span
      className="font-varsity inline-block rounded-[3px] border-[1.5px] border-stitch-red px-1.5 py-0.5 text-[10px] tracking-[0.1em] text-stitch-red uppercase"
      style={{ transform: 'rotate(-5deg)' }}
    >
      {label}
    </span>
  );
}
