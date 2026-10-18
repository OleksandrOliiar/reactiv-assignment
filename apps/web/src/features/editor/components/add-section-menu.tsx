'use client';

import { LIMITS } from '@reactiv/contracts';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { useEditorActions, useEditorStore } from './editor-store-provider';
import { sectionRegistry } from './sections-registry';

export function AddSectionMenu() {
  const { addSection } = useEditorActions();
  const atLimit = useEditorStore(
    (state) => state.state.document.sections.length >= LIMITS.sections,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" disabled={atLimit}>
          <Plus />
          Add section
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(sectionRegistry).map((definition) => {
          const Icon = definition.icon;
          return (
            <DropdownMenuItem
              key={definition.type}
              onSelect={() => addSection(definition.type)}
              className="whitespace-nowrap"
            >
              <Icon />
              {definition.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
