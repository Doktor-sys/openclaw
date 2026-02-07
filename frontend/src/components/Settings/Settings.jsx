import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    serverConfig: {
      host: 'localhost',
      port: 3001
    },
    apiKeys: {
      openai: '',
      anthropic: '',
      supabase: ''
    },
    notifications: {
      enabled: true,
      email: false,
      browser: true
    }
  })

  const updateSetting = (category, field, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [field]: value
      }
    })
  }

  const saveSettings = () => {
    console.log('Settings saved:', settings)
    alert('Einstellungen gespeichert!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Einstellungen</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Server Konfiguration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              <input
                type="text"
                value={settings.serverConfig.host}
                onChange={(e) => updateSetting('serverConfig', 'host', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={settings.serverConfig.port}
                onChange={(e) => updateSetting('serverConfig', 'port', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API-Schlüssel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Key</label>
              <input
                type="password"
                value={settings.apiKeys.openai}
                onChange={(e) => updateSetting('apiKeys', 'openai', e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anthropic API Key</label>
              <input
                type="password"
                value={settings.apiKeys.anthropic}
                onChange={(e) => updateSetting('apiKeys', 'anthropic', e.target.value)}
                placeholder="sk-ant-..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supabase URL</label>
              <input
                type="text"
                value={settings.apiKeys.supabase}
                onChange={(e) => updateSetting('apiKeys', 'supabase', e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Benachrichtigungen</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-gray-700">Benachrichtigungen aktivieren</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-gray-700">E-Mail Benachrichtigungen</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notifications.browser}
                onChange={(e) => updateSetting('notifications', 'browser', e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
              <span className="text-gray-700">Browser-Benachrichtigungen</span>
            </label>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}