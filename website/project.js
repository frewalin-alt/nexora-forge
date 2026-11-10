
const KEY = "nexora-projects";
const id = new URLSearchParams(location.search).get("id");
const $ = selector => document.querySelector(selector);
const title = $("#project-title");
const info = $("#project-info");
const scriptsBox = $("#project-scripts");
const promptBox = $("#project-prompt");
const generateButton = $("#project-generate");
const notice = $("#project-notice");
const chat = $("#project-chat");
const treeScripts = $("#project-tree-scripts");
let selectedScriptId = null;
let selectedScriptCode = "";

function projects() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}
function save(items) {
  localStorage.setItem(KEY, JSON.stringify(items));

  // Änderungen zusätzlich für das angemeldete Konto speichern.
  Promise.all(items.map(async item => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.warn("Project sync:", data.error || response.status);
      }
    } catch (error) {
      console.warn("Server-Synchronisierung nicht möglich:", error);
    }
  }));
}

async function syncProjectsFromServer() {
  try {
    const response = await fetch("/api/projects", {
      credentials: "same-origin"
    });
    if (!response.ok) return;

    const data = await response.json();
    const serverProjects = Array.isArray(data.projects) ? data.projects : [];
    const localProjects = projects();
    const merged = new Map();

    for (const item of serverProjects) merged.set(item.id, item);

    for (const item of localProjects) {
      const serverItem = merged.get(item.id);
      if (!serverItem) {
        merged.set(item.id, item);
        continue;
      }

      const localTime = Date.parse(item.updatedAt || item.createdAt || 0) || 0;
      const serverTime = Date.parse(serverItem.updatedAt || serverItem.createdAt || 0) || 0;

      if (localTime > serverTime) merged.set(item.id, item);
    }

    const result = [...merged.values()];
    localStorage.setItem(KEY, JSON.stringify(result));

    // Lokale Projekte und neuere lokale Änderungen hochladen.
    for (const item of result) {
      const serverItem = serverProjects.find(project => project.id === item.id);
      if (!serverItem ||
          (Date.parse(item.updatedAt || 0) || 0) >
          (Date.parse(serverItem.updatedAt || 0) || 0)) {
        await fetch("/api/projects", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item)
        });
      }
    }

    renderProjects();
    renderScripts();
  } catch (error) {
    console.warn("Could not load projects:", error);
  }
}
function project() { return projects().find(p => p.id === id); }

function renderProjects() {
  const list = $("#nexora-project-list");
  if (!list) return;
  list.replaceChildren();
}


