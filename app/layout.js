import './globals.css'

export const metadata = {
  title: 'One-Sentence Pitch Builder',
  description: 'AI-powered tool to help founders craft the perfect startup introduction',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
