import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Generate TwiML for emergency call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-US">
        This is an emergency alert from Femina 360. 
        A user has triggered an emergency alert and needs immediate assistance. 
        Please check your text messages for location details and evidence. 
        If this is a real emergency, please contact local emergency services immediately.
        This message will repeat.
    </Say>
    <Pause length="2"/>
    <Say voice="alice" language="en-US">
        This is an emergency alert from Femina 360. 
        A user has triggered an emergency alert and needs immediate assistance. 
        Please check your text messages for location details and evidence. 
        If this is a real emergency, please contact local emergency services immediately.
    </Say>
    <Hangup/>
</Response>`

    return new Response(twiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
      status: 200,
    })

  } catch (error) {
    console.error('TwiML generation error:', error)
    
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice" language="en-US">
        Emergency alert system error. Please check your messages.
    </Say>
    <Hangup/>
</Response>`

    return new Response(errorTwiml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
      status: 200,
    })
  }
})