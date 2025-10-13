export default function WorkContent({ data }) {
  return (
    <div className="work__drawer-content">
      <h3 className="work__content-headline">{data.title}</h3>
      <div className="work__spoke-list">
        {data.items.map((item, index) => (
          <div key={index} className="work__spoke">
            <div className="work__spoke-media" aria-hidden="true">
              <div className="work__spoke-logo" title="Logo placeholder"></div>
            </div>
            <div className="work__spoke-body">
              <h4>{item.title}</h4>
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
  )
}
