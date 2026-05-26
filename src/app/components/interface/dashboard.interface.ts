export interface LogAnalysisPayload {
  analysis: AnalysisData;
  suggestions: Suggestions;
  timeline: TimelineEntry[];
}

export interface AnalysisData {
  errors: AnalysisError[];
}

export interface Suggestions {
  ai_explanations: string;
}

export interface AnalysisError {
  type: string;
  description: string;
  suggestedFix: string;
}

export interface TimelineEntry {
  status: string; // Or Date if you move away from .toDateString()
  iconImage: string;
}

// models/user-registration.model.ts
export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  website?: string;
  phoneNumber?: string;
  customer_token: string; // backend should generate this ideally
}

export interface CustomerUsage {
  customer_token: string;
  plan?: 'free' | 'pro' | 'enterprise';
  daily_limit?: number;
  logs_today?: number;
  last_reset?: Date;
}

