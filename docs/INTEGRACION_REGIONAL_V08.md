# Integración regional · Alpha 0.8

## CFE Distribución: divisiones observadas, 2022

Fuente: CFE Distribución, **Programa de Ampliación y Modernización de las Redes Generales de Distribución 2023–2037**, Tabla III.1, pp. **8–9** (paginación impresa). URL: https://www.cfe.gob.mx/distribucion/cumplimiento/Documents/PAM%20RGD%202023-2037%20vf.pdf

Se transcribieron las **16 divisiones** con seis indicadores (año de cierre: **2022**):
- Capacidad instalada de subestaciones de alta a media tensión, **MVA**.
- Número de circuitos de media tensión, unidades.
- Longitud de líneas de media tensión, **km**.
- Capacidad instalada en redes de distribución, **MVA**.
- Número de servicios de suministro, **miles**.
- Ventas de electricidad, **GWh**.

**Validación numérica:** sumas de las 16 divisiones: **78 894 MVA**, **12 239 circuitos**, **548 410 km**, **59 125 MVA**, **47 507 miles de servicios** y **280 682 GWh**. Coinciden exactamente con la fila «Total 2022» publicada. Las ventas de energía no son generación; los servicios no son número de personas. Los indicadores nacionales 2024 se muestran por separado y no se asignan a divisiones.

**Geometría:** Figura III.1 de la misma fuente muestra divisiones, pero no aporta un GeoJSON vectorial descargado y verificable. No digitalizar a ojo, no confundir divisiones con entidades federativas.

## SENER: pronóstico por gerencia de control regional

Fuente: SENER, **PRODESEN 2024–2038**, Cuadro **3.7**, p. **81**. https://www.cenace.gob.mx/Docs/16_MARCOREGULATORIO/Prodecen/20%202024-2038%20Cap%C3%ADtulos%201%20al%206.pdf

Se registraron los años **2024, 2030 y 2038** del escenario de planeación para diez regiones y los máximos integrados de SIN y SEN. La unidad publicada es **MWh/h** (potencia promedio durante una hora), y se mantiene literal para no alterar la fuente. **Son estimaciones prospectivas, no hechos de 2024.**

Los máximos regionales son **no coincidentes**. Por ello, los valores individuales no se agregan para obtener los totales SIN y SEN. Los totales son los publicados por SENER.

Referencia adicional: CENACE, *Diagramas Unifilares del Sistema Eléctrico Nacional 2020–2025*, abril 2021. https://www.cenace.gob.mx/Docs/10_PLANEACION/DiagramasUnifilares/Mod%20Gral%20Planeaci%C3%B3n%202020-2025%20Diagramas%20Unifilares%20RNT%20y%20RGD%20del%20MEM.pdf

## Pendientes no solucionados
- Polígonos GIS exactos de las 16 divisiones CFE.
- Trazas GIS georreferenciadas de líneas de transmisión, límites de cuatro sistemas.
- Inventario de centrales 2023–2024 con coordenadas y capacidad individual simultáneamente verificadas.
- Pruebas visuales reales del nuevo comparador regional en navegador y móvil.

## Diseño y datos

La tabla del comparador de CFE presenta **8 filas por pantalla**, permite buscar, seleccionar métricas y exporta las **16** en CSV. La gráfica muestra **6** divisiones como máximo, y las fichas permiten consultar los seis campos de cualquier división. Esto preserva la limpieza de la interfaz sin omitir registros.
