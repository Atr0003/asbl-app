console.log("🔍 client.ts chargé");

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

async function testAPI() {
  try {
    const res = await api.get("/");
    console.log("✅ API connectée :", res.data);
  } catch (err) {
    console.error("❌ Erreur de connexion à l’API :", err);
  }
}

testAPI();
