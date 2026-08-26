"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

export interface ProvidersProps {
  readonly children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};
