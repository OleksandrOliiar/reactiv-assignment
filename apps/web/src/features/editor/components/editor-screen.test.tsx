/** @vitest-environment jsdom */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderEditor } from '@/test/render';
import { loadedConfiguration } from '@/test/fixtures';

import { EditorScreen } from './editor-screen';

describe('EditorScreen', () => {
  it('edits a text title and shows the change in the phone preview', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const title = screen.getByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.type(title, 'Hello preview');

    const preview = screen.getByRole('region', { name: 'Phone preview' });
    expect(within(preview).getByText('Hello preview')).toBeInTheDocument();
  });

  it('keeps preview copy readable when a title color is invalid', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const color = screen.getByRole('textbox', { name: 'Title color' });
    await user.clear(color);
    await user.type(color, 'red');

    expect(screen.getByText(/hex color/i)).toBeInTheDocument();
    const preview = screen.getByRole('region', { name: 'Phone preview' });
    expect(within(preview).getByText('Welcome home')).toBeInTheDocument();
  });

  it('adds a section from the toolbar menu', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Add section' }));
    await user.click(screen.getByRole('menuitem', { name: /Text/i }));

    expect(screen.getByRole('button', { name: /^4\.\s*Title/ })).toBeInTheDocument();
  });

  it('moves a section with the actions menu', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Actions for Welcome home' }));
    await user.click(screen.getByRole('menuitem', { name: 'Move up' }));

    const cards = screen.getAllByRole('button', { name: /^\d+\.\s/ });
    expect(cards[0]).toHaveAccessibleName(/Welcome home/);
  });

  it('deletes a section after confirmation', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'Actions for Shop now' }));
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.queryByRole('button', { name: /^3\.\s*Shop now/ })).not.toBeInTheDocument();
  });
});
