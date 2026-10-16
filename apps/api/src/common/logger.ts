import { randomUUID } from 'node:crypto';

import type { IncomingMessage, ServerResponse } from 'node:http';
import pino, { type Logger } from 'pino';
import { pinoHttp } from 'pino-http';

export function createLogger(level: string): Logger {
  return pino({ level });
}

export function createRequestLogger(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const header = req.headers['x-request-id'];
      const id = typeof header === 'string' && header.length > 0 ? header : randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
  });
}
