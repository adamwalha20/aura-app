const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export async function sendMessage(prompt: string, history: any[] = []) {
  if (!WEBHOOK_URL) {
    console.error("n8n Webhook URL is not set.");
    return "I am currently unable to connect to the sanctuary. Please check the configuration.";
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: prompt,
        history: history
      }),
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

  const prompt = `Generate 3 personalized daily rituals for a user with these preferences:
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
        userId: userId
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status ${response.status}`);
    }

    const data = await response.json();
    
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
        return [];
      }
    }

    return Array.isArray(rituals) ? rituals : [];

  } catch (error) {
    console.error("Ritual Generation Error (n8n):", error);
    return [];
  }
}
