import { readFileSync } from "node:fs";
import { join } from "node:path";

export const IDENTITY_DIR = "identity";

export const LOGO_VARIANTS = ["horizontal", "vertical", "icon", "icon-white"] as const;
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

export interface Logo {
  id: LogoVariant;
  file: string;
  width: number;
  height: number;
  background: string;
  use: string;
  minHeight: number;
}

/** The logo files in identity/. Usage rules live in design-system/08-logo.md. */
export const LOGOS: Logo[] = [
  {
    id: "horizontal",
    file: `${IDENTITY_DIR}/logo.png`,
    width: 1080,
    height: 278,
    background: "light — white #FFFFFF or page gray #F5F5F5",
    use: "Default. TopBar, page/document headers, any wide short slot.",
    minHeight: 24,
  },
  {
    id: "vertical",
    file: `${IDENTITY_DIR}/logo-vertical.png`,
    width: 919,
    height: 1080,
    background: "light — white #FFFFFF or page gray #F5F5F5",
    use: "Centered / square slots: splash, hero or welcome moments, cover slides.",
    minHeight: 64,
  },
  {
    id: "icon",
    file: `${IDENTITY_DIR}/logo-icon.png`,
    width: 451,
    height: 500,
    background: "light — white #FFFFFF or page gray #F5F5F5",
    use: "Tight spaces where the wordmark would be below minimum size; favicon, app icon, small badges.",
    minHeight: 16,
  },
  {
    id: "icon-white",
    file: `${IDENTITY_DIR}/logo-icon-white.png`,
    width: 451,
    height: 500,
    background: "brand blue #0655CB, navy #002F77, or the course-header gradient",
    use: "Any brand-coloured surface (auth screens). No white wordmark lockup exists — use this alone.",
    minHeight: 16,
  },
];

export const findLogo = (id: string) => LOGOS.find((l) => l.id === id);

export const readLogo = (root: string, logo: Logo) => readFileSync(join(root, logo.file)).toString("base64");
