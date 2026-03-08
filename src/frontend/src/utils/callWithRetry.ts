/**
 * Wraps a canister call with timeout and retry logic.
 * @param fn - The async function to call (should return a Promise)
 * @param operationName - Human-readable name for error messages
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @param retryDelayMs - Delay between retries in milliseconds (default: 500)
 */
export async function callWithRetry<T>(
  fn: () => Promise<T>,
  operationName: string,
  timeoutMs = 60000,
  maxRetries = 2,
  retryDelayMs = 500,
): Promise<T> {
  let lastError: Error = new Error(`${operationName} failed`);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `${operationName} timed out after ${timeoutMs / 1000}s`,
                ),
              ),
            timeoutMs,
          ),
        ),
      ]);
      return result;
    } catch (err) {
      lastError =
        err instanceof Error ? err : new Error(`${operationName} failed`);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw lastError;
}
