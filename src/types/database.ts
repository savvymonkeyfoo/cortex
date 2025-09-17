// types/database.ts

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: string
  organisation?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface WritingPreference {
  id: string
  user_id: string
  tone: string
  style: string
  formality_level: number
  writing_voice: string
  target_audience: string
  industry_context: string
  use_case: string
  preferred_language: string
  sentence_length: string
  paragraph_style: string
  custom_instructions: Record<string, any>
  terminology_preferences: Record<string, any>
  avoid_phrases: string[]
  profile_name: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  plan_code: string
  plan_name: string
  description?: string
  price_monthly: number
  price_yearly: number
  currency: string
  features: Record<string, any>
  limits: Record<string, any>
  is_active: boolean
  sort_order: number
  is_trial_available: boolean
  trial_days: number
  is_popular: boolean
  is_recommended: boolean
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'past_due' | 'paused'
  billing_cycle: 'monthly' | 'yearly' | 'lifetime'
  amount_paid?: number
  currency: string
  started_at: string
  current_period_start: string
  current_period_end?: string
  cancelled_at?: string
  trial_start?: string
  trial_end?: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  payment_method: Record<string, any>
  current_usage: Record<string, any>
  usage_reset_date?: string
  metadata: Record<string, any>
  notes?: string
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  user_id: string
  title: string
  description?: string
  slug: string
  category: string
  tags: string[]
  status: 'active' | 'draft' | 'archived' | 'deleted' | 'pending' | 'published'
  is_public: boolean
  is_template: boolean
  default_writing_preference_id?: string
  ai_instructions?: string
  content_guidelines: Record<string, any>
  color: string
  icon: string
  sort_order: number
  usage_count: number
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface ContentGeneration {
  id: string
  user_id: string
  topic_id?: string
  writing_preference_id?: string
  original_prompt: string
  content_type: 'linkedin_post' | 'linkedin_article' | 'blog_post' | 'email' | 'social_media' | 'custom'
  generation_parameters: Record<string, any>
  ai_model: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  processing_time_ms?: number
  token_usage: Record<string, any>
  error_message?: string
  requested_variations: number
  generated_count: number
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface GeneratedContent {
  id: string
  content_generation_id: string
  user_id: string
  title?: string
  content: string
  content_type: string
  word_count?: number
  character_count?: number
  hashtags: string[]
  mentions: string[]
  status: 'draft' | 'approved' | 'published' | 'scheduled' | 'archived' | 'deleted'
  scheduled_for?: string
  published_at?: string
  platform_post_id?: string
  platform_url?: string
  is_favorite: boolean
  user_rating?: number
  user_notes?: string
  performance_metrics: Record<string, any>
  last_metrics_update?: string
  variation_number: number
  is_selected_variation: boolean
  seo_score?: number
  readability_score?: number
  engagement_prediction?: number
  created_at: string
  updated_at: string
}