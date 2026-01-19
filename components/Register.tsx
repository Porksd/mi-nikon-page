import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Profile creation is handled by the database trigger on auth.users insert

        // Navigate to account or show success message
        // For now, assume auto-login behaviour or redirect to login
        alert('Registro exitoso. Por favor verifica tu correo si es necesario o inicia sesión.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.message || 'Error al registrarse');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-nikon-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900 blur-[150px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg bg-nikon-surface border border-nikon-border rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Crea tu Nikon ID</h1>
          <p className="text-nikon-text text-sm mt-2 text-center">Únete a la comunidad y accede a beneficios exclusivos.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-300">Nombre</label>
              <input
                name="firstName" type="text" required onChange={handleChange}
                className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-gray-300">Apellido</label>
              <input
                name="lastName" type="text" required onChange={handleChange}
                className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-300">Teléfono Móvil</label>
            <input
              name="phone" type="tel" placeholder="+569..." required onChange={handleChange}
              className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-300">Correo Electrónico</label>
            <input
              name="email" type="email" required onChange={handleChange}
              className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-gray-300">Contraseña</label>
            <input
              name="password" type="password" required onChange={handleChange}
              className="h-12 rounded-lg bg-nikon-dark border border-nikon-border px-4 text-white focus:border-nikon-yellow focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input type="checkbox" id="terms" required className="rounded bg-nikon-dark border-nikon-border text-nikon-yellow focus:ring-nikon-yellow" />
            <label htmlFor="terms" className="text-xs text-nikon-text">Acepto los <a href="#" className="underline">Términos y Condiciones</a> y la Política de Privacidad.</label>
          </div>

          <button type="submit" className="h-12 bg-nikon-yellow text-black font-bold rounded-lg mt-4 hover:bg-[#d9ad0b] transition-colors">
            Crear Cuenta
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-nikon-border text-center">
          <p className="text-nikon-text text-sm">
            ¿Ya tienes cuenta? <Link to="/login" className="text-white font-bold hover:text-nikon-yellow transition-colors">Ingresa aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;