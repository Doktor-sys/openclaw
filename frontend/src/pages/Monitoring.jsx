import { useState, useEffect } from 'react';
import StatsService from '../services/StatsService';

export default function Monitoring() {
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [overviewData, chartsData, healthData] = await Promise.all([
        StatsService.getOverview(),
        StatsService.getCharts(),
        StatsService.getHealth()
      ]);
      setOverview(overviewData);
      setCharts(chartsData);
      setHealth(healthData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getHealthColor = (status) => {
    return status === 'healthy' ? 'text-green-600' : 
           status === 'degraded' ? 'text-yellow-600' : 'text-red-600';
  };

  const getBarChart = (data, color = 'bg-blue-500') => {
    const max = Math.max(...data.map(d => d.value));
    return (
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className={`${color} rounded-t transition-all duration-500`}
              style={{ height: `${(item.value / max) * 100}%`, minHeight: '4px' }}
            ></div>
            <span className="text-xs text-gray-500 mt-1 truncate w-full text-center">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const getPieChart = (data) => {
    const total = data.reduce((acc, item) => acc + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="relative w-40 h-40 mx-auto">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const angle = (item.value / total) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (currentAngle * Math.PI) / 180;
            
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);
            
            const largeArc = angle > 180 ? 1 : 0;
            
            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={item.color || '#3b82f6'}
                className="transition-all duration-300 hover:opacity-80"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-gray-500">Gesamt</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Monitoring</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Laden...' : 'Aktualisieren'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'Übersicht' },
          { id: 'tasks', label: 'Aufgaben' },
          { id: 'performance', label: 'Performance' },
          { id: 'health', label: 'Gesundheit' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading && !overview ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Server Uptime</p>
                    <p className="text-2xl font-bold">{formatUptime(overview.server?.uptime || 0)}</p>
                  </div>
                  <div className="text-3xl">⏱️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Speicher</p>
                    <p className="text-2xl font-bold">{formatBytes(overview.server?.memoryUsage?.heapUsed || 0)}</p>
                  </div>
                  <div className="text-3xl">💾</div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all"
                    style={{ 
                      width: `${Math.round((overview.server?.memoryUsage?.heapUsed / overview.server?.memoryUsage?.heapTotal) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Uploads</p>
                    <p className="text-2xl font-bold">{overview.uploads?.total || 0}</p>
                  </div>
                  <div className="text-3xl">📤</div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{formatBytes(overview.uploads?.directorySize || 0)} verwendet</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Bot</p>
                    <p className="text-2xl font-bold">{overview.bot?.connected ? 'Online' : 'Offline'}</p>
                  </div>
                  <div className={`text-3xl ${overview.bot?.connected ? 'text-green-500' : 'text-gray-400'}`}>
                    🤖
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'overview' && charts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Aufgaben (7 Tage)</h3>
                {charts.tasksOverTime && getBarChart(charts.tasksOverTime, 'bg-green-500')}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Aktivität (7 Tage)</h3>
                {charts.activityOverTime && getBarChart(charts.activityOverTime, 'bg-blue-500')}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Aufgaben nach Status</h3>
                {charts.taskDistribution?.status && (
                  <div className="flex items-center justify-center">
                    {getPieChart(charts.taskDistribution.status.map((item, i) => ({
                      ...item,
                      color: ['#9ca3af', '#3b82f6', '#22c55e'][i]
                    })))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Aufgaben nach Priorität</h3>
                {charts.taskDistribution?.priority && (
                  <div className="flex items-center justify-center">
                    {getPieChart(charts.taskDistribution.priority)}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Aufgaben nach Status</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Offen', value: 3, color: 'bg-gray-500' },
                    { label: 'In Arbeit', value: 2, color: 'bg-blue-500' },
                    { label: 'Erledigt', value: 4, color: 'bg-green-500' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${item.color} rounded`}></div>
                      <span className="flex-1">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Aufgaben nach Priorität</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Hoch', value: 4, color: 'bg-red-500' },
                    { label: 'Mittel', value: 3, color: 'bg-yellow-500' },
                    { label: 'Niedrig', value: 2, color: 'bg-green-500' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${item.color} rounded`}></div>
                      <span className="flex-1">{item.label}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">System Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CPU Auslastung</span>
                    <span className="font-semibold">{overview?.server?.cpuUsage ? Math.round(overview.server.cpuUsage.user / 1000000) + '%' : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speicher Auslastung</span>
                    <span className="font-semibold">
                      {overview?.server?.memoryUsage 
                        ? Math.round((overview.server.memoryUsage.heapUsed / overview.server.memoryUsage.heapTotal) * 100) + '%'
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Request Gesamt</span>
                    <span className="font-semibold">{overview?.api?.totalRequests || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Fehler</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fehleranzahl</span>
                    <span className="font-semibold text-red-600">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fehlerrate</span>
                    <span className="font-semibold text-green-600">0%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && health && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">System Gesundheit</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${health.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {health.status === 'healthy' ? 'Gesund' : 'Beeinträchtigt'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(health.checks || {}).map(([key, check]) => (
                  <div key={key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-medium">{key}</span>
                      <span className={`text-lg ${check.status === 'healthy' ? '✅' : '⚠️'}`}></span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Status: <span className={getHealthColor(check.status)}>{check.status}</span>
                    </div>
                    {check.latency && (
                      <div className="text-sm text-gray-500">
                        Latenz: {check.latency}ms
                      </div>
                    )}
                    {check.usagePercent && (
                      <div className="text-sm text-gray-500">
                        Auslastung: {check.usagePercent}%
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Letzte Prüfung: {new Date(health.timestamp).toLocaleString('de-DE')}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
