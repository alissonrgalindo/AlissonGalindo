import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hero from '@/components/Hero';
import en from '@/i18n/dictionaries/en';

vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock('@/components/Background', () => ({
  default: () => <div data-testid="background-component" />,
}));

vi.mock('@/components/LanguageSwitcher', () => ({
  default: ({ currentLocale }: { currentLocale: string }) => (
    <div data-testid="language-switcher" data-locale={currentLocale} />
  ),
}));

describe('Hero Component', () => {
  it('renders the hero component with correct content', () => {
    render(<Hero lang="en" dictionary={en} />);

    expect(screen.getByText(en.hero.title)).toBeInTheDocument();
    
    expect(screen.getByText(en.hero.subtitle)).toBeInTheDocument();
    
    expect(screen.getByText(en.hero.location)).toBeInTheDocument();
    
    const descText = screen.getByText((content) => 
      content.includes(en.hero.description), { exact: false }
    );
    expect(descText).toBeInTheDocument();
    
    expect(screen.getByAltText(en.accessibility.photoAlt)).toBeInTheDocument();
    
    const codepenLink = screen.getByText(en.hero.codepenLink);
    expect(codepenLink).toBeInTheDocument();
    expect(codepenLink).toHaveAttribute('href', 'https://codepen.io/AlisonGalindo');
    
    const linkedinLink = screen.getByText(en.hero.linkedinLink);
    expect(linkedinLink).toBeInTheDocument();
    expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/alissonrgalindo/');
    
    const cvLink = screen.getByText(en.hero.downloadCV);
    expect(cvLink).toBeInTheDocument();
    expect(cvLink).toHaveAttribute('href', '/assets/docs/alison-cv.pdf');
    expect(cvLink).toHaveAttribute('download', 'Alison-Galindo-CV-UI-Developer');
  });

  it('renders the mocked background component', () => {
    render(<Hero lang="en" dictionary={en} />);
    expect(screen.getByTestId('background-component')).toBeInTheDocument();
  });

  it('renders the language switcher with the correct locale', () => {
    render(<Hero lang="en" dictionary={en} />);
    const langSwitcher = screen.getByTestId('language-switcher');
    expect(langSwitcher).toBeInTheDocument();
    expect(langSwitcher).toHaveAttribute('data-locale', 'en');
  });
});