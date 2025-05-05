import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Background from "@/components/Background";

vi.mock("animejs", () => ({
  animate: vi.fn(),
  stagger: vi.fn(),
  createSpring: vi.fn(),
}));

const mockWindow = () => {
  Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
  Object.defineProperty(window, "innerHeight", { value: 768, writable: true });
  Object.defineProperty(window, "devicePixelRatio", {
    value: 1,
    writable: true,
  });
};

describe("Background Component", () => {
  beforeEach(() => {
    mockWindow();

    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
    document.querySelectorAll = vi.fn().mockReturnValue([]);

    vi.clearAllMocks();
  });

  it("renders the background grid", () => {
    render(<Background />);

    const container = screen.getByRole("presentation");
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute(
      "aria-label",
      "Interactive background grid"
    );
  });

  it("calculates grid dimensions based on window size", () => {
    window.innerWidth = 1400;
    window.innerHeight = 800;

    render(<Background />);

    const container = screen.getByRole("presentation");

    expect(container.style.gridTemplateColumns).toBe("repeat(20, 1fr)");

    expect(container.style.gridTemplateRows).toBe("repeat(11, 1fr)");
  });

  it("handles window resize events", () => {
    render(<Background />);

    expect(window.addEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );

    
    const { unmount } = render(<Background />);
    unmount();
    expect(window.removeEventListener).toHaveBeenCalledWith(
      "resize",
      expect.any(Function)
    );
  });

  it("renders grid tiles as interactive elements", () => {
    
    window.innerWidth = 210;
    window.innerHeight = 140;

    render(<Background />);

    const tiles = screen.getAllByRole("button");
    
    expect(tiles.length).toBe(8);

    tiles.forEach((tile, index) => {
      expect(tile).toHaveAttribute("aria-label", `Grid tile ${index + 1}`);
      expect(tile).toHaveAttribute("tabIndex", "0");
    });
  });

  it("handles keyboard interaction with tiles", () => {
    
    window.innerWidth = 70;
    window.innerHeight = 70;

    render(<Background />);

    const tile = screen.getByRole("button");

    fireEvent.keyDown(tile, { key: "Enter" });
    fireEvent.keyDown(tile, { key: " " });
    fireEvent.keyDown(tile, { key: "Escape" });

    expect(tile).toBeInTheDocument();
  });
});