"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface BackgroundProps {
  cellSize?: number;
  depth?: number;
}

export default function Background({
  cellSize = 50,
  depth = 80,
}: BackgroundProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ rows: 15, columns: 15 });

  useEffect(() => {
    const calculateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const columns = Math.ceil(width / cellSize) + 2;
      const rows = Math.ceil(height / cellSize) + 2;
      setDimensions({ rows, columns });
    };

    calculateDimensions();
    window.addEventListener("resize", calculateDimensions);

    return () => window.removeEventListener("resize", calculateDimensions);
  }, [cellSize]);

  useEffect(() => {
    if (!gridRef.current) return;

    const cells = gridRef.current.querySelectorAll(".grid-cell");
    const { rows, columns } = dimensions;

    const enterHandlers: Array<(e: Event) => void> = [];
    const leaveHandlers: Array<(e: Event) => void> = [];

    cells.forEach((cell, index) => {
      const onMouseEnter = () => {
        gsap.to(cell, {
          z: -depth * 1.5,
          rotationX: Math.random() * 20 - 10,
          rotationY: Math.random() * 20 - 10,
          scale: 0.8,
          duration: 0.2,
          ease: "power3.out",
        });

        const cellIndex = index;
        const row = Math.floor(cellIndex / columns);
        const col = cellIndex % columns;

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const neighborRow = row + r;
            const neighborCol = col + c;
            if (
              neighborRow >= 0 &&
              neighborRow < rows &&
              neighborCol >= 0 &&
              neighborCol < columns
            ) {
              const neighborIndex = neighborRow * columns + neighborCol;
              const neighborCell = cells[neighborIndex];
              if (neighborCell && neighborCell !== cell) {
                const distance = Math.sqrt(r * r + c * c);
                const intensity = Math.max(0, 1 - distance / 3);

                gsap.to(neighborCell, {
                  z: -depth * intensity * 0.7,
                  rotationX: (Math.random() - 0.5) * 15 * intensity,
                  rotationY: (Math.random() - 0.5) * 15 * intensity,
                  scale: 1 - 0.2 * intensity,
                  duration: 0.3,
                  ease: "power2.out",
                });
              }
            }
          }
        }
      };

      const onMouseLeave = () => {
        gsap.to(cell, {
          z: 0,
          rotationX: 0,
          rotationY: 0,
          scale: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.4)",
        });
      };

      cell.addEventListener("mouseenter", onMouseEnter);
      cell.addEventListener("mouseleave", onMouseLeave);
      enterHandlers.push(onMouseEnter);
      leaveHandlers.push(onMouseLeave);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const cellX = rect.left + rect.width / 2;
        const cellY = rect.top + rect.height / 2;

        const distX = clientX - cellX;
        const distY = clientY - cellY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        const maxDistance = 300;
        if (distance < maxDistance) {
          const intensity = 1 - distance / maxDistance;
          const zDepth = -depth * intensity * 1.2;

          const angle = Math.atan2(distY, distX);
          const rotationX = Math.sin(angle) * 25 * intensity;
          const rotationY = Math.cos(angle) * 25 * intensity;

          gsap.to(cell, {
            z: zDepth,
            rotationX: rotationX,
            rotationY: rotationY,
            scale: 1 - 0.3 * intensity,
            duration: 0.4,
            ease: "power3.out",
          });
        } else {
          gsap.to(cell, {
            z: 0,
            rotationX: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        }
      });
    };

    const handleClick = (e: MouseEvent) => {
      const { clientX, clientY } = e;

      cells.forEach((cell) => {
        const rect = cell.getBoundingClientRect();
        const cellX = rect.left + rect.width / 2;
        const cellY = rect.top + rect.height / 2;

        const distX = clientX - cellX;
        const distY = clientY - cellY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        const maxDistance = 400;
        if (distance < maxDistance) {
          const intensity = 1 - distance / maxDistance;

          gsap.to(cell, {
            z: -depth * intensity * 2,
            rotationX: (Math.random() - 0.5) * 60 * intensity,
            rotationY: (Math.random() - 0.5) * 60 * intensity,
            scale: 0.5 + 0.5 * intensity,
            duration: 0.1,
            ease: "power4.out",
            onComplete: () => {
              gsap.to(cell, {
                z: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.3)",
              });
            },
          });
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("click", handleClick);
      cells.forEach((cell, idx) => {
        cell.removeEventListener("mouseenter", enterHandlers[idx]);
        cell.removeEventListener("mouseleave", leaveHandlers[idx]);
      });
    };
  }, [depth, dimensions]);

  return (
    <div className="fixed inset-0 w-full h-full bg-zinc-900 overflow-hidden -z-10">
      <div
        ref={gridRef}
        className="grid w-full h-full"
        style={{
          gridTemplateColumns: `repeat(${dimensions.columns}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${dimensions.rows}, ${cellSize}px)`,
          perspective: "800px",
          perspectiveOrigin: "center center",
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        {Array.from({ length: dimensions.rows * dimensions.columns }).map(
          (_, index) => (
            <div
              key={index}
              className="grid-cell border border-zinc-950 transition-colors hover:border-zinc-950 bg-zinc-950"
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                transformStyle: "preserve-3d",
                transformOrigin: "center center",
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
