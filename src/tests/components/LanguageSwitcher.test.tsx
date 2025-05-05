import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface LinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false';
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
}

vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/en'),
  useRouter: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: LinkProps) => {
  
    const validProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {
      href,
      className: props.className,
      'aria-label': props['aria-label'],
      'aria-current': props['aria-current'],
      onClick: props.onClick,
    };
    
    return (
      <a {...validProps}>
        {children}
      </a>
    );
  },
}));

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
  
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      if (typeof fn === 'function') fn();
      return 0 as unknown as NodeJS.Timeout;
    });
  });

  it('renders language options correctly', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    expect(screen.getByText('EN')).toBeInTheDocument();
    expect(screen.getByText('PT')).toBeInTheDocument();
  });
  
  it('applies active styling to current language', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    const enButton = screen.getByText('EN').closest('a');
    const ptButton = screen.getByText('PT').closest('a');
    
    expect(enButton?.className).toContain('bg-black text-white');
    expect(ptButton?.className).toContain('bg-white text-black');
  });
  
  it('has correct hrefs for language options', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    const enLink = screen.getByText('EN').closest('a');
    const ptLink = screen.getByText('PT').closest('a');
    
    expect(enLink).toHaveAttribute('href', '/en');
    expect(ptLink).toHaveAttribute('href', '/pt-BR');
  });
  
  it('has correct aria attributes for accessibility', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    const enButton = screen.getByText('EN').closest('a');
    const ptButton = screen.getByText('PT').closest('a');
    
    expect(enButton).toHaveAttribute('aria-current', 'page');
    expect(ptButton).not.toHaveAttribute('aria-current');
    
    expect(enButton).toHaveAttribute('aria-label', 'Switch to English (current language)');
    expect(ptButton).toHaveAttribute('aria-label', 'Switch to Português');
  });
  
  it('has correct navigation role', () => {
    render(<LanguageSwitcher currentLocale="en" />);
    
    const navElement = screen.getByRole('navigation');
    expect(navElement).toHaveAttribute('aria-label', 'Language selection');
  });
});