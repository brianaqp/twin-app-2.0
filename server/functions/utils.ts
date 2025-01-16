import path from "node:path";
import { platform  } from "node:os"
const __dirname = import.meta.dirname as string;


export function getDistPath() {
// Detectar el sistema operativo
const isWindows = platform() === "win32";

// Separador de rutas según el sistema operativo
const pathSeparator = isWindows ? "\\" : "/";

// Dividir __dirname por el separador adecuado
const words = __dirname.split(pathSeparator);

// Remover el último elemento
words.pop();
words.pop();

// Construir la nueva ruta usando el separador correcto
const distPath = words.join(pathSeparator) + `${pathSeparator}app${pathSeparator}dist`;

console.log(distPath)

return distPath;
}