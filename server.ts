import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import zlib from "zlib";
import csv from "csv-parser";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Heatmap State Data (Parsed from 2026OlympicsHometownData.csv)
  app.get("/api/athletes/state", (req, res) => {
    const { state } = req.query;
    const athletes: any[] = [];
    
    if (fs.existsSync("data/2026OlympicsHometownData.csv")) {
      fs.createReadStream("data/2026OlympicsHometownData.csv")
        .pipe(csv())
        .on('data', (row) => {
          const rowState = row.State || row.state;
          if (rowState && String(rowState).trim().toLowerCase() === String(state).trim().toLowerCase()) {
            athletes.push({
              name: row.Name || row.name || "Unknown",
              sport: row.Sport || row.sport || "Unknown",
              type: row.Type || row.type || "Olympics"
            });
          }
        })
        .on('end', () => {
          res.json({
            state: state,
            total: athletes.length,
            athletes
          });
        })
        .on('error', (err) => {
           res.json({ state, total: 0, athletes: [] });
        });
    } else {
      res.json({
        state: state,
        total: 0,
        athletes: []
      });
    }
  });

  // API 2: AI Agent Query Historical Data
  // Dynamically parses the .gz file to find specific athletes or counts
  app.post("/api/dataset/query", async (req, res) => {
    const { searchTerm, filterNoc } = req.body;
    const results: any[] = [];
    
    // Safety check
    if (!fs.existsSync("data/athlete_events.csv.gz")) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    let count = 0;
    const MAX_RESULTS = 50;

    const stream = fs.createReadStream("data/athlete_events.csv.gz")
      .pipe(zlib.createGunzip())
      .pipe(csv())
      .on('data', (data) => {
        if (count >= MAX_RESULTS) return;
        
        let match = true;
        if (searchTerm) {
          const matchName = data.Name && data.Name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchSport = data.Sport && data.Sport.toLowerCase().includes(searchTerm.toLowerCase());
          if (!matchName && !matchSport) match = false;
        }
        if (filterNoc && data.NOC !== filterNoc) {
          match = false;
        }

        if (match) {
          results.push(data);
          count++;
        }
      })
      .on('end', () => {
        res.json({ results, note: "Results truncated to max 50 for performance" });
      })
      .on('error', (err) => {
        res.status(500).json({ error: err.message });
      });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
