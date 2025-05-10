import express from 'express';
import cors from 'cors';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

const app = express();
app.use(cors({ origin: 'https://scan.accessibility-act.it' }));
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--headless', '--disable-gpu'] });
    const port = new URL(browser.wsEndpoint()).port;
    const result = await lighthouse(url, {
      port,
      onlyCategories: ['accessibility'],
      output: 'json',
    });

    const report = result.lhr;
    const score = report.categories.accessibility.score;
    const issues = Object.values(report.audits)
      .filter(a => a.score !== 1)
      .map(a => ({ id: a.id, title: a.title, description: a.description }));

    res.json({ score, issues });
  } catch (err) {
    console.error('Lighthouse error:', err);
    res.status(500).json({ error: 'Scan failed' });
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
