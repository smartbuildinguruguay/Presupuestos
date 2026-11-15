# Nave 1 · Estructura y vanos (anteproyecto de cálculo)
Padrón 10598 nave 1 · Av. Pedragosa Sierra · SBU · Ramiro Portugau
Base: `ESTRUCTURA__ABERTURAS.glb` (HEB 240, correas, clavaderas, aberturas y cruces).
Coordenadas del DAE = las de tu modelo de SketchUp (metros). Lado A = y 46.3 (z -46.3 en el GLB), lado B = y 35.0.

> **Alcance:** pre‑dimensionado para definir geometría y piezas. Los supuestos de abajo (viento, acero, tabla del panel) hay que confirmarlos antes de cortar acero. No reemplaza el cálculo firmado del ingeniero.

## 1. Supuestos
| Dato | Valor | Estado |
|---|---|---|
| Presión neta de viento sobre muros | 1,0 kPa (servicio), ×1,5 en estado último | **Supuesto**: confirmar con UNIT 50‑84 para Punta del Este |
| Acero | fy = 235 MPa | **Supuesto** (S235) |
| Flecha admisible | L/200 (servicio) | criterio |
| Panel ISOWALL PIR 80 mm (chapa 0,50/0,50, L/200) | Tabla aportada por Ramiro (kg/m²): 2 apoyos 3,0 m→180, 3,5→140, 4,0→110; 3 apoyos 3,0 m→225, 3,5→175, 4,0→138. Viento 1,0 kPa ≈ 102 kg/m² | Tabla no verificada contra catálogo Kingspan Uruguay; ver sección 3b |
| Peso panel pared | ≈ 0,13 kN/m² | estimado |
| Espesores de tubos del modelo | RHS 100×50×3, poste piñón 160×80×4 | **Supuesto**: el GLB trae cajas macizas, no hay espesor |
| Perfil de columnas y dinteles | HEB 240 (alma 10, alas 17) | leído de la geometría |

## 2. Qué encontré
1. **Clavaderas 100×50 con la cara de 50 mm hacia el viento.** Entre columnas (6,7 m) fallan por flecha incluso con 0,4 kPa (L/42) y por resistencia a partir de ~0,35 kPa. El hueco entre el ala exterior de la columna y la cara del panel es de solo 50 mm, así que ahí no entra una sección con canto.
2. **Las clavaderas se cortaban en cada abertura** y los extremos quedaban en el aire (lo que viste).
3. **Postes de piñón 160×80** (los montantes): con ~7,8 m de altura y 2,4 m de ancho tributario trabajan al 149 % y L/88. Hay que reforzarlos.
4. **Falta una viga horizontal en la cabeza de los vanos** de los muros largos. El tramo sobre aberturas (6,5 m entre columnas) no tenía nada que sostenga el panel de arriba ni reciba el viento de la carpintería.
5. **Pórticos HEB 240: sobrados.** Con gravedad (1,35 D + 1,5 L) el nudo de alero trabaja a ~46 kNm; con viento (1,5 W) a ~144 kNm. La capacidad elástica es 220 kNm, así que la utilización queda en ~21 % y ~65 %.
6. **Cruces: OK.** Son pletinas 50×8 (4 cm², Npl ≈ 94 kN). Con viento longitudinal ≈ 24 kN por vano de pared, el tensor trabaja a ~25 kN (utilización ≈ 0,27). No chocan con los vanos (arrancan en y = 3,10, el dintel nuevo termina en 3,00).

## 3. Solución adoptada
**Muros largos (lados A y B), paneles verticales, 3 líneas de apoyo**
- **Solera** RHS 100×50 sobre platea (y 0,05–0,15). Apoyo continuo, no trabaja a flexión.
- **Dintel de vano: perfil H IPE 200 acostado** (alma horizontal, alas verticales) a y = 2,95, entre columnas. Las alas quedan alineadas con las alas de la columna, así que el plano de apoyo de los paneles no cambia. Flexión horizontal 22 kNm sobre 46 kNm de capacidad (0,49). Con el peso propio en flexión biaxial: 0,72.
- **Viga de alero IPE 160 acostada** a y = 5,54. Es el apoyo superior del panel y además hace de puntal longitudinal para las cruces. Utilización 0,43 (0,72 biaxial).
- **Jambas tubulares RHS 100×50** del piso hasta el dintel en cada lado de puerta y ventana. Reciben las clavaderas y las soleras. Utilización 0,54, flecha L/206. En el lado B la jamba entre puerta y ventana es compartida (queda 23 cm de panel entre contramarcos).
- Se eliminan las clavaderas intermedias (y 1,25, 2,45, 3,65, 4,85): de 6 líneas a 3.

