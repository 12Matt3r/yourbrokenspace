
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex justify-center border-t border-solid border-border/50 bg-background">
      <div className="flex max-w-[960px] flex-1 flex-col py-8 px-4">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
          <Link href="/terms" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/about" className="text-muted-foreground text-sm hover:text-primary transition-colors">
            About YourSpace
          </Link>
        </div>
        <p className="text-muted-foreground text-xs text-center mt-8">
          © {currentYear} YourSpace Interactive Creative Labs. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
