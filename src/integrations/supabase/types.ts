export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achieved_at: string
          achievement_type: string
          badge_icon: string | null
          description: string | null
          id: string
          points: number | null
          student_id: string | null
          title: string
        }
        Insert: {
          achieved_at?: string
          achievement_type: string
          badge_icon?: string | null
          description?: string | null
          id?: string
          points?: number | null
          student_id?: string | null
          title: string
        }
        Update: {
          achieved_at?: string
          achievement_type?: string
          badge_icon?: string | null
          description?: string | null
          id?: string
          points?: number | null
          student_id?: string | null
          title?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          author_id: string | null
          class_id: string | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          priority: string | null
          target_role: Database["public"]["Enums"]["user_role"] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          class_id?: string | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          target_role?: Database["public"]["Enums"]["user_role"] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          class_id?: string | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          priority?: string | null
          target_role?: Database["public"]["Enums"]["user_role"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          class_id: string | null
          created_at: string
          date: string
          id: string
          marked_by: string | null
          notes: string | null
          status: string
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          date: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status: string
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          date?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_configurations: {
        Row: {
          auto_backup: boolean | null
          backup_frequency: string | null
          backup_type: string | null
          created_at: string
          id: string
          last_backup_at: string | null
          storage_used_mb: number | null
          user_id: string | null
        }
        Insert: {
          auto_backup?: boolean | null
          backup_frequency?: string | null
          backup_type?: string | null
          created_at?: string
          id?: string
          last_backup_at?: string | null
          storage_used_mb?: number | null
          user_id?: string | null
        }
        Update: {
          auto_backup?: boolean | null
          backup_frequency?: string | null
          backup_type?: string | null
          created_at?: string
          id?: string
          last_backup_at?: string | null
          storage_used_mb?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      birthday_reminders: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reminder_date: string
          sent: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reminder_date: string
          sent?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reminder_date?: string
          sent?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
      book_borrows: {
        Row: {
          book_id: string | null
          borrowed_at: string
          due_date: string
          id: string
          returned_at: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          book_id?: string | null
          borrowed_at?: string
          due_date: string
          id?: string
          returned_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          book_id?: string | null
          borrowed_at?: string
          due_date?: string
          id?: string
          returned_at?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "book_borrows_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
        ]
      }
      bus_stops: {
        Row: {
          bus_id: string | null
          created_at: string
          estimated_time: string | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          stop_order: number | null
        }
        Insert: {
          bus_id?: string | null
          created_at?: string
          estimated_time?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          stop_order?: number | null
        }
        Update: {
          bus_id?: string | null
          created_at?: string
          estimated_time?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          stop_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bus_stops_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
        ]
      }
      buses: {
        Row: {
          active: boolean | null
          bus_number: string
          capacity: number | null
          created_at: string
          driver_name: string | null
          driver_phone: string | null
          gps_device_id: string | null
          id: string
          route_name: string | null
        }
        Insert: {
          active?: boolean | null
          bus_number: string
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          gps_device_id?: string | null
          id?: string
          route_name?: string | null
        }
        Update: {
          active?: boolean | null
          bus_number?: string
          capacity?: number | null
          created_at?: string
          driver_name?: string | null
          driver_phone?: string | null
          gps_device_id?: string | null
          id?: string
          route_name?: string | null
        }
        Relationships: []
      }
      classes: {
        Row: {
          academic_year: string | null
          capacity: number | null
          created_at: string
          grade_level: number | null
          id: string
          name: string
          school_id: string | null
          section: string | null
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          capacity?: number | null
          created_at?: string
          grade_level?: number | null
          id?: string
          name: string
          school_id?: string | null
          section?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          capacity?: number | null
          created_at?: string
          grade_level?: number | null
          id?: string
          name?: string
          school_id?: string | null
          section?: string | null
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      counseling_sessions: {
        Row: {
          counselor_id: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          notes: string | null
          session_date: string
          session_type: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          counselor_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          session_date: string
          session_type?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          counselor_id?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          session_date?: string
          session_type?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean | null
          lesson_order: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          lesson_order?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean | null
          lesson_order?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean | null
          completion_percentage: number | null
          course_id: string | null
          created_at: string
          id: string
          last_watched_at: string | null
          lesson_id: string | null
          student_id: string | null
        }
        Insert: {
          completed?: boolean | null
          completion_percentage?: number | null
          course_id?: string | null
          created_at?: string
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          student_id?: string | null
        }
        Update: {
          completed?: boolean | null
          completion_percentage?: number | null
          course_id?: string | null
          created_at?: string
          id?: string
          last_watched_at?: string | null
          lesson_id?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          subject_id: string | null
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          subject_id?: string | null
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          subject_id?: string | null
          thumbnail_url?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_quotes: {
        Row: {
          author: string | null
          category: string | null
          created_at: string
          date_featured: string | null
          id: string
          quote_text: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          created_at?: string
          date_featured?: string | null
          id?: string
          quote_text: string
        }
        Update: {
          author?: string | null
          category?: string | null
          created_at?: string
          date_featured?: string | null
          id?: string
          quote_text?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_time: string | null
          event_date: string
          event_type: string | null
          id: string
          start_time: string | null
          target_audience: string | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date: string
          event_type?: string | null
          id?: string
          start_time?: string | null
          target_audience?: string | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          event_date?: string
          event_type?: string | null
          id?: string
          start_time?: string | null
          target_audience?: string | null
          title?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string
          exam_id: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          marks_obtained: number | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          exam_id?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          marks_obtained?: number | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          marks_obtained?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          exam_date: string
          id: string
          start_time: string
          subject_id: string | null
          title: string
          total_marks: number
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes: number
          exam_date: string
          id?: string
          start_time: string
          subject_id?: string | null
          title: string
          total_marks: number
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          exam_date?: string
          id?: string
          start_time?: string
          subject_id?: string | null
          title?: string
          total_marks?: number
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_types: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          due_frequency: string | null
          id: string
          is_recurring: boolean | null
          name: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          due_frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          name: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          due_frequency?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          fee_type: string
          id: string
          paid: boolean | null
          paid_amount: number | null
          payment_date: string | null
          payment_method: string | null
          student_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          fee_type: string
          id?: string
          paid?: boolean | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          student_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          fee_type?: string
          id?: string
          paid?: boolean | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          student_id?: string | null
          transaction_id?: string | null
        }
        Relationships: []
      }
      group_chat_messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string
          file_url: string | null
          id: string
          message_type: string | null
          sender_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string
          file_url?: string | null
          id?: string
          message_type?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_chat_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "group_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      group_chats: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          subject_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          subject_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_chats_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_chats_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          assigned_by: string | null
          class_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          subject_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          subject_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string
          available_copies: number | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          digital_copy_url: string | null
          id: string
          isbn: string | null
          title: string
          total_copies: number | null
        }
        Insert: {
          author: string
          available_copies?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          digital_copy_url?: string | null
          id?: string
          isbn?: string | null
          title: string
          total_copies?: number | null
        }
        Update: {
          author?: string
          available_copies?: number | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          digital_copy_url?: string | null
          id?: string
          isbn?: string | null
          title?: string
          total_copies?: number | null
        }
        Relationships: []
      }
      marks: {
        Row: {
          created_at: string
          exam_date: string | null
          exam_type: string
          id: string
          marks_obtained: number | null
          student_id: string | null
          subject_id: string | null
          total_marks: number | null
        }
        Insert: {
          created_at?: string
          exam_date?: string | null
          exam_type: string
          id?: string
          marks_obtained?: number | null
          student_id?: string | null
          subject_id?: string | null
          total_marks?: number | null
        }
        Update: {
          created_at?: string
          exam_date?: string | null
          exam_type?: string
          id?: string
          marks_obtained?: number | null
          student_id?: string | null
          subject_id?: string | null
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read: boolean | null
          read_at: string | null
          recipient_id: string | null
          reply_to: string | null
          sender_id: string | null
          subject: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string | null
          reply_to?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string | null
          reply_to?: string | null
          sender_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_tokens: {
        Row: {
          active: boolean | null
          created_at: string
          device_type: string | null
          id: string
          token: string
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          device_type?: string | null
          id?: string
          token: string
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          device_type?: string | null
          id?: string
          token?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      offline_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          subject_id: string | null
          synced: boolean | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          subject_id?: string | null
          synced?: boolean | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          subject_id?: string | null
          synced?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offline_notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_child_relationships: {
        Row: {
          child_id: string | null
          created_at: string
          id: string
          parent_id: string | null
          primary_contact: boolean | null
          relationship_type: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          primary_contact?: boolean | null
          relationship_type?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string
          id?: string
          parent_id?: string | null
          primary_contact?: boolean | null
          relationship_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          quiz_id: string | null
          score: number
          student_id: string | null
          time_taken_seconds: number | null
          total_points: number
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          quiz_id?: string | null
          score?: number
          student_id?: string | null
          time_taken_seconds?: number | null
          total_points: number
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          quiz_id?: string | null
          score?: number
          student_id?: string | null
          time_taken_seconds?: number | null
          total_points?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          options: Json
          points: number | null
          question: string
          quiz_id: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          options: Json
          points?: number | null
          question: string
          quiz_id?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          points?: number | null
          question?: string
          quiz_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          active: boolean | null
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          subject_id: string | null
          time_limit_minutes: number | null
          title: string
          total_questions: number
        }
        Insert: {
          active?: boolean | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          subject_id?: string | null
          time_limit_minutes?: number | null
          title: string
          total_questions?: number
        }
        Update: {
          active?: boolean | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          subject_id?: string | null
          time_limit_minutes?: number | null
          title?: string
          total_questions?: number
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quizzes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      student_analytics: {
        Row: {
          assignment_completion_rate: number | null
          attendance_percentage: number | null
          average_marks: number | null
          created_at: string
          id: string
          month_year: string
          participation_score: number | null
          quiz_performance: number | null
          student_id: string | null
          subject_id: string | null
        }
        Insert: {
          assignment_completion_rate?: number | null
          attendance_percentage?: number | null
          average_marks?: number | null
          created_at?: string
          id?: string
          month_year: string
          participation_score?: number | null
          quiz_performance?: number | null
          student_id?: string | null
          subject_id?: string | null
        }
        Update: {
          assignment_completion_rate?: number | null
          attendance_percentage?: number | null
          average_marks?: number | null
          created_at?: string
          id?: string
          month_year?: string
          participation_score?: number | null
          quiz_performance?: number | null
          student_id?: string | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_analytics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_bus_assignments: {
        Row: {
          active: boolean | null
          bus_id: string | null
          bus_stop_id: string | null
          created_at: string
          id: string
          student_id: string | null
        }
        Insert: {
          active?: boolean | null
          bus_id?: string | null
          bus_stop_id?: string | null
          created_at?: string
          id?: string
          student_id?: string | null
        }
        Update: {
          active?: boolean | null
          bus_id?: string | null
          bus_stop_id?: string | null
          created_at?: string
          id?: string
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_bus_assignments_bus_id_fkey"
            columns: ["bus_id"]
            isOneToOne: false
            referencedRelation: "buses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_bus_assignments_bus_stop_id_fkey"
            columns: ["bus_stop_id"]
            isOneToOne: false
            referencedRelation: "bus_stops"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          class_id: string | null
          created_at: string
          enrollment_date: string | null
          id: string
          roll_number: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          enrollment_date?: string | null
          id?: string
          roll_number?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          enrollment_date?: string | null
          id?: string
          roll_number?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_qr_codes: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_scanned_at: string | null
          qr_code_data: string
          scan_count: number | null
          student_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_scanned_at?: string | null
          qr_code_data: string
          scan_count?: number | null
          student_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_scanned_at?: string | null
          qr_code_data?: string
          scan_count?: number | null
          student_id?: string | null
        }
        Relationships: []
      }
      student_submissions: {
        Row: {
          feedback: string | null
          file_urls: string[] | null
          grade: number | null
          graded: boolean | null
          graded_at: string | null
          graded_by: string | null
          homework_id: string | null
          id: string
          student_id: string | null
          submission_text: string | null
          submitted_at: string
        }
        Insert: {
          feedback?: string | null
          file_urls?: string[] | null
          grade?: number | null
          graded?: boolean | null
          graded_at?: string | null
          graded_by?: string | null
          homework_id?: string | null
          id?: string
          student_id?: string | null
          submission_text?: string | null
          submitted_at?: string
        }
        Update: {
          feedback?: string | null
          file_urls?: string[] | null
          grade?: number | null
          graded?: boolean | null
          graded_at?: string | null
          graded_by?: string | null
          homework_id?: string | null
          id?: string
          student_id?: string | null
          submission_text?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework"
            referencedColumns: ["id"]
          },
        ]
      }
      study_materials: {
        Row: {
          approved: boolean | null
          approved_at: string | null
          approved_by: string | null
          class_id: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          subject_id: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          subject_id?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          approved?: boolean | null
          approved_at?: string | null
          approved_by?: string | null
          class_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          subject_id?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          class_id: string | null
          created_at: string
          id: string
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          id?: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          token: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          token: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          token?: string
          used?: boolean | null
        }
        Relationships: []
      }
      teacher_performance: {
        Row: {
          assignments_graded: number | null
          class_id: string | null
          classes_conducted: number | null
          created_at: string
          id: string
          month_year: string
          response_time_hours: number | null
          student_feedback_score: number | null
          teacher_id: string | null
        }
        Insert: {
          assignments_graded?: number | null
          class_id?: string | null
          classes_conducted?: number | null
          created_at?: string
          id?: string
          month_year: string
          response_time_hours?: number | null
          student_feedback_score?: number | null
          teacher_id?: string | null
        }
        Update: {
          assignments_graded?: number | null
          class_id?: string | null
          classes_conducted?: number | null
          created_at?: string
          id?: string
          month_year?: string
          response_time_hours?: number | null
          student_feedback_score?: number | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_performance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          class_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room_number: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room_number?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room_number?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      attendance_records: {
        Row: {
          class_id: string | null
          created_at: string | null
          date: string | null
          id: string | null
          marked_by: string | null
          notes: string | null
          status: string | null
          student_id: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          marked_by?: string | null
          notes?: string | null
          status?: string | null
          student_id?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string | null
          marked_by?: string | null
          notes?: string | null
          status?: string | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          blood_group: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact: string | null
          full_name: string | null
          id: string | null
          parent_name: string | null
          parent_phone: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          blood_group?: never
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          blood_group?: never
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          id?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "student" | "teacher" | "admin"
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
    Enums: {
      user_role: ["student", "teacher", "admin"],
    },
  },
} as const
