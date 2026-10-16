import { existsSync, readdirSync } from 'node:fs';
import { defineConfig } from 'vitest/config';

function workspaceProjects(root: string): string[] {
  if (!existsSync(root)) return [];

  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `${root}/${entry.name}`);
}

const projects = [...workspaceProjects('packages'), ...workspaceProjects('apps')];

export default defineConfig({
  test:
    projects.length > 0
      ? {
          // Each workspace package owns its tests via its own vitest.config.ts.
          // A config referenced here does not inherit this root file.
          projects,
          passWithNoTests: true,
        }
      : {
          passWithNoTests: true,
        },
});
