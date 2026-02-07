import BotControl from '../BotControl/BotControl'

export default function Overview() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Übersicht</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Aktive Projekte</div>
          <div className="text-4xl font-bold text-primary-600 mt-2">3</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Offene Aufgaben</div>
          <div className="text-4xl font-bold text-yellow-600 mt-2">12</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Abgeschlossene Aufgaben</div>
          <div className="text-4xl font-bold text-green-600 mt-2">28</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Aktuelle Aktivitäten</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Bot hat Aufgabe "Datenanalyse" abgeschlossen</span>
            <span className="text-gray-400 text-sm ml-auto">vor 5 Min</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Neues Projekt "Dashboard" erstellt</span>
            <span className="text-gray-400 text-sm ml-auto">vor 15 Min</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Kontext "Memory.md" aktualisiert</span>
            <span className="text-gray-400 text-sm ml-auto">vor 1 Stunde</span>
          </div>
        </div>
      </div>
      
      <BotControl />
    </div>
  )
}