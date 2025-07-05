
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PageWrapper } from '@/components/PageWrapper';
import { Lock, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <PageWrapper className="py-12">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader className="text-center border-b pb-6">
          <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl font-headline text-foreground">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            We collect information you provide directly to us, such as when you create an account, 
            upload content, or communicate with us. This may include your name, email address, 
            payment information, and any content you create or share.
          </p>
          <p>
            We also collect information automatically when you use the Platform, such as your IP address, 
            browser type, and usage data. (Placeholder - More details on data collection).
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>
            We use your information to operate and improve the Platform, personalize your experience, 
            process transactions, communicate with you, and for security and fraud prevention. 
            (Placeholder - More details on information use).
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. How We Share Your Information</h2>
          <p>
            We may share your information with service providers who assist us in operating the Platform, 
            with other users if you choose to share content publicly or collaborate, or if required by law. 
            We do not sell your personal information. (Placeholder - More details on information sharing).
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. Your Choices and Rights</h2>
          <p>
            You may have certain rights regarding your personal information, such as the right to access, 
            correct, or delete your data. You can manage your account settings and communication 
            preferences. (Placeholder - More details on user rights).
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
          <p>
            We take reasonable measures to protect your information from unauthorized access or disclosure. 
            However, no security system is impenetrable. (Placeholder - More details on security measures).
          </p>
          
          <h2 className="text-xl font-semibold text-foreground">6. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant 
            changes.
          </p>

          <p className="pt-4 text-sm">
            <em>This is a placeholder Privacy Policy document. In a real application, this would be 
            a comprehensive legal document drafted by a legal professional, compliant with relevant 
            privacy laws like GDPR, CCPA, etc.</em>
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
