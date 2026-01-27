import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
var appTitle = path.basename(path.resolve(__dirname));
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        port: 4001,
    },
    define: {
        __APP_TITLE__: JSON.stringify(appTitle),
    },
});
