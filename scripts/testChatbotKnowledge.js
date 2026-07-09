const {
  searchKnowledge,
} = require(
  "../services/chatbotKnowledgeService"
);

const questions = [
  "What services does Zeta-V provide?",

  "Tell me about bookkeeping services",

  "What is Digital Footprint?",

  "Which industries do you serve?",

  "Who is the CEO?",

  "Tell me about Zeta-V leadership team",

  "Where is your Pune office?",

  "How can I contact Zeta-V?",

  "What is RomIcons?",

  "Tell me about Zeta-V accelerator",

  "What is your mission and vision?",

  "Do you have any open positions?",
];

questions.forEach((question) => {
  console.log("\n");
  console.log("================================");

  console.log(
    `QUESTION: ${question}`
  );

  console.log("================================");

  const results = searchKnowledge(
    question,
    3
  );

  if (!results.length) {
    console.log("No knowledge found");

    return;
  }

  results.forEach((page, index) => {
    console.log(
      `${index + 1}. ${page.name}`
    );

    console.log(
      `   Category: ${page.category}`
    );

    console.log(
      `   Score: ${page.score}`
    );

    console.log(
      `   URL: ${page.url}`
    );
  });
});