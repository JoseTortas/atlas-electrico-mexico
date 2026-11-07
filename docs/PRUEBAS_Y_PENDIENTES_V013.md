# Alpha 0.13 · Pruebas y pendientes para la entrega final

## Revisiones realizadas

- `npm test`: 17 bloques de pruebas superados (lógica de los cinco módulos, fuentes, control de mapas y dos simuladores).
- Suma de las 12 tecnologías netas (GWh) = total SEN para 2022, 2023 y 2024 de la Tabla 2.2.
- Suma de las 7 tecnologías limpias = total de energías limpias para cada año.
- Chromium estático: filtros, paginación (7 filas), selección de unidad, búsqueda y exportación CSV de la nueva sección; módulo Recursos y 20 hallazgos revisados sin errores JS.
- Chromium móvil a 390 px: sin desplazamiento horizontal global tras corregir el mínimo intrínseco de la gráfica.

## Verificación manual con la aplicación completa

1. Servir la web con `python -m http.server 8000` desde la raíz del proyecto.
2. Ir a `#generation`; verificar nueva sección nacional, por defecto año 2024, gráfico de 12 tecnologías, tabla de 7 filas por página, filtro fósiles / limpias / renovables, descarga CSV y controles del mapa CANIE 2017.
3. Ir a `#resources`; comprobar matriz limpia nacional 2022–2024 y la advertencia de diferencias metodológicas entre ediciones PRODESEN 2023 y DOF 2025.
4. Ir a `#facts`; inspeccionar 20 hallazgos, especialmente los de generación nacional y recurso fósil; comprobar las cinco dimensiones históricas.
5. Abrir mapas de Transmisión y Distribución en la misma sesión, comprobar controles de Leaflet, marcadores históricos y el mapa oficial local CFE.
6. Probar smartphone, teclado, carga lenta / sin Internet y enlaces a fuentes oficiales.

## Limitaciones que se mantienen

- No se ha probado un despliegue público en GitHub Pages: el usuario lo publicará al final.
- El mapa de Generación CANIE 2017 depende de servicio remoto si no se sincroniza el archivo local.
- No se han validado mediante geodatos oficiales las líneas de transmisión ni los polígonos CFE Distribución. Los puntos urbanos de transmisión 2017 y las nueve instalaciones CFE Distribución 2026 no equivalen a un polígono.
- No existe todavía una serie comparable del volumen de generación distribuida solar inyectada o autoconsumida de 2022 a 2024 en el mismo universo del cuadro 2.2.
- «La central con mayor capacidad instalada» requiere un inventario completo, actualizado y comprobable por instalación. No asignar un ganador a partir de una selección parcial de centrales.
- La revisión de impactos de reforma es descriptiva; no constituye análisis causal.
