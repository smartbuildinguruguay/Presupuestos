/* =====================================================================
   SMART BUILDING URUGUAY · catálogo de modelos
   Este es el único archivo que hay que tocar para cargar datos.
   Todo lo marcado con  pendiente: [...]  se muestra en la web como
   "a confirmar" hasta que se complete.
   ===================================================================== */

window.SBU = {
  // Contacto (pendiente: confirmar número e Instagram)
  whatsapp: '598XXXXXXXX',          // sin + ni espacios, ej. 59899123456
  instagram: 'smartbuildinguruguay',
  // Precios de referencia (USD). PENDIENTE: confirmar con Ramiro.
  precio: {
    m2Base: 1500,        // llave en mano, sin terreno
    m2Deck: 220,         // deck de madera
    plazoMeses: m2 => m2 <= 30 ? 2 : m2 <= 80 ? 4 : m2 <= 150 ? 6 : 8,
  },

  // Revestimiento exterior: delta en USD por m² de fachada respecto del base
  exterior: [
    { id:'original', nombre:'Como en el render', delta:0, nota:'La terminación del proyecto' },
    { id:'pino',     nombre:'Siding pino tratado', delta:0,  tex:'pino',   nota:'Machimbre horizontal, impregnado CCA' },
    { id:'lapacho',  nombre:'Lapacho',             delta:45, tex:'lapacho',nota:'Madera dura, sin mantenimiento pesado' },
    { id:'chapa',    nombre:'Chapa acanalada negra',delta:12, tex:'chapa', nota:'Moderna, cero mantenimiento' },
    { id:'eifs',     nombre:'Revoque EIFS blanco',  delta:28, tex:'eifs',  nota:'Aislación exterior + revoque fino' },
  ],
  // Etapa 2 (se muestran como "próximamente" si activo:false)
  interior: { activo:false, opciones:[
    { id:'yeso', nombre:'Placa de yeso pintada', delta:0 },
    { id:'machimbre', nombre:'Machimbre de pino', delta:18 },
  ]},
  pisos: { activo:false, opciones:[
    { id:'porcelanato', nombre:'Porcelanato 60×60', delta:0 },
    { id:'vinilico', nombre:'Vinílico símil madera', delta:-8 },
    { id:'madera', nombre:'Deck interior de madera', delta:35 },
  ]},

  modelos: [
    {
      id:'smartrancho', nombre:'SmartRancho', lugar:'Pueblo Garzón',
      uid:'e934a307daf5473390842989337887c9',
      thumb:'https://media.sketchfab.com/models/e934a307daf5473390842989337887c9/thumbnails/04063cbb7f084237ad39dbb001cd3eb0/7707b671eec44ad48d48a4a02bacc26b.jpeg',
      m2:130, deck:0, dorm:3, banos:2,
      usos:['vivir','finde'],
      frase:'130 m² en una planta, a dos aguas. La casa de campo pensada para quedarse.',
      fachadaMat:[], // pendiente: nombre del material de fachada en Sketchfab
      pendiente:['dormitorios','baños','material de fachada en el 3D'],
    },
    {
      id:'polo-club', nombre:'Polo Club', lugar:'',
      uid:'768fe248c0ab48c4a5e751069cfac16e',
      thumb:'https://media.sketchfab.com/models/768fe248c0ab48c4a5e751069cfac16e/thumbnails/f79f206c5a0640249f900f7dc36d6c0a/bf70661917974127a5989672fe347210.jpeg',
      m2:125, deck:100, dorm:3, banos:2,
      usos:['vivir','finde','renta'],
      frase:'125 m² cubiertos y 100 m² de decks. La vida pasa afuera.',
      fachadaMat:[],
      pendiente:['dormitorios','baños','material de fachada en el 3D'],
    },
    {
      id:'el-tesoro', nombre:'El Tesoro', lugar:'La Barra · obra en curso',
      uid:'b689b59e6bec4f85b9e1716dbd01b4e0',
      thumb:'https://media.sketchfab.com/models/b689b59e6bec4f85b9e1716dbd01b4e0/thumbnails/8ce6b3f265e04424b2f87cd2619d4c10/80e4e848ef704f42aebd25f625a3fb10.jpeg',
      m2:90, deck:0, dorm:2, banos:1,
      usos:['vivir'],
      frase:'Steel frame en obra hoy en La Barra. Lo que ves es lo que se está construyendo.',
      fachadaMat:[],
      pendiente:['m²','dormitorios','material de fachada en el 3D'],
    },
    {
      id:'eden-rock', nombre:'Eden Rock', lugar:'Maldonado',
      uid:'65cc5fcecf2548a1a1cfc5bc58159a7f',
      thumb:'',
      m2:194, deck:0, dorm:3, banos:2,
      usos:['vivir'],
      frase:'Nave principal a dos aguas con cerchas de madera a la vista.',
      fachadaMat:['*7'], // confirmado en el configurador de Eden Rock
      pendiente:['qué propuesta mostrar (P1 194 m² / P2 152 m²)','dormitorios','baños'],
    },
    {
      id:'smarthouse', nombre:'SmartHouse 1.1', lugar:'',
      uid:'b7f33d6cf36b4e5894edaa0f61249d58',
      thumb:'https://media.sketchfab.com/models/b7f33d6cf36b4e5894edaa0f61249d58/thumbnails/93e3680dbc444052b5fb1a8f26353f77/b2867ad157d2498dba19f1ee69c7f8e9.jpeg',
      m2:45, deck:0, dorm:1, banos:1,
      usos:['empezar','finde','renta'],
      frase:'Compacta y completa. Para empezar y crecer después.',
      fachadaMat:[],
      pendiente:['m²','dormitorios','material de fachada en el 3D'],
    },
    {
      id:'smartbnb', nombre:'SmartBnB', lugar:'',
      uid:'4539fe80c8224ae09a8e3849e97741e6',
      thumb:'https://media.sketchfab.com/models/4539fe80c8224ae09a8e3849e97741e6/thumbnails/3bcb1cad05dc4cdea5a44d92cfe3613b/d294131b14704844b0b0864e9ed5d124.jpeg',
      m2:18, deck:0, dorm:1, banos:1,
      usos:['renta','empezar'],
      frase:'18 m² equipados para alquilar desde el primer mes.',
      fachadaMat:[],
      planta:'smartbnb',   // planta de ejemplo cargada abajo
      pendiente:['material de fachada en el 3D','planta real'],
    },
  ],

  /* Plantas técnicas. Unidades en metros, origen arriba a la izquierda,
     x hacia la derecha, y hacia abajo. Muros exteriores e = 0,15. */
  plantas: {
    smartbnb: {
      ejemplo:true,
      ancho:6.0, prof:3.0, eExt:0.15, eInt:0.10,
      muros:[ // interiores [x1,y1,x2,y2]
        [1.55,0,1.55,1.85],[0,1.85,1.55,1.85],
      ],
      puertas:[ // {m:'S'|'N'|'E'|'O'|[x1,y1,x2,y2], en: distancia desde inicio, a: ancho, giro: 1|-1}
        {m:'S', en:2.30, a:0.90, giro:1},
        {m:[0,1.85,1.55,1.85], en:0.55, a:0.70, giro:-1},
      ],
      ventanas:[ {m:'N',en:4.30,a:1.20},{m:'E',en:0.90,a:1.20},{m:'S',en:4.40,a:1.40},{m:'O',en:2.20,a:0.60} ],
      equip:[
        {t:'mesada',x:1.65,y:0,w:1.90,h:0.60},
        {t:'cama',x:4.05,y:0.45,w:1.60,h:2.00},
        {t:'inodoro',x:0.25,y:0.05},{t:'ducha',x:0.70,y:0.05,w:0.80,h:0.80},{t:'lav',x:0.10,y:1.25},
      ],
      locales:[
        {n:'Baño',x:1.05,y:1.45,a:2.6},
        {n:'Estar · cocina',x:2.75,y:1.75,a:7.9},
        {n:'Dormitorio',x:4.85,y:2.70,a:5.4},
      ],
      cotasX:[0,1.55,4.0,6.0], cotasY:[0,1.85,3.0],
    },
  },
};