const GRAPH_FEATURES = [
  { id:"gameplay", title:"Gameplay", category:"core", detail:"Die zentrale Spielmechanik und der Spielerablauf.", terms:["gameplay","spielablauf","mechanik","simulator","obby","tycoon","round","runde"], prompt:"Plane die zentrale Gameplay-Schleife meines Roblox-Spiels mit konkreten Spieleraktionen und Zielen." },
  { id:"currency", title:"Cash & Währung", category:"economy", detail:"Verdienen, Anzeigen und Ausgeben von Spielwährung.", terms:["cash","geld","währung","munzen","münzen","coins","money","currency"], prompt:"Plane ein vollständiges Währungssystem mit Einnahmen, Ausgaben und einer passenden Anzeige." },
  { id:"upgrades", title:"Upgrades", category:"progression", detail:"Verbesserungen und steigende Spielwerte.", terms:["upgrade","verbesser","level","stärke","speed","geschwindigkeit"], prompt:"Plane ein Upgrade-System mit Kosten, Stufen und nachvollziehbarem Fortschritt." },
  { id:"shop", title:"Shop", category:"economy", detail:"Spieler können Gegenstände und Verbesserungen erwerben.", terms:["shop","laden","kaufen","purchase","store"], prompt:"Plane einen Shop mit Kategorien, Preisen, Kaufprüfung und Spielerfeedback." },
  { id:"inventory", title:"Inventar", category:"progression", detail:"Gegenstände und Sammlungen der Spieler.", terms:["inventar","inventory","item","gegenstand","collect","sammel"], prompt:"Plane ein Inventarsystem mit Gegenständen, Kategorien und einer übersichtlichen Oberfläche." },
  { id:"quests", title:"Quests", category:"gameplay", detail:"Aufgaben, Ziele und Belohnungen.", terms:["quest","aufgabe","mission","daily","täglich","achievement","erfolg"], prompt:"Plane ein Quest-System mit Aufgaben, Fortschritt und Belohnungen." },
  { id:"pets", title:"Pets & Begleiter", category:"progression", detail:"Begleiter, Sammeln und mögliche Boni.", terms:["pet","pets","haustier","begleiter","egg","ei"], prompt:"Plane ein Begleiter-System mit Sammeln, Ausrüsten und fairen Boni." },
  { id:"rebirth", title:"Rebirth", category:"progression", detail:"Neustart mit langfristigen Fortschrittsboni.", terms:["rebirth","wiedergeburt","prestige","reset"], prompt:"Plane ein Rebirth-System mit Voraussetzungen, Belohnungen und dauerhaftem Fortschritt." },
  { id:"saving", title:"Datenspeicherung", category:"backend", detail:"Spielerfortschritt zuverlässig speichern und laden.", terms:["datastore","speicher","save","saving","profil","persistent"], prompt:"Prüfe das Speicherkonzept meines Spiels und plane sicheres Laden, Speichern und Errorbehandlung." },
  { id:"ui", title:"UI & HUD", category:"interface", detail:"Anzeigen, Menüs und Spielerführung.", terms:["gui","ui","hud","menü","menu","interface","oberfläche"], prompt:"Plane eine passende UI mit HUD, Menüs und klaren Spieler-Rückmeldungen." },
  { id:"tutorial", title:"Tutorial", category:"interface", detail:"Neue Spieler verständlich ins Spiel führen.", terms:["tutorial","einführung","new player","neuling","anleitung"], prompt:"Plane ein kurzes interaktives Tutorial für neue Spieler." },
  { id:"events", title:"Events", category:"live", detail:"Zeitlich begrenzte Aktionen und besondere Ereignisse.", terms:["event","ereignis","random","zufall","season","saison"], prompt:"Plane ein Event-System mit Start, Ende, Belohnungen und verständlichen Anzeigen." },
  { id:"leaderboard", title:"Leaderboards", category:"social", detail:"Spieler und ihre Erfolge vergleichen.", terms:["leaderboard","rangliste","bestenliste","highscore","top players"], prompt:"Plane eine Rangliste mit sinnvollen Statistiken und regelmäßiger Aktualisierung." },
  { id:"teams", title:"Teams & Gruppen", category:"social", detail:"Gemeinsam spielen und Gruppenfunktionen nutzen.", terms:["team","gruppe","party","clan","guild","gruppe"], prompt:"Plane ein Team- oder Gruppensystem mit Einladungen und gemeinsamen Funktionen." },
  { id:"rewards", title:"Belohnungen", category:"progression", detail:"Spieler für Aktionen und Meilensteine belohnen.", terms:["reward","belohn","daily reward","bonus","geschenk"], prompt:"Plane ein Belohnungssystem mit klaren Bedingungen und ausgewogenen Belohnungen." },
  { id:"audio", title:"Sound & Musik", category:"polish", detail:"Audio-Feedback und passende Musik.", terms:["sound","musik","music","audio","soundeffect"], prompt:"Plane Soundeffekte und Musik für wichtige Aktionen im Spiel." },
  { id:"testing", title:"Tests & Balancing", category:"quality", detail:"Error finden und Spielbalance prüfen.", terms:["test","testen","debug","fehler","balancing","bug"], prompt:"Erstelle eine Test- und Balancing-Checkliste für mein Roblox-Spiel." },
  { id:"security", title:"Sicherheit", category:"backend", detail:"Serverseitige Prüfungen und Schutz vor Manipulation.", terms:["security","sicherheit","exploit","anti cheat","anticheat"], prompt:"Prüfe die Sicherheit meines Spielsystems und plane serverseitige Validierungen." }
];

