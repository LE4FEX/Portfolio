//netlify serverless function
export async function handler(event) {
  const API_KEY = process.env.OPENWEATHER_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing OPENWEATHER_API_KEY env var' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  const url = new URL('https://api.openweathermap.org/data/2.5/weather');

  // forward query params Ex. q, lat, lon, units
  for (const [k, v] of Object.entries(event.queryStringParameters || {})) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set('appid', API_KEY);
  url.searchParams.set('lang', 'th');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' }
    });
    const data = await res.json();

    return {
      statusCode: res.status,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Request failed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
}
