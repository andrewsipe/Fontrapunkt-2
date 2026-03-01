/**
 * Performance benchmarking utilities
 * Phase 6: Internal performance monitoring for font parsing
 * Development only - logs parsing duration to console
 */

/**
 * Benchmark result interface
 */
export interface BenchmarkResult {
  duration: number;
  fileSize: number;
  fileSizeMB: number;
  meetsTarget: boolean;
  target: number;
}

/**
 * Performance targets
 */
const TARGET_PARSE_TIME_MS = 500; // Target: <500ms for <1MB fonts

/**
 * Benchmark font parsing performance
 * Logs duration to console in development mode only
 *
 * @param parseFn - Async function that parses the font
 * @param fileSize - Size of the font file in bytes
 * @param fontName - Optional font name for logging
 * @returns Benchmark result
 */
export async function benchmarkParsing<T = unknown>(
  parseFn: () => Promise<T>,
  fileSize: number,
  fontName?: string
): Promise<BenchmarkResult> {
  const startTime = performance.now();

  await parseFn();

  const endTime = performance.now();
  const duration = endTime - startTime;
  const fileSizeMB = fileSize / (1024 * 1024);
  const meetsTarget = duration < TARGET_PARSE_TIME_MS;

  // Only log in development mode
  if (import.meta.env.DEV) {
    const status = meetsTarget ? "✓" : "✗";
    const targetStatus = meetsTarget
      ? `(target: <${TARGET_PARSE_TIME_MS}ms)`
      : `(target: <${TARGET_PARSE_TIME_MS}ms - FAILED)`;

    console.log(
      `[Performance] ${status} Parsing Duration: ${duration.toFixed(2)}ms ${targetStatus}`,
      {
        fontName: fontName || "Unknown",
        fileSize: `${fileSizeMB.toFixed(2)}MB`,
        duration: `${duration.toFixed(2)}ms`,
        meetsTarget,
      }
    );
  }

  return {
    duration,
    fileSize,
    fileSizeMB,
    meetsTarget,
    target: TARGET_PARSE_TIME_MS,
  };
}

/**
 * Compare sequential vs parallel extraction performance
 * Development only - logs comparison to console
 *
 * @param sequentialFn - Sequential extraction function
 * @param parallelFn - Parallel extraction function
 * @param fileSize - Size of the font file in bytes
 */
export async function compareSequentialVsParallel<T = unknown>(
  sequentialFn: () => Promise<T>,
  parallelFn: () => Promise<T>,
  fileSize: number
): Promise<{
  sequential: BenchmarkResult;
  parallel: BenchmarkResult;
  speedup: number;
}> {
  if (!import.meta.env.DEV) {
    // In production, just run parallel (no comparison)
    const parallel = await benchmarkParsing(parallelFn, fileSize);
    return {
      sequential: { ...parallel, duration: 0 },
      parallel,
      speedup: 1,
    };
  }

  // Run sequential first
  const sequential = await benchmarkParsing(sequentialFn, fileSize, "Sequential");

  // Small delay to allow GC
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Run parallel
  const parallel = await benchmarkParsing(parallelFn, fileSize, "Parallel");

  const speedup = sequential.duration / parallel.duration;

  console.log(
    `[Performance] Speedup: ${speedup.toFixed(2)}x faster (${sequential.duration.toFixed(2)}ms → ${parallel.duration.toFixed(2)}ms)`
  );

  return {
    sequential,
    parallel,
    speedup,
  };
}

/**
 * Simple performance monitor for tracking operation durations
 * Development only - no-ops in production
 */
const perfMarks = new Map<string, number>();
const perfEnabled = import.meta.env.DEV;

/** Start timing an operation */
export function perfStart(label: string): void {
  if (!perfEnabled) return;
  perfMarks.set(label, performance.now());
}

/**
 * End timing and log if exceeds threshold
 * @returns Duration in milliseconds
 */
export function perfEnd(label: string, warnThreshold?: number): number | undefined {
  if (!perfEnabled) return undefined;

  const start = perfMarks.get(label);
  if (start === undefined) return undefined;

  const duration = performance.now() - start;
  perfMarks.delete(label);

  if (warnThreshold !== undefined && duration > warnThreshold) {
    console.warn(`[Perf] ${label} took ${duration.toFixed(1)}ms (>${warnThreshold}ms)`);
  }

  return duration;
}

/** Measure async operation */
export async function perfMeasure<T>(
  label: string,
  fn: () => Promise<T>,
  warnThreshold?: number
): Promise<T> {
  perfStart(label);
  const result = await fn();
  perfEnd(label, warnThreshold);
  return result;
}
