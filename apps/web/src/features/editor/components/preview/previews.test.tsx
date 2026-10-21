/** @vitest-environment jsdom */

import { defaultConfigurationData } from '@reactiv/contracts';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { SectionOf } from '../../types/types';
import { CtaPreview } from './cta-preview';
import { SlideImage } from './slide-image';
import { TextPreview } from './text-preview';

const [, text, cta] = defaultConfigurationData.sections as [
  SectionOf<'carousel'>,
  SectionOf<'text'>,
  SectionOf<'cta'>,
];

describe('CtaPreview', () => {
  it('links a valid URL in a new tab with the chosen colors', () => {
    render(<CtaPreview section={{ ...cta, buttonColor: '#f00', labelColor: '#00ff00' }} />);

    const link = screen.getByRole('link', { name: 'Shop now' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveStyle({ backgroundColor: '#ff0000', color: '#00ff00' });
  });

  it('never links an unsafe URL', () => {
    render(<CtaPreview section={{ ...cta, url: 'javascript:alert(1)', label: '' }} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
    expect(screen.getByText(/Enter an http or https URL/)).toBeInTheDocument();
  });
});

describe('TextPreview', () => {
  it('shows placeholders for blank text and ignores an invalid color', () => {
    render(
      <TextPreview
        section={{
          ...text,
          title: { text: '', color: 'red' },
          description: { text: '', color: '#123' },
        }}
      />,
    );

    expect(screen.getByText('Untitled')).not.toHaveAttribute('style');
    expect(screen.getByText('No description')).toHaveStyle({ color: '#112233' });
  });
});

describe('SlideImage', () => {
  it('shows a placeholder for a non-http URL', () => {
    render(<SlideImage url="ftp://example.com/a.jpg" label="Slide 1" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  it('swaps to the placeholder when the image fails to load', () => {
    render(<SlideImage url="https://example.com/missing.jpg" label="Slide 1" />);

    fireEvent.error(screen.getByRole('img', { name: 'Slide 1' }));
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });
});
