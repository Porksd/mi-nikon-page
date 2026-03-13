import React, { useState } from 'react';
import { X, MessageSquare, Star, Send } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, userId }) => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<'general' | 'bug' | 'feature'>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('user_feedback').insert([{
        user_id: userId,
        message,
        rating: rating > 0 ? rating : null,
        category
      }]);

      if (error) throw error;
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setMessage('');
        setRating(0);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error al enviar comentarios. Por favor intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-nikon-surface border border-nikon-border rounded-xl w-full max-w-md relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          {!submitted ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-nikon-yellow/20 p-3 rounded-full">
                  <MessageSquare className="text-nikon-yellow" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Tu opinión nos importa</h2>
                  <p className="text-sm text-gray-400">Ayúdanos a mejorar Mi Nikon</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Categoría</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'general', label: 'General' },
                      { id: 'feature', label: 'Sugerencia' },
                      { id: 'bug', label: 'Problema' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          category === cat.id 
                            ? 'bg-nikon-yellow text-black font-bold' 
                            : 'bg-black/40 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Calificación (Opcional)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star 
                          size={24} 
                          className={star <= rating ? "fill-nikon-yellow text-nikon-yellow" : "text-gray-600"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Comentarios</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos tu experiencia o qué te gustaría ver en la app..."
                    className="w-full bg-black/40 border border-nikon-border rounded-lg p-3 text-white h-32 focus:border-nikon-yellow outline-none transition-colors resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="w-full bg-nikon-yellow text-black font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Comentarios <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="text-green-500" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¡Gracias!</h3>
              <p className="text-gray-300">Tus comentarios han sido recibidos.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
