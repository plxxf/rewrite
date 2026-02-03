import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface QuotaItemProps {
  title: string;
  used: number;
  limit: number;
  resetTime: Date;
  icon: React.ReactNode;
}

function QuotaItem({ title, used, limit, resetTime, icon }: QuotaItemProps) {
  const remaining = limit - used;
  const percentage = (used / limit) * 100;
  const isLow = remaining <= limit * 0.2; // 剩余不足20%时显示警告

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <span className={`text-sm font-semibold ${isLow ? "text-orange-600" : "text-blue-600"}`}>
          {remaining} / {limit}
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {formatDistanceToNow(resetTime, {
            addSuffix: true,
            locale: zhCN,
          })}
          重置
        </span>
      </div>
    </div>
  );
}

export function QuotaDisplay() {
  const { data: quotaInfo, isLoading } = trpc.rateLimit.getInfo.useQuery(undefined, {
    refetchInterval: 60000, // 每分钟刷新一次
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用配额</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!quotaInfo) {
    return null;
  }

  const hourlyUsed = quotaInfo.conversionsHourly.limit - quotaInfo.conversionsHourly.remaining;
  const dailyUsed = quotaInfo.conversionsDaily.limit - quotaInfo.conversionsDaily.remaining;
  const batchHourlyUsed = quotaInfo.batchJobsHourly.limit - quotaInfo.batchJobsHourly.remaining;
  const batchDailyUsed = quotaInfo.batchJobsDaily.limit - quotaInfo.batchJobsDaily.remaining;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          使用配额
        </CardTitle>
        <CardDescription>您的转换次数使用情况</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">单文件转换</h4>
          <QuotaItem
            title="每小时限制"
            used={hourlyUsed}
            limit={quotaInfo.conversionsHourly.limit}
            resetTime={new Date(quotaInfo.conversionsHourly.resetAt)}
            icon={<Clock className="h-4 w-4 text-blue-600" />}
          />
          <QuotaItem
            title="每天限制"
            used={dailyUsed}
            limit={quotaInfo.conversionsDaily.limit}
            resetTime={new Date(quotaInfo.conversionsDaily.resetAt)}
            icon={<Clock className="h-4 w-4 text-blue-600" />}
          />
        </div>

        <div className="border-t pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground">批量转换</h4>
          <QuotaItem
            title="每小时限制"
            used={batchHourlyUsed}
            limit={quotaInfo.batchJobsHourly.limit}
            resetTime={new Date(quotaInfo.batchJobsHourly.resetAt)}
            icon={<Clock className="h-4 w-4 text-purple-600" />}
          />
          <QuotaItem
            title="每天限制"
            used={batchDailyUsed}
            limit={quotaInfo.batchJobsDaily.limit}
            resetTime={new Date(quotaInfo.batchJobsDaily.resetAt)}
            icon={<Clock className="h-4 w-4 text-purple-600" />}
          />
        </div>

        {(hourlyUsed >= quotaInfo.conversionsHourly.limit * 0.8 ||
          dailyUsed >= quotaInfo.conversionsDaily.limit * 0.8) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800">
            <p className="font-medium">配额即将用尽</p>
            <p className="text-xs mt-1">请等待配额重置后继续使用，或联系我们升级您的账户。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
