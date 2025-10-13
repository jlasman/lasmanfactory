import { useState } from 'react'
import WorkCard from './WorkCard'
import WorkContent from './WorkContent'

const workData = {
  ventures: {
    title: 'Two Worlds, One Philosophy.',
    items: [
      {
        title: 'The Passion Company',
        description: 'Our venture for personal transformation. We offer a complete pathway to upgrade your inner OS:',
        features: [
          'The iSELF Platform: A scalable, self-guided system for sustained clarity powered by Imagination Technology.',
          'Passion Dojo: Premium group training experiences.',
          '1:1 Private Mentorship: Exclusive, direct access for leaders and creators seeking profound transformation.',
        ],
      },
      {
        title: 'Quantum Star Systems',
        description:
          'Our venture for enterprise innovation. We provide a hybrid roadmap to de-risk your quantum future and drive measurable ROI today.',
      },
    ],
  },
  creations: {
    title: 'Where Ideas Take Form.',
    items: [
      {
        title: 'Stellar Art Gallery',
        description: 'Co-curating and directing a fine art gallery dedicated to blown glass and guest artists.',
      },
      {
        title: 'MANIA',
        description: 'Comic book franchise',
      },
      {
        title: 'Writing & Publications',
        description: 'Books and articles exploring technology and consciousness.',
      },
    ],
  },
  initiatives: {
    title: 'Building a Better Future.',
    items: [
      {
        title: 'Education Initiatives',
        description: 'Deploying frameworks for conscious learning and equitable access to technology.',
      },
      {
        title: 'Mental Wellness Projects',
        description: 'Mission-driven programs for mental health and personal growth.',
      },
      {
        title: 'Tech Access',
        description: 'Expanding access to transformative technology for underserved communities.',
      },
    ],
  },
}

export default function Work() {
  const [expandedSpoke, setExpandedSpoke] = useState(null)

  const toggleSpoke = (spoke) => {
    if (expandedSpoke === spoke) {
      setExpandedSpoke(null)
    } else {
      setExpandedSpoke(spoke)
      requestAnimationFrame(() => {
        const cardElement = document.getElementById(`card-${spoke}`)
        if (cardElement && window.innerWidth <= 768) {
          cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })
    }
  }

  return (
    <section id="work" className="work">
      <div className="container">
        <h2 className="work__headline">From the Lab to the Real World.</h2>

        <div className="work__grid">
          <div className="work__card-wrapper" id="card-ventures">
            <WorkCard
              id="ventures"
              title="Commercial Ventures"
              description="Applying our core R&D to build scalable companies and premium advisory services for ambitious leaders and industries."
              expanded={expandedSpoke === 'ventures'}
              onToggle={() => toggleSpoke('ventures')}
            />
            <div className="work__mobile-content">
              {expandedSpoke === 'ventures' && <WorkContent data={workData.ventures} />}
            </div>
          </div>

          <div className="work__card-wrapper" id="card-creations">
            <WorkCard
              id="creations"
              title="Artistic Creations"
              description="Using film, writing, and the curation of fine art to explore the boundaries of human potential and our technological future."
              expanded={expandedSpoke === 'creations'}
              onToggle={() => toggleSpoke('creations')}
            />
            <div className="work__mobile-content">
              {expandedSpoke === 'creations' && <WorkContent data={workData.creations} />}
            </div>
          </div>

          <div className="work__card-wrapper" id="card-initiatives">
            <WorkCard
              id="initiatives"
              title="Philanthropic Initiatives"
              description="Deploying our frameworks and resources toward mission-driven projects aimed at creating a more conscious and equitable world."
              expanded={expandedSpoke === 'initiatives'}
              onToggle={() => toggleSpoke('initiatives')}
            />
            <div className="work__mobile-content">
              {expandedSpoke === 'initiatives' && <WorkContent data={workData.initiatives} />}
            </div>
          </div>
        </div>

        <div className="work__drawer">
          {expandedSpoke && <WorkContent data={workData[expandedSpoke]} />}
        </div>
      </div>
    </section>
  )
}
