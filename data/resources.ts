import { Camera, Zap, Aperture, Image as ImageIcon } from 'lucide-react';

export const RESOURCES_DB = [
    // CAMERAS - REFLEX (DSLR)
    {
        type: 'camera',
        icon: 'Camera',
        category: 'dslr',
        keywords: ['d850', 'd750', 'd7500', 'd500', 'd6', 'd5', 'd3500', 'd5600', 'reflex', 'dslr'],
        title: 'Dominando tu Nikon Reflex',
        description: 'Sumérgete en el sistema de menús y bancos de configuración personalizados de tu DSLR.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/d850-tips-tricks.html',
        image: '/images/resources/dslr-tips.jpg' 
    },
    {
        type: 'camera',
        icon: 'Camera',
        category: 'dslr',
        keywords: ['d7500', 'd500', 'dx'],
        title: 'Ventajas del Formato DX para Vida Silvestre',
        description: 'Por qué el factor de recorte de tu D500/D7500 es un superpoder para el teleobjetivo.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/dx-format-advantages.html',
        image: '/images/resources/dx-wildlife.jpg'
    },
    
    // CAMERAS - MIRRORLESS (Z Series)
    {
        type: 'camera',
        icon: 'Camera',
        category: 'mirrorless',
        keywords: ['z9', 'z8', 'z 9', 'z 8'],
        title: 'Configurando el Seguimiento 3D para Deportes',
        description: 'Saca el máximo provecho al avanzado sistema de enfoque automático de tu Z8/Z9.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/focus-modes.html',
        image: '/images/resources/z9-autofocus.jpg'
    },
    {
        type: 'camera',
        icon: 'Camera',
        category: 'mirrorless',
        keywords: ['z6', 'z7', 'z5', 'z50', 'zfc', 'z30', 'mirrorless', 'z series'],
        title: 'Transición al Visor Electrónico',
        description: 'Consejos para usuarios de DSLR que se cambian al sistema EVF de la serie Z.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/evf-benefits.html',
        image: '/images/resources/z7-evf.jpg'
    },
     {
        type: 'camera',
        icon: 'Camera',
        category: 'mirrorless',
        keywords: ['z8', 'video'],
        title: 'Flujo de Trabajo de Video N-RAW',
        description: 'Cómo grabar y editar video 8K N-RAW con la Nikon Z8.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/video-raw.html',
        image: '/images/resources/z8-video.jpg'
    },

    // CAMERAS - COMPACT
    {
        type: 'camera',
        icon: 'Camera',
        category: 'compact',
        keywords: ['p1000', 'p950', 'coolpix'],
        title: 'Fotografía Lunar con Superzoom',
        description: 'Usando el zoom equivalente a 3000mm de la P1000 para capturar detalles lunares.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/moon-photography.html',
        image: '/images/resources/moon-shot.jpg'
    },

    // LENSES
    {
        type: 'lens',
        icon: 'Aperture',
        keywords: ['50mm', '85mm', '1.8', '1.2', 'prime'],
        title: 'Entendiendo la Profundidad de Campo',
        description: 'Cómo la apertura afecta el desenfoque del fondo (bokeh) con lentes prime.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/depth-of-field.html',
        image: '/images/resources/depth-of-field.jpg'
    },
    {
        type: 'lens',
        icon: 'Aperture',
        keywords: ['70-200', '100-400', '180-600', 'telephoto', 'zoom'],
        title: 'Efecto de Compresión en Paisajes',
        description: 'Usando teleobjetivos para acercar los elementos del fondo.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/lens-compression.html',
        image: '/images/resources/lens-compression.jpg'
    },
    {
        type: 'lens',
        icon: 'Aperture',
        keywords: ['macro', '105mm', '50mm micro', 'mc'],
        title: 'Iluminación para Macrofotografía',
        description: 'Técnicas de iluminación esenciales para el trabajo de primer plano.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/macro-lighting.html',
        image: '/images/resources/macro-lighting.jpg'
    },

    // FLASHES (Speedlights)
    {
        type: 'flash',
        icon: 'Zap',
        keywords: ['sb-5000', 'sb-700', 'flash', 'speedlight'],
        title: 'Conceptos Básicos de Flash Fuera de Cámara',
        description: 'Llevando tu flash fuera de la zapata para retratos dramáticos.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/off-camera-flash.html',
        image: '/images/resources/flash-basics.jpg'
    },
    {
        type: 'flash',
        icon: 'Zap',
        keywords: ['sb-5000', 'wireless'],
        title: 'Iluminación Controlada por Radio',
        description: 'Domina el sistema de iluminación inalámbrica avanzada de Nikon.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/a/tips-and-techniques/radio-control-flash.html',
        image: '/images/resources/radio-flash.jpg'
    }
];
