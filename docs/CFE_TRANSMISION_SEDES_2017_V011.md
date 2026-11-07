# Alpha 0.11: ciudades sede históricas de gerencias regionales CFE Transmisión

## Origen de las ubicaciones y cifras

- Institución: Comisión Federal de Electricidad, Plan de Negocios 2018–2022 de CFE Transmisión, **Anexo 1, figura A.1.1 y tabla A.1.1, página impresa 58**, con corte al **31 de diciembre de 2017**.
- Fuente primaria: https://transmision.cfe.mx/Documents/PDN%20CFE-Transmision%202018-2022.pdf#page=58
- Coordenadas: posiciones geográficas **de las ciudades**, según el listado público de localidades: https://en.wikipedia.org/wiki/List_of_cities_in_Mexico . Este listado es una referencia geográfica secundaria, **NO CFE**.
- Los puntos en el mapa NO indican domicilio de la gerencia, subestación, torre, infraestructura operativa ni polígono de cobertura. La precisión de la coordenada en el archivo JSON corresponde a la referencia urbana, no a una infraestructura particular.

| GRT 2017 | Ciudad | Subestaciones atendidas por GRT | Longitud atendida, km |
|---|---|---:|---:|
| Baja California | Mexicali | 72 | 5,195.28 |
| Noroeste | Hermosillo | 36 | 12,579.19 |
| Norte | Gómez Palacio | 37 | 12,388.03 |
| Noreste | Monterrey | 46 | 10,818.34 |
| Occidente | Guadalajara | 90 | 19,646.30 |
| Central | Ciudad de México | 142 | 17,733.81 |
| Oriente | Veracruz | 31 | 12,142.46 |
| Sureste | Tuxtla Gutiérrez | 25 | 9,556.37 |
| Peninsular | Mérida | 28 | 6,982.45 |
| **Total impreso CFE** | | **507** | **107,042.22** |

Nota de validación: los 9 valores impresos suman **107,042.23 km**, diferencia de **0.01 km** respecto al total impreso de CFE. Se conserva la discrepancia documental sin alterarla.

## Precaución de integridad y seguridad

CFE Transmisión incluye en sus versiones públicas reservas sobre coordenadas de subestaciones y líneas, por ejemplo:
https://portales-transparencia.cfe.mx/transmision/28%20Procedimientos%20de%20Contratacin/Sureste/Sede/2024/ADQ%203T_CTO.%20700537908%20CFE-0208-CSAAA-0009-2024.pdf

Se mantienen fuera de la aplicación las posiciones exactas de infraestructura reservada, los trazados operativos y cualquier dato que permitiera inferirlos. Los cuatro sistemas eléctricos de PRODESEN no se confunden con las nueve gerencias regionales históricas de CFE. La cobertura administrativa puede haber cambiado por la reorganización de CFE en 2025; ningún dato 2017 aparece como medición 2024 o 2026.

## Verificación

```
node tests/validate.mjs
```

Después de ejecutar `python -m http.server 8000`, abrir `#transmission`; deben aparecer nueve puntos urbanos, selección por gerencia, cuatro resultados visibles inicialmente, gráfico de km/subestaciones y botón de encuadre. Los otros módulos y PDF oficiales continúan intactos.
