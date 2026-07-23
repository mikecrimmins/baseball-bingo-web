type Props = {
  size?: number;
  className?: string;
};

/** The app mark (baseball-stitching ring, designer-provided SVG). */
export function Logo({ size = 40, className = '' }: Props) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
