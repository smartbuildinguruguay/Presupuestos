# Pedragosa Sierra · documentación de obra (JCG)

Tres naves de 22,5 × 11,1 m (≈250 m² c/u, 750 m² totales), 5 pórticos a 5,625 m, dados solo bajo columnas. Documento de trabajo, en estado estimado.

Este repositorio contiene planos y cantidades. **Los precios, el margen y la mano de obra no se publican acá**; están en el presupuesto privado.

## Contenido

| Carpeta | Qué hay |
|---|---|
| `planos/` | Planos vigentes en PDF (cimentación, estructura, sanitaria, eléctrica) |
| `computo/` | `cantidades.json` (única fuente de cantidades), desglose de acero y aberturas, pedido de estructura |
| `computo/scripts/calc_nave.py` | Calcula cimentación y envolvente desde la geometría del modelo y dibuja el plano de cimentación |
| `checks/check_cantidades.py` | Valida las cantidades contra la planilla original |
| `proceso/` | Flujo de trabajo y etapas de obra |

Verificar:

```
python3 computo/scripts/calc_nave.py
python3 checks/check_cantidades.py
```

## Cantidades por nave (y total de 3 naves)

| Rubro | Por nave | 3 naves | Origen |
|---|---|---|---|
| Acero de estructura | 7.141,8 kg | 21.425 kg | modelo |
| Dados | 10 (0,70 × 0,70 × 0,55 m) | 30 | calculada: solo bajo columnas |
| Riostres | 5 de 11,10 m (0,40 × 0,40) | 15 | supuesta: uno por pórtico |
| Platea | 298,75 m² (23,90 × 12,50 m, vuelo 0,70 m), e = 0,15 m | 896,25 m² | calculada |
| Hormigón | 56,4 m³ | 169,2 m³ | calculada |
| Armadura de dados, riostres y malla | ≈ 1.150 kg | ≈ 3.460 kg | supuesta |
| Techo PIR (2 faldones) | 273,0 m² | 819,0 m² | medida |
| Muro PIR neto | 333,8 m² | 1.001,5 m² | calculada: bruto menos aberturas |
| Vidriería de frente | 47,25 m² | 141,75 m² | planilla de aberturas |
| Aberturas aluminio/PVC (norte) | 15,72 m² | 47,2 m² | planilla de aberturas |


## Base de trabajo vigente

El cómputo métrico se hace sobre los archivos que el dueño de la obra define como fuente:

1. `fachadas_revestimientos.pdf`: fachadas A y B, 98,10 m² netos de revestimiento cada una.
2. `implantacion_padrones.pdf`: naves en los padrones 10596 (nave 1), 10597 (nave 2) y 10598 (nave 3). Cada nave está en su propio padrón, pegada al lateral izquierdo, con acceso por el derecho.
3. `tres_naves_v2.pdf`: planta de las tres naves, de 12,10 m de ancho.
4. Tomas de SketchUp de cimentación y estructura, con un pórtico más que el modelo anterior. **Pendiente de subir.**

Los planos y cantidades que generamos antes a partir de nuestro modelo (5 pórticos, 22,5 × 11,1 m) **no son fuente**. Las cantidades de cimentación, envolvente y presupuesto se recalculan con las tomas nuevas.

## Estado de los planos

| Documento | Estado | Observación |
|---|---|---|
| `planos/estructura_nave_modelo.pdf` | Vigente | 5 pórticos a 5,625 m, nave 22,5 × 11,1 m |
| `planos/cimentacion_5porticos.pdf` | Vigente, a validar | Platea 23,90 × 12,50 m; 10 dados por nave solo bajo columnas; armadura supuesta |
| `planos/sanitaria_PB_3_naves.pdf` | Vigente, a validar | Conteos de la planilla original; repartición por nave supuesta |
| `planos/electrica_PB_3_naves.pdf` | Vigente, a validar | Conteos de la planilla original; repartición por nave supuesta |

## Pendientes

1. Validar con el calculista: dimensiones de dados y riostres, armadura y tipo de fundación.
2. Vigas de borde de la platea: 218,4 ml y 34,9 m³ con 0,40 × 0,40 m, no incluidas en el total. Decidir si se incluyen.
3. Repartición por nave de sanitaria y eléctrica: validada.
4. Galvanizado ISO 1461: 21.425 kg (igual al acero de estructura). Falta precio.
5. Techo PIR: se presupuesta al mismo precio que el muro PIR (USD 50/m²).

El panel con estas cantidades está en `index.html` (se publica con GitHub Pages).
