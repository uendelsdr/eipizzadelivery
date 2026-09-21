export function OkeiIcon({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, background: "#ce2018", borderRadius: size * 0.28 }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );
}

export default function OkeiLogo({
  iconSize = 36,
  textSize = "text-xl",
}: {
  iconSize?: number;
  textSize?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <OkeiIcon size={iconSize} />
      <span className={`${textSize} font-extrabold tracking-tight`}>
        <span className="text-white">Ok</span>
        <span style={{ color: "var(--accent)" }}>EI</span>
      </span>
    </div>
  );
}
