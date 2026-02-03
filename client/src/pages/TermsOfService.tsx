import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
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
              <h1 className="text-2xl font-bold text-foreground">服务条款</h1>
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
              欢迎使用 Rewrite 在线文档格式转换服务（以下简称"服务"、"我们"或"我们的"）。这些服务条款（以下简称"条款"）构成您与 Rewrite 之间具有法律约束力的协议。通过访问或使用本服务，您同意受这些条款的约束。
            </p>

            <p className="font-semibold text-lg">如果您不同意这些条款，请不要使用本服务。</p>

            <hr className="my-8" />

            <h2>1. 接受条款</h2>

            <p>
              通过创建账户、访问或使用 Rewrite 服务的任何部分，您确认您已阅读、理解并同意受这些条款以及我们的隐私政策的约束。如果您代表组织或实体使用服务，您声明并保证您有权代表该组织或实体接受这些条款，并且该组织或实体同意受这些条款的约束。
            </p>

            <hr className="my-8" />

            <h2>2. 服务描述</h2>

            <p>
              Rewrite 是一个在线文档格式转换平台，利用 Pandoc 技术为用户提供多种文档格式之间的转换服务，包括但不限于 Markdown、HTML、Word（DOCX）、PDF、LaTeX、RTF、ODT、EPUB 等格式。服务包括单文件转换、批量文件转换、转换历史记录管理等功能。
            </p>

            <p>
              我们保留随时修改、暂停或终止服务的任何部分或全部的权利，无论是否通知。我们不对因服务修改、暂停或终止而造成的任何损失或不便承担责任。
            </p>

            <hr className="my-8" />

            <h2>3. 用户账户</h2>

            <h3>3.1 账户注册</h3>

            <p>
              要使用 Rewrite 的完整功能，您需要通过 Manus OAuth 创建账户。您同意提供准确、完整和最新的注册信息，并及时更新这些信息以保持其准确性和完整性。
            </p>

            <h3>3.2 账户安全</h3>

            <p>
              您负责维护账户凭证的机密性，并对在您账户下发生的所有活动负责。您同意在发现任何未经授权使用您账户的情况时立即通知我们。我们不对因您未能保护账户信息而造成的任何损失或损害承担责任。
            </p>

            <h3>3.3 账户终止</h3>

            <p>
              我们保留随时以任何理由暂停或终止您的账户的权利，包括但不限于违反这些条款、从事欺诈或非法活动、滥用服务或损害其他用户的权利。账户终止后，您将无法访问您的转换历史记录和存储的文件。
            </p>

            <hr className="my-8" />

            <h2>4. 可接受使用政策</h2>

            <p>您同意仅以合法和适当的方式使用服务。您不得：</p>

            <p>
              <strong>上传非法或有害内容</strong>：上传、转换或传输任何非法、有害、威胁、辱骂、骚扰、诽谤、粗俗、淫秽、侵犯他人隐私、仇恨或种族、民族或其他令人反感的内容。
            </p>

            <p>
              <strong>侵犯知识产权</strong>：上传或转换您无权使用的内容，包括受版权、商标、专利、商业秘密或其他专有权利保护的材料，除非您拥有必要的许可或授权。
            </p>

            <p>
              <strong>传播恶意软件</strong>：上传包含病毒、木马、蠕虫、逻辑炸弹或其他恶意或有害代码的文件。
            </p>

            <p>
              <strong>滥用服务</strong>：通过自动化手段（如机器人、脚本或爬虫）过度使用服务，进行拒绝服务攻击，或以任何方式干扰或破坏服务的正常运行。
            </p>

            <p>
              <strong>冒充他人</strong>：冒充任何个人或实体，或虚假陈述您与任何个人或实体的关系。
            </p>

            <p>
              <strong>商业滥用</strong>：未经我们明确书面同意，将服务用于商业目的或转售服务。
            </p>

            <p>
              <strong>规避限制</strong>：试图规避我们实施的任何技术限制、安全措施或使用限制。
            </p>

            <p>违反这些规则可能导致您的账户被暂停或终止，并可能承担法律责任。</p>

            <hr className="my-8" />

            <h2>5. 内容和知识产权</h2>

            <h3>5.1 您的内容</h3>

            <p>
              您保留对上传到服务的所有内容（包括文档、文本和其他材料）的所有权利、所有权和利益。通过上传内容，您授予我们有限的、非排他性的、全球性的、免版税的许可，以存储、处理和转换您的内容，仅用于向您提供服务。
            </p>

            <p>
              您声明并保证：(a) 您拥有或控制上传内容的所有必要权利；(b) 您的内容不侵犯或违反任何第三方的权利；(c) 您的内容符合这些条款和所有适用法律。
            </p>

            <h3>5.2 我们的知识产权</h3>

            <p>
              服务及其所有内容、功能和特性（包括但不限于信息、软件、文本、显示、图像、视频、音频、设计、选择和排列）均由 Rewrite、其许可方或其他内容提供商拥有，并受版权、商标、专利、商业秘密和其他知识产权或专有权利法律的保护。
            </p>

            <p>
              除非这些条款明确授权，否则您不得复制、修改、创建衍生作品、分发、出售、转让、公开展示、公开表演、传输或以其他方式利用服务的任何部分。
            </p>

            <h3>5.3 反馈</h3>

            <p>
              如果您向我们提供关于服务的任何反馈、建议或想法（统称"反馈"），您授予我们无限制的、永久的、不可撤销的、全球性的、免版税的权利和许可，以任何方式使用、复制、修改、改编、发布、翻译、创建衍生作品、分发和展示此类反馈。
            </p>

            <hr className="my-8" />

            <h2>6. 文件处理和数据保留</h2>

            <h3>6.1 文件处理</h3>

            <p>
              您上传的文件将被临时存储在我们的服务器上以完成转换任务。转换完成后，原始文件和转换后的输出文件将保留 <strong>7 天</strong>，之后将自动从我们的服务器中永久删除。您应在此期间下载您需要的转换结果。
            </p>

            <h3>6.2 数据保留</h3>

            <p>
              我们不对因文件自动删除、服务中断、技术故障或其他原因导致的数据丢失承担责任。您有责任备份您的重要文件和数据。
            </p>

            <h3>6.3 文件安全</h3>

            <p>
              虽然我们采取合理措施保护您的文件安全，但我们无法保证绝对的安全性。您应避免上传包含高度敏感或机密信息的文件。
            </p>

            <hr className="my-8" />

            <h2>7. 使用限制</h2>

            <p>为确保服务的公平使用和稳定性，我们实施以下使用限制：</p>

            <p>
              <strong>文件大小限制</strong>：单个文件最大 10 MB，文本转换最大 5 MB，批量转换所有文件总大小最大 50 MB。
            </p>

            <p>
              <strong>转换频率限制</strong>：每个用户每小时最多 50 次转换，每天最多 10 个批量转换任务。
            </p>

            <p>
              <strong>支持的格式</strong>：服务仅支持我们明确列出的文档格式。我们保留随时添加或删除支持格式的权利。
            </p>

            <p>
              我们保留根据系统负载和服务需求调整这些限制的权利。如果您需要更高的限制，请与我们联系讨论定制解决方案。
            </p>

            <hr className="my-8" />

            <h2>8. 免责声明</h2>

            <p>
              <strong>服务按"原样"和"可用"基础提供</strong>。在法律允许的最大范围内，我们明确否认所有明示或暗示的保证，包括但不限于对适销性、特定用途适用性、所有权和非侵权的暗示保证。
            </p>

            <p>我们不保证：</p>

            <ul>
              <li>服务将满足您的要求或可用于任何特定目的</li>
              <li>服务将不间断、及时、安全或无错误</li>
              <li>通过服务获得的结果将准确或可靠</li>
              <li>服务中的任何错误或缺陷将被纠正</li>
              <li>转换结果的质量将满足您的期望</li>
            </ul>

            <p>
              您使用服务的风险由您自行承担。我们不对转换结果的准确性、完整性或质量做任何保证。您应在依赖转换结果之前验证其准确性。
            </p>

            <hr className="my-8" />

            <h2>9. 责任限制</h2>

            <p>
              在法律允许的最大范围内，Rewrite 及其管理人员、董事、员工、代理人、许可方和服务提供商对因使用或无法使用服务而产生的任何直接、间接、偶然、特殊、后果性或惩罚性损害不承担责任，包括但不限于利润损失、数据丢失、业务中断或其他无形损失，即使我们已被告知此类损害的可能性。
            </p>

            <p>
              在任何情况下，我们对您承担的总责任不超过您在导致索赔的事件发生前 12 个月内向我们支付的金额，或如果您未向我们支付任何费用，则为 100 美元。
            </p>

            <p>
              某些司法管辖区不允许排除或限制某些保证或责任，因此上述限制可能不适用于您。在这种情况下，我们的责任将限制在适用法律允许的最大范围内。
            </p>

            <hr className="my-8" />

            <h2>10. 赔偿</h2>

            <p>
              您同意赔偿、辩护并使 Rewrite 及其管理人员、董事、员工、代理人、许可方和服务提供商免受因以下原因引起的任何索赔、责任、损害、损失、成本和费用（包括合理的律师费）的损害：
            </p>

            <ul>
              <li>您使用或滥用服务</li>
              <li>您违反这些条款</li>
              <li>您侵犯任何第三方的权利，包括但不限于知识产权、隐私权或其他专有权利</li>
              <li>您上传到服务的任何内容</li>
            </ul>

            <hr className="my-8" />

            <h2>11. 争议解决</h2>

            <h3>11.1 适用法律</h3>

            <p>
              这些条款应受中华人民共和国法律管辖并根据其解释，不考虑其法律冲突原则。如果您位于中国境外，您所在国家/地区的法律也可能适用。
            </p>

            <h3>11.2 争议解决</h3>

            <p>
              因这些条款或服务引起的任何争议应首先通过诚意协商解决。如果协商未能在 30 天内解决争议，任何一方可将争议提交至 Rewrite 所在地有管辖权的法院。
            </p>

            <h3>11.3 放弃集体诉讼</h3>

            <p>
              在法律允许的范围内，您同意仅以个人身份对我们提出索赔，而不作为任何集体诉讼、集体仲裁或代表诉讼的原告或集体成员。
            </p>

            <hr className="my-8" />

            <h2>12. 一般条款</h2>

            <h3>12.1 完整协议</h3>

            <p>
              这些条款以及我们的隐私政策构成您与 Rewrite 之间关于服务的完整协议,并取代所有先前或同期的口头或书面协议、理解或安排。
            </p>

            <h3>12.2 可分割性</h3>

            <p>
              如果这些条款的任何条款被认定为非法、无效或不可执行，该条款应在必要的最小范围内被修改或删除，而其余条款应继续完全有效。
            </p>

            <h3>12.3 弃权</h3>

            <p>
              我们未能行使或执行这些条款的任何权利或条款不构成对该权利或条款的弃权。
            </p>

            <h3>12.4 转让</h3>

            <p>
              您不得在未经我们事先书面同意的情况下转让或转移这些条款或您在服务下的任何权利或义务。我们可以自由转让这些条款和我们的权利和义务。
            </p>

            <h3>12.5 通知</h3>

            <p>
              我们可能通过电子邮件、服务内通知或在我们网站上发布通知的方式向您发送通知。您同意此类电子通知满足任何法律要求,即通知必须以书面形式提供。
            </p>

            <h3>12.6 条款的修改</h3>

            <p>
              我们保留随时修改这些条款的权利。我们会在本页面上发布更新后的条款,并更新"最后更新日期"。如果我们进行重大变更,我们会通过服务内通知或电子邮件通知您。您在条款变更后继续使用服务,即表示您接受更新后的条款。如果您不同意变更,请停止使用服务。
            </p>

            <hr className="my-8" />

            <h2>13. 联系我们</h2>

            <p>
              如果您对这些服务条款有任何疑问、意见或疑虑,请通过以下方式与我们联系：
            </p>

            <p>
              <strong>电子邮件</strong>：plxxf514@gmail.com
              <br />
              <strong>创始组织</strong>：邻里Neighbor
            </p>

            <hr className="my-8" />

            <p className="text-center font-semibold">
              感谢您使用 Rewrite。我们致力于为您提供优质、可靠的文档格式转换服务。
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-blue-50 to-white py-8 mt-12">
        <div className="container">
          <div className="border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 Rewrite. 由邻里Neighbor创建和维护。</p>
            <div className="flex gap-4">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                隐私政策
              </Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                服务条款
              </Link>
              <a href="mailto:plxxf514@gmail.com" className="hover:text-primary transition-colors">
                联系我们
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
