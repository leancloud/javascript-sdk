export class APIError extends Error {
  constructor(public code: number, public error: string) {
    super(`code: ${code}, message: ${error}`);
  }
}
