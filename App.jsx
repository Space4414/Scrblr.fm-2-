import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = 'https://Space4414.github.io/lastfm-scrobbler-frontend'; // ⛔ Replace with your actual backend URL

function App() {
  const [sessionKey, setSessionKey] = useState(null);
  const [queue, setQueue] = useState([]);
  const [intervalSec, setIntervalSec] = useState(60);
  const [isAuto, setIsAuto] = useState(false);
  const [repeatCount, setRepeatCount] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      axios.get(`${BACKEND_URL}/session?token=${token}`)
        .then(res => {
          setSessionKey(res.data.sessionKey);
          window.history.replaceState({}, document.title, '/');
        })
        .catch(() => alert('Session fetch failed'));
    }
  }, []);

  useEffect(() => {
    if (isAuto && queue.length > 0 && sessionKey) {
      const timer = setInterval(() => {
        const track = queue[0];
        scrobble(track.artist, track.title);
        rotateQueue();
      }, intervalSec * 1000);
      return () => clearInterval(timer);
    }
  }, [isAuto, queue, intervalSec, sessionKey]);

  const rotateQueue = () => {
    setQueue(q => {
      const [first, ...rest] = q;
      return [...rest, first];
    });
  };

  const scrobble = (artist, track) => {
    axios.post(`${BACKEND_URL}/scrobble`, {
      sessionKey,
      artist,
      track
    }).catch(() => alert('Scrobble failed'));
  };

  const login = () => {
    window.location.href = `${BACKEND_URL}/auth`;
  };

  const handleAdd = () => {
    const input = document.getElementById('trackInput').value;
    const [artist, title] = input.split(' - ').map(s => s.trim());
    if (!artist || !title) return alert('Use format: Artist - Track');
    const entries = Array(repeatCount).fill({ artist, title });
    setQueue(q => [...q, ...entries]);
    document.getElementById('trackInput').value = '';
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20, fontFamily: 'sans-serif' }}>
      <h1>Last.fm Scrobbler</h1>

      {!sessionKey ? (
        <button onClick={login} style={btnStyle}>Log in with Last.fm</button>
      ) : (
        <>
          <div style={{ marginBottom: 15 }}>
            <input id="trackInput" placeholder="Artist - Track" style={inputStyle} />
            <input
              type="number"
              min="1"
              value={repeatCount}
              onChange={(e) => setRepeatCount(Number(e.target.value))}
              style={{ ...inputStyle, width: 50, marginLeft: 5 }}
            />
            <button onClick={handleAdd} style={btnStyle}>Add</button>
          </div>

          <div>
            <label>
              Interval (sec):&nbsp;
              <input
                type="number"
                min="10"
                value={intervalSec}
                onChange={e => setIntervalSec(Number(e.target.value))}
                style={{ ...inputStyle, width: 60 }}
              />
            </label>
          </div>

          <div style={{ margin: '15px 0' }}>
            <button
              onClick={() => setIsAuto(!isAuto)}
              style={{
                ...btnStyle,
                backgroundColor: isAuto ? '#e74c3c' : '#27ae60'
              }}
            >
              {isAuto ? 'Stop Auto' : 'Start Auto'}
            </button>
          </div>

          <h3>Queue</h3>
          <ul>
            {queue.length === 0 && <p>No songs in queue</p>}
            {queue.map((track, i) => (
              <li key={i}>{track.artist} - {track.title}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '10px 15px',
  marginLeft: 5,
  backgroundColor: '#3498db',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};

const inputStyle = {
  padding: 8,
  width: '60%',
  border: '1px solid #ccc',
  borderRadius: 4
};

export default App;
