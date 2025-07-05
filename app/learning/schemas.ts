
import type { LearningPath } from './page';

export interface LearningPathState {
  paths: LearningPath[];
  error?: string;
  topic?: string;
}
