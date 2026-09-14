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
    const area = normalizarArea_(datos.organizacion);
    const areas = { cochi1: "Cochi 1", cochi2: "Cochi 2", stand: "Stand", auditorio: "Auditorio" };
    if (!Object.prototype.hasOwnProperty.call(areas, area)) {
      throw new Error("Área inválida. Selecciona Cochi 1, Cochi 2, Stand o Auditorio.");
    }
    const hojas = libro.getSheets().filter(function (hoja) {
      return normalizarArea_(hoja.getName()) === area;
    });
    if (hojas.length !== 1) {
      throw new Error("Debe existir exactamente una hoja para el área " + areas[area] + ".");
    }
    const hoja = hojas[0];
    hoja.appendRow([
      Utilities.formatDate(ahora, zona, "yyyy-MM-dd HH:mm:ss"),
      areas[area],
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

// Permite nombres como "Cochi1", "cochi 1" o "COCHI 1".
function normalizarArea_(texto) {
  return texto.toLowerCase().replace(/\s+/g, "");
}

function respuestaJSON_(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos))
    .setMimeType(ContentService.MimeType.JSON);
}

// Evita que los textos recibidos se interpreten como fórmulas.
function textoSeguro_(texto) {
  return /^[=+@-]/.test(texto) ? "'" + texto : texto;
}
