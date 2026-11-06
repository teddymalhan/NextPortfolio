import { cacheLife } from 'next/cache'
import { cacheTag } from 'next/cache'
import { resumeService } from '@/lib/services/resume-service'
import { HomeClient } from './home-client'
import type { Metadata } from 'next'
import { getProjectCards } from '@/lib/projects'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Home',
  description: site.description,
}

export default async function Home() {
  'use cache'
  cacheLife('hours')
  cacheTag('home-page')

  const isResumeVisible = await resumeService.getResumeVisibility()
  const resumePath = isResumeVisible ? '/api/resume/file' : null

  return <HomeClient isResumeVisible={isResumeVisible} resumePath={resumePath} projectCards={getProjectCards()} />
}
