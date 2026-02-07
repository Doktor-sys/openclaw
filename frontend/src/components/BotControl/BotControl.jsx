import { useState, useEffect } from 'react'

export default function BotControl() {
  const [botStatus, setBotStatus] = useState('offline')
  const [botConnected, setBotConnected] = useState(false)
  const [log, setLog] = useState([])

  useEffect(() => {
    fetchBotStatus()
    
    const ws = new WebSocket('ws://localhost:3002')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'bot_status_update') {
        setBotStatus(data.status)
        setBotConnected(true)
        addLog(`Bot Status: ${data.status}`)
      } else if (data.type === 'task_update') {
        addLog(`Aufgabe ${data.taskId}: ${data.status}`)
      }
    }

    ws.onopen = () => {
      addLog('WebSocket verbunden')
    }

    ws.onclose = () => {
      addLog('WebSocket getrennt')
      setBotConnected(false)
    }

    return () => ws.close()
  }, [])

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/bot/status')
      const data = await response.json()
      setBotConnected(data.connected)
      setBotStatus(data.connected ? 'online' : 'offline')
    } catch (error) {
      console.error('Fehler beim Abrufen des Bot-Status:', error)
    }
  }

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setLog(prev => [...prev.slice(-9), `[${timestamp}] ${message}`])
  }

  const sendCommand = async (command) => {
    try {
      const response = await fetch('/api/bot/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      const data = await response.json()
      addLog(data.message)
    } catch (error) {
      addLog(`Fehler: ${error.message}`)
    }
  }

  const statusColors = {
    active: 'bg-green-500',
    working: 'bg-yellow-500',
    processing: 'bg-blue-500',
    inactive: 'bg-gray-500',
    offline: 'bg-red-500',
    paused: 'bg-orange-500',
    error: 'bg-red-600',
    online: 'bg-green-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Bot-Steuerung</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${statusColors[botStatus]}`} />
          <span className="text-sm capitalize">{botStatus}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => sendCommand('pause')}
          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
        >
          ⏸ Pausieren
        </button>
        <button
          onClick={() => sendCommand('resume')}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          ▶ Fortsetzen
        </button>
        <button
          onClick={() => sendCommand('restart')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Neu starten
        </button>
        <button
          onClick={fetchBotStatus}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          📊 Status prüfen
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
        {log.length === 0 ? (
          <div className="text-gray-500">Warte auf Bot-Aktivität...</div>
        ) : (
          log.map((entry, index) => (
            <div key={index} className="mb-1">{entry}</div>
          ))
        )}
      </div>
    </div>
  )
}