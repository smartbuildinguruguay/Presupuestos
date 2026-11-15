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

## 3c. Techo: correas de techo (4 apoyos por faldón)
Pedido: 4 líneas de correa por faldón (3 tramos de panel de ~1,86 m sobre la pendiente).
| Dato | Valor | Estado |
|---|---|---|
| Peso propio techo (panel + correa + fijaciones) | 0,20 kN/m² | Supuesto |
| Sobrecarga de mantenimiento | 0,30 kN/m² en planta | Supuesto |
| Succión de viento | 0,8 kPa campo / 1,5 kPa borde (alero y cumbrera) | Supuesto, confirmar con UNIT 50‑84 |
| Luz de correa | 7,0 m, tramo continuo de 3 vanos | Del modelo |

- **Perfil:** C galvanizado 250×75×25×2,5 mm (8,6 kg/m) en las 8 líneas, mismo canto para que el plano del panel quede parejo. Campo: utilización 0,60; borde: 0,75; flecha > L/450. Propiedades del C calculadas con fórmula (sección efectiva ×0,85), **sin catálogo**.
- **Posición:** web normal a la pendiente, apoyada sobre el ala superior del dintel; alas hacia la cumbrera. Líneas a 0, 1,86, 3,71 y 5,57 m sobre la pendiente.
- **Por qué C y no tubo rectangular:** a igual resistencia el C pesa menos (≈ 8,6 kg/m contra ≈ 18 kg/m del RHS 200×100×4).
- **Tirantillas:** con succión el ala inferior queda libre. Poner una o dos tirantillas por tramo (a tercios de luz).
- **Tensores del techo:** en el modelo estaban 3–8 cm sobre el dintel, justo en la zona de las correas. Los bajé 15 cm (pasan por el alma del dintel, bajo las correas). Van en el DAE.
- **Falta:** la tabla del ISODEC 80 mm para confirmar que el panel admite ~1,9 m entre apoyos con esas cargas (mucho margen esperable, no verificado).

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
| Correas de techo C 250×75×25×2,5 | 8 | 167 m | 1.444 |
| **Nuevo** | | | **5.726** |
| Retirado (clavaderas 343 m, montantes 43 m, platinas rectangulares) | | | ≈ 3.580 |
| **Neto sin correas** | | | **≈ +700 kg** |

Las correas viejas (12 líneas, cajas macizas en el modelo) no tienen espesor definido, por eso no calculo su peso retirado.

Pesos con áreas nominales sin radios de esquina. Las platinas nuevas pesan unos 70 kg más que las viejas porque ahora cubren la unión de verdad.

## 6. Qué contiene el DAE
`Nave1_ESTRUCTURA_v2_vanos.dae` es la estructura completa (grupos con nombre). En **naranja** está lo nuevo; en gris lo existente.
- Sin cambios: Columnas HEB 240, Dinteles HEB 240 (sin las platinas viejas), tensores de muros.
- Nuevo: Platinas, Vigas de vano IPE 200, Vigas de alero IPE 160, Jambas, Soleras, Postes de piñón, Clavaderas de piñón, Correas de techo C 250, Tensores de techo bajados.
- No incluye aberturas. En SketchUp: borrar el grupo 02_02 y el grupo Cruces actuales e importar este.

## 7. Pendientes
1. Confirmar la presión de viento y que la tabla del ISOWALL 80 mm coincida con el catálogo del proveedor.
2. Confirmar espesores reales de tubos y calidad del acero.
3. Las chapas de los tensores se tocan 2–3 cm con las platinas en 4 nudos: se resuelve soldándolas a la platina.
4. Detalles de unión (vigas acostadas a columnas, jambas a dintel y platea) para el taller.

---
## 8. Bases empotradas, pestañas de correa y cruz de fondo (agregado)

**Hallazgo de deriva:** con bases articuladas, HEB240 a 7 m, viento 1,0 kPa: desplazamiento en alero ≈ 78 mm (h/74, servicio) → demasiado para panel PIR y aberturas embutidas. La resistencia alcanza (rodilla 144 kNm vs ~220 de capacidad); manda la deformación lateral.

**Opción A (modelada en el DAE): bases empotradas.** Placa 600×400×30, 4 anclajes M24 por columna (32 en total), 2 cartelas 12 mm por columna. Deriva ≈ 14 mm (h/404); M en base ≈ 113 kNm, H ≈ 49 kN. La fundación debe resistir ese momento: la platea sola puede no alcanzar → verificar dados/zapatas o vigas de fundación con el calculista firmante.

