import type { AspectRatio, Configuration } from '@reactiv/contracts';

export type LoadedConfiguration = {
  configuration: Configuration;
  isNew: boolean;
};

export type DraftImage = {
  id: string;
  url: string;
};

export type DraftSection =
  | {
      id: string;
      type: 'carousel';
      aspectRatio: AspectRatio;
      images: DraftImage[];
    }
  | {
      id: string;
      type: 'text';
      title: { text: string; color: string };
      description: { text: string; color: string };
    }
  | {
      id: string;
      type: 'cta';
      label: string;
      url: string;
      buttonColor: string;
      labelColor: string;
    };

export type SectionType = DraftSection['type'];

export type SectionErrors = Record<string, string>;
