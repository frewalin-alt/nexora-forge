
const express = require("express");
const path = require("path");

const app = express();
const websitePath = path.resolve(__dirname, "../website");
const PORT = 3001;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(websitePath));

app.get("/", (req, res) => {
  res.sendFile(path.join(websitePath, "index.html"));
});

app.post("/api/generate", async (req, res) => {
  try {
    const prompt = req.body?.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Bitte gib eine Anfrage ein."
      });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error:
          "OPENROUTER_API_KEY fehlt. Prüfe deine GitHub-Codespaces-Secrets und starte Codespaces neu."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Nexora Forge"
        },
        body: JSON.stringify({
          model: "recursive/flint-v1.0:free",
          messages: [
            {
              role: "system",
              content: [
                "Du bist Nexora Forge, ein Assistent für Roblox Studio und Luau.",
                "Schreibe verständlichen, sicheren und möglichst funktionierenden Luau-Code.",
                "Erkläre, wofür der Code gedacht ist.",
                "Nenne den passenden Skripttyp: Script, LocalScript oder ModuleScript.",
                "Erkläre, wo der Code in Roblox Studio eingefügt werden soll.",
                "Nutze bei Bedarf Codeblöcke und kurze Schritt-für-Schritt-Anleitungen.",
                "Erfinde keine Roblox-APIs und weise auf notwendige Server- und Client-Prüfungen hin."
              ].join(" ")
            },
            {
              role: "user",
              content: prompt.trim()
            }
          ],
          temperature: 0.3,
          max_tokens: 2048
        })
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "OpenRouter lieferte keine gültige JSON-Antwort. HTTP:",
        response.status
      );

      return res.status(502).json({
        error: "OpenRouter lieferte eine ungültige Antwort."
      });
    }

    if (!response.ok) {
      console.error(
        "OpenRouter API Fehler:",
        response.status,
        JSON.stringify(data.error || data)
      );

      const detail =
        data.error?.message ||
        data.message ||
        "Keine weiteren Details vom Anbieter.";

      return res.status(response.status).json({
        error: `OpenRouter-Fehler HTTP ${response.status}: ${detail}`
      });
    }

    const result = data.choices?.[0]?.message?.content;

    if (typeof result !== "string" || !result.trim()) {
      return res.status(502).json({
        error: "Das Modell hat keine Textantwort geliefert."
      });
    }

    return res.json({ result });
  } catch (error) {
    console.error("Serverfehler:", error.message);

    return res.status(500).json({
      error: "Interner Serverfehler. Prüfe das Server-Terminal."
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Nexora Forge läuft auf Port ${PORT}.`);
});
