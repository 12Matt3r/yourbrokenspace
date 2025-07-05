
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PageWrapper } from '@/components/PageWrapper';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <PageWrapper className="py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <ShieldAlert className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline text-foreground">Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using YourSpace ("the Platform"), you agree to be bound by these Terms of 
            Service ("Terms"). If you do not agree to all of these Terms, do not use the Platform.
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">2. User Conduct</h2>
          <p>
            You are responsible for all content you post and activities you conduct on the Platform. 
            You agree not to engage in any unlawful, harmful, or disruptive behavior.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. Intellectual Property</h2>
          <p>
            You retain ownership of the content you create and post on YourSpace. By posting content, 
            you grant YourSpace a license to display and distribute it on the Platform.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Monetization</h2>
          <p>
            Any monetization features are subject to additional terms and transaction fees, which will 
            be clearly disclosed. YourSpace is not responsible for tax obligations related to your earnings.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Disclaimers</h2>
          <p>
            The Platform is provided "as is" without warranties of any kind. YourSpace does not guarantee 
            uninterrupted or error-free service. (Placeholder - More detailed disclaimers would go here).
          </p>

          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p>
            YourSpace shall not be liable for any indirect, incidental, special, consequential, or punitive 
            damages. (Placeholder - More detailed limitations would go here).
          </p>

          <h2 className="text-xl font-semibold text-foreground">7. Modification of Terms</h2>
          <p>
            YourSpace reserves the right to modify these Terms at any time. We will notify users of 
            significant changes. Continued use of the Platform after changes constitutes acceptance.
          </p>

          <p className="pt-4 text-sm">
            <em>This is a placeholder Terms of Service document. In a real application, this would be 
            a comprehensive legal document drafted by a legal professional.</em>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center pt-6 border-t">
          <Link href="/">
            <Button variant="outline" size="lg" className="text-base">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </PageWrapper>
  );
}
