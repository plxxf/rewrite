import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { FileText, Download, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: conversions, isLoading } = trpc.conversion.getHistory.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteMutation = trpc.conversion.delete.useMutation({
    onSuccess: () => {
      toast.success("删除成功");
      utils.conversion.getHistory.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "删除失败");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("确定要删除这条转换记录吗？")) {
      deleteMutation.mutate({ id });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">转换历史</h1>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>我的转换记录</CardTitle>
            <CardDescription>
              查看和管理您的文档转换历史记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!conversions || conversions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">暂无转换记录</p>
                <Button asChild>
                  <Link href="/">开始转换</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>时间</TableHead>
                      <TableHead>输入格式</TableHead>
                      <TableHead>输出格式</TableHead>
                      <TableHead>文件名</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversions.map((conversion) => (
                      <TableRow key={conversion.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(conversion.createdAt), "yyyy-MM-dd HH:mm", {
                            locale: zhCN,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{conversion.inputFormat.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{conversion.outputFormat.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          {conversion.inputFileName || conversion.outputFileName || "-"}
                        </TableCell>
                        <TableCell>
                          {conversion.status === "completed" && (
                            <Badge variant="default" className="bg-green-500">完成</Badge>
                          )}
                          {conversion.status === "pending" && (
                            <Badge variant="secondary">处理中</Badge>
                          )}
                          {conversion.status === "failed" && (
                            <Badge variant="destructive">失败</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {conversion.outputFileUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                asChild
                              >
                                <a
                                  href={conversion.outputFileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(conversion.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
