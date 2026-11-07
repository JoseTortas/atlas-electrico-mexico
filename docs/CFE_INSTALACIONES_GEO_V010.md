# Alpha 0.10 · Georreferenciación comprobable de instalaciones CFE

## 1. Origen de las coordenadas

**CFE Distribución, División Golfo Centro**, *Directorio de Almacenes*, anexo 2, Licitación LPDGCT-0225, 8 de enero de 2026, p. 1.

Documento: https://www.cfe.gob.mx/concursoscontratos/ventabienes/Documents/Muebles%202026/ANEXOS%20LPDGCT-0225.pdf

Las coordenadas siguientes se transcribieron del campo **GEOLOCALIZACIÓN** publicado por CFE. No se obtuvieron por estimación, geocodificación aproximada ni interpolación del mapa. La latitud es el primer número; la longitud es el segundo. Se conservan en `data/distribution_locations.json`.

| Código CFE | Instalación | Municipio/ciudad | Latitud | Longitud |
|---|---|---|---:|---:|
| D128 | Almacén Divisional Golfo Centro | Tampico (Tamaulipas) | 22.31837048164888 | -97.86857464609245 |
| D129 | Almacén Zona Tampico | Tampico (Tamaulipas) | 22.254793412173765 | -97.86163727528945 |
| D130 | Almacén Zona Mante | Ciudad Mante (Tamaulipas) | 22.736624771147994 | -98.95955225258314 |
| D131 | Almacén Zona Victoria | Ciudad Victoria (Tamaulipas) | 23.724703967472276 | -99.15935000969323 |
| D132 | Almacén Zona Matehuala | Matehuala (San Luis Potosí) | 23.664228804478793 | -100.64441489497648 |
| D133 | Almacén Zona San Luis Potosí | San Luis Potosí (San Luis Potosí) | 22.15397911978481 | -100.9573522716182 |
| D134 | Almacén Zona Río Verde | Rioverde (San Luis Potosí) | 21.92977850703168 | -100.0019095584789 |
| D135 | Almacén Zona Valles | Ciudad Valles (San Luis Potosí) | 21.976546266011646 | -98.97573330206764 |
| D136 | Almacén Zona Huejutla | Huejutla (Hidalgo) | 21.144798852350206 | -98.40846704536662 |

**Significado geométrico:** cada par indica una instalación documentada. No es el centroide, sede, límite ni cobertura de la División Golfo Centro.

## 2. Capa en el mapa interactivo

- Se dibujan **nueve marcadores** y todos sus atributos desde el archivo JSON.
- El mapa inicial conserva el encuadre de México; «Acercar a instalaciones verificadas» ajusta la vista a los puntos de Golfo Centro.
- Al elegir **Golfo Centro**, los nueve marcadores permanecen y el mapa se centra en ellos.
- Al elegir otra división, no aparecen marcadores sin evidencia y el mapa muestra una nota de ausencia de coordenadas verificadas.
- El cuadro superior derecho muestra estadísticas divisionales **2022** sin vincularlas con almacenes particulares.
- La lista breve muestra tres almacenes y permite desplegar los restantes, pero el mapa contiene los nueve.

## 3. Mapa territorial oficial de CFE, no georreferenciado

Se reutiliza una **imagen de mapa publicada por CFE** en el *Informe Anual CFE 2022*, página impresa **140** (página 141 del archivo `Informe Anual Portal.pdf` proporcionado por el usuario). La imagen se extrajo del objeto gráfico de esa página, con su máscara de transparencia original, y se compuso sobre fondo blanco.

Archivo: `assets/img/cfe-divisiones-2022-mapa-oficial.png` (650 × 377 píxeles).

Se muestra en la pestaña «Referencia oficial» del módulo 03, por lo que ya no depende de incrustar el PDF que el navegador bloqueaba. Contiene la leyenda de las 16 divisiones. El enlace a la Figura III.1 del PAM RGD 2023–2037 continúa como segunda referencia institucional:

https://www.cfe.gob.mx/distribucion/cumplimiento/Documents/PAM%20RGD%202023-2037%20vf.pdf

**Importante:** la imagen original no es una capa GIS. No se le han asignado coordenadas, no se ha superpuesto a Leaflet ni se han digitizado límites supuestos.

## 4. Pendientes

Para mostrar los polígonos reales de cada división son necesarios archivos geoespaciales oficiales (GeoJSON, SHP, GeoPackage u otra fuente GIS verificable). Para ampliar los puntos operativos hacen falta coordenadas documentales de instalaciones de las otras quince divisiones. No reemplazar estos vacíos con centros de estado, centroides inventados, mapas de tarifas ni regiones de control de CENACE.

## 5. Validación

Desde la raíz del proyecto:

```bash
node tests/validate.mjs
```

Las pruebas verifican que los nueve puntos están dentro de México, tienen identificador, dirección y URL oficial; y que la pestaña de CFE no contiene un `iframe` externo. No certifican cobertura completa del mapa de divisiones.
