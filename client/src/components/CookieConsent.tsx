import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

const COOKIE_CONSENT_KEY = "rewrite-cookie-consent";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show consent banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
      <Card className="max-w-4xl mx-auto shadow-lg border-2">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-shrink-0">
              <Cookie className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Cookie 使用通知</h3>
              <p className="text-sm text-muted-foreground">
                我们使用 Cookie 来维护您的登录状态、记住您的偏好设置，并分析服务使用情况以改善用户体验。继续使用本服务即表示您同意我们使用 Cookie。
                了解更多信息，请查看我们的{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  隐私政策
                </Link>
                。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button onClick={handleDecline} variant="outline" className="w-full sm:w-auto">
                拒绝
              </Button>
              <Button onClick={handleAccept} className="w-full sm:w-auto">
                接受
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
