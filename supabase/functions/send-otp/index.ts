import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OTPRequest {
  phoneNumber: string;
  type: 'password_reset' | 'verification';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, type }: OTPRequest = await req.json()
    
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP in database with expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    // In a real implementation, store in Supabase database
    console.log(`Generated OTP for ${phoneNumber}: ${otp} (expires: ${expiresAt})`)
    
    // Send SMS via Twilio
    const smsResult = await sendOTPSMS(phoneNumber, otp, type)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        phoneNumber,
        expiresAt,
        // Don't return OTP in production!
        ...(Deno.env.get('ENVIRONMENT') === 'development' && { otp })
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Send OTP error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function sendOTPSMS(phoneNumber: string, otp: string, type: string) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log('Twilio not configured, simulating SMS')
    return { sid: `sim_${Date.now()}`, status: 'sent' }
  }

  const message = type === 'password_reset' 
    ? `Your Femina360 password reset code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone.`
    : `Your Femina360 verification code is: ${otp}. This code expires in 10 minutes.`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phoneNumber,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Twilio SMS failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`OTP SMS sent to ${phoneNumber}:`, result.sid)
    return result

  } catch (error) {
    console.error(`Failed to send OTP SMS to ${phoneNumber}:`, error)
    throw error
  }
}