import { Camera, Zap, Aperture, Image as ImageIcon } from 'lucide-react';

export const RESOURCES_DB = [
    // CAMERAS - REFLEX (DSLR)
    {
        type: 'camera',
        icon: 'Camera',
        category: 'dslr',
        keywords: ['d850', 'd750', 'd7500', 'd7200', 'd7100', 'd500', 'd6', 'd5', 'd3500', 'd5600', 'reflex', 'dslr'],
        title: 'Dominando tu Nikon Reflex',
        description: 'Sumérgete en el sistema de menús y bancos de configuración personalizados de tu DSLR.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/sugerencias-y-tecnicas/la-importancia-de-control-de-imagen',
        image: '/images/resources/dslr-tips.jpg' 
    },
    {
        type: 'camera',
        icon: 'Camera',
        category: 'dslr',
        keywords: ['d7500', 'd7200', 'd500', 'dx'],
        title: 'Ventajas del Formato DX para Vida Silvestre',
        description: 'Por qué el factor de recorte de tu D500/D7500 es un superpoder para el teleobjetivo.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/ideas-e-inspiraciones/prueba-de-campo-por-el-camino-con-un-nikkor-ideal-para-viajar',
        image: '/images/resources/dx-wildlife.jpg'
    },
    
    // CAMERAS - MIRRORLESS (Z Series)
    {
        type: 'camera',
        icon: 'Camera',
        category: 'mirrorless',
        keywords: ['z9', 'z8', 'z7', 'z6', 'z5', 'z50', 'zfc', 'z30'],
        title: 'Configurando el Seguimiento 3D para Deportes',
        description: 'Saca el máximo provecho al avanzado sistema de enfoque automático de tu Z8/Z9.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/productos-e-innovacion/actualizacion-del-firmware-del-z-9-para-fotografos-de-aves',
        image: '/images/resources/z9-autofocus.jpg'
    },
    {
        type: 'camera',
        icon: 'Camera',
        category: 'mirrorless',
        keywords: ['z6', 'z7', 'z5', 'z50', 'zfc', 'z30'],
        title: 'Transición al Visor Electrónico',
        description: 'Consejos para usuarios de DSLR que se cambian al sistema EVF de la serie Z.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/productos-e-innovacion/sistema-nikon-z-visor-electronico-evf',
        image: '/images/resources/z7-evf.jpg'
    },
     {
        type: 'camera',
        icon: 'Camera',
        category: 'mirrorless',
        keywords: ['z8', 'z9', 'z6'],
        title: 'Flujo de Trabajo de Video N-RAW',
        description: 'Cómo grabar y editar video 8K N-RAW con la Nikon Z8.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/productos-e-innovacion/entendiendo-el-modo-de-enfoque-manual-lineal-en-nikon-mirrorless',
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
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/sugerencias-y-tecnicas/como-fotografiar-la-via-lactea',
        image: '/images/resources/moon-shot.jpg'
    },

    // LENSES
    {
        type: 'lens',
        icon: 'Aperture',
        keywords: ['50mm', '85mm', '1.8', '1.2', 'prime', 'nikkor'],
        title: 'Entendiendo la Profundidad de Campo',
        description: 'Cómo la apertura afecta el desenfoque del fondo (bokeh) con lentes prime.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/sugerencias-y-tecnicas/la-primavera-es-el-momento-ideal-para-tomar-retratos',
        image: '/images/resources/depth-of-field.jpg'
    },
    {
        type: 'lens',
        icon: 'Aperture',
        keywords: ['70-200', '100-400', '180-600', '18-140', '18-200', 'telephoto', 'zoom', 'teleobjetivo'],
        title: 'Efecto de Compresión en Paisajes',
        description: 'Usando teleobjetivos para acercar los elementos del fondo.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/ideas-e-inspiraciones/fotografia-de-exposiciones-prolongadas',
        image: '/images/resources/lens-compression.jpg'
    },
    {
        type: 'lens',
        icon: 'Aperture',
        keywords: ['macro', '105mm', '50mm micro', 'mc', 'objetivo'],
        title: 'Iluminación para Macrofotografía',
        description: 'Técnicas de iluminación esenciales para el trabajo de primer plano.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/sugerencias-y-tecnicas/una-toma-calle-comercial',
        image: '/images/resources/macro-lighting.jpg'
    },

    // FLASHES (Speedlights)
    {
        type: 'flash',
        icon: 'Zap',
        keywords: ['sb-5000', 'sb-700', 'flash', 'speedlight'],
        title: 'Conceptos Básicos de Flash Fuera de Cámara',
        description: 'Llevando tu flash fuera de la zapata para retratos dramáticos.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/sugerencias-y-tecnicas/los-principios-basicos-de-la-fotografia-con-flash',
        image: '/images/resources/flash-basics.jpg'
    },
    {
        type: 'flash',
        icon: 'Zap',
        keywords: ['sb-5000', 'wireless'],
        title: 'Iluminación Controlada por Radio',
        description: 'Domina el sistema de iluminación inalámbrica avanzada de Nikon.',
        url: 'https://www.nikoncenter.cl/learn-and-explore/notas/productos-e-innovacion/serie-z-de-nikon-adaptador-de-montura-ftz',
        image: '/images/resources/radio-flash.jpg'
    }
];

