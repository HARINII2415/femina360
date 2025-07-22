import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyOTPRequest {
  phoneNumber: string;
  otp: string;
  type: 'password_reset' | 'verification';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, otp, type }: VerifyOTPRequest = await req.json()
    
    // In a real implementation, verify OTP from database
    // For now, simulate verification
    const isValid = await verifyOTPFromDatabase(phoneNumber, otp, type)
    
    if (!isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired OTP'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        },
      )
    }
    
    // Mark OTP as used
    await markOTPAsUsed(phoneNumber, otp)
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP verified successfully',
        phoneNumber
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Verify OTP error:', error)
    
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

async function verifyOTPFromDatabase(phoneNumber: string, otp: string, type: string): Promise<boolean> {
  // In a real implementation, query Supabase database
  // For development, simulate verification
  console.log(`Verifying OTP for ${phoneNumber}: ${otp} (type: ${type})`)
  
  // Simulate database check
  // In production, this would check against stored OTP and expiration
  return otp.length === 6 && /^\d{6}$/.test(otp)
}

async function markOTPAsUsed(phoneNumber: string, otp: string) {
  // In a real implementation, mark OTP as used in database
  console.log(`Marking OTP as used for ${phoneNumber}: ${otp}`)
}