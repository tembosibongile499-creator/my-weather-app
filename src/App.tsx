import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const MOCK_DATA = [
  { day: 'Mon', temp: 23 }, { day: 'Tue', temp: 27 }, { day: 'Wed', temp: 24 },
  { day: 'Thu', temp: 25 }, { day: 'Fri', temp: 22 }, { day: 'Sat', temp: 26 },
  { day: 'Sun', temp: 25 },
];

const App = () => {
  const [city, setCity] = useState('London');

  return (
    <div style={styles.container}>
      {/* Search Bar */}
      <div style={styles.searchBox}>
        <label>Enter city: </label>
        <input 
          type="text" 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
          style={styles.input}
        />
        <button style={styles.button}>Search</button>
      </div>

      {/* Current Weather Card */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>{city}</div>
        <div style={styles.cardBody}>
          <p>Current Temperature: 18°C</p>
          <p>Condition: Cloudy</p>
        </div>
      </div>

      {/* Temperature Trend Graph */}
      <div style={styles.graphSection}>
        <h3>Temperature Trend</h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={MOCK_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis domain={[15, 30]} />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#333" strokeWidth={2} dot={{ r: 5, fill: '#333' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insight Section */}
      <div style={styles.insightBox}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Insight:</div>
        <p>lovely day to go out: Friday (18°C)</p>
      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '600px', margin: '20px auto', padding: '20px', border: '1px solid #000', fontFamily: 'cursive' },
  searchBox: { marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' },
  input: { flex: 1, padding: '5px', border: '1px solid #000' },
  button: { padding: '5px 15px', cursor: 'pointer', border: '1px solid #000', backgroundColor: '#eee' },
  card: { border: '1px solid #000', marginBottom: '20px' },
  cardHeader: { backgroundColor: '#f0f0f0', padding: '10px', borderBottom: '1px solid #000', fontWeight: 'bold' },
  cardBody: { padding: '10px' },
  graphSection: { marginBottom: '20px' },
  insightBox: { border: '1px solid #000', padding: '10px' }
};

export default App;