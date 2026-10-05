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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string | null
          id: string
          quantity: number
          sku: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          quantity?: number
          sku: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          quantity?: number
          sku?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      catalogue_requests: {
        Row: {
          collection: string
          email: string | null
          id: string
          requested_at: string | null
          user_id: string | null
        }
        Insert: {
          collection: string
          email?: string | null
          id?: string
          requested_at?: string | null
          user_id?: string | null
        }
        Update: {
          collection?: string
          email?: string | null
          id?: string
          requested_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          business: string
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string
          status: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          business: string
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone: string
          status?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          business?: string
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      loyalty_members: {
        Row: {
          birthday: string | null
          city: string | null
          created_at: string | null
          email: string
          id: string
          instagram_handle: string | null
          name: string
          phone: string | null
          points: number | null
          referral_code: string | null
          referred_by: string | null
          tier: string | null
          total_spent: number | null
          user_id: string | null
        }
        Insert: {
          birthday?: string | null
          city?: string | null
          created_at?: string | null
          email: string
          id?: string
          instagram_handle?: string | null
          name: string
          phone?: string | null
          points?: number | null
          referral_code?: string | null
          referred_by?: string | null
          tier?: string | null
          total_spent?: number | null
          user_id?: string | null
        }
        Update: {
          birthday?: string | null
          city?: string | null
          created_at?: string | null
          email?: string
          id?: string
          instagram_handle?: string | null
          name?: string
          phone?: string | null
          points?: number | null
          referral_code?: string | null
          referred_by?: string | null
          tier?: string | null
          total_spent?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      loyalty_points_config: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          label: string
          points: number
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          label: string
          points: number
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          label?: string
          points?: number
        }
        Relationships: []
      }
      loyalty_points_log: {
        Row: {
          created_at: string | null
          id: string
          member_id: string | null
          points: number
          reason: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          points: number
          reason: string
        }
        Update: {
          created_at?: string | null
          id?: string
          member_id?: string | null
          points?: number
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_log_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "loyalty_members"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          collection_name: string
          created_at: string | null
          format: string
          id: string
          line_total_cents: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          unit_price_cents: number
        }
        Insert: {
          collection_name: string
          created_at?: string | null
          format: string
          id?: string
          line_total_cents: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          unit_price_cents: number
        }
        Update: {
          collection_name?: string
          created_at?: string | null
          format?: string
          id?: string
          line_total_cents?: number
          order_id?: string
          product_name?: string
          quantity?: number
          sku?: string
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          payment_method: string
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          payment_verified_at: string | null
          payment_error: string | null
          shipping_charge_cents: number
          total_cents: number | null
          shipment_tracking_number: string | null
          shipment_status: string | null
          shipment_created_at: string | null
          shipment_pickup_scheduled_at: string | null
          shipment_label_url: string | null
          shipment_events: Json | null
          shipment_synced_at: string | null
          created_at: string | null
          currency: string
          id: string
          notes: string | null
          shipping_address_line1: string
          shipping_address_line2: string | null
          shipping_city: string
          shipping_country: string
          shipping_email: string
          shipping_name: string
          shipping_phone: string
          shipping_postal_code: string
          shipping_state: string
          status: string
          subtotal_cents: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          payment_verified_at?: string | null
          payment_error?: string | null
          shipping_charge_cents?: number
          total_cents?: number | null
          shipment_tracking_number?: string | null
          shipment_status?: string | null
          shipment_created_at?: string | null
          shipment_pickup_scheduled_at?: string | null
          shipment_label_url?: string | null
          shipment_events?: Json | null
          shipment_synced_at?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          shipping_address_line1: string
          shipping_address_line2?: string | null
          shipping_city: string
          shipping_country?: string
          shipping_email: string
          shipping_name: string
          shipping_phone: string
          shipping_postal_code: string
          shipping_state: string
          status?: string
          subtotal_cents: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          payment_method?: string
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          payment_verified_at?: string | null
          payment_error?: string | null
          shipping_charge_cents?: number
          total_cents?: number | null
          shipment_tracking_number?: string | null
          shipment_status?: string | null
          shipment_created_at?: string | null
          shipment_pickup_scheduled_at?: string | null
          shipment_label_url?: string | null
          shipment_events?: Json | null
          shipment_synced_at?: string | null
          created_at?: string | null
          currency?: string
          id?: string
          notes?: string | null
          shipping_address_line1?: string
          shipping_address_line2?: string | null
          shipping_city?: string
          shipping_country?: string
          shipping_email?: string
          shipping_name?: string
          shipping_phone?: string
          shipping_postal_code?: string
          shipping_state?: string
          status?: string
          subtotal_cents?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      product_prices: {
        Row: {
          sale_ends_at: string | null
          sale_price_cents: number | null
          currency: string
          is_purchasable: boolean
          price_cents: number | null
          sku: string
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          sale_ends_at?: string | null
          sale_price_cents?: number | null
          currency?: string
          is_purchasable?: boolean
          price_cents?: number | null
          sku: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          sale_ends_at?: string | null
          sale_price_cents?: number | null
          currency?: string
          is_purchasable?: boolean
          price_cents?: number | null
          sku?: string
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          source: string | null
          subscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string | null
        }
        Relationships: []
      }
      partner_registrations: {
        Row: {
          business_type: string
          city: string
          company: string
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string
          state: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          business_type: string
          city: string
          company: string
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone: string
          state: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          business_type?: string
          city?: string
          company?: string
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string
          state?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          default_box_breadth_cm: number
          default_box_height_cm: number
          default_box_length_cm: number
          default_box_weight_kg: number
          flexi_courier_code: number | null
          flexi_rto_warehouse_code: string | null
          flexi_warehouse_code: string | null
          free_shipping_threshold_cents: number | null
          hsn_code: string
          id: number
          shipping_flat_cents: number
          updated_at: string
        }
        Insert: {
          default_box_breadth_cm?: number
          default_box_height_cm?: number
          default_box_length_cm?: number
          default_box_weight_kg?: number
          flexi_courier_code?: number | null
          flexi_rto_warehouse_code?: string | null
          flexi_warehouse_code?: string | null
          free_shipping_threshold_cents?: number | null
          hsn_code?: string
          id?: number
          shipping_flat_cents?: number
          updated_at?: string
        }
        Update: {
          default_box_breadth_cm?: number
          default_box_height_cm?: number
          default_box_length_cm?: number
          default_box_weight_kg?: number
          flexi_courier_code?: number | null
          flexi_rto_warehouse_code?: string | null
          flexi_warehouse_code?: string | null
          free_shipping_threshold_cents?: number | null
          hsn_code?: string
          id?: number
          shipping_flat_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          last_sign_in: string | null
          provider: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          last_sign_in?: string | null
          provider?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          last_sign_in?: string | null
          provider?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
