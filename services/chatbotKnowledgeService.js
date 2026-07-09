const fs = require("fs");
const path = require("path");

const KNOWLEDGE_PATH = path.join(
  __dirname,
  "../knowledge/zetaVKnowledge.json"
);

let cachedKnowledge = null;

const loadKnowledge = () => {
  try {
    if (cachedKnowledge) {
      return cachedKnowledge;
    }

    const knowledgeFile = fs.readFileSync(
      KNOWLEDGE_PATH,
      "utf8"
    );

    cachedKnowledge = JSON.parse(
      knowledgeFile
    );

    return cachedKnowledge;
  } catch (error) {
    console.error(
      "Failed to load chatbot knowledge:",
      error.message
    );

    return {
      chunks: [],
    };
  }
};

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const removeStopWords = (words) => {
  const stopWords = new Set([
    "a",
    "an",
    "the",
    "is",
    "are",
    "was",
    "were",
    "what",
    "which",
    "who",
    "where",
    "when",
    "why",
    "how",
    "do",
    "does",
    "did",
    "can",
    "could",
    "would",
    "should",
    "tell",
    "me",
    "about",
    "your",
    "you",
    "we",
    "our",
    "i",
    "to",
    "for",
    "of",
    "in",
    "on",
    "and",
    "or",
    "with",
    "zeta",
    "v",
    "have",
    "any",
  ]);

  return words.filter(
    (word) =>
      word.length > 2 &&
      !stopWords.has(word)
  );
};

const getQuestionKeywords = (question) => {
  return removeStopWords(
    normalizeText(question).split(" ")
  );
};

const detectIntent = (question) => {
  const text = normalizeText(question);

  const priorityIntents = [
    {
      intent: "leadership",
      category: "leadership",
      keywords: [
        "ceo",
        "founder",
        "leadership",
        "leader",
        "director",
        "management team",
        "leadership team",
      ],
    },

    {
      intent: "careers",
      category: "careers",
      keywords: [
        "career",
        "careers",
        "job",
        "jobs",
        "role",
        "roles",
        "opening",
        "openings",
        "position",
        "positions",
        "open position",
        "open positions",
        "current position",
        "current positions",
        "available position",
        "available positions",
        "vacancy",
        "vacancies",
        "hiring",
        "hire",
        "apply",
        "apply for job",
        "job available",
        "jobs available",
        "job opportunity",
        "job opportunities",
        "current jobs",
        "active jobs",
        "react developer job",
        "developer opening",
      ],
    },

    {
      intent: "contact",
      category: "contact",
      keywords: [
        "contact",
        "office",
        "location",
        "address",
        "phone",
        "email",
        "pune office",
        "hinjewadi",
        "get in touch",
        "social media",
        "linkedin",
      ],
    },

    {
      intent: "bookkeeping",
      category: "bookkeeping",
      keywords: [
        "bookkeeping",
        "book keeping",
        "accounting service",
        "accounting services",
        "financial records",
      ],
    },

    {
      intent: "digital-footprint",
      category: "digital-footprint",
      keywords: [
        "digital footprint",
        "online presence",
        "digital presence",
        "seo service",
        "seo services",
      ],
    },

    {
      intent: "accelerator",
      category: "accelerator",
      keywords: [
        "accelerator",
        "accelerators",
      ],
    },

    {
      intent: "romicons",
      category: "romicons",
      keywords: [
        "romicons",
        "romicon",
      ],
    },

    {
      intent: "industries",
      category: "industries",
      keywords: [
        "industry",
        "industries",
        "manufacturing",
        "healthcare",
        "financial services",
        "retail",
        "distribution",
      ],
    },
  ];

  for (
    const intentConfig of priorityIntents
  ) {
    const matchedKeyword =
      intentConfig.keywords.find(
        (keyword) =>
          text.includes(keyword)
      );

    if (matchedKeyword) {
      return {
        intent: intentConfig.intent,
        category: intentConfig.category,
      };
    }
  }

  const serviceKeywords = [
    "service",
    "services",
    "digital acceleration",
    "enterprise transformation",
    "workforce management",
    "shared services",
    "cloud",
    "devops",
    "cybersecurity",
    "gen ai",
    "generative ai",
    "automation",
    "application modernization",
    "rpa",
  ];

  if (
    serviceKeywords.some(
      (keyword) =>
        text.includes(keyword)
    )
  ) {
    return {
      intent: "services",
      category: "services",
    };
  }

  const companyKeywords = [
    "about company",
    "company story",
    "our story",
    "journey",
    "mission",
    "vision",
    "who are you",
    "who is zeta v",
    "what is zeta v",
  ];

  if (
    companyKeywords.some(
      (keyword) =>
        text.includes(keyword)
    )
  ) {
    return {
      intent: "company",
      category: "company",
    };
  }

  return null;
};

