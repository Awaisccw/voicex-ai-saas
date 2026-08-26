import type { Config } from "tailwindcss";
import sharedPreset from "@saas/tailwind-config";

const config: Config = {
  presets: [sharedPreset],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
