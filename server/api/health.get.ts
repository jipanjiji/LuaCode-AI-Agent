export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey;
  const { model } = getQuery(event);

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GEMINI_API_KEY is not configured on the server.',
    });
  }

  if (!model) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Model ID is required for health check.',
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: "hi" }] }],
    generationConfig: { maxOutputTokens: 1 }
  };

  try {
    const startTime = Date.now();
    await $fetch(url, {
      method: 'POST',
      body: payload
    });
    const latency = Date.now() - startTime;
    
    return { status: 'healthy', latency: `${latency}ms` };
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    
    if (statusCode === 429) {
      return { status: 'limited', reason: 'Rate limit reached' };
    }
    
    return { 
      status: 'error', 
      code: statusCode,
      reason: error.data?.error?.message || 'Unknown error'
    };
  }
});
