# Web Smart Building Uruguay · prototipo

- `index.html` — la web pública: buscador, un modelo a la vez con 3D de Sketchfab bajo demanda, configurador de revestimiento, presupuesto y cierre por WhatsApp.
- `admin.html` — **tu panel**: cargar modelos, ver cómo se arma cada precio (rubros → costo/m² → imprevistos → margen), revestimientos, contacto y renders de portada. Guarda en GitHub con la misma clave que Eléctrica Sayago.
- `datos.json` — todos los datos. Lo escribe el panel; no hace falta tocarlo a mano.
- `precio.js` — la fórmula de precio, compartida por la web y el panel.
- `editor-3d.js`: pestaña "3D: partes y vistas" del panel (qué partes cambian con cada terminación y la vista de cámara de cada una).
- `editor-planos.js`: editor de plantas del panel (pestaña Planos): arrastrar muros, aberturas, muebles y ambientes.
- `dibujos.js`: planta y corte por la cercha de cada modelo, dibujados en SVG (web y panel).
- `texturas.js`: texturas de revestimiento (pino, lapacho, chapa, EIFS) que se pintan sobre las paredes del 3D. Las usan la web y el panel.
- `img/` — renders de portada que sube el panel.

Link directo a un modelo: `…/web/#smartrancho`. Diagnóstico de materiales del 3D: `…/web/?diag#modelo`.
