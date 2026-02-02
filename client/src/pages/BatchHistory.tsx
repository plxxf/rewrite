import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { FileText, Download, ArrowLeft, Loader2, ChevronDown, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useState } from "react";

export default function BatchHistory() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());

  const { data: batchJobs, isLoading } = trpc.batch.getUserJobs.useQuery(undefined, {
    enabled: !!user,
  });

  const toggleExpanded = (jobId: number) => {
    setExpandedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
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
              <h1 className="text-2xl font-bold text-foreground">批量转换历史</h1>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>我的批量转换记录</CardTitle>
            <CardDescription>
              查看和管理您的批量文档转换历史记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!batchJobs || batchJobs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">暂无批量转换记录</p>
                <Button asChild>
                  <Link href="/batch">开始批量转换</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {batchJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden">
                    <Collapsible
                      open={expandedJobs.has(job.id)}
                      onOpenChange={() => toggleExpanded(job.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="p-0 h-auto">
                                {expandedJobs.has(job.id) ? (
                                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                              </Button>
                            </CollapsibleTrigger>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-base truncate">
                                  {job.name || `批量转换 #${job.id}`}
                                </h3>
                                <Badge
                                  variant={
                                    job.status === "completed"
                                      ? "default"
                                      : job.status === "failed"
                                      ? "destructive"
                                      : "secondary"
                                  }
                                  className="flex-shrink-0"
                                >
                                  {job.status === "processing" && (
                                    <>
                                      <Clock className="h-3 w-3 mr-1" />
                                      处理中
                                    </>
                                  )}
                                  {job.status === "completed" && (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      已完成
                                    </>
                                  )}
                                  {job.status === "failed" && (
                                    <>
                                      <XCircle className="h-3 w-3 mr-1" />
                                      失败
                                    </>
                                  )}
                                  {job.status === "pending" && "等待中"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                                <span>
                                  {format(new Date(job.createdAt), "yyyy-MM-dd HH:mm", {
                                    locale: zhCN,
                                  })}
                                </span>
                                <span>
                                  {job.inputFormat.toUpperCase()} → {job.outputFormat.toUpperCase()}
                                </span>
                                <span>共 {job.totalFiles} 个文件</span>
                                <span className="text-green-600">
                                  成功 {job.completedFiles}
                                </span>
                                {job.failedFiles > 0 && (
                                  <span className="text-destructive">
                                    失败 {job.failedFiles}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {job.status === "completed" && job.zipFileUrl && (
                            <Button
                              size="sm"
                              asChild
                              className="ml-4 flex-shrink-0"
                            >
                              <a
                                href={job.zipFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                下载 ZIP
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      <CollapsibleContent>
                        <div className="border-t border-border px-4 pb-4 pt-2">
                          <BatchJobDetails jobId={job.id} />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function BatchJobDetails({ jobId }: { jobId: number }) {
  const { data: jobStatus, isLoading } = trpc.batch.getJobStatus.useQuery({ jobId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!jobStatus || !jobStatus.items || jobStatus.items.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        暂无文件详情
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>文件名</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>更新时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobStatus.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.fileName}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {item.status === "completed" && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">完成</span>
                    </>
                  )}
                  {item.status === "failed" && (
                    <>
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">失败</span>
                    </>
                  )}
                  {item.status === "processing" && (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span>处理中</span>
                    </>
                  )}
                  {item.status === "pending" && (
                    <>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">等待</span>
                    </>
                  )}
                </div>
                {item.errorMessage && (
                  <p className="text-xs text-destructive mt-1">{item.errorMessage}</p>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(item.updatedAt), "yyyy-MM-dd HH:mm:ss", {
                  locale: zhCN,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
