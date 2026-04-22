export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { key } = getQuery(event);
  
  // Priority: Query Key > Server Key
  const apiKey = (key as string) || config.groqApiKey;

  if (!apiKey) {
    return { models: [], fallback: true };
  }

  const url = `https://api.groq.com/openai/v1/models`;

  try {
    const data: any = await $fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Filter for chat models (usual suspects)
    const models = data.data
      .filter((m: any) => 
        m.id.includes('llama') || 
        m.id.includes('mixtral') || 
        m.id.includes('gemma')
      )
      .map((m: any) => ({
        id: m.id,
        label: m.id.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      }));
      
    return { models, fallback: false };
  } catch (error: any) {
    console.error('[Groq Models API Error]:', error.data || error.message);
    return { models: [], fallback: true };
  }
});