**Opción B: bases articuladas + cruz de fondo.** Cruz en el plano del pórtico de fondo (grupo `[OPCIONAL] Cruz de fondo`, platina 80×10 + cartelas), más subir las cruces de techo de 50×8 a 80×10. La cruz de fondo toma ~72 % del viento transversal (~107 kN de ~160 kN) por diafragma de cubierta. Deriva ≈ 20 mm (h/290), ≈ +0,5 t. **Conclusión:** la cruz de fondo NO es necesaria por resistencia; sirve sólo en la Opción B. Con empotradas (A) no hace falta. Se dejó como grupo opcional (borrable en SketchUp).

**Unión correa–dintel:** pestaña soldada en taller 150×140×6 sobre el ala del dintel (32 u.), alma de la C abulonada con 2 M12 8.8 (32×2 = 64 bulones). Empalmes de correa solapados 30–40 cm con 4 bulones. Falta confirmar levantamiento (~15–19 kN por apoyo) con la ficha del fabricante de la C.

**Planilla actualizada (kg):** platinas de nudo 702 · IPE200 886 · IPE160 621 · jambas 354 · soleras 248 · postes piñón 1.132 · clavaderas piñón 339 · correas C250 1.443 · bases empotradas (placas 452 + cartelas 23 + anclajes 53) · pestañas 21 · bulones 1 · cruz opcional 185. Total nuevo 6.459 kg (6.274 sin la cruz opcional); retirado 2.949 kg (clavaderas y montantes) + ~250 kg de placas viejas 400×400×25. **Neto ≈ +3,1 t** sin cruz opcional.

**Interferencias:** 0 con aberturas; 261 contactos con estructura conservada, todos de extremo o soldadura (cruces contra columnas/dinteles, cartelas contra cara de ala, clavadera de piñón en columna 1, correas vs dintel) — sin penetraciones reales de volumen significativo.

**Supuestos no verificados:** viento neto 1,0 kPa (UNIT 50-84), tabla ISOWALL 80 mm provista por el cliente, fy 235 MPa, propiedades de la C por fórmula (sin catálogo), espesores reales de tubos. Todo requiere cálculo firmado antes de ejecutar.

---
## 9. Datos verificados en fuentes (15/11/2026)

- **Viento UNIT 50-84:** vk = 43,9 m/s (158 km/h) a ≤25 km de la costa atlántica / Río de la Plata (art. 6.2.2.2, citado por la Intendencia de Montevideo y por memorias de obra); 135 km/h para el resto del país. qc = vc²/16,3 → a vk pleno ≈ 118 kg/m² (1,16 kPa). Con presión interior ±0,3 y Ce ±0,8 en paredes, el neto en panel queda en ≈ 105–130 kg/m² según Kz/rugosidad (**no verificados**: Kz, Kd, rugosidad del padrón). El 1,0 kPa supuesto está en el borde bajo; usar **1,3 kPa en paredes y ~1,7 kPa succión de cubierta** hasta que el calculista fije Kz. La norma exige además verificar ausencia de colapso a 185 km/h (exigencia IM Montevideo; confirmar en Maldonado).
- **Paneles Kingspan Bromyros (Uruguay):** el catálogo oficial NO trae tablas de carga; sólo K/R (Isoroof 80 mm K=0,277). Para cubierta indica "carga admisible 80 kg/m² para 3 o más soportes" (producto exacto a confirmar) → **incompatible con succión de ~150 kg/m²** salvo que se confirme otra tabla. La tabla Isowall del cliente es del tipo Cintac/Tupemesa (50/75 mm, L/200, A792 Gr37), no de Bromyros. Pedir tabla de Isowall 80 mm e Isoroof/Isodec 80 mm a Bromyros (0800 1948).
- **Tubos:** pesos coherentes con el modelo: RHS 100×50 ≈ 6,6–6,8 kg/m (e=3 mm); RHS 120×60 ≈ 10,8 kg/m (e=4 mm); RHS 200×100: 5 mm = 22,3, 6 mm ≈ 26–27 kg/m (Cintac). Falta confirmar espesores y calidad (A500 Gr.C / fy≥315 MPa vs 235 asumido) con el proveedor.
- **Perfil C 250×75×25×2,5:** no se encontró ficha publicada; propiedades siguen por fórmula (×0,85). Pedir catálogo (Gerdau Uruguay, Ternium) o usar IPE/RHS con tabla.
