

// Removed ReactNode and lucide-react imports to avoid JSX in a .ts file.

export interface Challenge {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'past';
  prize: string;
  rules: string[];
  submissionTag: string; // The tag to use for filtering submissions
  icon: 'Brush' | 'Code' | 'Music'; // Use a string literal type for safety
  deadline: string;
}

// Mock data has been removed. The /challenges page now fetches live data from Firestore.
// In a real app, you would have an admin panel or a CLI script to seed this data.
