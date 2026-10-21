/** @vitest-environment jsdom */

import { CURRENT_SCHEMA_VERSION, defaultConfigurationData } from '@reactiv/contracts';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { loadedConfiguration } from '@/test/fixtures';
import { renderEditor } from '@/test/render';

import { EditorScreen } from '../editor-screen';

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('sonner', () => ({ toast }));

function importFile(contents: string) {
  const input = screen.getByLabelText('Import home screen JSON');
  fireEvent.change(input, {
    target: { files: [new File([contents], 'screen.json', { type: 'application/json' })] },
  });
}

const ctaOnlyExport = JSON.stringify({
  schemaVersion: CURRENT_SCHEMA_VERSION,
  exportedAt: '2026-01-01T00:00:00.000Z',
  data: { sections: defaultConfigurationData.sections.slice(2) },
});

describe('EditorToolbar', () => {
  beforeEach(() => {
    toast.success.mockReset();
    toast.error.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('replaces the draft with an imported file', async () => {
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    importFile(ctaOnlyExport);

    expect(await screen.findByRole('button', { name: /^1\.\s*Shop now/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Welcome home/ })).not.toBeInTheDocument();
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Imported the home screen. Save to keep it.');
  });

  it('shows why an import failed until it is dismissed or a later import works', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    importFile(JSON.stringify({ schemaVersion: 99, exportedAt: '2026-01-01T00:00:00Z', data: {} }));
    expect(await screen.findByText('Unsupported file version')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^2\.\s*Welcome home/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByText('Unsupported file version')).not.toBeInTheDocument();

    importFile('{');
    expect(await screen.findByText('Could not read this file')).toBeInTheDocument();
    importFile(ctaOnlyExport);
    await waitFor(() =>
      expect(screen.queryByText('Could not read this file')).not.toBeInTheDocument(),
    );
  });

  it('downloads the draft as an export file', async () => {
    const user = userEvent.setup();
    // jsdom has no object URLs.
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:export');
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: 'File' }));
    await user.click(screen.getByRole('menuitem', { name: 'Export JSON' }));

    expect(click).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(JSON.parse((await blob?.text()) ?? '')).toMatchObject({
      schemaVersion: CURRENT_SCHEMA_VERSION,
      data: defaultConfigurationData,
    });
    expect(toast.success).toHaveBeenCalledWith('Exported the home screen');
  });

  it('does not export a draft with errors', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const color = screen.getByRole('textbox', { name: 'Title color' });
    await user.clear(color);
    await user.type(color, 'red');
    await user.click(screen.getByRole('button', { name: 'File' }));

    expect(screen.getByRole('menuitem', { name: 'Export JSON' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('discards unsaved changes after confirmation', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const title = screen.getByRole('textbox', { name: 'Title' });
    await user.clear(title);
    await user.type(title, 'Throwaway');
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    await user.click(
      within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Discard' }),
    );

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Welcome home');
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});
