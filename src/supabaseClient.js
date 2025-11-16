// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// --- YOUR CONCRETE SUPABASE CREDENTIALS ---
const supabaseUrl = 'https://rxxaokeaqpejoltlqhpm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eGFva2VhcXBlam9sdGxxaHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMjAyNjcsImV4cCI6MjA3NDg5NjI2N30.YoDmSc0JYhh3Cb3t3z9tJCkdMYSZ0acwc5YpWMSKEY4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)