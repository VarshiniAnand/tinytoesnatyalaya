import AnimationObserver from '@/components/AnimationObserver'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import CertificationBanner from '@/components/CertificationBanner'
import Syllabus from '@/components/Syllabus'
import Classes from '@/components/Classes'
import Gallery from '@/components/Gallery'
import About from '@/components/About'
import Footer from '@/components/Footer'
import { readGallery } from '@/lib/gallery'

// Always render fresh so admin edits appear immediately on reload
export const dynamic = 'force-dynamic'

export default async function Home() {
  const galleryItems = await readGallery()
  return (
    <div className="heritage-bg">
      <div className="saree-border-top" />
      <Navbar />
      <Hero />
      <CertificationBanner />
      <Syllabus />
      <Classes />
      <Gallery items={galleryItems} />
      <About />
      <Footer />
      <AnimationObserver />
    </div>
  )
}
