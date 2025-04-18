"use client"

import { useEffect, useRef, useState } from "react"
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

  const createGrid = () => {
    const size = window.innerWidth > 800 ? 70 : 50
    const newColumns = Math.floor(window.innerWidth / size)
    const newRows = Math.floor(window.innerHeight / size)
    setColumns(newColumns)
    setRows(newRows)
  }

  useEffect(() => {
    createGrid()
    window.addEventListener("resize", createGrid)

    if (!scope.current.methods) {
      scope.current.methods = {}
    }

    scope.current.methods.animateTiles = (index: number, toggled: boolean) => {
      const tiles = document.querySelectorAll(".tile")
      if (!tiles || tiles.length === 0) return

      animate(".tile", {
        backgroundColor: toggled ? "#000" : "#fff",
        delay: stagger(50, {
          grid: [columns, rows],
          from: index,
        }),
        duration: 600,
        ease: createSpring({ stiffness: 80 })
      })
    }

    setTimeout(() => {
      scope.current?.methods?.animateTiles?.(0, false)
    }, 100)

    return () => window.removeEventListener("resize", createGrid)
  }, [columns, rows])

  const handleTileClick = (index: number) => {
    const nextToggle = !toggled
    setToggled(nextToggle)
    scope.current?.methods?.animateTiles?.(index, nextToggle)
  }

  return (
    <div
      ref={root}
      className="absolute top-0 left-0 w-screen h-screen grid overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: columns * rows }).map((_, i) => (
        <div
          key={i}
          className="tile outline-1 outline-transparent"
          onClick={() => handleTileClick(i)}
          tabIndex={0}
        />
      ))}
    </div>
  )
}