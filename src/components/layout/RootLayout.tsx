import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { MobileMenu } from './MobileMenu'
import { PageTransition } from './PageTransition'
import { ToastContainer } from '@/components/ui/Toast'

export function RootLayout() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
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
