import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      alert(error.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-nikon-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-nikon-yellow blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-nikon-surface border border-nikon-border rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-nikon-yellow rounded-lg flex items-center justify-center mb-4 text-black">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Bienvenido de nuevo</h1>
          <p className="text-nikon-text text-sm mt-2">Ingresa a tu cuenta Nikon ID</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-300">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:ring-1 focus:ring-nikon-yellow focus:outline-none transition-colors"
              placeholder="nombre@ejemplo.com"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-300">Contraseña</label>
              <a href="#" className="text-xs text-nikon-yellow hover:underline">¿Olvidaste tu contraseña?</a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:ring-1 focus:ring-nikon-yellow focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="h-12 bg-nikon-yellow text-black font-bold rounded-lg mt-2 hover:bg-[#d9ad0b] transition-colors">
            Ingresar
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-nikon-border text-center">
          <p className="text-nikon-text text-sm">
            ¿No tienes una cuenta? <Link to="/register" className="text-white font-bold hover:text-nikon-yellow transition-colors">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;