import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!nombreCompleto.trim()) {
          setError('Por favor ingresa tu nombre completo');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, nombreCompleto);
        if (error) {
          setError(error.message === 'User already registered'
            ? 'Este correo ya está registrado'
            : 'Error al crear cuenta. Verifica tus datos.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message === 'Invalid login credentials'
            ? 'Credenciales inválidas'
            : 'Error al iniciar sesión. Verifica tus datos.');
        }
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img src="/xonting-logo.png" alt="Xonter" className="h-24 w-24 object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Xonter</h1>
          <p className="text-gray-400 text-lg">Sistema de Gestión Empresarial</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !isSignUp
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <LogIn className="inline-block w-5 h-5 mr-2" />
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                isSignUp
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <UserPlus className="inline-block w-5 h-5 mr-2" />
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  id="nombre"
                  type="text"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Lorenzo"
                  required
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-green-500 hover:from-cyan-600 hover:to-green-600 text-black'
              }`}
            >
              {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm">
          Sistema exclusivo para uso del propietario
        </p>
      </div>
    </div>
  );
}
