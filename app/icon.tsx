import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const ACCENT = "#d92b1f";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT,
          borderRadius: 9,
        }}
      >
        <div
          style={{
            width: 22,
            height: 12.5,
            borderRadius: 6.25,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: 1.3,
          }}
        >
          <div
            style={{
              width: 10.2,
              height: 10.2,
              borderRadius: "50%",
              background: ACCENT,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="6"
              height="6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 12.5 L9.5 17.5 L19.5 6.5" />
            </svg>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
