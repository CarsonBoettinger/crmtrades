export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      lead_activities: {
        Row: {
          created_at: string;
          disposition: string | null;
          id: string;
          lead_id: string;
          notes: string | null;
          outcome_summary: string | null;
          sentiment: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          disposition?: string | null;
          id?: string;
          lead_id: string;
          notes?: string | null;
          outcome_summary?: string | null;
          sentiment?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          disposition?: string | null;
          id?: string;
          lead_id?: string;
          notes?: string | null;
          outcome_summary?: string | null;
          sentiment?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          best_time: string;
          business: string;
          channel: string | null;
          comments: string | null;
          consent: boolean;
          created_at: string;
          direction: string;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          phone: string;
          place_id: string | null;
          report_id: string | null;
          source: string | null;
          status: string;
          tags: string[];
          telegram_sent_at: string | null;
          town: string;
          trade: string;
        };
        Insert: {
          best_time: string;
          business: string;
          channel?: string | null;
          comments?: string | null;
          consent?: boolean;
          created_at?: string;
          direction?: string;
          email: string;
          first_name: string;
          id?: string;
          last_name: string;
          phone: string;
          place_id?: string | null;
          report_id?: string | null;
          source?: string | null;
          status?: string;
          tags?: string[];
          telegram_sent_at?: string | null;
          town: string;
          trade: string;
        };
        Update: {
          best_time?: string;
          business?: string;
          channel?: string | null;
          comments?: string | null;
          consent?: boolean;
          created_at?: string;
          direction?: string;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          phone?: string;
          place_id?: string | null;
          report_id?: string | null;
          source?: string | null;
          status?: string;
          tags?: string[];
          telegram_sent_at?: string | null;
          town?: string;
          trade?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "presence_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      presence_reports: {
        Row: {
          business_name: string;
          completed_at: string | null;
          contact_email: string | null;
          contact_first_name: string | null;
          contact_last_name: string | null;
          contact_phone: string | null;
          created_at: string;
          error_message: string | null;
          formatted_address: string | null;
          grade: string | null;
          id: string;
          lat: number | null;
          lead_id: string | null;
          lng: number | null;
          overall_score: number | null;
          phase: string;
          phone: string | null;
          place_id: string;
          public_payload: Json;
          rating: number | null;
          review_count: number | null;
          score_payload: Json | null;
          status: string;
          town: string | null;
          trade: string;
          unlock_token: string;
          unlocked_at: string | null;
          updated_at: string;
          website: string | null;
        };
        Insert: {
          business_name: string;
          completed_at?: string | null;
          contact_email?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          error_message?: string | null;
          formatted_address?: string | null;
          grade?: string | null;
          id?: string;
          lat?: number | null;
          lead_id?: string | null;
          lng?: number | null;
          overall_score?: number | null;
          phase?: string;
          phone?: string | null;
          place_id: string;
          public_payload?: Json;
          rating?: number | null;
          review_count?: number | null;
          score_payload?: Json | null;
          status?: string;
          town?: string | null;
          trade: string;
          unlock_token: string;
          unlocked_at?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Update: {
          business_name?: string;
          completed_at?: string | null;
          contact_email?: string | null;
          contact_first_name?: string | null;
          contact_last_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          error_message?: string | null;
          formatted_address?: string | null;
          grade?: string | null;
          id?: string;
          lat?: number | null;
          lead_id?: string | null;
          lng?: number | null;
          overall_score?: number | null;
          phase?: string;
          phone?: string | null;
          place_id?: string;
          public_payload?: Json;
          rating?: number | null;
          review_count?: number | null;
          score_payload?: Json | null;
          status?: string;
          town?: string | null;
          trade?: string;
          unlock_token?: string;
          unlocked_at?: string | null;
          updated_at?: string;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "presence_reports_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadActivity = Database["public"]["Tables"]["lead_activities"]["Row"];
export type PresenceReport = Database["public"]["Tables"]["presence_reports"]["Row"];
export type LeadStatus = "new" | "contacted" | "booked" | "closed";
export type ActivityType = "call" | "note" | "status_change";
export type CallDisposition =
  | "connected"
  | "not_connected"
  | "left_voicemail"
  | "wrong_number"
  | "callback_requested"
  | "booked"
  | "not_interested";
export type CallSentiment = "positive" | "neutral" | "negative";
