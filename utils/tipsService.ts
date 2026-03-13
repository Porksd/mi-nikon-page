// Tips fotográficos extraídos de "Conceptos Básicos de la Fotografía - Nikon School"

export interface PhotoTip {
  id: number;
  title: string;
  content: string;
  category: 'Composición' | 'Técnica' | 'Iluminación' | 'Equipo';
}

export const PHOTO_TIPS: PhotoTip[] = [
  {
    id: 1,
    title: "La Regla de los Tercios",
    content: "Divide tu imagen con dos líneas horizontales y dos verticales. Coloca el sujeto en una de las intersecciones para crear una composición más equilibrada y dinámica.",
    category: "Composición"
  },
  {
    id: 2,
    title: "El Triángulo de Exposición",
    content: "Controla la luz de tus fotos equilibrando tres factores: Apertura (profundidad de campo), Velocidad (congelado o movimiento) e ISO (sensibilidad digital).",
    category: "Técnica"
  },
  {
    id: 3,
    title: "¿Qué es la Apertura (f/)?",
    content: "Un número f/ más bajo (ej. f/1.8) abre más el lente, dejando entrar más luz y creando un fondo desenfocado (bokeh) ideal para retratos.",
    category: "Equipo"
  },
  {
    id: 4,
    title: "Velocidad de Obturación",
    content: "Para congelar la acción (como deportes), usa velocidades rápidas (1/500 seg o más). Para efectos de seda en el agua, usa velocidades lentas (1 seg o más) con trípode.",
    category: "Técnica"
  },
  {
    id: 5,
    title: "Sensibilidad ISO",
    content: "En días soleados usa un ISO bajo (100-200) para máxima calidad. En interiores con poca luz, sube el ISO, pero ten cuidado con el 'ruido' o grano en la imagen.",
    category: "Técnica"
  },
  {
    id: 6,
    title: "Enfoque al Ojo (Eye AF)",
    content: "Si tienes una Nikon Serie Z, activa el Enfoque al Ojo. La cámara seguirá automáticamente la mirada de tu sujeto, asegurando retratos siempre nítidos.",
    category: "Equipo"
  },
  {
    id: 7,
    title: "Usa la 'Hora Dorada'",
    content: "La luz justo después del amanecer o justo antes del atardecer es suave y cálida, reduciendo sombras duras y dando un aspecto profesional a tus paisajes.",
    category: "Iluminación"
  },
  {
    id: 8,
    title: "Líneas de Guía",
    content: "Utiliza caminos, cercas o edificios para guiar la mirada del espectador hacia el centro de interés de tu fotografía.",
    category: "Composición"
  },
  {
    id: 9,
    title: "Profundidad de Campo",
    content: "Para paisajes, cierra tu apertura (f/8 a f/11). Así conseguirás que tanto el frente como el fondo de la imagen se vean perfectamente enfocados.",
    category: "Composición"
  },
  {
    id: 10,
    title: "Balance de Blancos (WB)",
    content: "Si tus fotos se ven muy azules o muy naranja, ajusta el WB. La mayoría de las veces el modo 'Luz de Día' o 'Nublado' da resultados más naturales que el Auto.",
    category: "Técnica"
  }
];

export const getRandomTip = (): PhotoTip => {
  return PHOTO_TIPS[Math.floor(Math.random() * PHOTO_TIPS.length)];
};
