"use client"

import { useEffect, useRef, useState, useCallback, memo } from "react"
import { animate, stagger, createSpring } from "animejs"

type BackgroundScope = {
  methods?: {
    animateTiles?: (index: number, toggled: boolean) => void
  }
}

type DebouncedFunction<T extends (...args: unknown[]) => void> = (...args: Parameters<T>) => void;

const Tile = memo(({ 
  index, 
  onClick, 
  onKeyDown 
}: { 
  index: number; 
  onClick: () => void; 
  onKeyDown: (e: React.KeyboardEvent) => void 
}) => {
  return (
    <div
      className="tile outline-1 outline-transparent transition-opacity duration-300"
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Grid tile ${index + 1}`}
    />
  );
});

Tile.displayName = 'Tile';

// Custom hook for debouncing functions
function useDebounce<T extends (...args: unknown[]) => void>(func: T, wait: number): DebouncedFunction<T> {
  const timeout = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeout.current) clearTimeout(timeout.current);
    
    timeout.current = setTimeout(() => {
      func(...args);
    }, wait);
  }, [func, wait]);
}

export default function Background() {
  const root = useRef<HTMLDivElement>(null)
  const scope = useRef<BackgroundScope>({ methods: {} })
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [columns, setColumns] = useState(0)
  const [rows, setRows] = useState(0)
  const [toggled, setToggled] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const createGrid = useCallback(() => {
    const baseSize = window.innerWidth > 800 ? 70 : 50
    const devicePixelRatio = window.devicePixelRatio || 1
    const size = Math.floor(baseSize * (1 / Math.min(devicePixelRatio, 2)))
    
    const newColumns = Math.floor(window.innerWidth / size)
    const newRows = Math.floor(window.innerHeight / size)
    
    setColumns(newColumns)
    setRows(newRows)
  }, [])

  const debouncedCreateGrid = useDebounce(createGrid, 250)

  const animateTiles = useCallback((index: number, toggled: boolean) => {
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
  }, [columns, rows, isAnimating])

  useEffect(() => {
    createGrid()
    window.addEventListener("resize", debouncedCreateGrid)

    if (!scope.current.methods) {
      scope.current.methods = {}
    }

    scope.current.methods.animateTiles = animateTiles;

    animationTimeoutRef.current = setTimeout(() => {
      scope.current?.methods?.animateTiles?.(0, false)
    }, 300)

    return () => {
      window.removeEventListener("resize", debouncedCreateGrid)
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [createGrid, debouncedCreateGrid, animateTiles])

  const handleTileClick = useCallback((index: number) => {
    if (isAnimating) return
    
    const nextToggle = !toggled
    setToggled(nextToggle)
    scope.current?.methods?.animateTiles?.(index, nextToggle)
  }, [isAnimating, toggled, animateTiles])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTileClick(index)
    }
  }, [handleTileClick])

  const gridItems = useCallback(() => {
    return Array.from({ length: columns * rows }).map((_, i) => (
      <Tile
        key={i}
        index={i}
        onClick={() => handleTileClick(i)}
        onKeyDown={(e) => handleKeyDown(e, i)}
      />
    ))
  }, [columns, rows, handleTileClick, handleKeyDown])

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
      {gridItems()}
    </div>
  )
}