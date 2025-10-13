import { useEffect } from 'react'
import Navigation from './components/Navigation'
import Hero from './components/Hero'
import Philosophy from './components/Philosophy'
import Work from './components/Work'
import Creator from './components/Creator'
import Insights from './components/Insights'
import Invitation from './components/Invitation'
import Footer from './components/Footer'
import './styles/main.css'

function App() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    const targets = document.querySelectorAll(
      '.hero__content, .philosophy__content, .work__cards, .creator__content, .insights__content, .invitation'
    )

    targets.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(30px)'
      el.style.transition = 'all 0.8s ease-out'
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <Navigation />
      <Hero />
      <Philosophy />
      <Work />
      <Creator />
      <Insights />
      <Invitation />
      <Footer />
    </>
  )
}

export default App
