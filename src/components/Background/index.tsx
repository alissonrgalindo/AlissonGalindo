"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { animate, stagger, createSpring } from "animejs"

type BackgroundScope = {
  methods?: {
    animateTiles?: (index: number, toggled: boolean) => void
  }
}

export default function Background() {
  const root = useRef<HTMLDivElement>(null)
  const scope = useRef<BackgroundScope>({ methods: {} })

  const [columns, setColumns] = useState(0)
  const [rows, setRows] = useState(0)
  const [toggled, setToggled] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Memoize the createGrid function to avoid recreating it on every render
  const createGrid = useCallback(() => {
    // Adjust size based on screen width and device pixel ratio for better performance
    const baseSize = window.innerWidth > 800 ? 70 : 50
    const devicePixelRatio = window.devicePixelRatio || 1
    const size = Math.floor(baseSize * (1 / Math.min(devicePixelRatio, 2)))
    
    const newColumns = Math.floor(window.innerWidth / size)
    const newRows = Math.floor(window.innerHeight / size)
    
    setColumns(newColumns)
    setRows(newRows)
  }, [])

  // Debounce resize event for better performance
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  useEffect(() => {
    const debouncedCreateGrid = debounce(createGrid, 250)
    
    createGrid()
    window.addEventListener("resize", debouncedCreateGrid)

    if (!scope.current.methods) {
      scope.current.methods = {}
    }

    scope.current.methods.animateTiles = (index: number, toggled: boolean) => {
      if (isAnimating) return
      setIsAnimating(true)
      
      const tiles = document.querySelectorAll(".tile")
      if (!tiles || tiles.length === 0) {
        setIsAnimating(false)
        return
      }

      animate(".tile", {
        backgroundColor: toggled ? "#000" : "#fff",
        delay: stagger(50, {
          grid: [columns, rows],
          from: index,
        }),
        duration: 600,
        ease: createSpring({ stiffness: 80 }),
        complete: () => {
          setIsAnimating(false)
        }
      })
    }

    // Trigger initial animation
    setTimeout(() => {
      scope.current?.methods?.animateTiles?.(0, false)
    }, 300)

    return () => window.removeEventListener("resize", debouncedCreateGrid)
  }, [columns, rows, createGrid, isAnimating])

  const handleTileClick = (index: number) => {
    if (isAnimating) return
    
    const nextToggle = !toggled
    setToggled(nextToggle)
    scope.current?.methods?.animateTiles?.(index, nextToggle)
  }

  // Handle keyboard interaction for accessibility
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTileClick(index)
    }
  }

  return (
    <div
      ref={root}
      className="absolute top-0 left-0 w-screen h-screen grid overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
      aria-label="Interactive background grid"
      role="presentation"
    >
      {Array.from({ length: columns * rows }).map((_, i) => (
        <div
          key={i}
          className="tile outline-1 outline-transparent transition-opacity duration-300 hover:opacity-70"
          onClick={() => handleTileClick(i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          tabIndex={0}
          role="button"
          aria-label={`Grid tile ${i + 1}`}
        />
      ))}
    </div>
  )
}