**Piñones (frente y fondo)**
- **Postes RHS 200×100×6** (en el plano de las alas, cara exterior a ras) en lugar de 160×80. Frente: 0,65 y L/254. Fondo (trib. 2,85 m): 0,77 y L/214.
- **Frente:** clavaderas RHS 120×60×4 a y = 2,95 (cabeza de la vidriera) y 4,36 (antepecho de la ventana alta), de 120 mm de canto hacia adentro, soldadas entre postes y columnas. Utilización 0,42, L/571. Jambas 100×50 a cada lado de la vidriera.
- **Fondo (sin aberturas):** una sola línea a y = 3,70 (antes dos). Paneles a ~3,7 m de luz. Clavadera con 3,7 m de ancho tributario: utilización 0,67, L/373.

## 3b. Paneles contra la tabla de carga
Presión de viento 1,0 kPa ≈ 102 kg/m² (servicio, L/200).
| Zona | Apoyos | Luz | Admisible | Utilización |
|---|---|---|---|---|
| Muros largos, solera→dintel | 3 (continuo) | 2,85 m | ≈ 245 | 0,42 |
| Muros largos, dintel→alero | 3 (continuo) | 2,6 m | ≈ 280 | 0,36 |
| Piñón fondo, 3,7 m | 3 (continuo) | 3,7 m | ≈ 160 | 0,64 |
| Panel sin línea intermedia (2 apoyos) a 4,0 m | 2 | 4,0 m | 110 | 0,93 |
El panel no gobierna: los muros largos aguantan hasta ~2,2 kPa. La zona de borde de esquina tiene presiones locales mayores; confirmar con la norma. Succión: verificar fijaciones.

## 4. Platinas de nudo
**Forma elegida: contorno ajustado a la estructura** (hexágono en el alero, "chevron" en la cumbrera), chapa de 12 mm a cada lado, soldada a los cantos de las alas (cierra el nudo en cajón).
- **Por qué no el rectángulo:** sobresale hasta 18 cm del contorno de la columna y deja esquinas que no cumplen función.
- **Por qué no el triángulo (cartela):** una cartela bajo la viga solo se justifica si el momento del nudo lo pide. Acá el HEB 240 trabaja al 21–65 %, así que no hace falta cartela de rodilla. Además, bajo el dintel no hay ala donde soldarla.
- **Alero:** patas de 0,60 m (columna) y 0,70 m (dintel) ≈ 2,5–2,9 veces el canto del perfil; corte perpendicular al dintel; esquina interior sin ángulo recto.
- **Cumbrera:** 0,60 m a cada lado, siguiendo ambos dinteles. El momento ahí es bajo (30–36 kNm), la platina es solo empalme.
- Falta definir soldadura (cordón continuo perimetral) y verificarla en el cálculo firmado.

## 5. Planilla de acero (elementos tocados)
| Grupo | Cant. | Longitud | kg |
|---|---|---|---|
| Platinas de nudo 12 mm | 24 | – | 702 |
| Dintel de vano IPE 200 | 6 | 39,6 m | 886 |
| Viga de alero IPE 160 | 6 | 39,3 m | 621 |
| Jambas RHS 100×50×3 | 17 | 52,2 m | 354 |
| Soleras RHS 100×50×3 | 11 | 36,6 m | 248 |
| Postes piñón RHS 200×100×6 | 6 | 41,8 m | 1.132 |
| Clavaderas piñón RHS 120×60×4 | 12 | 31,4 m | 339 |
| **Nuevo** | | | **4.282** |
| Retirado (clavaderas 343 m, montantes 43 m, platinas rectangulares) | | | ≈ 3.580 |
| **Neto** | | | **≈ +700 kg** |

Pesos con áreas nominales sin radios de esquina. Las platinas nuevas pesan unos 70 kg más que las viejas porque ahora cubren la unión de verdad.

## 6. Qué contiene el DAE
`Nave1_ESTRUCTURA_v2_vanos.dae` es la estructura completa (grupos con nombre). En **naranja** está lo nuevo; en gris lo existente.
- Sin cambios: Columnas HEB 240, Dinteles HEB 240 (sin las platinas viejas), Correas.
- Nuevo: Platinas, Vigas de vano IPE 200, Vigas de alero IPE 160, Jambas, Soleras, Postes de piñón, Clavaderas de piñón.
- No incluye aberturas ni cruces (no cambiaron). En SketchUp: borrar el grupo 02_02 actual e importar este.

## 7. Pendientes
1. Confirmar la presión de viento y que la tabla del ISOWALL 80 mm coincida con el catálogo del proveedor.
2. Confirmar espesores reales de tubos y calidad del acero.
3. Las chapas de los tensores se tocan 2–3 cm con las platinas en 4 nudos: se resuelve soldándolas a la platina.
4. Detalles de unión (vigas acostadas a columnas, jambas a dintel y platea) para el taller.
