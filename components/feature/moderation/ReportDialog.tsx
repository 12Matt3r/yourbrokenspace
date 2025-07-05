
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { submitReportAction } from '@/lib/actions/moderationActions';

type ReportType = 'user' | 'creation';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: ReportType;
  targetName: string;
  targetId: string;
}

const reportReasons = {
  user: [
    { id: 'harassment', label: 'Harassment or Hateful Conduct' },
    { id: 'impersonation', label: 'Impersonation' },
    { id: 'spam', label: 'Spam or Misleading Content' },
    { id: 'other', label: 'Other' },
  ],
  creation: [
    { id: 'copyright', label: 'Copyright Infringement' },
    { id: 'inappropriate', label: 'Inappropriate Content' },
    { id: 'spam', label: 'Spam or Misleading' },
    { id: 'other', label: 'Other' },
  ],
};

export function ReportDialog({ isOpen, onClose, reportType, targetName, targetId }: ReportDialogProps) {
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      toast({
        variant: 'destructive',
        title: 'Please select a reason',
        description: 'You must select a reason for the report.',
      });
      return;
    }
    setIsSubmitting(true);
    
    const result = await submitReportAction({
      targetId,
      targetType: reportType,
      reason: selectedReason,
      details,
    });

    if (result.success) {
      toast({
        title: 'Report Submitted',
        description: `Thank you for reporting "${targetName}". Our team will review it shortly.`,
      });
      onClose();
      setSelectedReason(null);
      setDetails('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Report Failed',
        description: result.error || 'An unknown error occurred.',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-6 w-6 text-destructive" />
            Report {reportType === 'user' ? 'User' : 'Creation'}
          </DialogTitle>
          <DialogDescription>
            You are reporting <span className="font-semibold">{targetName}</span>. Please provide a reason below. Your report is anonymous.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <RadioGroup onValueChange={setSelectedReason} value={selectedReason || undefined}>
              {reportReasons[reportType].map((reason) => (
                <div key={reason.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={reason.id} id={`reason-${reason.id}`} />
                  <Label htmlFor={`reason-${reason.id}`}>{reason.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <Textarea
              placeholder="Provide additional details (optional)..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={!selectedReason || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
