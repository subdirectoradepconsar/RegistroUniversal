// ID del archivo de Google Sheets titulado "Registro Universal".
// Se encuentra en su URL, entre /d/ y /edit.
const SPREADSHEET_ID = "1G1pjgWOfu2Mggsyyxx7tK2Q1hSpRExFOrKyHzscxfjw";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("El cuerpo JSON es obligatorio.");
    }
    const datos = JSON.parse(e.postData.contents);
    if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
      throw new Error("Se esperaba un objeto JSON.");
    }
    const campos = ["organizacion", "nombre", "correo", "genero"];
    campos.forEach(function (campo) {
      if (typeof datos[campo] !== "string" || !datos[campo].trim()) {
        throw new Error("Campo obligatorio: " + campo);
      }
      datos[campo] = datos[campo].trim();
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
      throw new Error("Correo electrónico inválido.");
    }
    if (!/^\d{4}$/.test(String(datos.anioNacimiento))) {
      throw new Error("Año de nacimiento inválido.");
    }
    const libro = SpreadsheetApp.openById(SPREADSHEET_ID);
    const ahora = new Date();
    const zona = libro.getSpreadsheetTimeZone();
    const anio = Number(datos.anioNacimiento);
    if (anio < 1920 || anio > Number(Utilities.formatDate(ahora, zona, "yyyy"))) {
      throw new Error("Año de nacimiento fuera de rango.");
    }
    const hoja = libro.getActiveSheet();
    if (!hoja) throw new Error("No se encontró la hoja activa.");
    hoja.appendRow([
      Utilities.formatDate(ahora, zona, "yyyy-MM-dd HH:mm:ss"),
      textoSeguro_(datos.organizacion),
      textoSeguro_(datos.nombre),
      textoSeguro_(datos.correo),
      anio,
      textoSeguro_(datos.genero)
    ]);
    return respuestaJSON_({ status: "success" });
  } catch (error) {
    return respuestaJSON_({ status: "error", message: error.message || String(error) });
  }
}

function respuestaJSON_(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
}

// Evita que los textos recibidos se interpreten como fórmulas.
function textoSeguro_(texto) {
  return /^[=+@-]/.test(texto) ? "'" + texto : texto;
}
