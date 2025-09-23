export async function handler(event) {
  const API_KEY = process.env.OPENWEATHER_KEY;
  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  for (const [k, v] of Object.entries(event.queryStringParameters)) {
    url.searchParams.set(k, v);
  }
  url.searchParams.set("appid", API_KEY);
  url.searchParams.set("lang", "th");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return {
      statusCode: res.status,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}