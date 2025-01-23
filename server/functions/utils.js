import { platform } from "node:os";
const __dirname = import.meta.dirname;
export function getDistPath() {
    // Check if is windows platform
    const isWindows = platform() === "win32";
    // Get the divider depending on the platform
    const separator = isWindows ? '\\' : '/';
    // Split the words using the selector
    const words = __dirname.split(separator);
    // Remove utils
    words.pop();
    // Remove server path
    words.pop();
    // Retunr the app distribution
    const distPath = words.join(separator) + `${separator}app` + `${separator}dist` + `${separator}app` + `${separator}browser`;
    return distPath;
}
