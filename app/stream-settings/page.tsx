
import { StreamPluginPanel } from '@/components/feature/streaming/StreamPluginPanel';
import { PageWrapper } from '@/components/PageWrapper';

export default function StreamSettingsPage() {
  return (
    <PageWrapper className="py-12 flex flex-col items-center justify-center min-h-[calc(100vh-10rem)]">
      <StreamPluginPanel />
    </PageWrapper>
  );
}
