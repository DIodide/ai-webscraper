import { Browser, Page } from "puppeteer"; // pptr.dev - Control Chrome using a Headless Browser
import { Logger } from "@/utils/logger";
import { Browser as CoreBrowser } from "puppeteer-core"; // for prod need to handle prod differently from local
import { getPuppeteerOptions } from "./puppeteerSetup"; // proprietary

const logger = new Logger("scraper");

function cleanText(text) {
  return text.replace(/\s+/g, " ").replace(/\n+/g, " ").trim();
}

export async function scrapeUrl(url: string) {
  logger.info("Starting scraping process for: ", url);

  let browser: Browser | CoreBrowser | null = null;
  try {
    logger.info("Launching puppeteer browser");

    // get the appropriate browser
    if (process.env.NODE_ENV === "development") {
      logger.info("Launching puppeteer browser on development");
      const puppeteer = await import("puppeteer");

      const launchOptions = await getPuppeteerOptions();
      logger.info("Launching puppeteer browser on development");
      browser = await puppeteer.launch(launchOptions);
      logger.info("Browser launched successfully");
    } else {
      logger.info("Launching puppeteer-core browser on production");
      const puppeteer = await import("puppeteer-core");

      // Log version information
      logger.info(`Node version: ${process.version}`);

      logger.info("Getting puppeteer options on production");
      const launchOptions = await getPuppeteerOptions();
      logger.info("Launching puppeteer-core browser on production");
      browser = await puppeteer.launch(launchOptions);
    }

    const page = (await browser.newPage()) as Page;
    await page.goto(url, { waitUntil: "networkidle2" }); // wait until the data on the website is loaded
    await autoScroll(page); // scroll to the bottom of the page to trigger lazy loading
    const fullContent = await page.content();
    logger.info("Scraping complete: received fullContent: ", fullContent);

    const title = await page
      .$eval("title", el => el.textContent || "")
      .catch(() => "");
    const h1 = await page
      .$eval("h1", el => el.textContent || "")
      .catch(() => "");
    const h2 = await page
      .$eval("h2", el => el.textContent || "")
      .catch(() => "");
    const metaDescription = await page
      .$eval('meta[name="description"]', el => el.getAttribute("content") || "")
      .catch(() => "");

    return {
      url,
      title: cleanText(title),
      headings: {
        h1: cleanText(h1),
        h2: cleanText(h2),
      },
      metaDescription: cleanText(metaDescription),
      content: cleanText(fullContent), // only thing we really use ong
      error: null,
    };
  } catch {
    logger.error("Error occurred while scraping the URL");
  } finally {
    // close the browser
    if (browser) {
      await browser.close();
    }
  }
}

// Helper function to scroll page and trigger lazy loading (scroll all the way down to make sure all the data is loaded since some websites are funky)
async function autoScroll(page: Page) {
  await page.evaluate(async () => {
    await new Promise<void>(resolve => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
