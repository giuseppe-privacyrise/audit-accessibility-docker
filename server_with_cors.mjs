import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';

const app = express();
const execAsync = promisify(exec);

// Enable CORS for specific origin
app.use(cors({
  origin: 'https://scan.accessibility-act.it'
}));

app.use(express.json());

app.post('/scan', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const { stdout } = await execAsync(
      `lighthouse ${url} --only-categories=accessibility --output=json --output-path=stdout --quiet --chrome-flags="--headless"`
    );
    const report = JSON.parse(stdout);

    const score = report.categories.accessibility.score;
    const issues = Object.values(report.audits)
      .filter(a => a.score !== 1)
      .map(a => ({ id: a.id, title: a.title, description: a.description }));

    res.json({ score, issues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Scan failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