function ensureGraph(p) {
  if (!Array.isArray(p.graphNodes)) p.graphNodes = [];
  if (!Array.isArray(p.graphLinks)) p.graphLinks = [];

  const text = (
    String(p.title || "") + " " +
    (p.history || []).map(h => String(h.prompt || "") + " " + String(h.result || "")).join(" ")
  ).toLowerCase();

  const wanted = GRAPH_FEATURES.filter(feature =>
    feature.category === "core" ||
    feature.id === "ui" ||
    feature.id === "testing" ||
    feature.terms.some(term => text.includes(term))
  );

  const existing = new Set(p.graphNodes.map(node => node.id));
  const center = p.graphNodes.find(node => node.id === "project-root");

  if (!center) {
    p.graphNodes.unshift({
      id:"project-root",
      title:p.title || "Mein Spiel",
      detail:"Zentrales Roblox-Projekt",
      prompt:"Analysiere mein gesamtes Roblox-Projekt und fasse die wichtigsten Systeme und nächsten Schritte zusammen.",
      category:"root", status:"active", x:570, y:420
    });
  } else {
    center.title = p.title || center.title;
  }

  const count = p.graphNodes.length;
  wanted.forEach((feature, index) => {
    if (existing.has(feature.id)) return;
    const angle = (index * 2.399963) - Math.PI / 2;
    const ring = 220 + Math.floor(index / 8) * 125;
    p.graphNodes.push({
      id:feature.id,
      title:feature.title,
      detail:feature.detail,
      prompt:feature.prompt,
      category:feature.category,
      status:"planned",
      x:570 + Math.cos(angle) * ring,
      y:420 + Math.sin(angle) * ring
    });
    existing.add(feature.id);
  });

  const ids = new Set(p.graphNodes.map(node => node.id));
  for (const node of p.graphNodes) {
    if (node.id !== "project-root" &&
        !p.graphLinks.some(link => link.from === "project-root" && link.to === node.id)) {
      p.graphLinks.push({ from:"project-root", to:node.id });
    }
  }

  p.graphLinks = p.graphLinks.filter(link => ids.has(link.from) && ids.has(link.to));
}

function discoverGraphFeatures(p, text) {
  ensureGraph(p);
  const lower = String(text || "").toLowerCase();
  const known = new Set(p.graphNodes.map(node => node.id));

  for (const feature of GRAPH_FEATURES) {
    if (known.has(feature.id)) continue;
    if (!feature.terms.some(term => lower.includes(term))) continue;

    const index = p.graphNodes.length;
    const angle = index * 2.399963;
    const ring = 330 + Math.floor(index / 7) * 115;
    p.graphNodes.push({
      id:feature.id,
      title:feature.title,
      detail:feature.detail,
      prompt:feature.prompt,
      category:feature.category,
      status:"planned",
      x:570 + Math.cos(angle) * ring,
      y:420 + Math.sin(angle) * ring
    });
    p.graphLinks.push({ from:"project-root", to:feature.id });
    known.add(feature.id);
  }
}

function persistGraph() {
  const items = projects();
  const p = items.find(item => item.id === id);
  if (!p) return;
  p.updatedAt = new Date().toISOString();
  save(items);
}

