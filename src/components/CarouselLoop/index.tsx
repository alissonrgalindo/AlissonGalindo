'use client'

import React, { useEffect, useRef, ReactNode, CSSProperties } from 'react'
import styles from './index.module.css'

type Direction = 'left' | 'right'
type Speed = 'slow' | 'normal' | 'fast'

type CarouselLoopProps = {
  children: ReactNode
  className?: string
  direction?: Direction
  speed?: Speed
  gap?: number
}

const CarouselLoop = ({
  children,
  className = '',
  direction = 'left',
  speed = 'normal',
  gap = 16,
}: CarouselLoopProps) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const innerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion && scrollerRef.current && innerRef.current) {
      scrollerRef.current.setAttribute('data-animated', 'true')

      const childrenNodes = Array.from(innerRef.current.children)

      childrenNodes.forEach((item) => {
        const duplicatedItem = item.cloneNode(true) as HTMLElement
        duplicatedItem.setAttribute('aria-hidden', 'true')
        innerRef.current?.appendChild(duplicatedItem)
      })
    }
  }, [])

  const speedValues: Record<Speed, string> = {
    slow: '60s',
    normal: '40s',
    fast: '20s',
  }

  const scrollerStyle: CSSProperties & {
    [key: `--${string}`]: string
  } = {
    width: '100%',
    '--_animation-duration': speedValues[speed],
    '--_animation-direction': direction === 'right' ? 'reverse' : 'forwards',
    '--_gap': `${gap}px`,
  }

  return (
    <div
      ref={scrollerRef}
      className={`${styles.scroller} ${className}`}
      style={scrollerStyle}
      data-direction={direction}
      data-speed={speed}
    >
      <div ref={innerRef} className={styles.inner}>
        {children}
      </div>
    </div>
  )
}

export default CarouselLoop
