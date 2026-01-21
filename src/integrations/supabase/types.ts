export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      behavior_categories: {
        Row: {
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      behaviors: {
        Row: {
          category_id: string | null
          id: string
          is_active: boolean | null
          name: string
          prompt: string | null
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          prompt?: string | null
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          category_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          prompt?: string | null
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "behaviors_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "behavior_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      caregiver_links: {
        Row: {
          caregiver_user_id: string
          created_at: string
          id: string
          invite_code: string | null
          patient_user_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          caregiver_user_id: string
          created_at?: string
          id?: string
          invite_code?: string | null
          patient_user_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          caregiver_user_id?: string
          created_at?: string
          id?: string
          invite_code?: string | null
          patient_user_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      caregiver_permissions: {
        Row: {
          can_receive_dose_taken: boolean | null
          can_receive_late_alerts: boolean | null
          can_receive_low_battery_alerts: boolean | null
          can_receive_missed_alerts: boolean | null
          can_receive_refill_alerts: boolean | null
          can_view_calendar: boolean | null
          can_view_medications: boolean | null
          can_view_stats: boolean | null
          caregiver_user_id: string
          id: string
          patient_user_id: string
          updated_at: string
        }
        Insert: {
          can_receive_dose_taken?: boolean | null
          can_receive_late_alerts?: boolean | null
          can_receive_low_battery_alerts?: boolean | null
          can_receive_missed_alerts?: boolean | null
          can_receive_refill_alerts?: boolean | null
          can_view_calendar?: boolean | null
          can_view_medications?: boolean | null
          can_view_stats?: boolean | null
          caregiver_user_id: string
          id?: string
          patient_user_id: string
          updated_at?: string
        }
        Update: {
          can_receive_dose_taken?: boolean | null
          can_receive_late_alerts?: boolean | null
          can_receive_low_battery_alerts?: boolean | null
          can_receive_missed_alerts?: boolean | null
          can_receive_refill_alerts?: boolean | null
          can_view_calendar?: boolean | null
          can_view_medications?: boolean | null
          can_view_stats?: boolean | null
          caregiver_user_id?: string
          id?: string
          patient_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      case_inventory: {
        Row: {
          doses_remaining: number | null
          id: string
          last_refill_at: string | null
          medication_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          doses_remaining?: number | null
          id?: string
          last_refill_at?: string | null
          medication_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          doses_remaining?: number | null
          id?: string
          last_refill_at?: string | null
          medication_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_inventory_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      conditions_catalog: {
        Row: {
          category: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number | null
          synonyms: string[] | null
        }
        Insert: {
          category?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          synonyms?: string[] | null
        }
        Update: {
          category?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          synonyms?: string[] | null
        }
        Relationships: []
      }
      devices: {
        Row: {
          battery_percent: number | null
          created_at: string
          device_identifier: string | null
          device_name: string | null
          firmware_version: string | null
          id: string
          last_seen_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_percent?: number | null
          created_at?: string
          device_identifier?: string | null
          device_name?: string | null
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_percent?: number | null
          created_at?: string
          device_identifier?: string | null
          device_name?: string | null
          firmware_version?: string | null
          id?: string
          last_seen_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dose_logs: {
        Row: {
          created_at: string
          event_datetime: string
          event_type: string
          id: string
          medication_id: string
          notes: string | null
          scheduled_datetime: string
          source: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_datetime?: string
          event_type: string
          id?: string
          medication_id: string
          notes?: string | null
          scheduled_datetime: string
          source?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_datetime?: string
          event_type?: string
          id?: string
          medication_id?: string
          notes?: string | null
          scheduled_datetime?: string
          source?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dose_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_schedules: {
        Row: {
          created_at: string
          days_of_week: number[] | null
          end_date: string | null
          frequency_type: string | null
          id: string
          medication_id: string
          on_time_window_minutes: number | null
          start_date: string | null
          times_of_day: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[] | null
          end_date?: string | null
          frequency_type?: string | null
          id?: string
          medication_id: string
          on_time_window_minutes?: number | null
          start_date?: string | null
          times_of_day?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[] | null
          end_date?: string | null
          frequency_type?: string | null
          id?: string
          medication_id?: string
          on_time_window_minutes?: number | null
          start_date?: string | null
          times_of_day?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_schedules_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          alt_names: string[] | null
          compartment: number | null
          created_at: string
          form: string | null
          generic_name: string
          id: string
          instructions: string | null
          is_active: boolean | null
          notes: string | null
          refill_quantity_doses: number | null
          refill_threshold_doses: number | null
          stored_in_case: boolean | null
          strength_unit: string | null
          strength_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alt_names?: string[] | null
          compartment?: number | null
          created_at?: string
          form?: string | null
          generic_name: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          notes?: string | null
          refill_quantity_doses?: number | null
          refill_threshold_doses?: number | null
          stored_in_case?: boolean | null
          strength_unit?: string | null
          strength_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alt_names?: string[] | null
          compartment?: number | null
          created_at?: string
          form?: string | null
          generic_name?: string
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          notes?: string | null
          refill_quantity_doses?: number | null
          refill_threshold_doses?: number | null
          stored_in_case?: boolean | null
          strength_unit?: string | null
          strength_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_events: {
        Row: {
          created_at: string
          event_datetime: string
          id: string
          is_read: boolean | null
          medication_id: string | null
          metadata: Json | null
          scheduled_datetime: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_datetime?: string
          id?: string
          is_read?: boolean | null
          medication_id?: string | null
          metadata?: Json | null
          scheduled_datetime?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_datetime?: string
          id?: string
          is_read?: boolean | null
          medication_id?: string | null
          metadata?: Json | null
          scheduled_datetime?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          caregiver_updates: boolean | null
          case_battery_alerts: boolean | null
          community_activity: boolean | null
          dose_reminders: boolean | null
          missed_dose_alerts: boolean | null
          refill_reminders: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caregiver_updates?: boolean | null
          case_battery_alerts?: boolean | null
          community_activity?: boolean | null
          dose_reminders?: boolean | null
          missed_dose_alerts?: boolean | null
          refill_reminders?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caregiver_updates?: boolean | null
          case_battery_alerts?: boolean | null
          community_activity?: boolean | null
          dose_reminders?: boolean | null
          missed_dose_alerts?: boolean | null
          refill_reminders?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refill_logs: {
        Row: {
          created_at: string
          id: string
          medication_id: string
          new_quantity: number | null
          previous_quantity: number | null
          quantity_added: number
          refilled_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          medication_id: string
          new_quantity?: number | null
          previous_quantity?: number | null
          quantity_added: number
          refilled_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          medication_id?: string
          new_quantity?: number | null
          previous_quantity?: number | null
          quantity_added?: number
          refilled_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refill_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_behaviors: {
        Row: {
          behavior_id: string
          id: string
          selected: boolean | null
          selected_at: string | null
          user_id: string
        }
        Insert: {
          behavior_id: string
          id?: string
          selected?: boolean | null
          selected_at?: string | null
          user_id: string
        }
        Update: {
          behavior_id?: string
          id?: string
          selected?: boolean | null
          selected_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_behaviors_behavior_id_fkey"
            columns: ["behavior_id"]
            isOneToOne: false
            referencedRelation: "behaviors"
            referencedColumns: ["id"]
          },
        ]
      }
      user_conditions: {
        Row: {
          condition_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          condition_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          condition_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_conditions_condition_id_fkey"
            columns: ["condition_id"]
            isOneToOne: false
            referencedRelation: "conditions_catalog"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          age: number | null
          allergies_text: string | null
          avatar_url: string | null
          blood_group: string | null
          condition_other_text: string | null
          created_at: string
          full_name: string | null
          height_unit: string | null
          height_value: number | null
          passcode_enabled: boolean | null
          phone: string | null
          role: string | null
          share_profile_in_forum: boolean | null
          timezone: string | null
          updated_at: string
          user_id: string
          weight_unit: string | null
          weight_value: number | null
        }
        Insert: {
          age?: number | null
          allergies_text?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          condition_other_text?: string | null
          created_at?: string
          full_name?: string | null
          height_unit?: string | null
          height_value?: number | null
          passcode_enabled?: boolean | null
          phone?: string | null
          role?: string | null
          share_profile_in_forum?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          weight_unit?: string | null
          weight_value?: number | null
        }
        Update: {
          age?: number | null
          allergies_text?: string | null
          avatar_url?: string | null
          blood_group?: string | null
          condition_other_text?: string | null
          created_at?: string
          full_name?: string | null
          height_unit?: string | null
          height_value?: number | null
          passcode_enabled?: boolean | null
          phone?: string | null
          role?: string | null
          share_profile_in_forum?: boolean | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          weight_unit?: string | null
          weight_value?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_caregiver_access: {
        Args: {
          _caregiver_id: string
          _patient_id: string
          _permission: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
