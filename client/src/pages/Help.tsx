import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, FileText, Zap, Shield, HelpCircle, Mail } from "lucide-react";
import { FILE_SIZE_LIMITS, formatFileSize } from "@shared/fileConfig";
import { RATE_LIMITS } from "@shared/rateLimitConfig";

export default function Help() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h1 className="text-xl font-bold">帮助中心</h1>
            </div>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">欢迎来到 Rewrite 帮助中心</CardTitle>
              <CardDescription className="text-base">
                在这里您可以找到关于 Rewrite 文档格式转换工具的所有信息，包括支持的格式、使用限制和常见问题解答。
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle>支持的格式</CardTitle>
              </div>
              <CardDescription>Rewrite 支持以下文档格式之间的互相转换</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { name: "Markdown", ext: ".md", desc: "轻量级标记语言" },
                  { name: "HTML", ext: ".html", desc: "网页格式" },
                  { name: "Word", ext: ".docx", desc: "Microsoft Word" },
                  { name: "PDF", ext: ".pdf", desc: "便携式文档" },
                  { name: "LaTeX", ext: ".tex", desc: "学术排版" },
                  { name: "reStructuredText", ext: ".rst", desc: "Python 文档" },
                  { name: "Textile", ext: ".textile", desc: "轻量标记" },
                  { name: "Org-mode", ext: ".org", desc: "Emacs 文档" },
                  { name: "MediaWiki", ext: ".wiki", desc: "维基格式" },
                  { name: "EPUB", ext: ".epub", desc: "电子书" },
                  { name: "ODT", ext: ".odt", desc: "开放文档" },
                  { name: "RTF", ext: ".rtf", desc: "富文本格式" },
                  { name: "Plain Text", ext: ".txt", desc: "纯文本" },
                  { name: "Jupyter", ext: ".ipynb", desc: "笔记本" },
                  { name: "PowerPoint", ext: ".pptx", desc: "演示文稿" },
                ].map((format) => (
                  <div
                    key={format.name}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-white hover:bg-blue-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{format.name}</div>
                      <div className="text-xs text-muted-foreground">{format.ext}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium text-blue-900">✅ 格式兼容性说明</p>
                <ul className="mt-2 space-y-1 text-blue-800">
                  <li>• 大部分格式之间可以互相转换（经过系统测试，成功率 96%+）</li>
                  <li>• PDF 转换已优化：使用 WeasyPrint 引擎，支持中文和复杂排版</li>
                  <li>• 已移除不兼容的格式：AsciiDoc 和 JSON（Pandoc 不支持）</li>
                  <li>• 推荐转换路径：复杂格式 → Markdown → 目标格式，获得最佳兼容性</li>
                  <li>• 所有转换均支持中文，不会出现乱码</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <CardTitle>使用限制</CardTitle>
              </div>
              <CardDescription>了解文件大小和转换次数的限制</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">文件大小限制</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>单文件最大</span>
                    <span className="font-medium">{formatFileSize(FILE_SIZE_LIMITS.SINGLE_FILE_MAX)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>文本转换最大</span>
                    <span className="font-medium">{formatFileSize(FILE_SIZE_LIMITS.TEXT_CONVERSION_MAX)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>批量转换总大小最大</span>
                    <span className="font-medium">{formatFileSize(FILE_SIZE_LIMITS.BATCH_TOTAL_MAX)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">转换次数限制</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>单文件转换 - 每小时</span>
                    <span className="font-medium">{RATE_LIMITS.CONVERSIONS_PER_HOUR} 次</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>单文件转换 - 每天</span>
                    <span className="font-medium">{RATE_LIMITS.CONVERSIONS_PER_DAY} 次</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>批量转换 - 每小时</span>
                    <span className="font-medium">{RATE_LIMITS.BATCH_JOBS_PER_HOUR} 次</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span>批量转换 - 每天</span>
                    <span className="font-medium">{RATE_LIMITS.BATCH_JOBS_PER_DAY} 次</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                <p className="font-medium">配额重置说明</p>
                <p className="mt-1">
                  小时配额在每个整点重置，每天配额在每天午夜（00:00）重置。您可以在首页右侧查看实时配额使用情况。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <CardTitle>常见问题</CardTitle>
              </div>
              <CardDescription>最常被问到的问题和解答</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>如何使用 Rewrite 进行文档转换？</AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2">
                    <p>使用 Rewrite 非常简单：</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>首先登录您的账户</li>
                      <li>选择输入格式和输出格式</li>
                      <li>输入文本或上传文件</li>
                      <li>点击"转换"按钮</li>
                      <li>查看转换结果并下载</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>转换后的文件保存多久？</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <p>
                      为了保护您的隐私和节省存储空间，所有转换文件和历史记录会在 <strong>7 天后自动删除</strong>。
                      建议您及时下载需要保存的文件。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>为什么转换失败了？</AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2">
                    <p>转换失败可能有以下几个原因：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>文件大小超过限制（单文件最大 10MB）</li>
                      <li>文件格式不受支持或文件损坏</li>
                      <li>已达到每小时或每天的转换次数限制</li>
                      <li>网络连接不稳定</li>
                    </ul>
                    <p className="mt-2">
                      如果问题持续存在，请联系我们的技术支持团队。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>批量转换如何使用？</AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2">
                    <p>批量转换功能让您可以一次处理多个文件：</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>点击顶部导航的"批量转换"按钮</li>
                      <li>选择输入和输出格式</li>
                      <li>拖拽或选择多个文件（最多 50MB）</li>
                      <li>点击"开始批量转换"</li>
                      <li>等待所有文件转换完成</li>
                      <li>下载打包的 ZIP 文件</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>我的文件安全吗？</AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2">
                    <p>我们非常重视您的数据安全：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>所有文件传输使用 HTTPS 加密</li>
                      <li>文件存储在安全的云存储中</li>
                      <li>只有您可以访问自己的转换记录</li>
                      <li>文件会在 7 天后自动删除</li>
                      <li>我们不会将您的文件用于任何其他目的</li>
                    </ul>
                    <p className="mt-2">
                      详细信息请查看我们的<Link href="/privacy-policy" className="text-blue-600 hover:underline">隐私政策</Link>。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>如何查看我的使用配额？</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <p>
                      登录后，您可以在首页右侧的"使用配额"卡片中查看实时的配额使用情况，包括剩余次数和重置时间。
                      配额信息每分钟自动刷新。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger>支持哪些浏览器？</AccordionTrigger>
                  <AccordionContent className="text-sm">
                    <p>
                      Rewrite 支持所有现代浏览器，包括 Chrome、Firefox、Safari、Edge 的最新版本。
                      为了获得最佳体验，建议使用最新版本的浏览器。
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger>转换质量如何保证？</AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2">
                    <p>
                      Rewrite 使用业界领先的 <strong>Pandoc</strong> 转换引擎，这是一个经过广泛测试和验证的开源工具。
                      不过，不同格式之间的转换可能会有一些限制：
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>复杂的 PDF 文档可能无法完美转换</li>
                      <li>某些特殊格式或样式可能会丢失</li>
                      <li>建议在转换后检查输出结果</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <CardTitle>联系我们</CardTitle>
              </div>
              <CardDescription>如果您有其他问题或需要帮助</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  如果您在使用过程中遇到任何问题，或者有任何建议和反馈，欢迎通过以下方式联系我们：
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild variant="default">
                    <a href="https://help.manus.im" target="_blank" rel="noopener noreferrer">
                      <Mail className="mr-2 h-4 w-4" />
                      提交反馈
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/privacy-policy">
                      <Shield className="mr-2 h-4 w-4" />
                      隐私政策
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/terms-of-service">
                      <FileText className="mr-2 h-4 w-4" />
                      服务条款
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Rewrite. 由邻里Neighbor创建和维护。</p>
          <div className="flex justify-center gap-4 mt-2">
            <a href="mailto:plxxf514@gmail.com" className="hover:text-primary">
              联系我们
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
