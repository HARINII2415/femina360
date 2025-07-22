import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket for emergency evidence
export const EVIDENCE_BUCKET = 'emergency-evidence'

// Upload emergency evidence to Supabase Storage
export async function uploadEmergencyEvidence(
  videoBlob: Blob, 
  userId: string
): Promise<{ url: string; path: string }> {
  const fileName = `emergency_${Date.now()}_${userId}.webm`
  const filePath = `${userId}/${fileName}`

  const { data, error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .upload(filePath, videoBlob, {
      contentType: 'video/webm',
      upsert: false
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(EVIDENCE_BUCKET)
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
    path: filePath
  }
}

// Call emergency alert edge function
export async function triggerEmergencyAlert(alertData: {
  userId: string
  userName: string
  location: { lat: number; lng: number } | null
  evidenceUrl: string
  emergencyContacts: any[]
  timestamp: string
}) {
  const { data, error } = await supabase.functions.invoke('emergency-alert', {
    body: alertData
  })

  if (error) {
    throw new Error(`Emergency alert failed: ${error.message}`)
  }

  return data
}

// Send OTP for password reset
export async function sendPasswordResetOTP(phoneNumber: string) {
  // In a real implementation, this would call a Supabase Edge Function
  // that integrates with Twilio to send SMS
  const { data, error } = await supabase.functions.invoke('send-otp', {
    body: { phoneNumber, type: 'password_reset' }
  })

  if (error) {
    throw new Error(`OTP send failed: ${error.message}`)
  }

  return data
}

// Verify OTP for password reset
export async function verifyPasswordResetOTP(phoneNumber: string, otp: string) {
  const { data, error } = await supabase.functions.invoke('verify-otp', {
    body: { phoneNumber, otp, type: 'password_reset' }
  })

  if (error) {
    throw new Error(`OTP verification failed: ${error.message}`)
  }

  return data
}