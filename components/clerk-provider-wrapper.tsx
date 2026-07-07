"use client"

import { ClerkProvider } from "@clerk/nextjs"
import type { ComponentType, ReactNode } from "react"

export function ClerkProviderWrapper({ children }: { children: ReactNode }) {
  // Type assertion needed due to Clerk type definitions
  const Provider = ClerkProvider as unknown as ComponentType<{ children: ReactNode; signInUrl?: string; signUpUrl?: string }>
  return <Provider signInUrl="/sign-in" signUpUrl="/sign-up">{children}</Provider>
}


