import type { CarouselImage, Configuration, ConfigurationData, Section } from '@reactiv/contracts';

export type LoadedConfiguration = {
  configuration: Configuration;
  isNew: boolean;
};

/** Drafts have the contract shapes, but their values are not validated yet. */
export type DraftDocument = ConfigurationData;
export type DraftSection = Section;
export type DraftImage = CarouselImage;

export type SectionType = DraftSection['type'];
export type SectionOf<T extends SectionType> = Extract<DraftSection, { type: T }>;

/** Messages keyed by field path, e.g. `title.color` or `images.0.url`. */
export type SectionErrors = Record<string, string>;
/** Section errors keyed by section id. Screen-level errors use `_screen`. */
export type FieldErrors = Record<string, SectionErrors>;
