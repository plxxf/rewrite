import { useState, useCallback, useRef } from "react";

interface UseAutoRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attemptNumber: number) => void;
  onMaxRetriesReached?: () => void;
}

interface UseAutoRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  isRetrying: boolean;
  retryCount: number;
  reset: () => void;
}

/**
 * 自动重试 Hook
 * 用于处理网络错误等临时性错误的自动重试
 */
export function useAutoRetry<T>({
  maxRetries = 3,
  retryDelay = 1000,
  onRetry,
  onMaxRetriesReached,
}: UseAutoRetryOptions = {}): UseAutoRetryReturn<T> {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setIsRetrying(false);
    setRetryCount(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const shouldRetry = useCallback((error: unknown): boolean => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // 网络错误应该重试
    if (
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("fetch") ||
      errorMessage.toLowerCase().includes("timeout")
    ) {
      return true;
    }
    
    // 服务器错误应该重试
    if (
      errorMessage.toLowerCase().includes("server") ||
      errorMessage.toLowerCase().includes("500") ||
      errorMessage.toLowerCase().includes("503")
    ) {
      return true;
    }
    
    // 其他错误不重试
    return false;
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      let lastError: unknown;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          // 如果是重试，设置重试状态
          if (attempt > 0) {
            setIsRetrying(true);
            setRetryCount(attempt);
            onRetry?.(attempt);
            
            // 等待重试延迟
            await sleep(retryDelay * attempt); // 指数退避
          }
          
          // 执行函数
          const result = await fn();
          
          // 成功，重置状态
          setIsRetrying(false);
          setRetryCount(0);
          
          return result;
        } catch (error) {
          lastError = error;
          
          // 检查是否应该重试
          if (!shouldRetry(error) || attempt === maxRetries) {
            break;
          }
        }
      }
      
      // 达到最大重试次数
      setIsRetrying(false);
      if (retryCount > 0) {
        onMaxRetriesReached?.();
      }
      
      throw lastError;
    },
    [maxRetries, retryDelay, shouldRetry, onRetry, onMaxRetriesReached, retryCount]
  );

  return {
    execute,
    isRetrying,
    retryCount,
    reset,
  };
}
