import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SignInContent } from './sign-in-content'
import { ClerkProviderWrapper } from '@/components/clerk-provider-wrapper'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access the admin dashboard',
}

export default function SignInPage() {
  return (
    <ClerkProviderWrapper>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen" />}>
        <SignInContent />
      </Suspense>
    </ClerkProviderWrapper>
  )
}
