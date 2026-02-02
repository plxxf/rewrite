import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { FileText, Download, History, ArrowRight, Upload, Loader2, AlertCircle } from "lucide-react";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useAutoRetry } from "@/hooks/useAutoRetry";
import { Link } from "wouter";
import {
  FILE_SIZE_LIMITS,
  validateFileSize,
  validateFileType,
  formatFileSize,
} from "@shared/fileConfig";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputFormat, setInputFormat] = useState("markdown");
  const [outputFormat, setOutputFormat] = useState("html");
  const [isConverting, setIsConverting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [conversionError, setConversionError] = useState<Error | null>(null);
  
  const { execute: executeWithRetry, isRetrying, retryCount } = useAutoRetry({
    maxRetries: 3,
    retryDelay: 1000,
    onRetry: (attempt) => {
      toast.info(`正在重试... (${attempt}/3)`);
    },
    onMaxRetriesReached: () => {
      toast.error("已达到最大重试次数");
    },
  });

  const { data: formats } = trpc.conversion.getSupportedFormats.useQuery();
  const convertTextMutation = trpc.conversion.convertText.useMutation();
  const convertFileMutation = trpc.conversion.convertFile.useMutation();

  const handleConvert = useCallback(async () => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    if (!inputText.trim()) {
      toast.error("请输入要转换的内容");
      return;
    }

    // Validate text size
    const textSize = new Blob([inputText]).size;
    const sizeValidation = validateFileSize(textSize, FILE_SIZE_LIMITS.TEXT_CONVERSION_MAX);
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error);
      return;
    }

    setIsConverting(true);
    setOutputText("");
    setConversionError(null);

    try {
      const result = await executeWithRetry(async () => {
        return await convertTextMutation.mutateAsync({
          inputFormat,
          outputFormat,
          inputText,
          saveToHistory: true,
        });
      });

      setOutputText((result as any).outputText || "");
      toast.success("转换成功！");
    } catch (error) {
      const err = error instanceof Error ? error : new Error("转换失败");
      setConversionError(err);
      toast.error(err.message);
    } finally {
      setIsConverting(false);
    }
  }, [user, inputText, inputFormat, outputFormat, convertTextMutation, executeWithRetry]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    // Validate file size
    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      toast.error(sizeValidation.error);
      return;
    }

    // Validate file type
    const typeValidation = validateFileType(file.name, inputFormat);
    if (!typeValidation.valid) {
      toast.error(typeValidation.error);
      return;
    }

    setIsConverting(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        const base64Content = base64Data.split(",")[1];

        try {
          const result = await convertFileMutation.mutateAsync({
            inputFormat,
            outputFormat,
            fileData: base64Content || "",
            fileName: file.name,
          });

          toast.success("文件转换成功！");
          if (result.outputFileUrl) {
            window.open(result.outputFileUrl, "_blank");
          }
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "文件转换失败");
        } finally {
          setIsConverting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("文件读取失败");
      setIsConverting(false);
    }
  }, [user, inputFormat, outputFormat, convertFileMutation]);

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleDownload = useCallback(() => {
    if (!outputText) {
      toast.error("没有可下载的内容");
      return;
    }

    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `output.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [outputText, outputFormat]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Rewrite</h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  <Link href="/batch">
                    <Button variant="ghost" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      批量转换
                    </Button>
                  </Link>
                  <Link href="/history">
                    <Button variant="ghost" size="sm">
                      <History className="h-4 w-4 mr-2" />
                      历史记录
                    </Button>
                  </Link>
                </div>
                <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>登录</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        {!user ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">欢迎使用 Rewrite</CardTitle>
              <CardDescription className="text-lg mt-2">
                强大的在线文档格式转换工具，支持 Markdown、HTML、Word、PDF 等多种格式互转
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button size="lg" asChild>
                <a href={getLoginUrl()}>
                  登录开始使用
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Format Selection */}
            <Card>
              <CardHeader>
                <CardTitle>选择转换格式</CardTitle>
                <CardDescription className="flex items-start gap-2 mt-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    文件大小限制：单文件最大 {formatFileSize(FILE_SIZE_LIMITS.SINGLE_FILE_MAX)}，
                    文本转换最大 {formatFileSize(FILE_SIZE_LIMITS.TEXT_CONVERSION_MAX)}，
                    批量转换总大小最大 {formatFileSize(FILE_SIZE_LIMITS.BATCH_TOTAL_MAX)}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="input-format">输入格式</Label>
                    <Select value={inputFormat} onValueChange={setInputFormat}>
                      <SelectTrigger id="input-format">
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
                    <Label htmlFor="output-format">输出格式</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger id="output-format">
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

            {/* Conversion Area */}
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                <TabsTrigger value="text">文本转换</TabsTrigger>
                <TabsTrigger value="file">文件转换</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>输入内容</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="在此输入或粘贴要转换的内容..."
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </CardContent>
                  </Card>

                  {conversionError && (
                    <ErrorMessage
                      error={conversionError}
                      onRetry={handleConvert}
                      className="mb-4"
                    />
                  )}
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>输出结果</span>
                        {outputText && (
                          <Button size="sm" variant="outline" onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            下载
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={outputText}
                        readOnly
                        placeholder="转换结果将显示在这里..."
                        className="min-h-[400px] font-mono text-sm bg-muted"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center">
                  <Button
                    size="lg"
                    onClick={handleConvert}
                    disabled={isConverting || !inputText.trim()}
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isRetrying ? `重试中 (${retryCount}/3)...` : "转换中..."}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        开始转换
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="file">
                <Card>
                  <CardContent className="pt-6">
                    <div
                      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">拖拽文件到此处</h3>
                      <p className="text-muted-foreground mb-4">或点击下方按钮选择文件</p>
                      <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                      <Button
                        asChild
                        variant="outline"
                        disabled={isConverting}
                      >
                        <label htmlFor="file-upload" className="cursor-pointer">
                          {isConverting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              转换中...
                            </>
                          ) : (
                            "选择文件"
                          )}
                        </label>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Rewrite. 保留所有权利。</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/privacy" className="hover:text-primary">
              隐私政策
            </Link>
            <Link href="/terms" className="hover:text-primary">
              服务条款
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
