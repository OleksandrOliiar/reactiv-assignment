/** @vitest-environment jsdom */

import { LIMITS, defaultConfigurationData } from '@reactiv/contracts';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { loadedConfiguration, savedConfiguration } from '@/test/fixtures';
import { renderEditor } from '@/test/render';

import type { DraftSection } from '../types/types';
import { EditorScreen } from './editor-screen';

function loadedWith(sections: DraftSection[], isNew = false) {
  return { configuration: { ...savedConfiguration, data: { sections } }, isNew };
}

function preview() {
  return within(screen.getByRole('region', { name: 'Phone preview' }));
}

describe('EditorScreen', () => {
  it('edits a text title and shows the change in the phone preview', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const title = screen.getByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.type(title, 'Hello preview');

    expect(preview().getByText('Hello preview')).toBeInTheDocument();
  });

  it('keeps preview copy readable when a title color is invalid', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const color = screen.getByRole('textbox', { name: 'Title color' });
    await user.clear(color);
    await user.type(color, 'red');

    expect(screen.getByText(/hex color/i)).toBeInTheDocument();
    // Once in the header status and once on the section card.
    expect(screen.getAllByText('1 error')).toHaveLength(2);
    expect(preview().getByText('Welcome home')).toBeInTheDocument();
  });

  it('edits a call to action and shows it in the phone preview', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^3\.\s*Shop now/ }));
    const label = screen.getByRole('textbox', { name: 'Button label' });
    await user.clear(label);
    await user.type(label, 'Browse deals');

    expect(preview().getByRole('link', { name: 'Browse deals' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^3\.\s*Browse deals/ })).toBeInTheDocument();
  });

  it('adds, reorders, edits, and removes carousel images', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });
    const urls = () =>
      screen
        .getAllByRole('textbox', { name: 'Image URL' })
        .map((input) => (input as HTMLInputElement).value);

    await user.click(screen.getByRole('button', { name: /^1\.\s*Carousel, 2 images/ }));
    await user.click(screen.getByRole('button', { name: 'Add image' }));
    expect(urls()).toHaveLength(3);
    expect(screen.getByRole('button', { name: /^1\.\s*Carousel, 3 images/ })).toBeInTheDocument();

    const [first] = screen.getAllByRole('textbox', { name: 'Image URL' });
    await user.clear(first!);
    await user.type(first!, 'https://example.com/first.jpg');
    await user.click(screen.getAllByRole('button', { name: 'Move image down' })[0]!);
    expect(urls()[1]).toBe('https://example.com/first.jpg');

    await user.click(screen.getAllByRole('button', { name: 'Remove image' })[1]!);
    expect(urls()).not.toContain('https://example.com/first.jpg');
    expect(urls()).toHaveLength(2);
  });

  it('stops adding images at the carousel limit', async () => {
    const user = userEvent.setup();
    const [carousel] = defaultConfigurationData.sections;
    if (carousel?.type !== 'carousel') throw new Error('expected the carousel first');
    const images = Array.from({ length: LIMITS.imagesPerCarousel }, (_, index) => ({
      id: `image-${index}`,
      url: `https://example.com/${index}.jpg`,
    }));
    renderEditor(<EditorScreen />, { initial: loadedWith([{ ...carousel, images }]) });

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`^1\\.\\s*Carousel, ${LIMITS.imagesPerCarousel} images`),
      }),
    );
    expect(screen.getByRole('button', { name: 'Add image' })).toBeDisabled();
  });

  it('adds a section from the Sections heading', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Add section' }));
    await user.click(screen.getByRole('menuitem', { name: /Text/i }));

    expect(screen.getByRole('button', { name: /^4\.\s*Title/ })).toBeInTheDocument();
    expect(screen.getByText(`4 of ${LIMITS.sections}`)).toBeInTheDocument();
  });

  it('stops adding sections at the screen limit', () => {
    const [, , cta] = defaultConfigurationData.sections;
    if (!cta) throw new Error('expected a CTA section');
    const sections = Array.from({ length: LIMITS.sections }, (_, index) => ({
      ...cta,
      id: `cta-${index}`,
    }));
    renderEditor(<EditorScreen />, { initial: loadedWith(sections) });

    expect(screen.getByRole('button', { name: 'Add section' })).toBeDisabled();
  });

  it('moves a section with the actions menu', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Actions for Welcome home' }));
    await user.click(screen.getByRole('menuitem', { name: 'Move up' }));

    const cards = screen.getAllByRole('button', { name: /^\d+\.\s/ });
    expect(cards[0]).toHaveAccessibleName(/Welcome home/);
  });

  it('disables moves past either end of the list', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Actions for Carousel, 2 images' }));
    expect(screen.getByRole('menuitem', { name: 'Move up' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('duplicates a section below the original', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Actions for Welcome home' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));

    expect(screen.getByRole('button', { name: /^3\.\s*Welcome home/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(preview().getAllByText('Welcome home')).toHaveLength(2);
  });

  it('deletes a section after confirmation', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Actions for Shop now' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByRole('button', { name: /^3\.\s*Shop now/ })).not.toBeInTheDocument();
  });

  it('explains an empty screen in the list and the preview', () => {
    renderEditor(<EditorScreen />, { initial: loadedWith([], true) });

    expect(screen.getByText('No sections yet')).toBeInTheDocument();
    expect(preview().getByText('Empty screen')).toBeInTheDocument();
    expect(screen.getByText('Not saved yet')).toBeInTheDocument();
    expect(screen.queryByText(/^Version/)).not.toBeInTheDocument();
  });

  it('warns before leaving with unsaved changes', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });
    const leave = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };

    expect(leave()).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Actions for Welcome home' }));
    await user.click(screen.getByRole('menuitem', { name: 'Move up' }));
    expect(leave()).toBe(true);
  });
});
