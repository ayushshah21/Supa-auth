/// <reference lib="deno.ns" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-initial-location',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

const MAILGUN_API_KEY = Deno.env.get('MAILGUN_API_KEY')
const MAILGUN_DOMAIN = 'ticketai.tech'
const SENDER_EMAIL = `postmaster@${MAILGUN_DOMAIN}`

// Validate API key format
const isValidApiKey = MAILGUN_API_KEY?.match(/^[a-f0-9]{32}-[a-f0-9]{8}-[a-f0-9]{8}$/)

// Debug: Log environment setup with API key validation
console.error('DEBUG: Environment setup:', JSON.stringify({
  hasMailgunApiKey: !!MAILGUN_API_KEY,
  isValidApiKeyFormat: !!isValidApiKey,
  mailgunDomain: MAILGUN_DOMAIN,
  senderEmail: SENDER_EMAIL
}))

console.log('Environment variables:', { 
  hasMailgunApiKey: !!MAILGUN_API_KEY,
  hasMailgunDomain: !!MAILGUN_DOMAIN
});

console.error('DEBUG: Mailgun Configuration:', {
  domain: MAILGUN_DOMAIN,
  senderEmail: SENDER_EMAIL,
  hasApiKey: !!MAILGUN_API_KEY,
  apiKeyPrefix: MAILGUN_API_KEY?.substring(0, 8) + '...',
})

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get origin from request headers or x-initial-location
    const origin = req.headers.get('origin') || req.headers.get('x-initial-location') || 'http://localhost:5173'
    console.error('DEBUG: Request origin:', origin)

    // Log request details
    console.error('DEBUG: Request received:', JSON.stringify({
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    }))

    // Verify request method
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      })
    }

    // Validate environment variables
    if (!MAILGUN_API_KEY) {
      console.error('DEBUG: Missing Mailgun API key')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      })
    }

    // Parse request body
    const { to, subject, body, ticketId } = await req.json()
    console.error('DEBUG: Email details:', JSON.stringify({ 
      to, 
      subject,
      bodyLength: body?.length,
      ticketId
    }))

    // Validate required fields
    if (!to || !subject || !body || !ticketId) {
      console.log('[send-email] Missing required fields:', { to, subject, hasBody: !!body, ticketId })
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      })
    }

    // Construct ticket URL
    const ticketUrl = `${origin}/ticket/${ticketId}`
    
    // Create a professional email template with modern styling
    const emailBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; border-radius: 8px; padding: 40px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <!-- Logo or Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1a1a1a; margin: 0; font-size: 24px;">TicketAI Support</h1>
            </div>

            <!-- Main Content -->
            <div style="color: #4a5568; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                ${body}
            </div>

            <!-- Ticket Link Button -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="${ticketUrl}" 
                   style="display: inline-block; 
                          background-color: #4f46e5; 
                          color: white; 
                          padding: 12px 24px; 
                          text-decoration: none; 
                          border-radius: 6px; 
                          font-weight: 500;
                          transition: background-color 0.2s ease;">
                    View Ticket Details
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; color: #718096; font-size: 14px; margin-top: 20px;">
            <p style="margin: 0;">This is an automated message from TicketAI Support System.</p>
            <p style="margin: 5px 0;">Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>`

    console.error('DEBUG: Sending email via Mailgun...')

    // Create form data for Mailgun API
    const formData = new FormData()
    formData.append('from', SENDER_EMAIL)
    formData.append('to', to)
    formData.append('subject', subject)
    formData.append('html', emailBody)

    // Send email using Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`
    console.error('DEBUG: Sending to Mailgun:', {
      url: mailgunUrl,
      method: 'POST',
      hasAuth: true,
      formDataKeys: [...formData.keys()]
    })

    const response = await fetch(mailgunUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
      },
      body: formData
    })

    // Get the full response text for better error logging
    const responseText = await response.text()
    console.error('DEBUG: Mailgun API Response:', {
      status: response.status,
      statusText: response.statusText,
      responseText: responseText.substring(0, 500), // Limit log size
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      // Check for authentication issues
      if (response.status === 401) {
        console.error('DEBUG: Authentication failed')
        return new Response(JSON.stringify({ 
          error: 'Authentication failed',
          details: 'Invalid API key or unauthorized access'
        }), {
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        })
      }
      // Check for rate limiting
      if (response.status === 429) {
        console.error('DEBUG: Rate limit exceeded')
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded, please try again later',
          details: responseText
        }), {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          }
        })
      }
      throw new Error(`Mailgun API error: ${response.status} ${responseText}`)
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (e) {
      console.error('DEBUG: Failed to parse Mailgun response:', e)
      result = { raw: responseText }
    }

    console.error('DEBUG: Email sent successfully:', result)

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Email sent successfully',
      id: result.id
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    })

  } catch (err) {
    console.error('DEBUG: Error sending email:', err)
    return new Response(JSON.stringify({ 
      error: 'Failed to send email',
      details: err.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
