"use client";

import { useState, useEffect, useRef } from "react";

type ColoredChar = {
  char: string;
  color: string;
};

export default function AsciiConverter() {
  const [resolution] = useState(0.3);
  const [inverted] = useState(false);
  const [grayscale] = useState(true);
  const [charSet] = useState("detailed");
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [coloredAsciiArt, setColoredAsciiArt] = useState<ColoredChar[][]>([]);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const charSets = {
    standard: " .:-=+*#%@",
    detailed: " .,:;i1tfLCG08@",
    blocks: " ░▒▓█",
    minimal: " .:█",
  };

  useEffect(() => {
    loadImage();
  }, []);

  useEffect(() => {
    if (imageLoaded && imageRef.current) {
      convertToAscii();
    }
  }, [resolution, inverted, grayscale, charSet, imageLoaded]);

  useEffect(() => {
    if (imageLoaded && !loading && !error) {
      renderToCanvas();
    }
  }, [asciiArt, coloredAsciiArt, grayscale, loading, error, imageLoaded]);

  const loadImage = () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      if (img.width === 0 || img.height === 0) {
        setError("Invalid image dimensions");
        setLoading(false);
        return;
      }

      imageRef.current = img;
      setImageLoaded(true);
      setLoading(false);
    };

    img.onerror = () => {
      setError("Failed to load image");
      setLoading(false);
    };

    // Use the remote image URL
    img.src = "/me.png";
  };

  const adjustColorBrightness = (
    r: number,
    g: number,
    b: number,
    factor: number
  ): string => {
    const minBrightness = 40;
    r = Math.max(Math.min(Math.round(r * factor), 255), minBrightness);
    g = Math.max(Math.min(Math.round(g * factor), 255), minBrightness);
    b = Math.max(Math.min(Math.round(b * factor), 255), minBrightness);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderToCanvas = () => {
    if (!outputCanvasRef.current || !asciiArt || coloredAsciiArt.length === 0)
      return;

    const canvas = outputCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const fontSize = 8;
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    const lineHeight = fontSize;
    const charWidth = fontSize * 0.6;

    if (grayscale) {
      const lines = asciiArt.split("\n");
      const maxLineLength = Math.max(...lines.map((line) => line.length));
      canvas.width = maxLineLength * charWidth;
      canvas.height = lines.length * lineHeight;
    } else {
      canvas.width = coloredAsciiArt[0].length * charWidth;
      canvas.height = coloredAsciiArt.length * lineHeight;
    }

    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    if (grayscale) {
      ctx.fillStyle = "white";
      asciiArt.split("\n").forEach((line, lineIndex) => {
        ctx.fillText(line, 0, lineIndex * lineHeight);
      });
    } else {
      coloredAsciiArt.forEach((row, rowIndex) => {
        row.forEach((col, colIndex) => {
          ctx.fillStyle = col.color;
          ctx.fillText(col.char, colIndex * charWidth, rowIndex * lineHeight);
        });
      });
    }
  };

  const convertToAscii = () => {
    try {
      if (!canvasRef.current || !imageRef.current) {
        throw new Error("Canvas or image not available");
      }

      const img = imageRef.current;

      if (img.width === 0 || img.height === 0) {
        throw new Error("Invalid image dimensions");
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const width = Math.floor(img.width * resolution);
      const height = Math.floor(img.height * resolution);

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, img.width, img.height);

      let imageData;
      try {
        imageData = ctx.getImageData(0, 0, img.width, img.height);
      } catch (e) {
        console.error("Error:", e);
        throw new Error("Failed to get image data");
      }

      const data = imageData.data;
      const chars = charSets[charSet as keyof typeof charSets];

      const fontAspect = 0.5;
      const widthStep = Math.ceil(img.width / width);
      const heightStep = Math.ceil(img.height / height / fontAspect);

      let result = "";
      const coloredResult: ColoredChar[][] = [];

      for (let y = 0; y < img.height; y += heightStep) {
        const coloredRow: ColoredChar[] = [];

        for (let x = 0; x < img.width; x += widthStep) {
          const pos = (y * img.width + x) * 4;

          const r = data[pos];
          const g = data[pos + 1];
          const b = data[pos + 2];

          let brightness;
          if (grayscale) {
            brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          } else {
            brightness = Math.sqrt(
              0.299 * (r / 255) * (r / 255) +
                0.587 * (g / 255) * (g / 255) +
                0.114 * (b / 255) * (b / 255)
            );
          }

          if (inverted) brightness = 1 - brightness;

          const charIndex = Math.floor(brightness * (chars.length - 1));
          const char = chars[charIndex];

          result += char;

          if (!grayscale) {
            const brightnessFactor =
              (charIndex / (chars.length - 1)) * 1.5 + 0.5;
            const color = adjustColorBrightness(r, g, b, brightnessFactor);
            coloredRow.push({ char, color });
          } else {
            coloredRow.push({ char, color: "white" });
          }
        }

        result += "\n";
        coloredResult.push(coloredRow);
      }

      setAsciiArt(result);
      setColoredAsciiArt(coloredResult);
      setError(null);
    } catch (err) {
      console.error("Error converting to ASCII:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setAsciiArt("");
      setColoredAsciiArt([]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row w-full overflow-hidden ">
        {/* ASCII Art Preview */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="text-white font-mono">Loading image...</div>
          ) : error ? (
            <div className="text-red-400 font-mono text-center">
              {error}
              <div className="mt-2 text-white text-sm">
                Failed to load or process the image.
              </div>
            </div>
          ) : (
            <canvas
              ref={outputCanvasRef}
              className="select-text mix-blend-difference"
              style={{
                width: "80dvw",
                height: "auto",
                fontSize: "1rem", 
                lineHeight: "1rem",
                fontFamily: "monospace",
              }}
            />
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
