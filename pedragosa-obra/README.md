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

## Medidas de los dibujos del dueño (a escala)

| Concepto | Medida |
|---|---|
| Ancho exterior | 12,10 m (acotado en `tres_naves_v2`) |
| Largo exterior | 22,5 m |
| Pórticos | 5, separados 5,12 m (4 vanos = 20,48 m) |
| Distancia entre líneas de columnas | 10,96 m |
| Dados | 0,70 × 0,70 m, 2 por pórtico (10 por nave) |
| Alero / cumbrera | ≈ 5,70 m / ≈ 6,90 m (aproximado) |

El front pórtico (el de adelante) es liviano, solo con paneles y clavaderas prolongadas.

## Cantidades por nave (y total de 3 naves)

| Rubro | Por nave | 3 naves | Origen |
|---|---|---|---|
| Platea 0,15 m (23,20 × 12,80 m) | 296,96 m² | 890,88 m² | calculada (vuelo 0,35 m) |
| Riostres transversales (uno por pórtico) | 5 de 10,96 m | 15 (164,4 ml) | confirmado por el dueño |
| Dados | 10 (0,70 × 0,70 × 0,55 m) | 30 | medido + supuesto |
| Hormigón total | 56,0 m³ | 168,0 m³ | calculada |
| Techo PIR (2 faldones) | 277,6 m² | 832,7 m² | calculada |
| Muro PIR neto | 301,4 m² | 904,2 m² | laterales medidos (98,10 m² c/u) + gables |
| Acero de estructura | 7.141,8 kg | 21.425 kg | **modelo anterior: pendiente de recalcular** |

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
