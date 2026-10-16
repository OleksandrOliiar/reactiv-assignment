import {
  CURRENT_SCHEMA_VERSION,
  configurationDataSchema,
  configurationSchema,
} from './configuration';
import type { Configuration, ConfigurationData } from './configuration';

export const defaultConfigurationData: ConfigurationData = configurationDataSchema.parse({
  sections: [
    {
      id: 'welcome-carousel',
      type: 'carousel',
      aspectRatio: 'landscape',
      images: [
        { id: 'welcome-carousel-1', url: 'https://picsum.photos/id/1015/1200/800' },
        { id: 'welcome-carousel-2', url: 'https://picsum.photos/id/1016/1200/800' },
      ],
    },
    {
      id: 'welcome-text',
      type: 'text',
      title: { text: 'Welcome home', color: '#111827' },
      description: {
        text: 'Edit this screen, then save it. A refresh brings the same layout back.',
        color: '#4B5563',
      },
    },
    {
      id: 'welcome-cta',
      type: 'cta',
      label: 'Shop now',
      url: 'https://example.com',
      buttonColor: '#111827',
      labelColor: '#FFFFFF',
    },
  ],
});

export function createDefaultConfiguration(id: string, updatedAt: string): Configuration {
  return configurationSchema.parse({
    id,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    version: 1,
    updatedAt,
    data: defaultConfigurationData,
  });
}
