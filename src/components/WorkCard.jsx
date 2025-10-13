export default function WorkCard({ id, title, description, expanded, onToggle, data }) {
  return (
    <div className="work__card-wrapper">
      <div
        className={`work__card ${expanded ? 'work__card--expanded' : ''}`}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`work-content-${id}`}
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

      <div
        id={`work-content-${id}`}
        className={`work__card-content ${expanded ? 'work__card-content--expanded' : ''}`}
        aria-hidden={!expanded}
      >
        <div className="work__card-content-inner">
          <h4 className="work__content-headline">{data.title}</h4>
          <div className="work__spoke-list">
            {data.items.map((item, index) => (
              <div key={index} className="work__spoke">
                <div className="work__spoke-media" aria-hidden="true">
                  <div className="work__spoke-logo" title="Logo placeholder"></div>
                </div>
                <div className="work__spoke-body">
                  <h5>{item.title}</h5>
                  <p>{item.description}</p>
                  {item.features && (
                    <ul>
                      {item.features.map((feature, idx) => (
                        <li key={idx}>
                          <strong>{feature.split(':')[0]}:</strong>
                          {feature.split(':')[1]}
                        </li>
                      ))}
                    </ul>
                  )}
                  {index < 2 && <button className="work__spoke-btn">Visit Website</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
