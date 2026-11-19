# Pedragosa Sierra · documentación de obra (JCG)

Tres naves de 22,5 × 11,1 m (≈250 m² c/u, 750 m² totales), 5 pórticos a 5,625 m, dados solo en columnas. Documento de trabajo, en estado estimado.

Este repositorio contiene planos y cantidades. **Los precios, el margen y la mano de obra no se publican acá**; están en el presupuesto privado.

## Contenido

| Carpeta | Qué hay |
|---|---|
| `planos/` | Planos vigentes en PDF (estructura, sanitaria, eléctrica) |
| `computo/` | `cantidades.json` (única fuente de cantidades), desglose de acero y aberturas, pedido de estructura |
| `checks/` | Validaciones automáticas de las cantidades contra la planilla original |
| `proceso/` | Flujo de trabajo y etapas de obra |

Verificar: `python3 checks/check_cantidades.py`

## Estado de los planos

| Documento | Estado | Observación |
|---|---|---|
| `planos/estructura_nave_modelo.pdf` | Vigente | 5 pórticos a 5,625 m, nave 22,5 × 11,1 m, 7.141,8 kg de acero por nave |
| `planos/sanitaria_PB_3_naves.pdf` | Vigente, por validar | Conteos de la planilla original; repartición por nave supuesta |
| `planos/electrica_PB_3_naves.pdf` | Vigente, por validar | Conteos de la planilla original; repartición por nave supuesta |
| Cimentación | **Desactualizado** | Debe quedar 10 dados por nave, solo bajo columnas |
| Desarrollo estructural (4 pórticos) | **Desactualizado** | Reemplazar por el de 5 pórticos |
| Geometría de planta `tres_naves_v2` | **Desactualizado** | Sigue con 12,10 m de ancho |
| Muros PIR | Pendiente | 322,6 m² por nave escalado; falta calcular sobre el modelo |

## Pendientes

1. Validar la repartición por nave de sanitaria y eléctrica.
2. Actualizar cimentación y desarrollo estructural a 5 pórticos.
3. Calcular muros PIR y vidriería sobre el modelo de 22,5 m.
4. Definir las vigas de borde de la platea (201,6 ml, sin dimensión).
5. Galvanizado del acero (ISO 1461), no incluido en la cantidad de acero.
