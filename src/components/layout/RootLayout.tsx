import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileMenu } from './MobileMenu'
import { PageTransition } from './PageTransition'
import { ToastContainer } from '@/components/ui/Toast'
import { usePageTracking } from '@/hooks/usePageTracking'

export function RootLayout() {
  usePageTracking()

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col overflow-x-hidden">
      <Navbar />
      <MobileMenu />

      <main className="flex-1 flex flex-col pt-14">
        <PageTransition />
      </main>

      <Footer />
      <ToastContainer />
    </div>
  )
}
