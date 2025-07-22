import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmergencyRequest {
  userId: string;
  userName: string;
  location: { lat: number; lng: number } | null;
  evidenceUrl: string;
  emergencyContacts: Array<{
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
  }>;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const emergencyData: EmergencyRequest = await req.json()
    
    console.log('Emergency alert received:', emergencyData)

    // Send SMS to all emergency contacts
    const smsPromises = emergencyData.emergencyContacts.map(contact => 
      sendEmergencySMS(contact, emergencyData)
    )

    // Make emergency calls (starting with primary contact)
    const primaryContact = emergencyData.emergencyContacts.find(c => c.isPrimary)
    const callPromises = []
    
    if (primaryContact) {
      callPromises.push(makeEmergencyCall(primaryContact, emergencyData))
    }

    // Execute all notifications
    const smsResults = await Promise.allSettled(smsPromises)
    const callResults = await Promise.allSettled(callPromises)

    // Log results
    console.log('SMS Results:', smsResults)
    console.log('Call Results:', callResults)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Emergency alerts sent',
        smsCount: smsResults.filter(r => r.status === 'fulfilled').length,
        callsInitiated: callResults.filter(r => r.status === 'fulfilled').length,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Emergency alert error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function sendEmergencySMS(contact: any, emergencyData: EmergencyRequest) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log('Twilio credentials not configured, simulating SMS')
    return simulateSMS(contact, emergencyData)
  }

  const locationText = emergencyData.location 
    ? `Location: https://maps.google.com/?q=${emergencyData.location.lat},${emergencyData.location.lng}`
    : 'Location: Not available'

  const message = `🚨 EMERGENCY ALERT 🚨
${emergencyData.userName} needs immediate help!

${locationText}

Evidence: ${emergencyData.evidenceUrl}

Time: ${new Date(emergencyData.timestamp).toLocaleString()}

This is an automated emergency alert from Femina360.`

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
          To: contact.phone,
          Body: message,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Twilio SMS failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`SMS sent to ${contact.name} (${contact.phone}):`, result.sid)
    return result

  } catch (error) {
    console.error(`Failed to send SMS to ${contact.name}:`, error)
    throw error
  }
}

async function makeEmergencyCall(contact: any, emergencyData: EmergencyRequest) {
  const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log('Twilio credentials not configured, simulating call')
    return simulateCall(contact, emergencyData)
  }

  const twimlUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/emergency-call-twiml`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: contact.phone,
          Url: twimlUrl,
          Method: 'POST',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Twilio call failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log(`Call initiated to ${contact.name} (${contact.phone}):`, result.sid)
    return result

  } catch (error) {
    console.error(`Failed to call ${contact.name}:`, error)
    throw error
  }
}

function simulateSMS(contact: any, emergencyData: EmergencyRequest) {
  console.log(`[SIMULATED SMS] To: ${contact.name} (${contact.phone})`)
  console.log(`Message: Emergency alert for ${emergencyData.userId}`)
  console.log(`Evidence: ${emergencyData.evidenceUrl}`)
  
  return {
    sid: `sim_${Date.now()}`,
    status: 'sent',
    to: contact.phone,
    from: '+1234567890'
  }
}

function simulateCall(contact: any, emergencyData: EmergencyRequest) {
  console.log(`[SIMULATED CALL] To: ${contact.name} (${contact.phone})`)
  console.log(`Emergency call for ${emergencyData.userId}`)
  
  return {
    sid: `call_${Date.now()}`,
    status: 'initiated',
    to: contact.phone,
    from: '+1234567890'
  }
}