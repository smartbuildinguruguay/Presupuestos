# Web Smart Building Uruguay · prototipo v0

Lobby comercial: buscador (por uso o por m²), un modelo a la vez con visor 3D de Sketchfab bajo demanda, configurador de revestimiento exterior con presupuesto dinámico, planta técnica y cierre por WhatsApp.

- `index.html` — la página.
- `modelos.js` — **único archivo de datos**: precios, opciones de revestimiento, los 6 modelos y las plantas.
- Link directo a un modelo: agregar `#id` al final (ej. `#smartrancho` para el reel de Pueblo Garzón).
- Modo diagnóstico de materiales: agregar `?diag` a la URL, abrir el 3D y tocar cada material para pintarlo de rojo; el nombre del que se pinta en la fachada va en `fachadaMat` de ese modelo.
