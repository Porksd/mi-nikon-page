import React, { useState, useEffect } from 'react';
import { X, Gift, User, Phone, Calendar, Instagram, Facebook } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface ProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  missingFields: string[];
}

const ProfileCompletionModal: React.FC<ProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  missingFields
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    birthday: '',
    instagram: '',
    facebook: '',
    tiktok: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile data
  useEffect(() => {
    if (isOpen) {
      loadProfileData();
    }
  }, [isOpen]);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          birthday: profile.birthday || '',
          instagram: profile.instagram || '',
          facebook: profile.facebook || '',
          tiktok: profile.tiktok || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (missingFields.includes('full_name') && !formData.full_name.trim()) {
        setError('Por favor ingresa tu nombre completo');
        setIsSubmitting(false);
        return;
      }

      if (missingFields.includes('phone') && !formData.phone.trim()) {
        setError('Por favor ingresa tu teléfono');
        setIsSubmitting(false);
        return;
      }

      if (missingFields.includes('birthday') && !formData.birthday) {
        setError('Por favor ingresa tu fecha de nacimiento');
        setIsSubmitting(false);
        return;
      }

      // Call the update function
      const { data, error: updateError } = await supabase.rpc('update_profile_with_completion', {
        p_full_name: formData.full_name || null,
        p_phone: formData.phone || null,
        p_birthday: formData.birthday || null,
        p_instagram: formData.instagram || null,
        p_facebook: formData.facebook || null,
        p_tiktok: formData.tiktok || null
      });

      if (updateError) throw updateError;

      if (data?.success) {
        onComplete();
        onClose();
      } else {
        setError(data?.error || 'Error al actualizar perfil');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Gift className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  ¡Completa tu perfil!
                </h3>
                <p className="text-sm text-neutral-400 mt-1">
                  Obtén un descuento especial en tu cumpleaños
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Benefits info */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              🎁 <strong>Beneficios exclusivos:</strong>
            </p>
            <ul className="text-xs text-yellow-300/80 mt-2 space-y-1 ml-4 list-disc">
              <li>Descuento especial en tu mes de cumpleaños</li>
              <li>Recomendaciones personalizadas de productos</li>
              <li>Acceso prioritario a talleres y eventos</li>
            </ul>
          </div>

          {/* Full Name */}
          {missingFields.includes('full_name') && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                placeholder="Juan Pérez"
                required
              />
            </div>
          )}

          {/* Phone */}
          {missingFields.includes('phone') && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                placeholder="+56 9 1234 5678"
                required
              />
            </div>
          )}

          {/* Birthday */}
          {missingFields.includes('birthday') && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
                required
              />
              <p className="text-xs text-neutral-400 mt-1">
                Para ofrecerte un descuento especial en tu mes 🎂
              </p>
            </div>
          )}

          {/* Social Media (optional) */}
          <div className="border-t border-neutral-800 pt-4">
            <p className="text-sm font-medium text-neutral-300 mb-3">
              Redes Sociales (opcional)
            </p>

            {/* Instagram */}
            <div className="mb-3">
              <label className="block text-xs text-neutral-400 mb-1">
                <Instagram className="w-3 h-3 inline mr-1" />
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                placeholder="@usuario"
              />
            </div>

            {/* Facebook */}
            <div className="mb-3">
              <label className="block text-xs text-neutral-400 mb-1">
                <Facebook className="w-3 h-3 inline mr-1" />
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                placeholder="usuario"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs text-neutral-400 mb-1">
                TikTok
              </label>
              <input
                type="text"
                value={formData.tiktok}
                onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-500"
                placeholder="@usuario"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-2 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar y Obtener Beneficios'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-neutral-400 text-sm py-2 hover:text-white transition-colors"
            >
              Lo haré más tarde
            </button>
          </div>

          <p className="text-xs text-neutral-500 text-center">
            * Campos requeridos para completar tu perfil
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionModal;
