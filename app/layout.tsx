import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'InternSafe — Stop the scam before the payment', description: 'Check internship and job offers for warning signs before you pay.', generator: 'v0.app' }
export const viewport: Viewport = { colorScheme: 'light dark', themeColor: '#F2F4FA' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html> }
