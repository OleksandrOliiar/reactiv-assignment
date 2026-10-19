/** @vitest-environment jsdom */

import { createDefaultConfiguration, defaultConfigurationData } from '@reactiv/contracts';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderEditor } from '@/test/render';
import { loadedConfiguration, savedConfiguration } from '@/test/fixtures';

import { SaveButton } from './save-button';
import { EditorStatus } from './editor-status';
import { EditorScreen } from './editor-screen';

const saveConfiguration = vi.hoisted(() => vi.fn());
const loadLatestConfiguration = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/features/editor/api/actions', () => ({
  saveConfiguration,
  loadLatestConfiguration,
}));

vi.mock('sonner', () => ({ toast }));

async function editWelcomeTitle(user: ReturnType<typeof userEvent.setup>, value: string) {
  await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
  const title = screen.getByRole('textbox', { name: 'Title' });
  await user.clear(title);
  await user.type(title, value);
}

describe('SaveButton', () => {
  beforeEach(() => {
    saveConfiguration.mockReset();
    loadLatestConfiguration.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  it('stays disabled until the draft changes', () => {
    renderEditor(
      <>
        <EditorStatus />
        <SaveButton />
      </>,
      { initial: loadedConfiguration },
    );

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('blocks a client-side invalid draft without calling the action', async () => {
    const user = userEvent.setup();
    renderEditor(<EditorScreen />, { initial: loadedConfiguration });

    await user.click(screen.getByRole('button', { name: /^2\.\s*Welcome home/ }));
    const color = screen.getByRole('textbox', { name: 'Title color' });
    await user.clear(color);
    await user.type(color, 'red');

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    expect(saveConfiguration).not.toHaveBeenCalled();
  });

  it('saves a dirty draft and marks the screen saved', async () => {
    const user = userEvent.setup();
    saveConfiguration.mockResolvedValue({
      status: 'saved',
      configuration: {
        ...savedConfiguration,
        version: 4,
        data: {
          ...defaultConfigurationData,
          sections: defaultConfigurationData.sections.map((section) =>
            section.type === 'text'
              ? { ...section, title: { ...section.title, text: 'Saved title' } }
              : section,
          ),
        },
      },
    });

    renderEditor(<EditorScreen />, { initial: loadedConfiguration });
    await editWelcomeTitle(user, 'Saved title');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(saveConfiguration).toHaveBeenCalledOnce());
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Home screen saved'));
    expect(screen.getByText('Version 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('maps a server validation failure onto the field', async () => {
    const user = userEvent.setup();
    const textId = defaultConfigurationData.sections.find((section) => section.type === 'text')?.id;
    saveConfiguration.mockResolvedValue({
      status: 'invalid',
      message: 'Fix the highlighted fields.',
      errors: { [textId ?? '']: { 'title.color': 'Rejected by the service' } },
    });

    renderEditor(<EditorScreen />, { initial: loadedConfiguration });
    await editWelcomeTitle(user, 'Server check');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(screen.getByText('Rejected by the service')).toBeInTheDocument());
    expect(toast.error).toHaveBeenCalledWith('Fix the highlighted fields.');
  });

  it('opens the conflict dialog and reloads the latest screen', async () => {
    const user = userEvent.setup();
    saveConfiguration.mockResolvedValue({
      status: 'conflict',
      message: 'Version mismatch',
    });
    loadLatestConfiguration.mockResolvedValue({
      status: 'loaded',
      configuration: createDefaultConfiguration('default', '2026-02-01T00:00:00.000Z'),
    });

    renderEditor(<EditorScreen />, { initial: loadedConfiguration });
    await editWelcomeTitle(user, 'Stale draft');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('This screen was saved somewhere else')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reload latest' }));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith('Loaded the latest saved screen'),
    );
    expect(screen.getByRole('button', { name: /^2\.\s*Welcome home/ })).toBeInTheDocument();
    expect(screen.queryByText('This screen was saved somewhere else')).not.toBeInTheDocument();
  });
});
