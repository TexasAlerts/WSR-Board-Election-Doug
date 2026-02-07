/**
 * TypeScript Type Definitions
 * Database models and shared types for Doug Charles for Prosper Town Council
 */

// ============================================
// Database Enums
// ============================================

export type PollType = 'single_choice' | 'multiple_choice';
export type PollStatus = 'draft' | 'active' | 'closed';
export type PollVisibility = 'public' | 'public_view' | 'authenticated';

export type IdeaCategory =
  | 'infrastructure'
  | 'community'
  | 'safety'
  | 'environment'
  | 'general'
  | 'question';

export type IdeaStatus =
  | 'pending'
  | 'published'
  | 'under_review'
  | 'planned'
  | 'completed'
  | 'declined';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

export type SupporterStatus = 'pending_email' | 'pending_phone' | 'approved' | 'suspended';

export type SupporterRole = 'supporter' | 'admin' | 'super_admin';

export type VerificationPurpose = 'verify' | 'password_reset';

// ============================================
// Core Database Models
// ============================================

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  poll_type: PollType;
  status: PollStatus;
  show_results_before_vote: boolean;
  allow_comments: boolean;
  closes_at: string | null;
  created_at: string;
  published_at: string | null;
  visibility: PollVisibility;
  notify_voters_weekly: boolean;
  created_by: string | null;
}

export interface PollChoice {
  id: string;
  poll_id: string;
  choice_text: string;
  display_order: number;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  voter_email: string;
  vote_data: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  supporter_id: string | null;
}

export interface Idea {
  id: string;
  name: string;
  email: string;
  category: IdeaCategory;
  title: string;
  content: string;
  status: IdeaStatus;
  is_public: boolean;
  admin_response: string | null;
  support_count: number;
  created_at: string;
}

export interface IdeaSupport {
  id: string;
  idea_id: string;
  supporter_email: string;
  created_at: string;
}

export interface Comment {
  id: string;
  poll_id: string | null;
  idea_id: string | null;
  name: string;
  email: string;
  content: string;
  status: CommentStatus;
  created_at: string;
  supporter_id: string | null;
}

// ============================================
// Authentication & User Models
// ============================================

export interface Supporter {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash?: string;
  phone: string;
  phone_verified?: boolean;
  street_address: string;
  street_address_standardized?: string | null;
  city: string;
  state: string;
  zip_code: string;
  address_validated?: boolean;
  email_consent: boolean;
  sms_consent: boolean;
  consent_timestamp?: string | null;
  status: SupporterStatus;
  role: SupporterRole;
  created_at: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  approved_at: string | null;
}

export interface Session {
  id: string;
  supporter_id: string;
  token: string;
  expires_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface EmailVerification {
  id: string;
  supporter_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  purpose: VerificationPurpose;
  created_at: string;
}

export interface SMSVerification {
  id: string;
  supporter_id: string;
  phone: string;
  code: string;
  expires_at: string;
  attempts: number;
  verified_at: string | null;
  created_at: string;
}

export interface VerifiedVoter {
  id: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  verified_at: string | null;
  verification_token?: string | null;
  token_expires_at?: string | null;
  created_at: string;
}

// ============================================
// Logging & Audit Models
// ============================================

export interface AuditLog {
  id: string;
  supporter_id: string | null;
  event_type: string;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ErrorLog {
  id: string;
  error_type: string;
  message: string;
  stack_trace: string | null;
  context: Record<string, unknown> | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PollWithChoices extends Poll {
  choices: PollChoice[];
}

export interface PollWithResults extends PollWithChoices {
  total_votes: number;
  user_vote?: PollVote;
  results?: Array<{
    choice_id: string;
    choice_text: string;
    votes: number;
    percentage: number;
  }>;
}

export interface IdeaWithSupports extends Idea {
  user_supported?: boolean;
}

// ============================================
// Form & Validation Types
// ============================================

export interface SupporterRegistration {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  email_consent: boolean;
  sms_consent: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirm_password: string;
}

export interface PollSubmission {
  poll_id: string;
  choice_ids: string[];
}

export interface IdeaSubmission {
  name: string;
  email: string;
  category: IdeaCategory;
  title: string;
  content: string;
}

export interface CommentSubmission {
  poll_id?: string;
  idea_id?: string;
  name: string;
  email: string;
  content: string;
}

// ============================================
// Component Props Types
// ============================================

export interface PollCardProps {
  poll: Poll;
  showResults?: boolean;
  onVote?: (pollId: string, choiceIds: string[]) => Promise<void>;
}

export interface IdeaCardProps {
  idea: Idea;
  onSupport?: (ideaId: string) => Promise<void>;
  showActions?: boolean;
}

export interface CommentListProps {
  comments: Comment[];
  pollId?: string;
  ideaId?: string;
  onSubmit?: (comment: CommentSubmission) => Promise<void>;
}

// ============================================
// Utility Types
// ============================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

// ============================================
// Supabase Client Types
// ============================================

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: Poll;
        Insert: Omit<Poll, 'id' | 'created_at'>;
        Update: Partial<Omit<Poll, 'id' | 'created_at'>>;
      };
      poll_choices: {
        Row: PollChoice;
        Insert: Omit<PollChoice, 'id' | 'created_at'>;
        Update: Partial<Omit<PollChoice, 'id' | 'created_at'>>;
      };
      poll_votes: {
        Row: PollVote;
        Insert: Omit<PollVote, 'id' | 'created_at'>;
        Update: Partial<Omit<PollVote, 'id' | 'created_at'>>;
      };
      ideas: {
        Row: Idea;
        Insert: Omit<Idea, 'id' | 'created_at' | 'support_count'>;
        Update: Partial<Omit<Idea, 'id' | 'created_at'>>;
      };
      supporters: {
        Row: Supporter;
        Insert: Omit<Supporter, 'id' | 'created_at'>;
        Update: Partial<Omit<Supporter, 'id' | 'created_at'>>;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at'>;
        Update: Partial<Omit<Session, 'id' | 'created_at'>>;
      };
      verified_voters: {
        Row: VerifiedVoter;
        Insert: Omit<VerifiedVoter, 'id' | 'created_at'>;
        Update: Partial<Omit<VerifiedVoter, 'id' | 'created_at'>>;
      };
    };
  };
}
