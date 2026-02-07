import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../../services/AuthService'

export default function Header() {
  const [botStatus, setBotStatus] = useState('active')
  const [userDropdown, setUserDropdown] = useState(false)
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = AuthService.getUser()
    setUser(currentUser)
  }, [])

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'bot_status_update') {
        setBotStatus(data.status)
      }
    }

    return () => ws.close()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.search-container')) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.length >= 2) {
      try {
        const response = await fetch(`http://localhost:3002/api/search/suggestions?q=${encodeURIComponent(value)}`)
        const data = await response.json()
        setSuggestions(data)
        setShowSearchDropdown(true)
      } catch (error) {
        console.error('Search error:', error)
      }
    } else {
      setSuggestions([])
      setShowSearchDropdown(false)
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSearchDropdown(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text)
    navigate(`/search?q=${encodeURIComponent(suggestion.text)}`)
    setShowSearchDropdown(false)
  }

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  }

  return (
    <header className="bg-primary-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">OpenClaw</div>
      </div>
      
      <div className="search-container relative flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => suggestions.length > 0 && setShowSearchDropdown(true)}
            placeholder="Suche..."
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </form>

        {showSearchDropdown && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
              >
                <span>{suggestion.type === 'project' ? '📁' : suggestion.type === 'task' ? '✅' : suggestion.type === 'context' ? '📝' : '🤖'}</span>
                <span className="flex-1">{suggestion.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm">Bot Status:</span>
          <div className={`w-3 h-3 rounded-full ${statusColors[botStatus]}`} />
          <span className="text-sm capitalize">{botStatus}</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setUserDropdown(!userDropdown)}
            className="flex items-center gap-2 hover:bg-primary-600 px-3 py-2 rounded"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span>{user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <span>{user?.username || 'OpenClaw User'}</span>
          </button>
          
          {userDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50">
              <button onClick={() => navigate('/settings')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Einstellungen</button>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}