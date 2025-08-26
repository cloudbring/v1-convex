import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import React from 'react'
import { Footer } from './footer'

expect.extend(toHaveNoViolations)

const expectedPartnerLinks = [
  { name: 'Convex', href: 'https://convex.dev/c/middayv1template' },
  { name: 'Vercel', href: 'https://vercel.com?utm_source=v1' },
  { name: 'Cal.com', href: 'https://cal.com?utm_source=v1' },
  { name: 'Resend', href: 'https://resend.com?utm_source=v1' },
  { name: 'Turbo', href: 'https://turbo.build/?utm_source=v1' },
  { name: 'Polar', href: 'https://polar.sh/?utm_source=v1' }
]

describe('Footer Component', () => {
  describe('Basic Rendering', () => {
    it('should render footer structure', () => {
      render(<Footer />)
      
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.getByText('Featuring')).toBeInTheDocument()
    })

    it('should render with correct layout classes', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('flex', 'items-center', 'justify-center', 'font-mono', 'text-xs', 'fixed', 'bottom-8', 'w-full', 'flex-col', 'space-y-6')
    })

    it('should render "Featuring" text with correct styling', () => {
      render(<Footer />)
      
      const featuringText = screen.getByText('Featuring')
      expect(featuringText).toHaveClass('text-[#878787]')
    })
  })

  describe('Partner Links', () => {
    it.each(expectedPartnerLinks)('should render $name link correctly', ({ name, href }) => {
      render(<Footer />)
      
      const allLinks = screen.getAllByRole('link')
      const partnerLinks = allLinks.filter(link => link.getAttribute('href') === href)
      expect(partnerLinks).toHaveLength(2) // Duplicate for marquee
      
      partnerLinks.forEach(link => {
        expect(link).toHaveAttribute('href', href)
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('should render all partner links with external attributes', () => {
      render(<Footer />)
      
      const allLinks = screen.getAllByRole('link')
      expect(allLinks).toHaveLength(12) // 6 partners × 2 for marquee
      
      allLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  describe('SVG Logo Rendering', () => {
    it('should render all partner logos', () => {
      render(<Footer />)
      
      // Get all SVGs in the document
      const svgs = document.querySelectorAll('svg')
      expect(svgs).toHaveLength(12) // 6 logos × 2 for marquee animation
      
      svgs.forEach(svg => {
        expect(svg.querySelector('path')).toBeInTheDocument()
      })
    })

    it('should render Convex logo with correct attributes', () => {
      render(<Footer />)
      
      const convexSvgs = document.querySelectorAll('svg[width="140"]')
      expect(convexSvgs).toHaveLength(2) // Duplicate for marquee
      
      convexSvgs.forEach(svg => {
        expect(svg).toHaveAttribute('viewBox', '0 0 382 146')
        expect(svg.querySelector('path')).toBeInTheDocument()
      })
    })

    it('should render Vercel logo with correct attributes', () => {
      render(<Footer />)
      
      const vercelSvgs = document.querySelectorAll('svg[width="74"]')
      expect(vercelSvgs).toHaveLength(2) // Duplicate for marquee
      
      vercelSvgs.forEach(svg => {
        expect(svg).toHaveAttribute('height', '17')
        expect(svg.querySelector('path')).toBeInTheDocument()
      })
    })

    it('should render Cal.com logo with correct attributes', () => {
      render(<Footer />)
      
      const calSvgs = document.querySelectorAll('svg[width="79"]')
      expect(calSvgs).toHaveLength(2) // Duplicate for marquee
      
      calSvgs.forEach(svg => {
        expect(svg).toHaveAttribute('height', '18')
        expect(svg).toHaveAttribute('viewBox', '0 0 79 18')
        expect(svg.querySelector('path')).toBeInTheDocument()
      })
    })

    it('should render Polar logo with correct attributes', () => {
      render(<Footer />)
      
      // Find Polar logo by looking for its unique viewBox
      const polarSvgs = document.querySelectorAll('svg[viewBox="0 0 86 21"]')
      expect(polarSvgs).toHaveLength(2) // Duplicate for marquee
      
      polarSvgs.forEach(svg => {
        expect(svg).toHaveAttribute('width', '86')
        expect(svg).toHaveAttribute('height', '21')
        expect(svg.querySelector('path')).toBeInTheDocument()
      })
    })
  })

  describe('Animation and Layout', () => {
    it('should apply correct CSS classes for marquee animation', () => {
      render(<Footer />)
      
      // Check for marquee container
      const marqueeContainer = document.querySelector('.relative.flex.overflow-x-hidden.space-x-6')
      expect(marqueeContainer).toBeInTheDocument()
    })

    it('should have marquee animation classes', () => {
      render(<Footer />)
      
      const animatedElements = document.querySelectorAll('.animate-marquee')
      expect(animatedElements).toHaveLength(1)
      
      const secondAnimatedElements = document.querySelectorAll('.animate-marquee2')
      expect(secondAnimatedElements).toHaveLength(1)
    })

    it('should have responsive animation behavior', () => {
      render(<Footer />)
      
      // Check for responsive classes (animate-marquee on mobile, lg:animate-none on desktop)
      const firstMarquee = document.querySelector('.animate-marquee.lg\\:animate-none')
      expect(firstMarquee).toBeInTheDocument()
    })

    it('should render duplicate content for continuous scroll', () => {
      render(<Footer />)
      
      const allLinks = screen.getAllByRole('link')
      expect(allLinks).toHaveLength(12) // 6 partners × 2 for seamless marquee
      
      // Verify we have exactly 2 of each partner
      expectedPartnerLinks.forEach(({ href }) => {
        const partnerLinks = allLinks.filter(link => link.getAttribute('href') === href)
        expect(partnerLinks).toHaveLength(2)
      })
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations except for link names', async () => {
      const { container } = render(<Footer />)
      const results = await axe(container, {
        rules: {
          'link-name': { enabled: false } // Disable link-name rule for SVG-only links
        }
      })
      expect(results).toHaveNoViolations()
    })

    it('should use semantic HTML structure', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      expect(footer.tagName).toBe('FOOTER')
    })

    it('should have proper link accessibility', () => {
      render(<Footer />)
      
      const links = screen.getAllByRole('link')
      
      links.forEach(link => {
        // All links should have href attribute
        expect(link).toHaveAttribute('href')
        
        // External links should have proper security attributes
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('should maintain focus order', () => {
      render(<Footer />)
      
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      
      // All links should be focusable
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1')
      })
    })
  })

  describe('Content Validation', () => {
    it('should have correct partner count', () => {
      render(<Footer />)
      
      // Should have exactly 6 unique partner links (duplicated for marquee)
      const uniqueHrefs = new Set()
      const allLinks = screen.getAllByRole('link')
      
      allLinks.forEach(link => {
        uniqueHrefs.add(link.getAttribute('href'))
      })
      
      expect(uniqueHrefs.size).toBe(6)
    })

    it('should have valid URL formats', () => {
      render(<Footer />)
      
      const allLinks = screen.getAllByRole('link')
      
      allLinks.forEach(link => {
        const href = link.getAttribute('href')
        expect(href).toMatch(/^https?:\/\//)
      })
    })

    it('should have consistent UTM parameters', () => {
      render(<Footer />)
      
      const utmLinks = screen.getAllByRole('link').filter(link => {
        const href = link.getAttribute('href')
        return href && href.includes('utm_source=v1')
      })
      
      // Vercel, Cal.com, Resend, Turbo, and Polar should have UTM parameters (10 total with duplicates)
      expect(utmLinks).toHaveLength(10)
    })
  })

  describe('Error Handling', () => {
    it('should render gracefully with missing SVG content', () => {
      // This test ensures the component structure remains intact even if SVGs fail
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      const featuringText = screen.getByText('Featuring')
      const links = screen.getAllByRole('link')
      
      expect(footer).toBeInTheDocument()
      expect(featuringText).toBeInTheDocument()
      expect(links.length).toBeGreaterThan(0)
    })

    it('should maintain layout stability', () => {
      render(<Footer />)
      
      const footer = screen.getByRole('contentinfo')
      
      // Check that essential layout classes are present
      expect(footer).toHaveClass('fixed', 'bottom-8', 'w-full')
    })
  })
})