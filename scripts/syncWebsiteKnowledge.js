const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const WEBSITE_PAGES = require("../config/chatbotPages");

const OUTPUT_PATH = path.join(
  __dirname,
  "../knowledge/zetaVKnowledge.json"
);

const cleanText = (text = "") => {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const createHash = (text) => {
  return crypto
    .createHash("sha256")
    .update(text.toLowerCase())
    .digest("hex");
};

const splitIntoChunks = (
  text,
  maxChunkLength = 900
) => {
  const cleanedText = cleanText(text);

  if (!cleanedText) {
    return [];
  }

  const sentences = cleanedText
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => cleanText(sentence))
    .filter(Boolean);

  const chunks = [];

  let currentChunk = "";

  for (const sentence of sentences) {
    if (
      currentChunk &&
      `${currentChunk} ${sentence}`.length >
        maxChunkLength
    ) {
      chunks.push(cleanText(currentChunk));

      currentChunk = sentence;
    } else {
      currentChunk = cleanText(
        `${currentChunk} ${sentence}`
      );
    }
  }

  if (currentChunk) {
    chunks.push(cleanText(currentChunk));
  }

  return chunks;
};

const extractVisibleSections = async (page) => {
  return page.evaluate(() => {
    const selectorsToRemove = [
      "script",
      "style",
      "noscript",
      "svg",
      "iframe",
      "nav",
      "footer",
    ];

    const body = document.body.cloneNode(true);

    selectorsToRemove.forEach((selector) => {
      body
        .querySelectorAll(selector)
        .forEach((element) => element.remove());
    });

    const candidateSelectors = [
      "main",
      "section",
      "article",
    ];

    const sections = [];

    candidateSelectors.forEach((selector) => {
      body
        .querySelectorAll(selector)
        .forEach((element) => {
          const text =
            element.innerText ||
            element.textContent ||
            "";

          if (text.trim().length >= 80) {
            sections.push(text);
          }
        });
    });

    if (!sections.length) {
      const fallbackText =
        body.innerText ||
        body.textContent ||
        "";

      sections.push(fallbackText);
    }

    return sections;
  });
};

const extractPageContent = async (
  browser,
  pageConfig
) => {
  const page = await browser.newPage();

  try {
    console.log(`Fetching: ${pageConfig.name}`);
    console.log(`URL: ${pageConfig.url}`);

    await page.goto(pageConfig.url, {
      waitUntil: "networkidle",
      timeout: 60000,
    });

    await page.waitForTimeout(2000);

    const title = cleanText(
      await page.title()
    );

    const sections =
      await extractVisibleSections(page);

    const pageChunks = [];

    sections.forEach((section) => {
      const chunks = splitIntoChunks(section);

      chunks.forEach((content) => {
        pageChunks.push({
          content,
          hash: createHash(content),
        });
      });
    });

    console.log(
      `Generated ${pageChunks.length} chunks from ${pageConfig.name}`
    );

    return {
      name: pageConfig.name,
      category: pageConfig.category,
      url: pageConfig.url,
      title,
      chunks: pageChunks,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `Failed to fetch ${pageConfig.name}:`,
      error.message
    );

    return {
      name: pageConfig.name,
      category: pageConfig.category,
      url: pageConfig.url,
      title: "",
      chunks: [],
      syncedAt: new Date().toISOString(),
      error: error.message,
    };
  } finally {
    await page.close();
  }
};

const syncWebsiteKnowledge = async () => {
  let browser;

  try {
    console.log("\n================================");
    console.log("Zeta-V Chatbot Knowledge Sync");
    console.log("================================\n");

    browser = await chromium.launch({
      headless: true,
    });

    const pages = [];

    for (const pageConfig of WEBSITE_PAGES) {
      const pageData = await extractPageContent(
        browser,
        pageConfig
      );

      pages.push(pageData);

      console.log("--------------------------------");
    }

    const uniqueHashes = new Set();

    const uniqueChunks = [];

    pages.forEach((page) => {
      page.chunks.forEach((chunk, index) => {
        if (uniqueHashes.has(chunk.hash)) {
          return;
        }

        uniqueHashes.add(chunk.hash);

        uniqueChunks.push({
          id: `${page.category}-${index + 1}`,
          pageName: page.name,
          category: page.category,
          url: page.url,
          title: page.title,
          content: chunk.content,
          hash: chunk.hash,
        });
      });
    });

    const knowledgeDirectory =
      path.dirname(OUTPUT_PATH);

    if (!fs.existsSync(knowledgeDirectory)) {
      fs.mkdirSync(knowledgeDirectory, {
        recursive: true,
      });
    }

    const output = {
      company: "Zeta-V Technology Solutions",
      website: "https://zeta-v.com",
      generatedAt: new Date().toISOString(),
      totalPages: pages.length,
      totalChunks: uniqueChunks.length,
      chunks: uniqueChunks,
    };

    fs.writeFileSync(
      OUTPUT_PATH,
      JSON.stringify(output, null, 2),
      "utf8"
    );

    console.log("\n================================");
    console.log("Knowledge sync completed");
    console.log(`Pages processed: ${pages.length}`);
    console.log(
      `Unique chunks: ${uniqueChunks.length}`
    );
    console.log(`Saved to: ${OUTPUT_PATH}`);
    console.log("================================\n");
  } catch (error) {
    console.error(
      "Knowledge sync failed:",
      error.message
    );

    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

syncWebsiteKnowledge();