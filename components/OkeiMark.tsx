export function OkeiIcon({ size = 36 }: { size?: number }) {
  const trackW = size * 0.681;
  const trackH = size * 0.389;
  const knob = size * 0.319;

  return (
    <div
      className="flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, background: "var(--accent)", borderRadius: size * 0.278 }}
    >
      <div
        className="flex items-center justify-end"
        style={{
          width: trackW,
          height: trackH,
          borderRadius: trackH / 2,
          background: "#ffffff",
          padding: size * 0.042,
        }}
      >
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: knob, height: knob, background: "var(--accent)" }}
        >
          <svg
            width={knob * 0.6}
            height={knob * 0.6}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function OkeiLogo({
  iconSize = 36,
  textSize = "text-xl",
  showTagline = false,
  stacked = false,
}: {
  iconSize?: number;
  textSize?: string;
  showTagline?: boolean;
  stacked?: boolean;
}) {
  return (
    <div className={`flex ${stacked ? "flex-col items-center gap-3.5" : "items-center gap-3"}`}>
      <OkeiIcon size={iconSize} />
      <div className={`flex flex-col gap-0.5 ${stacked ? "items-center" : ""}`}>
        <span
          className={`${textSize} leading-none font-black text-white`}
          style={{ fontFamily: "var(--font-brand)", letterSpacing: "-0.05em" }}
        >
          OkEI
        </span>
        {showTagline && (
          <span
            className="font-mono text-[10px] uppercase"
            style={{ letterSpacing: "0.22em", color: "var(--text-tertiary)" }}
          >
            demandas
          </span>
        )}
      </div>
    </div>
  );
}
