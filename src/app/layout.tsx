import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'App Store | A Little Better',
    template: '%s | A Little Better App Store'
  },
  description: 'Discover and explore apps from the A Little Better ecosystem.',
  metadataBase: new URL('https://apps.a-little-better.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://apps.a-little-better.com',
    title: 'App Store | A Little Better',
    description: 'Discover and explore apps from the A Little Better ecosystem.',
    siteName: 'A Little Better App Store',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
            <nav className="container-custom py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  A Little Better App Store
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Browse Apps
                  </Link>
                  <Link href="https://a-little-better.com" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Main Site
                  </Link>
                </div>
              </div>
            </nav>
          </header>
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white mt-auto">
            <div className="container-custom py-8">
              <div className="text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} A Little Better. All rights reserved.</p>
                <p className="mt-2">
                  <Link href="https://a-little-better.com" className="text-primary-600 hover:underline">
                    Visit Main Site
                  </Link>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

