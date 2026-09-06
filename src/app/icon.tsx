import { ImageResponse } from "next/og";

/**
 * The app icon, generated at build time rather than committed as a binary.
 *
 * The manifest previously pointed at /icons/icon-192.png and icon-512.png,
 * neither of which existed, so the app could not be installed to a home
 * screen at all. Generating them keeps the mark in one place: change the
 * path here and every size follows.
 *
 * The shape is the church door from the logo. An arch survives being drawn
 * at 32px where a detailed building turns to mush.
 */

export const size = { width: 512, height: 512 };
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
          background: "#6b2fd9",
        }}
      >
        <svg
          width="330"
          height="330"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 14.5 16 4l12 10.5"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.5 13.5V27h19V13.5"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12.5 27v-6a3.5 3.5 0 1 1 7 0v6"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
