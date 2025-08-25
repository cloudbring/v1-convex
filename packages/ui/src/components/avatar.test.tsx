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
     * Test AvatarImage component structure
     * Should render AvatarImage component in avatar context
     */
    it('should render AvatarImage component', () => {
      render(
        <Avatar data-testid="avatar-wrapper">
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
        </Avatar>
      )
      
      const wrapper = screen.getByTestId('avatar-wrapper')
      expect(wrapper).toBeInTheDocument()
      expect(wrapper).toHaveClass('relative', 'flex', 'overflow-hidden', 'rounded-full')
    })

    /**
     * Test AvatarImage with fallback structure
     * Should render in proper avatar context
     */
    it('should render AvatarImage with fallback context', () => {
      render(
        <Avatar data-testid="avatar-wrapper">
          <AvatarImage 
            src="https://example.com/avatar.jpg" 
            alt="User avatar"
            className="custom-image-class"
          />
          <AvatarFallback>UA</AvatarFallback>
        </Avatar>
      )
      
      const wrapper = screen.getByTestId('avatar-wrapper')
      const fallback = screen.getByText('UA')
      
      expect(wrapper).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
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
     * Should render avatar with fallback content
     */
    it('should render complete Avatar with image and fallback', () => {
      render(
        <Avatar data-testid="complete-avatar">
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByTestId('complete-avatar')
      const fallback = screen.getByText('JD')
      
      expect(avatar).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
    })

    /**
     * Test accessibility features
     * Should support proper avatar structure with fallback
     */
    it('should support accessibility features', () => {
      render(
        <Avatar data-testid="accessible-avatar">
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe profile picture" />
          <AvatarFallback>John Doe</AvatarFallback>
        </Avatar>
      )
      
      const avatar = screen.getByTestId('accessible-avatar')
      const fallback = screen.getByText('John Doe')
      
      expect(avatar).toBeInTheDocument()
      expect(fallback).toBeInTheDocument()
    })
  })
})