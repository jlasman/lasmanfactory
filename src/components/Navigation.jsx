import { useEffect, useState } from 'react'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (e, targetId) => {
    e.preventDefault()
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      className="nav"
      style={{
        background: scrolled ? 'rgba(18, 18, 18, 0.98)' : 'rgba(18, 18, 18, 0.95)',
      }}
    >
      <div className="nav__container">
        <div className="nav__logo">
          <a href="#home" onClick={(e) => scrollToSection(e, '#home')}>
            JL
          </a>
        </div>
        <div className="nav__menu">
          <a href="#philosophy" className="nav__link" onClick={(e) => scrollToSection(e, '#philosophy')}>
            Philosophy
          </a>
          <a href="#work" className="nav__link" onClick={(e) => scrollToSection(e, '#work')}>
            Work
          </a>
          <a href="#creator" className="nav__link" onClick={(e) => scrollToSection(e, '#creator')}>
            Creator
          </a>
          <a href="#insights" className="nav__link" onClick={(e) => scrollToSection(e, '#insights')}>
            Insights
          </a>
          <a href="#contact" className="nav__link" onClick={(e) => scrollToSection(e, '#contact')}>
            Contact
          </a>
        </div>
      </div>
    </nav>
  )
}
