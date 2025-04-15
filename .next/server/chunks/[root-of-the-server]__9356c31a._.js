module.exports = {

"[project]/.next-internal/server/app/api/check-chroma/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/app/api/check-chroma/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "GET": (()=>GET)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET() {
    try {
        const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
        console.log('Server checking ChromaDB at:', chromaUrl);
        // Get auth credentials from environment or use defaults from docker-compose
        const username = process.env.CHROMA_USERNAME || 'admin';
        const password = process.env.CHROMA_PASSWORD || 'admin';
        // Use fetch with increased timeout to check ChromaDB availability
        const controller = new AbortController();
        const timeoutId = setTimeout(()=>controller.abort(), 5000); // 5 second timeout
        try {
            const headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
            // Add basic auth header for Token Auth provider
            // ChromaDB uses Basic Auth format: admin:admin in docker-compose
            const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
            headers['Authorization'] = `Basic ${base64Credentials}`;
            console.log('Sending request to ChromaDB with auth');
            const response = await fetch(`${chromaUrl}/api/v2/heartbeat`, {
                method: 'GET',
                headers,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            console.log('ChromaDB server response status:', response.status);
            if (response.ok) {
                const responseText = await response.text();
                console.log('ChromaDB server response text:', responseText);
                // Check if the response contains heartbeat data
                if (responseText.includes('heartbeat')) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        available: true,
                        message: 'ChromaDB is available',
                        details: responseText
                    });
                }
            }
            console.log('ChromaDB returned invalid response:', response.status);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                available: false,
                message: `ChromaDB returned response with status: ${response.status}, but format was invalid`,
                status: response.status
            });
        } catch (fetchError) {
            clearTimeout(timeoutId);
            console.error('Error connecting to ChromaDB:', fetchError);
            const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
            const isAbortError = errorMessage.includes('abort') || errorMessage.includes('timeout');
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                available: false,
                message: isAbortError ? `Timeout connecting to ChromaDB at ${chromaUrl}` : `Error connecting to ChromaDB: ${errorMessage}`,
                error: isAbortError ? 'TIMEOUT' : 'CONNECTION_ERROR'
            });
        }
    } catch (error) {
        console.error('Server-side error checking ChromaDB:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            available: false,
            message: `Error in ChromaDB check: ${error instanceof Error ? error.message : String(error)}`,
            error: 'GENERAL_ERROR'
        });
    }
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__9356c31a._.js.map