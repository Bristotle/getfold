import type { MetadataRoute } from "next";

/**
 * Generated rather than static, so the icon paths always point at files that
 * actually exist. The previous public/manifest.json referenced two PNGs that
 * were never committed, which silently made the app non-installable.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fold, church management",
    short_name: "Fold",
    description:
      "Members, attendance, tithes and returns for Ghanaian churches.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f6",
    theme_color: "#6b2fd9",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        // Android crops maskable icons to its own shape. The mark sits well
        // inside the safe area, so the door is never clipped.
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      { name: "Members", url: "/members" },
      { name: "Record attendance", url: "/attendance" },
      { name: "Record giving", url: "/contributions" },
    ],
  };
}
