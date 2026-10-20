import {
  configurationSchema,
  errorResponseSchema,
  type Configuration,
  type CreateConfigurationRequest,
  type ErrorCode,
  type ErrorDetail,
  type UpdateConfigurationRequest,
} from '@reactiv/contracts';
import axios, { isAxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';
import 'server-only';

import { env } from '@/env';

const DEFAULT_TIMEOUT_MS = 5_000;

export class ConfigServiceError extends Error {
  readonly status: number;
  readonly code: ErrorCode;
  readonly details?: ErrorDetail[];

  constructor(status: number, code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = 'ConfigServiceError';
    this.status = status;
    this.code = code;
    if (details && details.length > 0) this.details = details;
  }
}

export type ConfigServiceClient = {
  get(id: string): Promise<Configuration>;
  create(body: CreateConfigurationRequest): Promise<Configuration>;
  update(id: string, body: UpdateConfigurationRequest): Promise<Configuration>;
};

type ClientOptions = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
  http?: AxiosInstance;
};

export function createConfigHttp(options: ClientOptions): AxiosInstance {
  return axios.create({
    baseURL: options.baseUrl.replace(/\/$/, ''),
    timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    headers: {
      accept: 'application/json',
      'x-api-key': options.apiKey,
    },
  });
}

export function createConfigServiceClient(options: ClientOptions): ConfigServiceClient {
  const http = options.http ?? createConfigHttp(options);

  async function send(config: AxiosRequestConfig): Promise<unknown> {
    try {
      const response = await http.request(config);
      return response.data;
    } catch (error) {
      throw toConfigServiceError(error);
    }
  }

  return {
    async get(id) {
      return parseConfiguration(
        await send({
          method: 'GET',
          url: `/v1/configurations/${encodeURIComponent(id)}`,
        }),
      );
    },
    async create(body) {
      return parseConfiguration(
        await send({ method: 'POST', url: '/v1/configurations', data: body }),
      );
    },
    async update(id, body) {
      return parseConfiguration(
        await send({
          method: 'PUT',
          url: `/v1/configurations/${encodeURIComponent(id)}`,
          data: body,
        }),
      );
    },
  };
}

/** The client configured from the server environment. */
export function configServiceClient(): ConfigServiceClient {
  return createConfigServiceClient({
    baseUrl: env.CONFIG_SERVICE_URL,
    apiKey: env.CONFIG_SERVICE_API_KEY,
  });
}

function parseConfiguration(payload: unknown): Configuration {
  const parsed = configurationSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ConfigServiceError(
      502,
      'INTERNAL',
      'Configuration service returned an invalid configuration',
    );
  }
  return parsed.data;
}

function toConfigServiceError(error: unknown): ConfigServiceError {
  if (!isAxiosError(error)) {
    return new ConfigServiceError(503, 'INTERNAL', 'Configuration service is unavailable');
  }

  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
    return new ConfigServiceError(
      503,
      'INTERNAL',
      timedOut ? 'Configuration service timed out' : 'Configuration service is unavailable',
    );
  }

  const parsed = errorResponseSchema.safeParse(error.response.data);
  if (!parsed.success) {
    return new ConfigServiceError(
      error.response.status,
      'INTERNAL',
      'Configuration service request failed',
    );
  }

  return new ConfigServiceError(
    error.response.status,
    parsed.data.error.code,
    parsed.data.error.message,
    parsed.data.error.details,
  );
}