const calculateChunkScore = (
  chunk,
  keywords,
  detectedIntent
) => {
  const content = normalizeText(
    chunk.content
  );

  const pageName = normalizeText(
    chunk.pageName
  );

  const category = normalizeText(
    chunk.category
  );

  let score = 0;

  keywords.forEach((keyword) => {
    const escapedKeyword =
      keyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    const matches = content.match(
      new RegExp(
        `\\b${escapedKeyword}\\b`,
        "g"
      )
    );

    if (matches) {
      score += matches.length * 3;
    }

    if (pageName.includes(keyword)) {
      score += 20;
    }

    if (category.includes(keyword)) {
      score += 15;
    }
  });

  if (
    detectedIntent &&
    chunk.category ===
      detectedIntent.category
  ) {
    score += 100;
  }

  return score;
};

const searchKnowledge = (
  question,
  maxChunks = 5
) => {
  const knowledge = loadKnowledge();

  const keywords =
    getQuestionKeywords(question);

  const detectedIntent =
    detectIntent(question);

  console.log(
    "Chatbot search keywords:",
    keywords
  );

  console.log(
    "Chatbot detected intent:",
    detectedIntent
  );

  if (!knowledge.chunks?.length) {
    return [];
  }

  const scoredChunks = knowledge.chunks
    .map((chunk) => ({
      ...chunk,

      score: calculateChunkScore(
        chunk,
        keywords,
        detectedIntent
      ),
    }))
    .filter(
      (chunk) => chunk.score > 0
    )
    .sort(
      (a, b) => b.score - a.score
    );

  const intentChunks = detectedIntent
    ? scoredChunks.filter(
        (chunk) =>
          chunk.category ===
          detectedIntent.category
      )
    : [];

  const candidateChunks =
    intentChunks.length > 0
      ? intentChunks
      : scoredChunks;

  const selectedChunks = [];

  const selectedContent = new Set();

  for (const chunk of candidateChunks) {
    const normalizedContent =
      normalizeText(chunk.content);

    if (
      selectedContent.has(
        normalizedContent
      )
    ) {
      continue;
    }

    selectedContent.add(
      normalizedContent
    );

    selectedChunks.push(chunk);

    if (
      selectedChunks.length >=
      maxChunks
    ) {
      break;
    }
  }

  console.log(
    "Chatbot matched chunks:",
    selectedChunks.map(
      (chunk) => ({
        pageName: chunk.pageName,
        category: chunk.category,
        score: chunk.score,
        characters:
          chunk.content.length,
      })
    )
  );

  return selectedChunks;
};

const buildKnowledgeContext = (
  question
) => {
  const matchedChunks =
    searchKnowledge(question, 5);

  if (!matchedChunks.length) {
    return {
      context: "",
      sources: [],
    };
  }

  const context = matchedChunks
    .map((chunk, index) => {
      return `
KNOWLEDGE SECTION ${index + 1}

PAGE: ${chunk.pageName}

CATEGORY: ${chunk.category}

SOURCE URL: ${chunk.url}

CONTENT:

${chunk.content}
`;
    })
    .join(
      "\n\n--------------------\n\n"
    );

  const uniqueSources = new Map();

  matchedChunks.forEach((chunk) => {
    if (
      !uniqueSources.has(chunk.url)
    ) {
      uniqueSources.set(
        chunk.url,
        {
          name: chunk.pageName,
          url: chunk.url,
          category:
            chunk.category,
        }
      );
    }
  });

  return {
    context,

    sources: Array.from(
      uniqueSources.values()
    ),
  };
};

module.exports = {
  searchKnowledge,
  buildKnowledgeContext,
  detectIntent,
};