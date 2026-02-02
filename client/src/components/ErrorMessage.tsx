import { AlertCircle, XCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  error: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

// 错误类型映射到友好的中文提示
const errorMessages: Record<string, { title: string; description: string; canRetry: boolean }> = {
  // 文件相关错误
  "FILE_TOO_LARGE": {
    title: "文件过大",
    description: "单个文件不能超过 10 MB。请选择较小的文件或压缩后重试。",
    canRetry: false,
  },
  "BATCH_TOO_LARGE": {
    title: "批量文件过大",
    description: "批量转换的文件总大小不能超过 50 MB。请减少文件数量或选择较小的文件。",
    canRetry: false,
  },
  "TEXT_TOO_LARGE": {
    title: "文本内容过大",
    description: "文本内容不能超过 5 MB。请减少内容长度后重试。",
    canRetry: false,
  },
  "INVALID_FILE_TYPE": {
    title: "不支持的文件类型",
    description: "该文件类型不支持转换。请检查文件格式是否正确。",
    canRetry: false,
  },
  "EMPTY_FILE": {
    title: "文件为空",
    description: "上传的文件内容为空，无法进行转换。请检查文件内容。",
    canRetry: false,
  },

  // 转换相关错误
  "CONVERSION_FAILED": {
    title: "转换失败",
    description: "文件转换过程中出现错误。可能是文件格式不正确或内容有误，请检查后重试。",
    canRetry: true,
  },
  "UNSUPPORTED_CONVERSION": {
    title: "不支持的转换",
    description: "该格式组合不支持转换。请选择其他输出格式。",
    canRetry: false,
  },
  "PANDOC_ERROR": {
    title: "Pandoc 转换错误",
    description: "Pandoc 引擎处理文件时出错。请检查文件内容是否符合格式规范。",
    canRetry: true,
  },

  // 权限相关错误
  "Conversion not found or access denied": {
    title: "访问被拒绝",
    description: "您没有权限访问该转换记录，或该记录不存在。",
    canRetry: false,
  },
  "Batch job not found or access denied": {
    title: "访问被拒绝",
    description: "您没有权限访问该批量任务，或该任务不存在。",
    canRetry: false,
  },

  // 网络相关错误
  "NETWORK_ERROR": {
    title: "网络连接失败",
    description: "无法连接到服务器。请检查您的网络连接后重试。",
    canRetry: true,
  },
  "TIMEOUT": {
    title: "请求超时",
    description: "服务器响应超时。可能是文件过大或网络不稳定，请稍后重试。",
    canRetry: true,
  },
  "SERVER_ERROR": {
    title: "服务器错误",
    description: "服务器处理请求时出现错误。我们已记录此问题，请稍后重试。",
    canRetry: true,
  },

  // 认证相关错误
  "UNAUTHORIZED": {
    title: "未登录",
    description: "您需要登录后才能使用此功能。",
    canRetry: false,
  },
  "SESSION_EXPIRED": {
    title: "登录已过期",
    description: "您的登录会话已过期，请重新登录。",
    canRetry: false,
  },
};

// 从错误对象或消息中提取错误类型
function getErrorType(error: Error | string): string {
  const errorMessage = typeof error === "string" ? error : error.message;
  
  // 检查是否匹配预定义的错误类型
  for (const key of Object.keys(errorMessages)) {
    if (errorMessage.includes(key)) {
      return key;
    }
  }
  
  // 检查常见的网络错误
  if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("fetch")) {
    return "NETWORK_ERROR";
  }
  
  if (errorMessage.toLowerCase().includes("timeout")) {
    return "TIMEOUT";
  }
  
  if (errorMessage.toLowerCase().includes("unauthorized") || errorMessage.toLowerCase().includes("401")) {
    return "UNAUTHORIZED";
  }
  
  if (errorMessage.toLowerCase().includes("server") || errorMessage.toLowerCase().includes("500")) {
    return "SERVER_ERROR";
  }
  
  return "UNKNOWN";
}

export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  if (!error) return null;

  const errorType = getErrorType(error);
  const errorInfo = errorMessages[errorType] || {
    title: "发生错误",
    description: typeof error === "string" ? error : error.message,
    canRetry: true,
  };

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>{errorInfo.title}</span>
        {onRetry && errorInfo.canRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-2 h-7 gap-1 text-xs"
          >
            <RefreshCw className="h-3 w-3" />
            重试
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {errorInfo.description}
      </AlertDescription>
    </Alert>
  );
}

// 简化版本，只显示图标和消息
export function InlineErrorMessage({ error }: { error: Error | string | null }) {
  if (!error) return null;

  const errorType = getErrorType(error);
  const errorInfo = errorMessages[errorType] || {
    title: "发生错误",
    description: typeof error === "string" ? error : error.message,
    canRetry: false,
  };

  return (
    <div className="flex items-start gap-2 text-sm text-destructive">
      <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">{errorInfo.title}</p>
        <p className="text-xs mt-0.5 text-muted-foreground">{errorInfo.description}</p>
      </div>
    </div>
  );
}
