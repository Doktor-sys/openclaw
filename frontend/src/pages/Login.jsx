import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await AuthService.login(username, password);
      AuthService.setAuth(response.token, response.user);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.error || 'Anmeldung fehlgeschlagen');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary-700">OpenClaw</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ihr Benutzername"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ihr Passwort"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Anmeldung...' : 'Anmelden'}
          </button>

          <div className="text-center text-sm text-gray-600">
            Noch kein Konto?{' '}
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Registrieren
            </button>
          </div>

          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <p className="font-medium mb-1">Demo-Zugang:</p>
            <p>Benutzername: <span className="font-mono bg-white px-2 py-1 rounded">admin</span></p>
            <p>Passwort: <span className="font-mono bg-white px-2 py-1 rounded">admin123</span></p>
          </div>
        </form>
      </div>
    </div>
  );
}