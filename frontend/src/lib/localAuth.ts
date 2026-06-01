export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
  AZURE: 'azure',
  DISCORD: 'discord',
} as const

export type OAuthProvider = typeof OAUTH_PROVIDERS[keyof typeof OAUTH_PROVIDERS]

export const LOCAL_ORGANIZATION_STORAGE_KEY = 'everx_local_organization_name'