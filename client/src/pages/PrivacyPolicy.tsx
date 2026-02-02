import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">隐私政策</h1>
            </div>
          </div>
          {user && (
            <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 flex-1">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="prose prose-blue max-w-none p-8">
            <p className="text-sm text-muted-foreground mb-6">
              <strong>最后更新日期：2026 年 2 月 2 日</strong>
            </p>

            <p>
              欢迎使用 Rewrite（以下简称"我们"、"我们的"或"本服务"）。我们重视您的隐私，并致力于保护您的个人信息。本隐私政策说明了我们如何收集、使用、存储和保护您在使用 Rewrite 在线文档格式转换服务时提供的信息。
            </p>

            <p>
              通过访问或使用本服务，您同意本隐私政策中描述的做法。如果您不同意本政策，请不要使用本服务。
            </p>

            <hr className="my-8" />

            <h2>1. 我们收集的信息</h2>

            <h3>1.1 您主动提供的信息</h3>

            <p>当您使用 Rewrite 服务时，我们可能会收集以下信息：</p>

            <p>
              <strong>账户信息</strong>：当您通过 Manus OAuth 登录时，我们会收集您的用户名、电子邮件地址、登录方式和唯一标识符（OpenID）。这些信息用于创建和管理您的账户。
            </p>

            <p>
              <strong>上传的文件和内容</strong>：您上传用于格式转换的文档和文本内容。这些文件会临时存储在我们的服务器上以完成转换任务，并在转换完成后根据我们的数据保留政策进行处理。
            </p>

            <p>
              <strong>转换历史记录</strong>：我们会记录您的转换历史，包括输入格式、输出格式、转换时间和转换状态，以便您查看和管理过往的转换任务。
            </p>

            <h3>1.2 自动收集的信息</h3>

            <p>当您访问和使用本服务时，我们会自动收集以下技术信息：</p>

            <p>
              <strong>使用数据</strong>：包括您访问的页面、使用的功能、操作时间戳、转换次数等使用统计信息。
            </p>

            <p>
              <strong>设备和浏览器信息</strong>：包括您的 IP 地址、浏览器类型和版本、操作系统、设备类型、屏幕分辨率等技术信息。
            </p>

            <p>
              <strong>Cookie 和类似技术</strong>：我们使用 Cookie 和类似的跟踪技术来维护您的登录状态、记住您的偏好设置，并分析服务使用情况。详见第 5 节"Cookie 和跟踪技术"。
            </p>

            <hr className="my-8" />

            <h2>2. 我们如何使用您的信息</h2>

            <p>我们收集和使用您的信息用于以下目的：</p>

            <p>
              <strong>提供和改进服务</strong>：处理您的文档转换请求，维护您的账户，提供转换历史记录功能，并根据使用反馈改进服务质量和用户体验。
            </p>

            <p>
              <strong>身份验证和安全</strong>：验证您的身份，保护您的账户安全，防止欺诈和滥用行为，确保服务的安全性和完整性。
            </p>

            <p>
              <strong>通信</strong>：向您发送服务相关的通知，如转换完成提醒、系统维护通知、重要政策更新等。我们不会向您发送营销邮件，除非您明确同意。
            </p>

            <p>
              <strong>分析和优化</strong>：分析服务使用模式，了解用户需求，优化功能设计，提升系统性能和稳定性。
            </p>

            <p>
              <strong>法律合规</strong>：遵守适用的法律法规要求，响应法律程序，保护我们的权利和财产。
            </p>

            <hr className="my-8" />

            <h2>3. 信息共享和披露</h2>

            <p>我们不会出售、出租或交易您的个人信息。我们仅在以下情况下共享您的信息：</p>

            <p>
              <strong>服务提供商</strong>：我们可能与第三方服务提供商共享必要信息，以支持服务运营，包括云存储服务（Amazon S3）、身份验证服务（Manus OAuth）和分析服务。这些服务提供商仅被授权在提供服务所需的范围内使用您的信息，并有义务保护您的信息安全。
            </p>

            <p>
              <strong>法律要求</strong>：当我们有充分理由相信披露信息是遵守法律、法规、法律程序或政府要求所必需时，或为保护我们的权利、财产或安全，或保护用户或公众的权利、财产或安全时，我们可能会披露您的信息。
            </p>

            <p>
              <strong>业务转让</strong>：如果我们参与合并、收购、资产出售或破产程序，您的信息可能会作为业务资产的一部分被转让。在此类情况下，我们会通知您，并确保您的信息继续受到本隐私政策或类似保护措施的约束。
            </p>

            <p>
              <strong>征得同意</strong>：在其他情况下，我们会在共享您的信息之前征得您的明确同意。
            </p>

            <hr className="my-8" />

            <h2>4. 数据存储和安全</h2>

            <h3>4.1 数据存储</h3>

            <p>
              您上传的文件和转换结果存储在 Amazon S3 云存储服务中。转换历史记录和账户信息存储在安全的数据库中。我们采取合理的技术和组织措施来保护您的数据免受未经授权的访问、使用、披露、修改或破坏。
            </p>

            <h3>4.2 数据保留</h3>

            <p>
              <strong>转换文件</strong>：您上传的原始文件和转换后的输出文件会在转换完成后保留 <strong>7 天</strong>，之后将自动从我们的服务器中删除。您可以在此期间随时下载转换结果。
            </p>

            <p>
              <strong>转换历史记录</strong>：您的转换历史记录（包括转换参数和元数据，但不包括文件内容）会保留在您的账户中，直到您主动删除或关闭账户。
            </p>

            <p>
              <strong>账户信息</strong>：您的账户信息会在您的账户处于活跃状态期间保留。如果您选择关闭账户，我们会在合理期限内删除或匿名化您的个人信息，除非法律要求我们保留。
            </p>

            <h3>4.3 安全措施</h3>

            <p>我们采用行业标准的安全措施来保护您的信息，包括：</p>

            <ul>
              <li>使用 HTTPS 加密传输数据</li>
              <li>对存储的敏感数据进行加密</li>
              <li>实施访问控制和身份验证机制</li>
              <li>定期进行安全审计和漏洞扫描</li>
              <li>限制员工和承包商对个人信息的访问</li>
            </ul>

            <p>
              尽管我们采取了合理的安全措施，但请注意，没有任何数据传输或存储方法是 100% 安全的。我们无法保证绝对的安全性。
            </p>

            <hr className="my-8" />

            <h2>5. Cookie 和跟踪技术</h2>

            <p>
              我们使用 Cookie 和类似的跟踪技术来提供和改进服务。Cookie 是存储在您设备上的小型文本文件，用于识别您的浏览器并记住某些信息。
            </p>

            <h3>5.1 我们使用的 Cookie 类型</h3>

            <p>
              <strong>必要 Cookie</strong>：这些 Cookie 对于服务的基本功能是必需的，例如维护您的登录状态和会话管理。没有这些 Cookie，服务将无法正常运行。
            </p>

            <p>
              <strong>功能 Cookie</strong>：这些 Cookie 用于记住您的偏好设置和选择，以提供更个性化的体验。
            </p>

            <p>
              <strong>分析 Cookie</strong>：这些 Cookie 帮助我们了解用户如何与服务互动，以便我们改进功能和用户体验。我们可能使用第三方分析工具（如 Google Analytics）来收集此类信息。
            </p>

            <h3>5.2 管理 Cookie</h3>

            <p>
              您可以通过浏览器设置来管理或删除 Cookie。大多数浏览器允许您拒绝接受 Cookie 或在收到 Cookie 时收到通知。但是，如果您禁用必要 Cookie，服务的某些功能可能无法正常工作。
            </p>

            <p>有关如何管理 Cookie 的更多信息，请参阅您浏览器的帮助文档。</p>

            <hr className="my-8" />

            <h2>6. 您的权利和选择</h2>

            <p>
              根据适用的数据保护法律（包括欧盟《通用数据保护条例》（GDPR）和《加州消费者隐私法案》（CCPA）），您可能享有以下权利：
            </p>

            <p>
              <strong>访问权</strong>：您有权请求访问我们持有的关于您的个人信息。
            </p>

            <p>
              <strong>更正权</strong>：您有权请求更正不准确或不完整的个人信息。
            </p>

            <p>
              <strong>删除权</strong>：您有权请求删除您的个人信息（"被遗忘权"），但某些法律义务可能要求我们保留某些信息。
            </p>

            <p>
              <strong>限制处理权</strong>：在某些情况下，您有权请求限制我们处理您的个人信息。
            </p>

            <p>
              <strong>数据可携权</strong>：您有权以结构化、常用和机器可读的格式接收您提供给我们的个人信息，并有权将这些信息传输给另一个控制者。
            </p>

            <p>
              <strong>反对权</strong>：您有权反对我们出于特定目的处理您的个人信息，包括直接营销。
            </p>

            <p>
              <strong>撤回同意权</strong>：如果我们基于您的同意处理您的个人信息，您有权随时撤回同意，但这不会影响撤回前基于同意的处理的合法性。
            </p>

            <p>
              要行使这些权利，请通过本政策末尾提供的联系方式与我们联系。我们会在合理期限内响应您的请求，通常在 30 天内。
            </p>

            <hr className="my-8" />

            <h2>7. 儿童隐私</h2>

            <p>
              Rewrite 服务不面向 13 岁以下的儿童。我们不会有意收集 13 岁以下儿童的个人信息。如果我们发现在未经父母同意的情况下收集了 13 岁以下儿童的个人信息，我们会采取措施尽快删除该信息。如果您认为我们可能持有 13 岁以下儿童的信息,请通过本政策末尾提供的联系方式与我们联系。
            </p>

            <hr className="my-8" />

            <h2>8. 国际数据传输</h2>

            <p>
              您的信息可能会被传输到并存储在您所在国家/地区以外的服务器上，这些地区的数据保护法律可能与您所在地区的法律不同。通过使用本服务，您同意将您的信息传输到这些地区。我们会采取适当措施确保您的信息在传输和存储过程中得到充分保护，符合本隐私政策和适用法律的要求。
            </p>

            <hr className="my-8" />

            <h2>9. 第三方链接和服务</h2>

            <p>
              本服务可能包含指向第三方网站或服务的链接。我们不对这些第三方的隐私做法或内容负责。我们建议您在向任何第三方网站或服务提供个人信息之前，仔细阅读其隐私政策。
            </p>

            <hr className="my-8" />

            <h2>10. 隐私政策的变更</h2>

            <p>
              我们可能会不时更新本隐私政策，以反映我们做法的变化、法律要求的变化或其他运营、法律或监管原因。我们会在本页面上发布更新后的隐私政策，并更新"最后更新日期"。如果我们进行重大变更，我们会通过服务内通知或电子邮件通知您。我们建议您定期查看本隐私政策以了解最新信息。
            </p>

            <p>
              您在隐私政策变更后继续使用服务，即表示您接受更新后的政策。如果您不同意变更，请停止使用服务。
            </p>

            <hr className="my-8" />

            <h2>11. 联系我们</h2>

            <p>
              如果您对本隐私政策有任何疑问、意见或请求，或希望行使您的数据保护权利，请通过以下方式与我们联系：
            </p>

            <p>
              <strong>电子邮件</strong>：privacy@rewrite.example.com
              <br />
              <strong>网站</strong>：https://rewrite.example.com
            </p>

            <p>我们会尽力在合理期限内回复您的询问和请求。</p>

            <hr className="my-8" />

            <p className="text-center font-semibold">
              感谢您信任 Rewrite。我们致力于保护您的隐私并提供安全、可靠的服务。
            </p>
          </CardContent>
        </Card>
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