function renderScripts() {
  const p = project();

  if (!p) {
    title.textContent = "Project not found";
    generateButton.disabled = true;
    scriptsBox.textContent = "Dieses Project was not found. Return to the dashboard.";
    treeScripts.replaceChildren();
    return;
  }

  title.textContent = p.title;
  const treeName = $("#project-tree-name");
  if (treeName) treeName.textContent = p.title;

  ensureGraph(p);
  const archived = p.archived === true;
  const nodes = p.graphNodes;
  const links = p.graphLinks;
  const root = nodes.find(node => node.id === "project-root");
  const history = Array.isArray(p.history) ? p.history : [];

  const done = nodes.filter(node => node.status === "done").length;
  info.textContent = done + " / " + Math.max(0, nodes.length - 1) + " systems complete";

  generateButton.disabled = archived;
  promptBox.disabled = archived;
  promptBox.placeholder = archived
    ? "This project is archived. Restore it from the dashboard to make changes."
    : "Beschreibe ein neues Feature oder eine Verbesserung …";

  treeScripts.replaceChildren();
  nodes.filter(node => node.id !== "project-root").forEach(node => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "project-tree-file";
    item.textContent = (node.status === "done" ? "✓ " : node.status === "active" ? "◉ " : "○ ") + node.title;
    item.addEventListener("click", () => {
      promptBox.value = node.prompt || ("Entwickle das System " + node.title + " passend zu meinem Projekt.");
      promptBox.focus();
      selectGraphNode(node.id);
    });
    treeScripts.appendChild(item);
  });

  const overview = document.createElement("div");
  overview.className = "nexora-graph-shell";

  const toolbar = document.createElement("div");
  toolbar.className = "nexora-graph-toolbar";

  const graphTitle = document.createElement("div");
  graphTitle.innerHTML = "<strong>System Map</strong><span>Your game, its features, and their connections</span>";

  const controls = document.createElement("div");
  controls.className = "nexora-graph-controls";

  const zoomOut = document.createElement("button");
  zoomOut.type = "button";
  zoomOut.textContent = "−";
  const zoomLabel = document.createElement("span");
  zoomLabel.textContent = "100%";
  const zoomIn = document.createElement("button");
  zoomIn.type = "button";
  zoomIn.textContent = "+";
  const fit = document.createElement("button");
  fit.type = "button";
  fit.textContent = "Fit View";

  controls.append(zoomOut, zoomLabel, zoomIn, fit);
  toolbar.append(graphTitle, controls);

  const legend = document.createElement("div");
  legend.className = "nexora-graph-legend";
  legend.innerHTML = '<span><i class="planned"></i> Planned</span><span><i class="active"></i> In Progress</span><span><i class="done"></i> Complete</span><span class="nexora-graph-hint">Drag nodes · click to explore · change status</span>';

  const viewport = document.createElement("div");
  viewport.className = "nexora-graph-viewport";

  let graphPan = null;

  viewport.addEventListener("pointerdown", (event) => {
    const clickedNode = event.target instanceof Element
      && event.target.closest(".nexora-graph-node");

    if (clickedNode || event.button !== 0) return;

    graphPan = {
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop
    };

    viewport.classList.add("is-panning");
    viewport.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!graphPan) return;

    viewport.scrollLeft = graphPan.left - (event.clientX - graphPan.x);
    viewport.scrollTop = graphPan.top - (event.clientY - graphPan.y);
  });

  function stopGraphPan() {
    graphPan = null;
    viewport.classList.remove("is-panning");
  }

  viewport.addEventListener("pointerup", stopGraphPan);
  viewport.addEventListener("pointercancel", stopGraphPan);


  const canvas = document.createElement("div");
  canvas.className = "nexora-graph-canvas";
  canvas.style.width = "1500px";
  canvas.style.height = "1100px";

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "nexora-graph-lines");
  svg.setAttribute("width", "1500");
  svg.setAttribute("height", "1100");

  links.forEach(link => {
    const a = nodes.find(node => node.id === link.from);
    const b = nodes.find(node => node.id === link.to);
    if (!a || !b) return;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x + 70);
    line.setAttribute("y1", a.y + 35);
    line.setAttribute("x2", b.x + 70);
    line.setAttribute("y2", b.y + 35);
    line.setAttribute("class", "nexora-graph-edge");
    svg.appendChild(line);
  });

  canvas.appendChild(svg);
  let scale = 1;

  function applyZoom() {
    canvas.style.transform = "scale(" + scale + ")";
    zoomLabel.textContent = Math.round(scale * 100) + "%";
  }
  zoomIn.addEventListener("click", () => { scale = Math.min(1.5, scale + .1); applyZoom(); });
  zoomOut.addEventListener("click", () => { scale = Math.max(.55, scale - .1); applyZoom(); });
  fit.addEventListener("click", () => {
    scale = Math.min(1, (viewport.clientWidth - 30) / 1500);
    applyZoom();
    viewport.scrollTo({ left:0, top:0, behavior:"smooth" });
  });

  nodes.forEach(node => {
    const card = document.createElement("div");
    card.className = "nexora-graph-node" +
      (node.id === "project-root" ? " root" : "") +
      " status-" + (node.status || "planned");
    card.style.left = node.x + "px";
    card.style.top = node.y + "px";
    card.dataset.nodeId = node.id;

    const open = document.createElement("button");
    open.type = "button";
    open.className = "nexora-graph-node-open";
    open.textContent = node.id === "project-root" ? "◈ " + node.title : node.title;
    open.title = node.detail || node.title;
    open.addEventListener("click", () => {
      if (node.id === "project-root") {
        promptBox.value = "Analysiere das gesamte Projekt „" + p.title + "“ und schlage passende neue Systeme vor.";
      } else {
        promptBox.value = node.prompt || ("Verbessere das System " + node.title + " für mein Roblox-Projekt.");
      }
      promptBox.focus();
      selectGraphNode(node.id);
    });

    const status = document.createElement("button");
    status.type = "button";
    status.className = "nexora-graph-node-status";
    status.textContent = node.id === "project-root" ? "PROJECT" :
      node.status === "done" ? "✓ COMPLETE" :
      node.status === "active" ? "◉ IN PROGRESS" : "○ PLANNED";
    status.disabled = archived || node.id === "project-root";
    status.addEventListener("click", event => {
      event.stopPropagation();
      node.status = node.status === "planned" ? "active" :
        node.status === "active" ? "done" : "planned";
      persistGraph();
      renderScripts();
    });

    card.append(open, status);
    canvas.appendChild(card);

    if (node.id !== "project-root" && !archived) {
      let drag = null;
      card.addEventListener("pointerdown", event => {
        if (event.target === status || event.target === open) return;
        drag = { x:event.clientX, y:event.clientY, left:node.x, top:node.y };
        card.setPointerCapture(event.pointerId);
      });
      card.addEventListener("pointermove", event => {
        if (!drag) return;
        node.x = Math.max(15, Math.min(1400, drag.left + (event.clientX - drag.x) / scale));
        node.y = Math.max(15, Math.min(1000, drag.top + (event.clientY - drag.y) / scale));
        card.style.left = node.x + "px";
        card.style.top = node.y + "px";
        const edgeLines = svg.querySelectorAll("line");
        links.forEach((link, index) => {
          const a = nodes.find(n => n.id === link.from);
          const b = nodes.find(n => n.id === link.to);
          const line = edgeLines[index];
          if (!line || !a || !b) return;
          line.setAttribute("x1", a.x + 70);
          line.setAttribute("y1", a.y + 35);
          line.setAttribute("x2", b.x + 70);
          line.setAttribute("y2", b.y + 35);
        });
      });
      card.addEventListener("pointerup", () => {
        if (!drag) return;
        drag = null;
        persistGraph();
      });
      card.addEventListener("pointercancel", () => { drag = null; });
    }
  });

  viewport.appendChild(canvas);
  overview.append(toolbar, legend, viewport);

  const footer = document.createElement("div");
  footer.className = "nexora-graph-footer";
  footer.textContent = archived
    ? "📦 Archived Project · Die System Map ist schreibgeschützt."
    : nodes.length - 1 + " systems · " + links.length + " connections · Relevant systems are added automatically.";
  overview.appendChild(footer);

  scriptsBox.replaceChildren(overview);
  $("#editor-file-title").textContent = "System Map";
  $("#editor-file-path").textContent = archived ? "Archived Project" : "Interactive project graph";
  $("#editor-copy").disabled = true;
  $("#editor-copy").textContent = "System-Map";

  // Neu erzeugte Grundstruktur dauerhaft sichern.
  if (!p.graphInitialized) {
    p.graphInitialized = true;
    persistGraph();
  }
}

