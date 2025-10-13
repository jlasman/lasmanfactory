export default function WorkCard({ title, description, ctaText, active, onClick }) {
  const handleCtaClick = (e) => {
    e.stopPropagation()
    console.log(`Navigate to ${title}`)
  }

  return (
    <div className={`work__card ${active ? 'active' : ''}`} onClick={onClick}>
      <h3 className="work__card-title">{title}</h3>
      <p className="work__card-description">{description}</p>
      <button className="work__card-cta" onClick={handleCtaClick}>
        {ctaText}
      </button>
    </div>
  )
}
