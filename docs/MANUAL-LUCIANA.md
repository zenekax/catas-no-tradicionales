# Cómo actualizar las fechas de la web

Todo se hace desde **una planilla de Google**. No hace falta tocar nada más.

Planilla: (link a la planilla, privado)
(Guardala en favoritos. También funciona desde la app de Google Sheets en el celular.)

**Lo más importante:** cuando termines de cargar o cambiar algo, tenés que tocar el botón naranja
**📤 PUBLICAR EN LA WEB** (a la derecha de la tabla, arriba) y confirmar con **Sí**.
Si no, la web no se entera. (También funciona desde el menú **🍫 Web → Publicar en la web**.)

---

## Qué significa cada columna

| Columna | Qué poner | Ejemplo |
|---|---|---|
| Producto | Elegir de la lista (o escribir uno nuevo) | Empanadas regionales |
| Fecha | Día/mes/año | 15/11/2026 |
| Hora | Hora y minutos | 13:00 |
| Barrio | Barrio de CABA | Flores |
| Cupos totales | Cuántos lugares tiene la cata | 12 |
| Cupos libres | Cuántos quedan | 12 |
| Precio | Solo el número. Si todavía no lo sabés, dejalo vacío (en la web dice "Consultá el valor") | 38000 |
| Link de Mercado Pago | El link de pago de esa cata. Si no hay, dejalo vacío (la reserva va por WhatsApp) | https://mpago.la/… |
| Estado | Elegir de la lista | Abierto |

## Los estados

- **Abierto**: se puede reservar.
- **Últimos lugares**: se puede reservar y se destaca que quedan pocos. (Si en "Cupos libres" ponés 3 o menos, la web lo marca sola.)
- **Agotado**: aparece completo y el botón pasa a "Anotate en lista de espera".
- **Próximamente**: aparece como "Avisame cuando abra".
- **Oculto**: la cata **no se muestra** en la web, pero queda guardada en la planilla.

---

## Cosas que vas a hacer seguido

### Agregar una cata nueva
1. Bajá hasta la primera fila vacía.
2. Completá todas las columnas de esa fila (fecha, hora, barrio, cupos…).
3. Tocá el botón **📤 PUBLICAR EN LA WEB** y confirmá con **Sí**.
4. En 1 o 2 minutos aparece en catasnotradicionales.com.

### Actualizar cuántos lugares quedan
1. Cambiá el número en **Cupos libres** de esa cata.
2. Tocá **📤 PUBLICAR EN LA WEB**.

Cuando llegue a **0**, la web la marca como agotada sola.

### Marcar una cata como agotada
1. En la columna **Estado** de esa fila, elegí **Agotado**.
2. Publicá.

### Sacar una cata de la web
1. En **Estado** elegí **Oculto**.
2. Publicá.

### Las catas que ya pasaron
No hace falta hacer nada: **las catas con fecha pasada desaparecen solas de la web**.
Pueden quedar en la planilla. Si querés limpiar la planilla igual, hacelo así:
1. Hacé clic derecho sobre el **número de la fila** (el número gris de la izquierda).
2. Elegí **Eliminar fila**.

Importante: **borrá la fila entera, o dejala toda vacía. No borres solo algunas celdas**, porque
una fila a medio completar hace que la planilla avise un error y no deje publicar.

### Agregar el link de Mercado Pago
1. Pegá el link completo en **Link de Mercado Pago** (tiene que empezar con `https://`).
2. Publicá. El botón "Reservar mi lugar" va a llevar directo al pago.

---

## Si algo sale mal

- **Al publicar sale un mensaje con "Fila X: …"**: hay un dato mal en esa fila (por ejemplo la fecha o el estado). Corregilo y volvé a publicar. Mientras tanto la web sigue mostrando lo anterior, no se rompe.
- **Quiero revisar antes de publicar**: 🍫 Web → **Revisar si hay errores**.
- **No aparece el botón o el menú 🍫 Web**: recargá la página de la planilla (F5) y esperá unos segundos.
- **Publiqué y no veo el cambio**: esperá 2 minutos y recargá la web con **Cmd+Shift+R** (Mac) o **Ctrl+Shift+R** (Windows).
- **Cualquier otra cosa**: avisale a Nacho.

---

*Para Nacho:* el código del panel está en `docs/apps-script/Codigo.gs`. La web lee la primera hoja de la planilla
al publicarse (variable `GOOGLE_SHEET_ID` en Cloudflare) y el botón "Publicar" dispara el Deploy Hook de Cloudflare. Ver `docs/DEPLOY.md`.
