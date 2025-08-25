/**
 * @fileoverview Test suite for Avatar components
 * 
 * This module tests the Avatar component family built on Radix UI:
 * - Avatar root component with proper styling
 * - AvatarImage for displaying user profile images  
 * - AvatarFallback for displaying initials when image fails
 * - Class name merging and custom styling
 * 
 * Avatar components are essential for user profile display throughout the app.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@v1/test-utils'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

describe('Avatar Components', () => {
  describe('Avatar', () => {
    /**
     * Test basic Avatar rendering
     * Should render with proper structure and classes
     */
    it('should render Avatar component', () => {
      render(<Avatar data-testid="avatar" />)
      
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveClass('relative', 'flex', 'h-10', 'w-10', 'shrink-0', 'overflow-hidden', 'rounded-full')
    })

    /**
     * Test custom className merging
     * Should merge custom classes with default ones
     */
    it('should merge custom className with defaults', () => {
      render(<Avatar className="custom-class" data-testid="avatar" />)
      
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveClass('relative', 'flex', 'custom-class')
    })

    /**
     * Test forwarded props
     * Should forward additional props to the underlying element
     */
    it('should forward props to underlying element', () => {
      render(<Avatar aria-label="User profile" data-testid="avatar" />)
      
      const avatar = screen.getByTestId('avatar')
      expect(avatar).toHaveAttribute('aria-label', 'User profile')
    })
  })

  describe('AvatarImage', () => {
    /**
     * Test AvatarImage rendering with src
     * Should render image element with proper attributes
     */
    it('should render AvatarImage with src', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
        </Avatar>
      )
      
      const image = screen.getByRole('img')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      expect(image).toHaveAttribute('alt', 'User avatar')
      expect(image).toHaveClass('aspect-square', 'h-full', 'w-full')
    })

    /**
     * Test AvatarImage custom className
     * Should apply custom styling alongside defaults
     */
    it('should apply custom className to AvatarImage', () => {
      render(
        <Avatar>
          <AvatarImage 
            src="https://example.com/avatar.jpg" 
            alt="User avatar"
            className="custom-image-class"
          />
        </Avatar>
      )
      
      const image = screen.getByRole('img')
      expect(image).toHaveClass('aspect-square', 'custom-image-class')
    })
  })

  describe('AvatarFallback', () => {
    /**
     * Test AvatarFallback rendering
     * Should render fallback content when image fails
     */
    it('should render AvatarFallback content', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      
      const fallback = screen.getByText('JD')
      expect(fallback).toBeInTheDocument()
      expect(fallback).toHaveClass(
        'flex',
        'h-full', 
        'w-full',
        'items-center',
        'justify-center',
        'rounded-full',
        'bg-muted'
      )
    })

    /**
     * Test AvatarFallback custom styling
     * Should merge custom classes with defaults
     */
    it('should apply custom className to AvatarFallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback">JD</AvatarFallback>
        </Avatar>
      )
      
      const fallback = screen.getByText('JD')
      expect(fallback).toHaveClass('flex', 'custom-fallback')
    })
  })

  describe('Avatar Integration', () => {
    /**
     * Test complete Avatar with image and fallback
     * Should render both image and fallback for proper fallback behavior
     */
    it('should render complete Avatar with image and fallback', () => {
      render(
        <Avatar data-testid="complete-avatar">
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByTestId('complete-avatar')
      const image = screen.getByRole('img')
      const fallback = screen.getByText('JD')
      
      expect(avatar).toBeInTheDocument()
      expect(image).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
    })

    /**
     * Test accessibility features
     * Should have proper ARIA attributes for screen readers
     */
    it('should support accessibility features', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe profile picture" />
          <AvatarFallback>John Doe</AvatarFallback>
        </Avatar>
      )
      
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('alt', 'John Doe profile picture')
    })
  })
})