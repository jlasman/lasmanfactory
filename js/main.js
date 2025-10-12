// The Lab - Interactive Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website
    initializeNavigation();
    initializeWorkSection();
    initializeScrollEffects();
    initializeCTAButtons();
    initializeNewsletterForm();
});

// Navigation functionality
function initializeNavigation() {
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav__link');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navigation background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    });
}

// Work section interactive functionality
function initializeWorkSection() {
    const workCards = document.querySelectorAll('.work__card');
    const contentSections = document.querySelectorAll('.work__content-section');
    
    // Set initial active state
    workCards[0].classList.add('active');
    
    workCards.forEach((card, index) => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            workCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Hide all content sections
            contentSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show corresponding content section
            const spokeType = this.getAttribute('data-spoke');
            const targetContent = document.getElementById(`${spokeType}-content`);
            
            if (targetContent) {
                targetContent.style.display = 'block';
                // Add fade-in animation
                targetContent.style.opacity = '0';
                targetContent.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    targetContent.style.transition = 'all 0.5s ease';
                    targetContent.style.opacity = '1';
                    targetContent.style.transform = 'translateY(0)';
                }, 10);
            }
        });
    });
}

// Scroll effects and animations
function initializeScrollEffects() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe sections for scroll animations
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Set initial state for animation
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        
        observer.observe(section);
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroBackground = document.querySelector('.hero__background');
        
        if (heroBackground) {
            const rate = scrolled * -0.5;
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
    });
}

// CTA button functionality
function initializeCTAButtons() {
    // Hero CTA - scroll to work section
    const heroCTA = document.querySelector('.hero__cta');
    if (heroCTA) {
        heroCTA.addEventListener('click', function() {
            const workSection = document.getElementById('work');
            if (workSection) {
                workSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // Work card CTAs - placeholder functionality
    const workCardCTAs = document.querySelectorAll('.work__card-cta');
    workCardCTAs.forEach(cta => {
        cta.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent card click
            
            // Get the card type
            const card = this.closest('.work__card');
            const spokeType = card.getAttribute('data-spoke');
            
            // Placeholder functionality - in a real implementation, 
            // these would navigate to dedicated pages
            console.log(`Navigate to ${spokeType} page`);
            
            // Show a temporary message
            showTemporaryMessage(`${spokeType.charAt(0).toUpperCase() + spokeType.slice(1)} page coming soon!`);
        });
    });
    
    // Creator CTA
    const creatorCTA = document.querySelector('.creator__cta');
    if (creatorCTA) {
        creatorCTA.addEventListener('click', function() {
            showTemporaryMessage("Jeremy's full journey page coming soon!");
        });
    }
    
    // Insights CTA
    const insightsCTA = document.querySelector('.insights__cta');
    if (insightsCTA) {
        insightsCTA.addEventListener('click', function() {
            showTemporaryMessage("Insights hub coming soon!");
        });
    }
    
    // Final invitation CTA
    const invitationCTA = document.querySelector('.invitation__cta');
    if (invitationCTA) {
        invitationCTA.addEventListener('click', function() {
            showTemporaryMessage("Contact form coming soon!");
        });
    }
}

// Utility function to show temporary messages
function showTemporaryMessage(message) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 25px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);
        opacity: 0;
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(messageEl);
    
    // Show message
    setTimeout(() => {
        messageEl.style.opacity = '1';
    }, 10);
    
    // Hide and remove message
    setTimeout(() => {
        messageEl.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(messageEl);
        }, 300);
    }, 3000);
}

// Smooth scroll polyfill for older browsers
function smoothScrollTo(target) {
    const targetPosition = target.offsetTop - 80; // Account for fixed nav
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 1000;
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Dynamic content loading (placeholder for future implementation)
function loadDynamicContent() {
    // This function would handle loading dynamic content
    // from APIs or content management systems
    
    // For now, it's a placeholder that could be expanded to:
    // - Load latest blog posts for the insights section
    // - Update project information
    // - Load portfolio items for the creations section
    
    console.log('Dynamic content loading would happen here');
}

// Performance optimization - lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Newsletter form functionality
function initializeNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const successMessage = document.getElementById('newsletter-success');
    const inputGroup = document.querySelector('.footer__newsletter-input-group');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(form);
            
            // Submit to Netlify
            fetch('/', {
                method: 'POST',
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString()
            })
            .then(() => {
                // Show success message
                inputGroup.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Optional: Reset after 5 seconds
                setTimeout(() => {
                    inputGroup.style.display = 'flex';
                    successMessage.style.display = 'none';
                    form.reset();
                }, 5000);
            })
            .catch((error) => {
                console.error('Error:', error);
                // You could add error handling here
            });
        });
    }
}

// Export functions for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeNavigation,
        initializeWorkSection,
        initializeScrollEffects,
        initializeCTAButtons,
        showTemporaryMessage,
        initializeNewsletterForm
    };
}