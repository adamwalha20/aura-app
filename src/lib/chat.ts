import { supabase } from './supabase';

const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function sendMessage(prompt: string, history: any[] = [], userId?: string, conversationId?: string) {
  if (!WEBHOOK_URL) {
    console.error("n8n Webhook URL is not set.");
    return "I am currently unable to connect to the sanctuary. Please check the configuration.";
  }

  const bodyData: any = {
    type: 'message', // Added type: message as requested
    message: prompt,
    history: history,
    userId: userId,
    threadId: conversationId // Map conversationId to threadId for n8n
  };

  try {
    let contextString = "";
    if (userId) {
      const context = await fetchUserDailyContext(userId);
      contextString = `\n[Context]: Goals(${context.profile?.goals?.join(', ')}), Skin(${context.profile?.skin_type}), Focus(${context.profile?.preferred_focus_time}). Rituals: ${context.rituals.filter((r:any) => r.completed).length}/${context.rituals.length} done today.`;
      
      bodyData.message = prompt + contextString;
      // Pass the real username for n8n database lookups and personalization
      bodyData.userName = context.profile?.full_name || 'Aura Seeker';
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }

    const data = await response.json();
    
    // n8n webhooks often return an array of objects, or a single object.
    // We'll try to find the output property or use the whole response if it's a string.
    if (Array.isArray(data) && data.length > 0) {
      return data[0].output || data[0].response || JSON.stringify(data[0]);
    }
    
    return data.output || data.response || data.text || (typeof data === 'string' ? data : JSON.stringify(data));

  } catch (error) {
    console.error("Chat Error (n8n):", error);
    return "I apologize, but my connection to the sanctuary is momentarily weak. Let us breathe together and try again.";
  }
}
export async function getRitualSuggestions(userId: string, profile: any) {
  if (!WEBHOOK_URL) {
    console.error("n8n Webhook URL is not set.");
    return [];
  }

  const prompt = `Generate exactly 1 personalized daily ritual for a user with these preferences:
  - Goals: ${profile.goals?.join(', ')}
  - Skin Type: ${profile.skin_type}
  - Style Vibe: ${profile.style_vibe}
  - Preferred Focus Time: ${profile.preferred_focus_time}
  
  Return the rituals as a JSON array of objects with "text" and "time" properties. 
  Example: [{"text": "10-min meditation", "time": "08:00 AM"}]`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: prompt,
        type: 'ritual_generation',
        userId: userId,
        userName: profile.full_name || 'Aura Seeker' // Include real username
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }

    const text = await response.text();
    if (!text) return [];

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // If it's not JSON, it might be the raw string from n8n
      data = text;
    }
    
    // n8n might return the array directly or inside an output property
    let rituals = data.output || data.response || data;
    
    if (typeof rituals === 'string') {
      try {
        // Strip markdown code blocks if present
        const jsonMatch = rituals.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const cleanJson = jsonMatch ? jsonMatch[1] : rituals;
        rituals = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse ritual JSON:", rituals);
        // Fallback: If it's a simple string, treat it as a single ritual
        if (typeof rituals === 'string' && rituals.length > 5) {
          return [{ text: rituals.trim(), time: "08:00 AM" }];
        }
        return [];
      }
    }

    return Array.isArray(rituals) ? rituals : (rituals ? [rituals] : []);

  } catch (error) {
    console.error("Ritual Generation Error (n8n):", error);
    return [];
  }
}

export async function fetchUserDailyContext(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const [ritualsRes, sessionsRes, profileRes] = await Promise.all([
    supabase.from('daily_rituals').select('*').eq('user_id', userId).gte('created_at', today),
    supabase.from('focus_sessions').select('*').eq('user_id', userId).gte('start_time', today),
    supabase.from('users').select('*').eq('id', userId).single()
  ]);

  return {
    rituals: ritualsRes.data || [],
    sessions: sessionsRes.data || [],
    profile: profileRes.data
  };
}

export async function getTomorrowPlan(userId: string, profile: any) {
  if (!WEBHOOK_URL) return null;

  const context = await fetchUserDailyContext(userId);
  const prompt = `Based on today's progress, analyze and generate a "Vision for Tomorrow" plan for the user:
  - Today's Rituals: ${context.rituals.length} total, ${context.rituals.filter((r:any) => r.completed).length} completed.
  - Focus Sessions: ${context.sessions.length} today.
  - User Goals: ${profile.goals?.join(', ')}
  
  Return the plan in this JSON format:
  {
    "reflection": "Short motivating analysis of today",
    "tomorrow_plan": {
      "focus_blocks": ["Deep Work (9am-11am)", "Rest (2pm)"],
      "rituals": ["Morning stretch", "Hydrate"],
      "skin_advice": "Focus on hydration tonight"
    }
  }`;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
      body: JSON.stringify({ 
        message: prompt, 
        type: 'tomorrow_vision', 
        userId,
        userName: profile.full_name || 'Aura Seeker' // Include real username
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    let result = data.output || data.response || data;
    
    if (typeof result === 'string') {
      const match = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      result = JSON.parse(match ? match[1] : result);
    }
    
    return result;
  } catch (e) {
    console.error("Tomorrow Vision Error:", e);
    return null;
  }
}
export async function createNewConversation(userId: string, title?: string) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title: title || 'New Conversation' })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating conversation:", error);
    return null;
  }
  return data;
}

export async function getChatHistory(conversationId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
  return data.map(msg => ({
    role: msg.role,
    text: msg.content
  }));
}

export async function saveChatMessage(conversationId: string, userId: string, role: 'user' | 'model', content: string) {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role: role,
      content: content
    });
    
  if (error) {
    console.error("Error saving chat message:", error);
  }
}

export async function updateConversationTitle(conversationId: string, title: string) {
  const { error } = await supabase
    .from('conversations')
    .update({ title: title })
    .eq('id', conversationId);
    
  if (error) {
    console.error("Error updating conversation title:", error);
  }
}

export async function getUsersConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data;
}
