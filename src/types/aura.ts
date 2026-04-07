export interface AuraUser {
  id: string;
  full_name: string;
  avatar_url: string;
  xp: number;
  level: string;
}

export interface HealthMetric {
  id: string;
  user_id: string;
  metric_type: 'skin_analysis' | 'outfit_analysis';
  data: Record<string, any>;
  analyzed_at: string;
}

export interface DailyFeed {
  id: string;
  user_id: string;
  target_date: string;
  content: {
    greeting: string;
    nutrition: any[];
    rituals: any[];
    suggestions: string[];
  };
  is_read: boolean;
}

export interface FocusSession {
  id: string;
  user_id: string;
  focus_type: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  xp_earned: number;
  status: 'in_progress' | 'completed' | 'cancelled';
}
