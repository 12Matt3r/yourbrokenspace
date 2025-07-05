import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { YourSpaceLogo } from '@/components/branding/YourSpaceLogo';

const features = [
  {
    title: 'Modular Profiles',
    description: 'Craft a unique online presence with customizable profile modules. Showcase your work, skills, and personality in a way that truly represents you.',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBInhVBDa134Afgi1K-CAclG9wyeMXzrUgu9F2S0Qvi3XtaSpgokD1buNXyuTSCMUvUkZ5GSOO-ykF7XP3CrIX24qvOsh6U-2-Peh6J0ocLYBLELWhdySUAobGwbNOWG0sK0QPIQ9nCdVEvuhXdcVMTYXva3JgZtx_r9bkUM9mRNDSdKPx4jjLmeCV8af7JAUWm3mdu6NKPt9Rf8RGVMfrvScEWMwhn_nUb4K7TRkwCLIxATGIJz02t8kBw8bxVivVwW4o3qm_SIkhT",
    aiHint: "customizable profile interface",
  },
  {
    title: 'AI-Powered Discovery',
    description: 'Explore new creative avenues with our AI-driven discovery engine. Get personalized recommendations, find inspiration, and connect with like-minded creators.',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfhX0ZjAOZOaK-2W8i8PLhfYTRdNfGj2v1u880vOFMlVVrwwYMD83Jj_9j9fL_NtgN5f3vxs0GgxMn_I-SI4EOeWm58bOyWf90Eeua9OVadPMOHi2-qzLabDRYCEgREoZQrR4oTDQlYjJeS0ndL6ozCBF_7Uo0FLWiei4IjkSFeqS2mg3VH5F_l-5-uz7y9gIki9XBLxNnJzOz8ZOSbxixI3-jscOzRX16o5v80v2LxPSCzF_7qEsBxC8alUVQh4RzTOHqTrNDliGx",
    aiHint: "ai data visualization",
  },
  {
    title: 'Collaboration Tools',
    description: 'Collaborate effortlessly with built-in tools for project management, communication, and file sharing. Bring your creative visions to life, together.',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqGyvy2F9kc7lOHaVev2gbXq2-jLPW2GwXRA6u3uC4uZAJ6NDU83YiOBl5_0eyQWAAP1ATjhAsjpfnEMkEHbG8Ygy1kkhEaz7fywYvtN-sIFQDHSiuNfr2zenSUX2ziQx9nAcgfv055zyfUYyS_FIAxF5Fc2pBnuuUkTZ7f7d6a8szgZWiYhO0q8BqzhW6c4CunfG6lkrB6r0BsIP-Pr8xFi8VXtIN0w6pa0rYKyarUJ2jtDxoNaqAEFsAMn1pVjxG8RmfK711TR5f",
    aiHint: "team collaboration interface",
  },
  {
    title: 'Monetization Options',
    description: 'Turn your passion into profit with flexible monetization options. Sell your creations, offer subscriptions, or receive direct support from your audience.',
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8JvaPuwrVDrVoQxtkHDJi93eEVE-YhsTH42WvF3v15tYrYoiufmkmw2Ww49-MRed8Oisd7f8eC85izoroocqH_fCwAoQBlNlS0XqNWxbiXR5HHD9WK9k4KqUEl8Eczn6gzLSwYHzgiM4yXIqYttGv7aW7FG6HIB5Vi1IMVuSyYeGkt2Pj36NsFuWVriAFix_XwlmyALbVIQkSPxQQ0-e_4m0viDCeW7TZcJNwzdMLcXjC1RUkIGn_B_41c7CcAQksDBr5PRKjZFqW",
    aiHint: "creator economy dashboard",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-1 justify-center sm:px-10 md:px-20 lg:px-40">
      <div className="flex flex-col max-w-[960px] flex-1">
        <div className="p-0 sm:p-4">
          <div
            className="flex min-h-[480px] flex-col gap-8 items-center justify-center p-4"
          >
            <YourSpaceLogo className="h-40 w-40 text-primary" />
            <div className="text-center">
                <h1 className="text-foreground text-3xl font-black leading-tight tracking-[-0.033em] sm:text-5xl">
                    Unleash Your Creative Potential
                </h1>
                <h2 className="text-muted-foreground text-sm font-normal leading-normal sm:text-base mt-2 max-w-xl">
                    YourSpace is a full-stack platform for creators. Build modular profiles, discover new ideas with AI, collaborate seamlessly, and monetize your work.
                </h2>
            </div>
            <Link href="/walkthrough">
                <Button size="lg" className="h-10 px-4 sm:h-12 sm:px-5 text-sm sm:text-base">
                    <span className="truncate">Explore Creative Labs</span>
                </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-10 px-4 py-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-foreground tracking-tight text-[32px] font-bold leading-tight sm:text-4xl max-w-[720px]">
              Core Features
            </h1>
            <p className="text-muted-foreground text-base font-normal leading-normal max-w-[720px]">
              YourSpace provides a comprehensive suite of tools to empower creators at every stage of their journey.
            </p>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col gap-3 pb-3">
                <div className="w-full relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    style={{objectFit: 'cover'}}
                    data-ai-hint={feature.aiHint}
                  />
                </div>
                <div>
                  <p className="text-foreground text-base font-medium leading-normal">{feature.title}</p>
                  <p className="text-muted-foreground text-sm font-normal leading-normal">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
