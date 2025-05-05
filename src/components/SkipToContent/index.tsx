"use client"

import { useEffect, useRef } from 'react'

export default function SkipToContent() {
  const linkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && linkRef.current) {
        linkRef.current.style.transform = 'translateY(0)'
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFocus = () => {
    if (linkRef.current) {
      linkRef.current.style.transform = 'translateY(0)'
    }
  }

  const handleBlur = () => {
    if (linkRef.current) {
      linkRef.current.style.transform = 'translateY(-100%)'
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    const mainContent = document.getElementById('main-content')
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1')
      mainContent.focus()
      setTimeout(() => {
        mainContent.removeAttribute('tabindex')
      }, 1000)
    }
  }

  return (
    <a
      ref={linkRef}
      href="#main-content"
      className="fixed top-0 left-0 z-50 p-3 bg-black text-white transform -translate-y-full focus:outline-none transition-transform duration-200"
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
    >
      Skip to main content
    </a>
  )
}