function selectGraphNode(nodeId) {
  document.querySelectorAll(".nexora-graph-node").forEach(card => {
    card.classList.toggle("selected", card.dataset.nodeId === nodeId);
  });
}

$("#editor-copy").addEventListener("click", async () => {
  if (!selectedScriptCode) return;
  const button = $("#editor-copy");
  try {
    await navigator.clipboard.writeText(selectedScriptCode);
    button.textContent = "✓ Kopiert";
    setTimeout(() => { button.textContent = "⧉ Code kopieren"; }, 1600);
  } catch {
    button.textContent = "Kopieren nicht möglich";
  }
});

function extract(result) {
  if (typeof result !== "string" || !result.trim()) return [];

  const pattern = /```(?:lua|luau)?[ \t]*\r?\n([\s\S]*?)```/gi;
  const blocks = [...result.matchAll(pattern)];
  if (!blocks.length) return [];

  return blocks.map((match, index) => {
    const previousEnd = index === 0 ? 0 :
      blocks[index - 1].index + blocks[index - 1][0].length;
    const header = result.slice(previousEnd, match.index);
    const lines = header.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

    const typeMatch = header.match(/Typ\s*:\s*(Script|LocalScript|ModuleScript)/i);
    const pathMatch = header.match(/Pfad\s*:\s*([^\r\n]+)/i);

    const heading = lines.find(line =>
      !/^Typ\s*:/i.test(line) &&
      !/^Pfad\s*:/i.test(line) &&
      !/^[-*]\s*$/.test(line)
    );

    const title = (heading || "NexoraScript" + (index + 1))
      .replace(/^#{1,6}\s*/, "")
      .replace(/^\*\*(.*?)\*\*$/, "$1")
      .replace(/:$/, "")
      .trim()
      .slice(0, 80);

    const type = typeMatch ? typeMatch[1] : "Script";
    const fallback = type === "LocalScript"
      ? "StarterPlayer/StarterPlayerScripts"
      : type === "ModuleScript" ? "ReplicatedStorage" : "ServerScriptService";

    const targetPath = pathMatch
      ? pathMatch[1].trim().replace(/^`|`$/g, "").replace(/\s*>\s*/g, "/")
      : fallback;

    return {
      id: Date.now() + "-" + index,
      title: title || "NexoraScript" + (index + 1),
      type,
      path: targetPath,
      code: match[1].trim()
    };
  }).filter(item => item.code);
}
function message(label, text) {
  const box = document.createElement("article");
  box.style.cssText = "margin:12px 0;padding:14px;background:#151923;border:1px solid #39334d;border-radius:9px";
  const heading = document.createElement("strong");
  heading.textContent = label;
  const content = document.createElement("pre");
  content.textContent = text;
  content.style.whiteSpace = "pre-wrap";
  box.append(heading, content);
  chat.prepend(box);
}

async function generate() {
  const current = project();
  if (current && current.archived) {
    notice.textContent = "This project is archived. Restore it from the dashboard first.";
    return;
  }
  const request = promptBox.value.trim();
  if (!request) { notice.textContent = "Describe your idea first."; return; }
  generateButton.disabled = true;
  notice.textContent = "Nexora is building your system …";
  promptBox.value = "";
  message("You", request);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: request })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Generation failed.");
    if (!data.result) throw new Error("Nexora returned an empty response.");

    const items = projects();
    const p = items.find(item => item.id === id);
    if (!p) throw new Error("Project not found.");

    const newScripts = extract(data.result);
    p.scripts = p.scripts || [];
    p.history = p.history || [];
    p.scripts.push(...newScripts);
    p.history.push({ prompt: request, result: data.result, createdAt: new Date().toISOString() });
    discoverGraphFeatures(p, request + " " + data.result);
    p.updatedAt = new Date().toISOString();
    save(items);

    message("⚡ Nexora Forge", data.result);
    renderScripts();
    renderProjects();
    notice.textContent = "Projekt aktualisiert · passende Systeme wurden in die System-Map aufgenommen."
  } catch (error) {
    notice.textContent = error.message;
    message("Error", error.message);
  } finally {
    generateButton.disabled = false;
  }
}

generateButton.addEventListener("click", generate);
promptBox.addEventListener("keydown", event => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    generate();
  }
});
renderProjects();
renderScripts();

// NEXORA INITIAL PROJECT PROMPT
try {
  const pendingPrompt = sessionStorage.getItem("nexora-pending-project-prompt");
  if (pendingPrompt) {
    sessionStorage.removeItem("nexora-pending-project-prompt");
    promptBox.value = pendingPrompt;
    notice.textContent = "Deine erste Projektbeschreibung ist bereit. Klicke auf „System erstellen“, um zu starten.";
  }
} catch (error) {
  console.warn("Projektbeschreibung konnte nicht übernommen werden:", error);
}



syncProjectsFromServer();
