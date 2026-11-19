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
| Platea | 249,75 m², e = 0,15 m | 749,25 m² | medida |
| Hormigón | 49,0 m³ | 147,1 m³ | calculada |
| Armadura de dados, riostres y malla | ≈ 1.040 kg | ≈ 3.130 kg | supuesta |
| Techo PIR (2 faldones) | 273,0 m² | 819,0 m² | medida |
| Muro PIR neto | 333,8 m² | 1.001,5 m² | calculada: bruto menos aberturas |
| Vidriería de frente | 47,25 m² | 141,75 m² | planilla de aberturas |
| Aberturas aluminio/PVC (norte) | 15,72 m² | 47,2 m² | planilla de aberturas |

## Estado de los planos

| Documento | Estado | Observación |
|---|---|---|
| `planos/estructura_nave_modelo.pdf` | Vigente | 5 pórticos a 5,625 m, nave 22,5 × 11,1 m |
| `planos/cimentacion_5porticos.pdf` | Vigente, a validar | 10 dados por nave solo bajo columnas; armadura supuesta |
| `planos/sanitaria_PB_3_naves.pdf` | Vigente, a validar | Conteos de la planilla original; repartición por nave supuesta |
| `planos/electrica_PB_3_naves.pdf` | Vigente, a validar | Conteos de la planilla original; repartición por nave supuesta |

## Pendientes

1. Validar con el calculista: dimensiones de dados y riostres, armadura y tipo de fundación.
2. Vigas de borde de la platea: 201,6 ml y 32,3 m³ con 0,40 × 0,40 m, no incluidas en el total. Decidir si se incluyen.
3. Validar la repartición por nave de sanitaria y eléctrica.
4. Galvanizado ISO 1461: 21.425 kg (igual al acero de estructura). Falta precio.
5. Confirmar si el techo PIR se presupuesta como panel aparte de los muros.

El panel con estas cantidades está en `index.html` (se publica con GitHub Pages).
