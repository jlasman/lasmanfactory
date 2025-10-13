import { useState } from 'react'
import SocialLinks from './SocialLinks'
import { supabase } from '../lib/supabase'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase
        .from('newsletter_subscriptions')
        .insert([
          {
            email: email,
            status: 'active',
            source: 'website'
          }
        ])

      if (insertError) {
        if (insertError.code === '23505') {
          setError('This email is already subscribed!')
        } else {
          setError('Something went wrong. Please try again.')
        }
        console.error('Newsletter signup error:', insertError)
      } else {
        setSubmitted(true)
        setEmail('')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('Newsletter signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <div className="footer__brand">
            <h2 className="footer__logo">JL</h2>
            <p className="footer__tagline">
              Quantum-powered evolution        
              <br/>for people and systems.
            </p>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">THE WORK</h4>
            <ul className="footer__links">
              <li>
                <a href="#work">Ventures</a>
              </li>
              <li>
                <a href="#work">Creations</a>
              </li>
              <li>
                <a href="#work">Initiatives</a>
              </li>
            </ul>
          </div>

          <div className="footer__section">
            <h4 className="footer__title">THE CREATOR</h4>
            <ul className="footer__links">
              <li>
                <a href="#creator">About Jeremy</a>
              </li>
              <li>
                <a href="#philosophy">The Lab (Philosophy)</a>
              </li>
              <li>
                <a href="#insights">Insights</a>
              </li>
            </ul>
          </div>

          <div className="footer__section footer__newsletter">
            <h4 className="footer__title">GET THE BLUEPRINTS</h4>
            <p className="footer__newsletter-description">
              Actionable insights on Conscious Engineering, sent from the lab to your inbox.
            </p>
            <form onSubmit={handleSubmit} className="footer__newsletter-form">
              {!submitted ? (
                <>
                  <div className="footer__newsletter-input-group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="footer__newsletter-input"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                    <button type="submit" className="footer__newsletter-button" disabled={loading}>
                      {loading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </div>
                  {error && (
                    <div className="footer__newsletter-error">
                      <p>{error}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="footer__newsletter-success">
                  <p>Success! You're now subscribed.</p>
                </div>
              )}
            </form>
          </div>
        </div>

        <SocialLinks />

        <div className="footer__bottom">
          <p className="footer__copyright">© 2025 Jeremy A. Lasman. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}
