# Oasis Fuente de Amor

Sitio estático en HTML, CSS y JavaScript. No requiere compilación ni dependencias locales.

## Publicación

1. Publica `index.html`, `style.css`, `script.js` y `oasis.png` en un hosting estático con HTTPS.
2. En el panel de EmailJS, confirma el servicio `oasis_service`, la plantilla `template_mldwmkr` y copia la clave pública vigente de Account > Public Key en `script.js`.
3. La plantilla debe aceptar `nombre`, `apellido`, `email`, `motivo`, `mensaje` y `reply_to`. Autoriza el dominio de producción y habilita los controles antispam del proveedor.
4. Envía un mensaje real desde el dominio publicado y confirma su recepción antes de anunciar el sitio. Si EmailJS no está disponible, el formulario prepara un correo en la aplicación de correo de la persona visitante.

La galería muestra un aviso temporal hasta que se añadan fotos propias. Las fuentes Manrope y DM Sans se cargan desde Google Fonts y requieren conexión externa. El correo y la dirección publicados deben mantenerse actualizados.