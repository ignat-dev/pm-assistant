import { AppInfo } from '@/common/constants'
import { ReactNode } from 'react'

import './main.scss'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}

export function generateMetadata() {
  return {
    description: AppInfo.description,
    title: `${AppInfo.name} — ${AppInfo.description}`,
  }
}
