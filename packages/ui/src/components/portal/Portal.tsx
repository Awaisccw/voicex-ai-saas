"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export interface PortalProps {
  readonly children: React.ReactNode;
  readonly containerId?: string;
}

export const Portal: React.FC<PortalProps> = ({ children, containerId }) => {
  const [mounted, setMounted] = React.useState(false);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
    if (containerId) {
      const existing = document.getElementById(containerId);
      if (existing) {
        setContainer(existing);
        return;
      }
      const newContainer = document.createElement("div");
      newContainer.id = containerId;
      document.body.appendChild(newContainer);
      setContainer(newContainer);
    } else {
      setContainer(document.body);
    }
  }, [containerId]);

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
};

Portal.displayName = "Portal";
