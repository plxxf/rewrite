import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { User, BarChart3, Settings as SettingsIcon, FileText, HelpCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

export default function Settings() {
  const { user, loading } = useAuth();
  const { data: stats, isLoading: statsLoading } = trpc.user.getStats.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: favoriteFormats } = trpc.user.getFavoriteFormats.useQuery(undefined, {
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请先登录以查看您的设置和统计信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>登录</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 准备图表数据
  const activityData = stats?.recentActivity.map((item) => ({
    date: new Date(item.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
    count: item.count,
  })) || [];

  const formatData = stats?.formatStats.map((item, index) => ({
    name: `${item.inputFormat} → ${item.outputFormat}`,
    value: item.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">用户设置</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help">
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                帮助
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              账户
            </TabsTrigger>
            <TabsTrigger value="stats">
              <BarChart3 className="h-4 w-4 mr-2" />
              统计
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <FileText className="h-4 w-4 mr-2" />
              偏好
            </TabsTrigger>
          </TabsList>

          {/* 账户信息 */}
          <TabsContent value="account" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>账户信息</CardTitle>
                <CardDescription>查看您的账户详细信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">用户名</p>
                    <p className="text-base font-semibold">{user.name || "未设置"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">邮箱</p>
                    <p className="text-base font-semibold">{user.email || "未设置"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">登录方式</p>
                    <p className="text-base font-semibold">{user.loginMethod || "未知"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">注册时间</p>
                    <p className="text-base font-semibold">
                      {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">最后登录</p>
                    <p className="text-base font-semibold">
                      {new Date(user.lastSignedIn).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">账户角色</p>
                    <p className="text-base font-semibold">
                      {user.role === "admin" ? "管理员" : "普通用户"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 使用统计 */}
          <TabsContent value="stats" className="space-y-4 mt-6">
            {statsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">加载统计数据...</p>
              </div>
            ) : (
              <>
                {/* 总览卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>总转换次数</CardTitle>
                      <CardDescription>单文件转换总计</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-primary">{stats?.totalConversions || 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>批量任务数</CardTitle>
                      <CardDescription>批量转换任务总计</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold text-primary">{stats?.totalBatchJobs || 0}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* 最近7天活动趋势 */}
                <Card>
                  <CardHeader>
                    <CardTitle>最近7天转换趋势</CardTitle>
                    <CardDescription>每日转换次数统计</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {activityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#3b82f6" name="转换次数" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">暂无最近7天的转换记录</p>
                    )}
                  </CardContent>
                </Card>

                {/* 格式使用统计 */}
                <Card>
                  <CardHeader>
                    <CardTitle>格式使用分布</CardTitle>
                    <CardDescription>最常用的格式转换组合（前10）</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formatData.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={formatData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => `${entry.name}: ${entry.value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {formatData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2">
                          {formatData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold">{item.value} 次</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-12">暂无格式使用统计</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* 偏好设置 */}
          <TabsContent value="preferences" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>默认格式设置</CardTitle>
                <CardDescription>根据您的使用习惯，我们为您推荐以下默认格式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {favoriteFormats ? (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">您最常使用的格式组合：</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">输入格式</p>
                        <p className="text-lg font-semibold">{favoriteFormats.inputFormat.toUpperCase()}</p>
                      </div>
                      <div className="text-2xl text-muted-foreground">→</div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">输出格式</p>
                        <p className="text-lg font-semibold">{favoriteFormats.outputFormat.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    暂无使用记录，开始使用后系统将自动推荐默认格式
                  </p>
                )}
                <Separator />
                <div className="text-sm text-muted-foreground">
                  <p>💡 提示：系统会根据您的使用习惯自动调整推荐格式</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
