import { NextResponse } from 'next/server';

// Define the expected shape of incoming requests
interface WebhookRequest {
  action: 'analyze_vision' | 'focus_session_update' | 'chat_message';
  userId: string;
  userName?: string; // Added userName for personalization
  payload: Record<string, any>;
}

export async function POST(request: Request) {
  try {
    const body: WebhookRequest = await request.json();
    const { action, payload, userId, userName } = body;

    // 1. (Optional but Recommended) Verify user session via Supabase
    // In production, you should verify the user's JWT token here to ensure
    // they aren't spoofing the userId.
    // const supabase = createRouteHandlerClient({ cookies });
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session || session.user.id !== userId) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // 2. Retrieve n8n configuration from environment variables
    // You can route to different n8n webhooks based on the `action` if preferred,
    // or send everything to a single master router webhook in n8n.
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    const n8nAuthToken = process.env.N8N_AUTH_TOKEN;

    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL is not configured in environment variables.');
    }

    // 3. Forward the request to the n8n Webhook safely
    // The frontend never sees the N8N_AUTH_TOKEN or the direct n8n URL.
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Secure your n8n webhook by requiring this header in the n8n Webhook node
        'Authorization': `Bearer ${n8nAuthToken}`, 
        'X-Aura-Source': 'nextjs-client'
      },
      body: JSON.stringify({
        action,
        userId,
        userName: userName || 'Aura Seeker', // Forward the real username
        payload,
        timestamp: new Date().toISOString()
      })
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n responded with status: ${n8nResponse.status}`);
    }

    // 4. Parse the AI/n8n response and return it to the Next.js frontend
    const data = await n8nResponse.json();

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error: any) {
    console.error('[AURA] Webhook Trigger Error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal Server Error' 
      },
      { status: 500 }
    );
  }
}
