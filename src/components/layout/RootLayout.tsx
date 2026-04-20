import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileMenu } from './MobileMenu'
import { PageTransition } from './PageTransition'
import { ToastContainer } from '@/components/ui/Toast'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar />
      <MobileMenu />

      <main className="flex-1">
        <PageTransition />
      </main>

      <Footer />
      <ToastContainer />
    </div>
  )
}
