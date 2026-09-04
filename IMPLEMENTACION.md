# Registro Universal: implementación

1. Abre el archivo de Google Sheets **Registro Universal**. En la pestaña de destino coloca en A1:F1: **Fecha y Hora | Organización | Nombre | Correo | Año de nacimiento | Género**. Déjala activa: el script utiliza `getActiveSheet()`. Para fijar una pestaña permanentemente puedes sustituirlo por `getSheetByName("Nombre de pestaña")`.
2. Configura la zona horaria local en **Archivo → Configuración** de Google Sheets. El script la utiliza para la fecha `yyyy-MM-dd HH:mm:ss`.
3. Abre **Extensiones → Apps Script**, copia el contenido completo de `Código.gs` y sustituye `SPREADSHEET_ID` por el ID de este archivo (segmento entre `/d/` y `/edit` de su URL). Se abre por ID porque una Web App no dispone del contexto activo de la interfaz de Sheets.
4. Selecciona **Implementar → Nueva implementación → Aplicación web**. Configura **Ejecutar como: Yo** y **Quién tiene acceso: Cualquier persona**. Autoriza los permisos solicitados y copia la URL terminada en `/exec`.
5. Sustituye `APPS_SCRIPT_URL` al inicio de `app.js` por esa URL. El formulario ya invoca `registrarParticipante(datos)` y deshabilita el botón con un indicador durante el envío. Al actualizar un despliegue existente, publica una nueva versión desde **Gestionar implementaciones**.
6. Envía un registro de prueba desde la web y comprueba directamente que aparece una fila en A:F. Revisa **Ejecuciones** en Apps Script si no aparece. No ejecutes `doPost` directamente desde el editor sin un evento de prueba.

## Respuestas y CORS

El backend devuelve `{ "status": "success" }` o `{ "status": "error", "message": "..." }`. `MimeType.JSON` establece el tipo de contenido; no añade cabeceras CORS. `ContentService.TextOutput` no ofrece un método para configurar cabeceras arbitrarias y Google redirige su respuesta a `script.googleusercontent.com`.

El frontend envía JSON como `text/plain;charset=utf-8` con `mode: "no-cors"`. La respuesta es opaca: no puede consultar `response.ok`, el estado HTTP ni el JSON. Por ello muestra una solicitud enviada sin confirmar el guardado y no reintenta automáticamente. Un fallo de red tampoco demuestra que no se haya insertado la fila. El bloqueo evita envíos simultáneos en esta página, pero no deduplica reintentos ni envíos desde otras pestañas.

Si necesitas confirmar el guardado desde la interfaz, utiliza un backend intermediario que permita CORS y lea la respuesta de Apps Script, o aloja el formulario en Apps Script y utiliza `google.script.run` con una función específica de registro.

Referencias: [Content Service](https://developers.google.com/apps-script/guides/content), [TextOutput](https://developers.google.com/apps-script/reference/content/text-output), [Aplicaciones web](https://developers.google.com/apps-script/guides/web).
