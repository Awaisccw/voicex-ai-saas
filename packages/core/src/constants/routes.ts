export const APP_ROUTES = {
  HOME: "/",
  STUDIO: "/studio",
  VOICES: "/voices",
  CLONING: "/cloning",
  PRICING: "/pricing",
  API_DOCS: "/docs/api",
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  SETTINGS: "/settings",
  PROJECTS: "/projects",
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
