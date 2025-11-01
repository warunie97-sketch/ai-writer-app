export default function App() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h1>Pena.AI ✨</h1>
    <p>Selamat datang ke studio penulisan immersive Melayu ✍️</p>

    <textarea id="writer" placeholder="Tulis cerita di sini..." rows="10"></textarea>

    <button id="saveBtn">Simpan Bab</button>

    <p id="status"></p>
  `;

  document.getElementById("saveBtn").addEventListener("click", () => {
    const text = document.getElementById("writer").value;
    localStorage.setItem("pena-draft", text);
    
    document.getElementById("status").innerText = "✅ Bab disimpan!";
  });

  // Auto restore
  const saved = localStorage.getItem("pena-draft");
  if (saved) document.getElementById("writer").value = saved;
}
