import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { FileText, Upload, Loader2, ArrowLeft, Download, X, CheckCircle, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

interface SelectedFile {
  file: File;
  id: string;
}

export default function Batch() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [inputFormat, setInputFormat] = useState("markdown");
  const [outputFormat, setOutputFormat] = useState("html");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { data: formats } = trpc.conversion.getSupportedFormats.useQuery();
  const createJobMutation = trpc.batch.createJob.useMutation();
  
  const { data: jobStatus, refetch: refetchJobStatus } = trpc.batch.getJobStatus.useQuery(
    { jobId: currentJobId! },
    { enabled: !!currentJobId, refetchInterval: 2000 }
  );

  useEffect(() => {
    if (jobStatus?.job.status === "completed" || jobStatus?.job.status === "failed") {
      setIsProcessing(false);
    }
  }, [jobStatus]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: SelectedFile[] = Array.from(files).map((file) => ({
      file,
      id: Math.random().toString(36).substring(7),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleStartBatch = useCallback(async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("请选择要转换的文件");
      return;
    }

    setIsProcessing(true);

    try {
      // Convert files to base64
      const filesData = await Promise.all(
        selectedFiles.map(async ({ file }) => {
          return new Promise<{ fileName: string; fileData: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64Data = e.target?.result as string;
              const base64Content = base64Data.split(",")[1];
              resolve({
                fileName: file.name,
                fileData: base64Content || "",
              });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      const result = await createJobMutation.mutateAsync({
        inputFormat,
        outputFormat,
        files: filesData,
      });

      setCurrentJobId(result.jobId);
      toast.success(`批量转换任务已创建，共 ${result.totalFiles} 个文件`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "批量转换失败");
      setIsProcessing(false);
    }
  }, [user, selectedFiles, inputFormat, outputFormat, createJobMutation]);

  const handleReset = useCallback(() => {
    setSelectedFiles([]);
    setCurrentJobId(null);
    setIsProcessing(false);
  }, []);

  if (authLoading) {
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

  const progress = jobStatus
    ? ((jobStatus.job.completedFiles + jobStatus.job.failedFiles) / jobStatus.job.totalFiles) * 100
    : 0;

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
              <h1 className="text-2xl font-bold text-foreground">批量转换</h1>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>选择转换格式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="batch-input-format">输入格式</Label>
                  <Select value={inputFormat} onValueChange={setInputFormat} disabled={isProcessing}>
                    <SelectTrigger id="batch-input-format">
                      <SelectValue placeholder="选择输入格式" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats?.inputFormats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-output-format">输出格式</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat} disabled={isProcessing}>
                    <SelectTrigger id="batch-output-format">
                      <SelectValue placeholder="选择输出格式" />
                    </SelectTrigger>
                    <SelectContent>
                      {formats?.outputFormats.map((format) => (
                        <SelectItem key={format} value={format}>
                          {format.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          {!currentJobId && (
            <Card>
              <CardHeader>
                <CardTitle>选择文件</CardTitle>
                <CardDescription>支持同时上传多个文件进行批量转换</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <h3 className="text-base font-semibold mb-2">拖拽文件到此处</h3>
                  <p className="text-sm text-muted-foreground mb-4">或点击下方按钮选择文件</p>
                  <input
                    type="file"
                    id="batch-file-upload"
                    className="hidden"
                    multiple
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <Button asChild variant="outline">
                    <label htmlFor="batch-file-upload" className="cursor-pointer">
                      选择文件
                    </label>
                  </Button>
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>已选择 {selectedFiles.length} 个文件</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles([])}
                      >
                        清空
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {selectedFiles.map(({ file, id }) => (
                        <div
                          key={id}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Start Button */}
                {selectedFiles.length > 0 && (
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleStartBatch}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>开始批量转换 ({selectedFiles.length} 个文件)</>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Progress Display */}
          {currentJobId && jobStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>转换进度</span>
                  <Badge
                    variant={
                      jobStatus.job.status === "completed"
                        ? "default"
                        : jobStatus.job.status === "failed"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {jobStatus.job.status === "processing" && "处理中"}
                    {jobStatus.job.status === "completed" && "已完成"}
                    {jobStatus.job.status === "failed" && "失败"}
                    {jobStatus.job.status === "pending" && "等待中"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      已完成 {jobStatus.job.completedFiles} / {jobStatus.job.totalFiles}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                  {jobStatus.job.failedFiles > 0 && (
                    <p className="text-sm text-destructive">
                      失败: {jobStatus.job.failedFiles} 个文件
                    </p>
                  )}
                </div>

                {/* File Status List */}
                <div className="max-h-80 overflow-y-auto space-y-2 border rounded-lg p-3">
                  {jobStatus.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{item.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === "completed" && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {item.status === "failed" && (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        {item.status === "processing" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.status === "pending" && "等待"}
                          {item.status === "processing" && "处理中"}
                          {item.status === "completed" && "完成"}
                          {item.status === "failed" && "失败"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Download Button */}
                {jobStatus.job.status === "completed" && jobStatus.job.zipFileUrl && (
                  <div className="flex gap-3">
                    <Button
                      size="lg"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={jobStatus.job.zipFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        下载所有文件 (ZIP)
                      </a>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleReset}
                    >
                      开始新的批量转换
                    </Button>
                  </div>
                )}

                {jobStatus.job.status === "failed" && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={handleReset}
                  >
                    重新开始
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
