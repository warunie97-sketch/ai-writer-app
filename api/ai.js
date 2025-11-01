export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { text, mood } = req.body;
    const prompt = `
Anda ialah AI penulis novel gaya Melayu immersive.
Mood: ${mood}
Sambung teks dengan rasa emosi, mendalam, dan mengalir lembut.

Teks:
${text}

Sambungan:
`;

    const reply = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250,
      }),
    }).then((r) => r.json());

    res.status(200).json({ result: reply.choices[0].message.content.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
