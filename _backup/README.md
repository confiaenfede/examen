# Landing de Tueria — cómo está hecha

Sitio estático: HTML + CSS + JS puros, sin build ni dependencias. Se abre con doble clic en `index.html`
o se sube tal cual a Netlify, GitHub Pages, etc. Única dependencia externa: Google Fonts (Figtree) y una foto
de Unsplash en la sección Firma.

## Archivos

| Archivo | Qué contiene |
|---|---|
| `index.html` | Todo el contenido y la estructura |
| `styles.css` | Base: variables, tipografía, nav, hero, panel "app", frase central, planes, FAQ, formulario |
| `mix.css` | Panel de actividad (4 columnas), roles, integraciones, planes en una tarjeta |
| `mix2.css` | Sección de Firma (réplica de la landing original) y estilos del organigrama |
| `mix3.css` | Zoom general (`body{zoom:.75}`) y árbol del organigrama |
| `mix4.css` | Organigrama animado y bloques de producto (retirados, ver abajo) |
| `mix5.css` | Organigrama: conectores calculados, sin scroll interno |
| `mix6.css` | Bloque "equipo" centrado, sección "Por qué Tueria", línea Hoy/2027, firma |
| `mix7.css` | Organigrama fijo mientras se arma + recorte de espacios en blanco |
| `mix8.css` | Contadores que crecen y listas Hoy / 2027 |
| `mix9.css` | Cierre con formulario y pie (como tueria.com) |
| `mix10.css`, `mix11.css` | Hero con titular que se escribe (color de lo dinámico: `--dyn`) |
| `mix12.css` | Texto que se descubre letra por letra |
| `script.js` | Todas las animaciones y el formulario |
| `assets/` | `logo.png`, `firma.png` |
| `docs/seccion-producto-removida.html` | Sección "Producto" retirada, lista para pegar de nuevo |

Las hojas `mix*.css` se cargan en orden y las últimas pisan a las primeras. Cuando haya que ordenar el
proyecto, conviene fusionarlas en un solo `styles.css`.

## Orden de secciones (index.html)

1. Nav fijo
2. Hero: titular que se escribe solo ("Tu inmobiliaria," + frase rotativa), botones
3. Frase central que se descubre letra por letra
4. Panel de actividad (4 columnas, datos de ejemplo)
5. Roles: organigrama que se arma al scrollear (bloque fijo de `230vh`)
6. Firma electrónica (copiada de la landing original)
7. Integraciones (Google, Mercado Libre, CRM Multiportal, WhatsApp)
8. Por qué Tueria: contadores vivos, línea Hoy / 2027, firma de Federico
9. Planes (tarjeta única como tueria.com)
10. Preguntas frecuentes
11. Cierre con formulario + pie

## Cómo funcionan las animaciones (`script.js`)

- **Titular que se escribe:** `#tw0` ("Tu inmobiliaria,") y `#tw` (frase rotativa). Las frases están en el array
  `frases`. El cursor es `.caret` y titila cuando está quieto. El color de la frase es `--dyn` en `mix11.css`.
- **Texto letra por letra:** cualquier elemento con la clase `wr` se parte en letras `<i>`; su opacidad depende
  de cuánto scrolleó el elemento por la pantalla. Para el recorrido más lento, subir `vh*.37`.
- **Organigrama:** `.roles__run` (alto `230vh`) contiene un `.roles__pin` con `position:sticky`. El scroll dentro
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

- Tamaño general: `body{zoom:.75}` en `mix3.css`.
- Duración del organigrama fijo: `height:230vh` en `mix7.css`.
- Color de la frase del titular: `--dyn` en `mix11.css`.
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
