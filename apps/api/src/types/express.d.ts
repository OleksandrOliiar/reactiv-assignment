export {};

declare global {
  namespace Express {
    interface Request {
      validated?: {
        body: unknown;
        params: unknown;
      };
    }
  }
}
