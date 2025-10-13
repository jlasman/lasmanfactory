export default function Hero() {
  const scrollToWork = () => {
    const workSection = document.getElementById('work')
    if (workSection) {
      workSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="home" className="hero">
      <div className="hero__background">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="hero__video"
        >
          <source src="/assets/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="hero__video-overlay"></div>
      </div>
      <div className="hero__content">
        <h1 className="hero__headline">Welcome to the Lab.</h1>
        <p className="hero__subheadline">
          A space dedicated to a single, lifelong experiment: Fusing quantum consciousness with quantum
          technology to build new worlds—inside and out.
        </p>
        <p className="hero__support">
          The work here has led to foundational inventions like <strong>Imagination Technology</strong>—a
          repeatable framework for upgrading the human OS.
        </p>
        <button className="hero__cta" onClick={scrollToWork}>
          See What We're Building ↓
        </button>
      </div>
    </section>
  )
}
