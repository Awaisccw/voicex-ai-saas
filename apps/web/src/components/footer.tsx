import * as React from "react";
import Link from "next/link";
import { Container, Logo, Badge } from "@saas/ui";
import { APP_ROUTES } from "@saas/core";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-card/40 mt-auto">
      <Container size="xl" className="py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <Link href={APP_ROUTES.HOME}>
              <Logo size="md" variant="full" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Enterprise-grade neural acoustic synthesis platform. Transform text into emotive,
              broadcast-quality voices with fine-tuned emotion, cadence, and multi-lingual mastery.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Badge variant="success" size="sm" dot>
                All Neural Engines Operational
              </Badge>
            </div>
          </div>

          {/* Product Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Product
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="#demo" className="hover:text-foreground transition-colors">
                  AI Voice Studio
                </Link>
              </li>
              <li>
                <Link href="#voices" className="hover:text-foreground transition-colors">
                  Voice Library (120+)
                </Link>
              </li>
              <li>
                <Link href="#cloning" className="hover:text-foreground transition-colors">
                  Zero-Shot Voice Cloning
                </Link>
              </li>
              <li>
                <Link href="#api" className="hover:text-foreground transition-colors">
                  Developer REST API
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-foreground transition-colors">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="#docs" className="hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#sdk" className="hover:text-foreground transition-colors">
                  TypeScript & Python SDKs
                </Link>
              </li>
              <li>
                <Link href="#showcase" className="hover:text-foreground transition-colors">
                  Customer Showcase
                </Link>
              </li>
              <li>
                <Link href="#changelog" className="hover:text-foreground transition-colors">
                  Release Notes
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Company
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="#about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#security" className="hover:text-foreground transition-colors">
                  Security & Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VOICEX Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              Turborepo + Next.js 14+ Architecture
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
