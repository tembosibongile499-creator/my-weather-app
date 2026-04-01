import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'

// ─── Sample fallback data ────────────────────────────────────────────────────
const sampleWeatherData = [
  { day: 'Mon', temp: 18 },
  { day: 'Tue', temp: 22 },
  { day: 'Wed', temp: 19 },
  { day: 'Thu', temp: 23 },
  { day: 'Fri', temp: 21 },
  { day: 'Sat', temp: 18 },
  { day: 'Sun', temp: 17 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ICONS = {
  Clear: '☀️', Clouds: '☁️', Rain: '🌧️', Drizzle: '🌦️',
  Thunderstorm: '⛈️', Snow: '❄️', Mist: '🌫️', Fog: '🌫️', Haze: '🌫️',
}
const getIcon = (main) => ICONS[main] || '🌤️'

function getShortDay(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })
}

// Convert API 3-hourly list → daily averages
function processForecast(list) {
  const daily = {}
  list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0]
    if (!daily[date]) daily[date] = { temps: [], conds: [], rain: [] }
    daily[date].temps.push(item.main.temp)
    daily[date].conds.push(item.weather[0].main)
    daily[date].rain.push((item.pop || 0) * 100)
  })
  return Object.keys(daily).slice(0, 5).map((date) => {
    const temps = daily[date].temps
    const avg = Math.round(temps.reduce((a, b) => a + b) / temps.length)
    const maxRain = Math.round(Math.max(...daily[date].rain))
    const cond = daily[date].conds.sort(
      (a, b) =>
        daily[date].conds.filter((v) => v === b).length -
        daily[date].conds.filter((v) => v === a).length
    )[0]
    return { day: getShortDay(date), temp: avg, rain: maxRain, cond }
  })
}

function getBestDay(days) {
  return days.reduce((a, b) => {
    const score = (d) =>
      100 - Math.abs(d.temp - 22) - d.rain * 0.4 -
      (['Rain', 'Thunderstorm'].includes(d.cond) ? 30 : 0)
    return score(a) >= score(b) ? a : b
  })
}

function getInsight(days) {
  const best = getBestDay(days)
  const hot = days.find((d) => d.temp > 35)
  const cold = days.find((d) => d.temp < 5)
  const rainy = days.find((d) => d.rain > 60)
  const lines = []
  if (hot) lines.push(`🔥 Very hot on ${hot.day} (${hot.temp}°C) — avoid midday outdoor activity.`)
  if (cold) lines.push(`🧊 Cold on ${cold.day} (${cold.temp}°C) — dress warmly.`)
  if (rainy) lines.push(`☔ Rain likely on ${rainy.day} (${rainy.rain}% chance) — carry an umbrella.`)
  lines.push(`✅ Best day to go out: ${best.day} (${best.temp}°C, ${best.cond})`)
  return lines
}

// ─── TrendChart component ─────────────────────────────────────────────────────
function TrendChart({ data }) {
  return (
    <section className="trend-chart">
      <h3>Temperature Trend</h3>
      {/* FIX: ResponsiveContainer MUST have width + height, and parent div must also have a fixed height */}
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
            {/* FIX: YAxis must be rendered (it was imported but missing from JSX) */}
            <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 12 }} />
            <YAxis stroke="#555" tick={{ fontSize: 12 }} tickFormatter={(v) => v + '°'} />
            <Tooltip
              formatter={(value) => [`${value}°C`, 'Temp']}
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
            />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 5, fill: '#1d4ed8', strokeWidth: 0 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [cityInput, setCityInput] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cityName, setCityName] = useState('Sample City')
  const [currentTemp, setCurrentTemp] = useState(22)
  const [condition, setCondition] = useState('Clear')
  const [chartData, setChartData] = useState(sampleWeatherData)
  const [insights, setInsights] = useState([
    '✅ Best day to go out: Tuesday (22°C, sample data)',
  ])

  async function handleSearch() {
    if (!cityInput.trim()) return setError('Please enter a city name.')
    if (!apiKey.trim()) return setError('Please enter your API key below.')
    setError('')
    setLoading(true)
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityInput)}&appid=${apiKey.trim()}&units=metric`
      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'City not found')

      const days = processForecast(data.list)
      setCityName(data.city.name + ', ' + data.city.country)
      setCurrentTemp(Math.round(data.list[0].main.temp))
      setCondition(data.list[0].weather[0].main)
      setChartData(days)
      setInsights(getInsight(days))
    } catch (e) {
      setError('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <div className="browser-frame">

        {/* Search bar */}
        <header className="search-bar">
          <span>Enter city:</span>
          <input
            type="text"
            placeholder="Lusaka"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Loading…' : 'Search'}
          </button>
        </header>

        {/* API key input */}
        <div className="api-key-row">
          <span>API Key:</span>
          <input
            type="password"
            placeholder="Paste your OpenWeatherMap API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {error && <p className="error-msg">{error}</p>}

        {/* Current weather */}
        <section className="city-stats">
          <h2>{cityName}</h2>
          <p>Current Temperature: <strong>{currentTemp}°C</strong></p>
          <p>Condition: <strong>{getIcon(condition)} {condition}</strong></p>
        </section>

        {/* Chart — YAxis is now included and ResponsiveContainer is fixed */}
        <TrendChart data={chartData} />

        {/* Insights */}
        <section className="insight-panel">
          <h3>Insights</h3>
          {insights.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </section>

      </div>
    </div>
  )
}

export default App
