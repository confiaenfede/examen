# Landing de Tueria — cómo está hecha

Sitio estático: HTML + CSS + JS puros, sin build ni dependencias. Se abre con doble clic en `index.html`
o se sube tal cual a Netlify, GitHub Pages, etc. Dependencias externas: Google Fonts (Figtree) y MapLibre GL (unpkg) para el mapa.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `index.html` | Todo el contenido y la estructura |
| `styles.css` | Todos los estilos, en un solo archivo (ver nota abajo) |
| `script.js` | Todas las animaciones, el mapa y el formulario |
| `assets/` | `logo.png`, `firma.png` |
| `docs/seccion-producto-removida.html` | Sección "Producto" retirada, lista para pegar de nuevo |

`styles.css` se armó fusionando la hoja base y las 16 hojas `mix*.css` anteriores **en el mismo orden de carga**,
y eliminando las reglas que ya no aplican a ningún elemento del HTML. Las reglas siguen en orden de cascada: cada
bloque `/* ---- mixN.css ---- */` pisa a los anteriores (varias reglas usan `!important`). Si se reordena o se
unifica más, hay que revisar la landing en el navegador. Las hojas originales están en `_backup/` (se puede
borrar antes de publicar).

## Orden de secciones (index.html)

1. Nav fijo
2. Hero: titular que se escribe solo ("Tu inmobiliaria," + frase rotativa), botones
3. Frase central que se descubre letra por letra
4. Panel de actividad (4 columnas, datos de ejemplo)
5. Recorrido de punta a punta (de la tasación al cierre, se mueve solo)
6. Roles: organigrama que se arma al scrollear (bloque fijo de `200vh`)
7. Mapa de cierres (MapLibre, datos de ejemplo)
8. Integraciones (Google, Mercado Libre, CRM Multiportal, WhatsApp)
9. Por qué Tueria: contadores vivos, línea Hoy / 2027
10. Planes (tarjeta única como tueria.com)
11. Preguntas frecuentes
12. Cierre con formulario + pie

## Cómo funcionan las animaciones (`script.js`)

- **Titular que se escribe:** `#tw0` ("Tu inmobiliaria,") y `#tw` (frase rotativa). Las frases están en el array
  `frases`. El cursor es `.caret` y titila cuando está quieto. El color de la frase es `--dyn` en `styles.css`.
- **Texto letra por letra:** cualquier elemento con la clase `wr` se parte en letras `<i>`; su opacidad depende
  de cuánto scrolleó el elemento por la pantalla. Para el recorrido más lento, subir `vh*.37`.
- **Organigrama:** `.roles__run` (alto `200vh`) contiene un `.roles__pin` con `position:sticky`. El scroll dentro
  del tramo decide cuántos nodos `<li>` del árbol están visibles (`setOrg`). Se calculan los conectores según los
  hermanos visibles, el árbol empieza agrandado (`scale(1.28)`) y los nodos se deslizan a su lugar (técnica FLIP).
  En pantallas de 900 px o menos se muestra completo y sin animación.
- **Contadores:** elementos con `data-count`. Cuentan hasta el valor y siguen sumando
  (`data-step` rango por tick, `data-every` ms) mientras la sección está visible. Son una animación, no datos reales.
- **Reveal:** clase `rv`; entra con fade al aparecer.
- **Formulario:** sin backend; arma un `mailto:` a federico@tueria.com. Para recibir envíos reales, conectarlo a
  Formspree u otro servicio.
- `prefers-reduced-motion` desactiva o simplifica todas las animaciones.

## Ajustes rápidos

- Tamaño general: `body{zoom:.75}` en `styles.css`.
- Duración del organigrama fijo: `.roles__run{height:200vh}` en `styles.css`.
- Color de la frase del titular: `--dyn` en `styles.css`.
- Frases del titular: array `frases` en `script.js`.

## Pendientes y advertencias de contenido

- Todo el copy es provisional.
- Datos de ejemplo (dashboard, feeds, rankings) están rotulados "Datos de ejemplo".
- Cifras "14 reuniones", "+150 hs", "+50 usuarios": confirmar que son reales (el manual interno marcaba esa
  base instalada como no verificada).
- Sección Firma conserva afirmaciones de la landing original que el manual contradice: "Verificación de identidad /
  DNI + OTP" (el OTP prueba el control del correo), "Datos alojados en Argentina" y "Firma por lote".
- Contradicción: la firma electrónica aparece como disponible en la sección Firma y en el FAQ, pero en 2027 en la
  línea Hoy / 2027.
- "CRM Multiportal" figura como "Próximamente": confirmar si ya está disponible.
- Los números que suben solos no deberían publicarse como cifras en vivo sin datos reales.
- Enlaces de Términos y Privacidad apuntan a tueria.com.
