// /.netlify/functions/weather
export async function handler(event) {
  const API_KEY = process.env.OPENWEATHER_KEY;
  const t = (event.queryStringParameters?.t || "current").toLowerCase(); // 'current' | 'forecast' | 'hourly'
  let base;
  if (t === "forecast") {
    base = "https://api.openweathermap.org/data/2.5/forecast";
  } else if (t === "hourly") {
    base = "https://api.openweathermap.org/data/3.0/onecall";
  } else {
    base = "https://api.openweathermap.org/data/2.5/weather";
  }

  const url = new URL(base);
  for (const [k, v] of Object.entries(event.queryStringParameters || {})) {
    if (k !== "t") url.searchParams.set(k, v);
  }
  url.searchParams.set("appid", API_KEY);
  url.searchParams.set("lang", "th");

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    return {
      statusCode: res.status,
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
}
