import { auth, currentUser } from '@clerk/nextjs/server'

export async function getAdminUserId(): Promise<string | null> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  if (!user) return null

  const authorizedEmails = (process.env.AUTHORIZED_ADMINS || '').split(',').filter(Boolean)
  const userEmail = user.emailAddresses[0]?.emailAddress
  return (userEmail && authorizedEmails.includes(userEmail)) || user.publicMetadata?.isAdmin === true
    ? userId
    : null
}


