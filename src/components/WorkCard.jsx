export default function WorkCard({ id, title, description, expanded, onToggle }) {
  return (
    <div
      className={`work__card ${expanded ? 'work__card--expanded' : ''}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      aria-controls="work-drawer"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <div className="work__card-header">
        <div className="work__card-text">
          <h3 className="work__card-title">{title}</h3>
          <p className="work__card-description">{description}</p>
        </div>
        <div className="work__card-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="work__card-chevron"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  )
}
