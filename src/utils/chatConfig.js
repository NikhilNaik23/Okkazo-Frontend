export const CHAT_API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Socket server can be routed via gateway later; for dev we connect directly.
export const CHAT_SOCKET_URL = import.meta.env.VITE_CHAT_SOCKET_URL || import.meta.env.VITE_BACKEND_URL;
