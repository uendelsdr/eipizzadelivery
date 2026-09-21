import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

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
          background: "#ce2018",
          borderRadius: 14,
        }}
      >
        <svg
          width="38"
          height="38"
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
    ),
    { ...size },
  );
}
