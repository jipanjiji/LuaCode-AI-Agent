export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { key } = getQuery(event);
  
  // Priority: Query Key > Server Key
  const apiKey = (key as string) || config.geminiApiKey;

  if (!apiKey) {
    return { models: [], fallback: true };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const data: any = await $fetch(url);
    
    // Filter for models that support content generation
    const models = data.models
      .filter((m: any) => m.supportedGenerationMethods.includes('generateContent'))
      .map((m: any) => ({
        id: m.name.replace('models/', ''),
        label: m.displayName,
        description: m.description
      }));
      
    return { models };
  } catch (error: any) {
    console.error('[Models API Error]:', error.data || error.message);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.error?.message || 'Failed to fetch models from Gemini API',
    });
  }
});
