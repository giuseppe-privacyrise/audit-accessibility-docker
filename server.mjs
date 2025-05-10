import express from 'express';
import cors from 'cors';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

const app = express();
app.use(cors({ origin: 'https://scan.accessibility-act.it' }));
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let chrome;
  try {
    chrome = await launch({ chromeFlags: ['--headless'] });
    const options = { logLevel: 'info', output: 'json', onlyCategories: ['accessibility'], port: chrome.port };
    const runnerResult = await lighthouse(url, options);

    const reportJson = runnerResult.lhr;
    const score = reportJson.categories.accessibility.score;
    const issues = Object.values(reportJson.audits)
      .filter(a => a.score !== 1)
      .map(a => ({ id: a.id, title: a.title, description: a.description }));

    res.json({ score, issues });
  } catch (err) {
    console.error('Lighthouse error:', err);
    res.status(500).json({ error: 'Scan failed' });
  } finally {
    if (chrome) await chrome.kill();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
