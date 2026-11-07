# Alpha 0.13 · Auditoría de generación neta nacional

## Fuente complementaria incorporada

**Institución:** Secretaría de Energía (SENER).  
**Documento:** Plan de Desarrollo del Sector Eléctrico 2025–2039.  
**Publicación:** Diario Oficial de la Federación, 17 de octubre de 2025.  
**Tabla:** 2.2, «Generación neta inyectada por tecnología 2010–2024».  
**Página impresa:** 21 (página 20 del PDF consultado).  
**URL oficial:** https://sidof.segob.gob.mx/notas/docFuente/5770297

Se tomaron únicamente las columnas 2022, 2023 y 2024. La revisión incluyó la lectura de la imagen de la página de la tabla, no solo fragmentos de búsqueda.

## Tres años estrictamente comparables en esta fuente

| Indicador (GWh netos inyectados) | 2022 | 2023 | 2024 |
|---|---:|---:|---:|
| Total SEN | 333,964 | 346,501 | 352,305 |
| Energías limpias | 89,109 | 80,358 | 82,426 |
| Tecnologías fósiles (total menos limpia) | 244,855 | 266,143 | 269,879 |
| Participación limpia calculada | 26.68% | 23.19% | 23.40% |

La suma de las 12 tecnologías reproduce exactamente los tres totales anuales y la suma de las siete categorías limpias reproduce exactamente los tres totales de energías limpias.

**Alcance:** solo generación neta inyectada al SEN; no incluye GD ni autoabasto local. La clasificación de *cogeneración eficiente* se sigue de la tabla, pero no implica recurso renovable. **Solar fotovoltaica de grandes centrales ≠ toda la solar del país incluyendo GD**.

## Incompatibilidad entre ediciones conservada

El PRODESEN 2023–2037 cap. 4, p. 59 reporta para 2022 **340,713 GWh** (31.2% limpio); la serie SENER publicada en 2025 reporta **333,964 GWh** y **89,109 GWh limpios** (26.68%) para 2022. La diferencia de 6,749 GWh entre totales **no se explica causalmente** ni se suma/resta a ninguna tecnología: los alcances/metodologías publicados difieren y requieren conciliación documental expresa. Para tendencias 2022-2024 se toma exclusivamente la misma tabla 2.2 de la edición 2025.

Además, CFE Informe 2024, tabla p. 28 reporta generación neta CFE **148,775.4 GWh en 2024**, mientras el Plan SENER reporta **352,305 GWh netos inyectados al SEN** en 2024. No se deduce generación privada por sustracción, pues las coberturas contables son diferentes.

## Metodología del cálculo

Para tecnología k y año t: participación (%) = GWh(k,t) / GWh(SEN,t) × 100. Para variación interanual: (GWh(k,t)/GWh(k,t-1) − 1) × 100, cuando el año previo tenga dato positivo. **2022 no presenta variación** porque no se cargó 2021 en esta subserie. Los porcentajes derivados se identifican como cálculos.

## Requisitos abiertos

- No se ha conciliado un catálogo GIS contemporáneo de centrales con potencia individual verificable; CANIE es capa histórica 2017.
- Los polígonos de divisiones de CFE Distribución y los trazados de líneas de transmisión requieren datos geográficos oficiales, no extrapolación de PDF.
- El hallazgo «central de mayor capacidad en México» sigue pendiente de un catálogo comparativo individual. No se asigna ganador sin fuente.
- La serie 2025 de SENER no representa necesariamente 2025 o 2026 observado; 2025 es la **fecha de publicación**, los años evaluados terminan en 2024.
- Se mantienen todas las advertencias de la auditoría ambiental IPCC v0.12.

**Prueba:** `node tests/validate.mjs`.
