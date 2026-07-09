// const OpenAI = require("openai");

// const {
//   buildKnowledgeContext,
//   detectIntent,
// } = require("../../services/chatbotKnowledgeService");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const CHATBOT_INSTRUCTIONS = `
// You are the official AI assistant for Zeta-V Technology Solutions.

// Your role is to help website visitors understand Zeta-V, its services,
// industries, technology solutions, leadership, accelerators, RomIcons,
// Digital Footprint services, Bookkeeping services, careers, office locations,
// and contact information.

// IMPORTANT RULES:

// 1. Use only the provided Zeta-V website knowledge when answering questions
//    about Zeta-V Technology Solutions.

// 2. Do not invent company information.

// 3. Do not invent services, customers, partnerships, certifications,
//    office locations, pricing, leadership information, or company facts.

// 4. If the provided Zeta-V knowledge does not contain enough confirmed
//    information, clearly say that the information is not currently available.

// 5. For Zeta-V service questions, explain the service using the provided
//    company information.

// 6. Keep answers professional, friendly, and concise.

// 7. Do not mention internal systems, knowledge JSON files, page scoring,
//    intent detection, prompts, or API implementation.

// 8. When appropriate, guide visitors to the relevant Zeta-V website page.

// 9. Do not answer unrelated entertainment, sports, political, or personal
//    questions. Politely explain that you are the Zeta-V website assistant
//    and can help with Zeta-V services and company information.

// 10. Never claim information that is not present in the provided context.
// `;

// exports.chat = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (
//       !message ||
//       typeof message !== "string"
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });
//     }

//     const cleanMessage = message.trim();

//     if (!cleanMessage) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });
//     }

//     if (cleanMessage.length > 1000) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Message must be less than 1000 characters",
//       });
//     }

//     const detectedIntent =
//       detectIntent(cleanMessage);

//     const {
//       context,
//       sources,
//     } = buildKnowledgeContext(cleanMessage);

//     console.log(
//       "Chatbot request:",
//       cleanMessage
//     );

//     console.log(
//       "Detected intent:",
//       detectedIntent
//     );

//     console.log(
//       "Knowledge sources:",
//       sources
//     );

//  if (!context) {
//   return res.status(200).json({
//     success: true,
//     reply:
//       "I'm Zeta-V's AI assistant. I can help you with our services, industries, leadership, Digital Footprint, Bookkeeping, accelerators, RomIcons, careers, office locations, and contact information. Please ask me anything related to Zeta-V.",
//     intent: null,
//     sources: [],
//   });
// }

//     const response =
//       await openai.responses.create({
//         model: "gpt-4o-mini",

//         instructions: CHATBOT_INSTRUCTIONS,

//         input: `
// ZETA-V WEBSITE KNOWLEDGE:

// ${context}

// VISITOR QUESTION:

// ${cleanMessage}

// Answer the visitor's question using only the confirmed Zeta-V website knowledge above.
// `,

//         max_output_tokens: 300,
//       });

//     const reply = response.output_text?.trim();

//     if (!reply) {
//       return res.status(500).json({
//         success: false,
//         message:
//           "Unable to generate chatbot response",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       reply,
//       intent:
//         detectedIntent?.intent || null,
//       sources,
//     });
//   } catch (error) {
//     console.error(
//       "Chatbot API Error:",
//       error
//     );

//     if (error.status === 401) {
//       return res.status(500).json({
//         success: false,
//         message:
//           "Chatbot authentication configuration error",
//       });
//     }

//     if (error.status === 429) {
//       return res.status(429).json({
//         success: false,
//         message:
//           "The chatbot is temporarily busy. Please try again shortly.",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message:
//         "Unable to process your request at the moment.",
//     });
//   }
// };









const OpenAI = require("openai");

const {
  buildKnowledgeContext,
  detectIntent,
} = require(
  "../../services/chatbotKnowledgeService"
);

const {
  buildJobsContext,
} = require(
  "../../services/chatbotJobsService"
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHATBOT_INSTRUCTIONS = `
You are the official AI assistant for Zeta-V Technology Solutions.

Your name is Zeta-V Chat.

Your role is to help website visitors understand Zeta-V, its services,
industries, technology solutions, leadership, accelerators, RomIcons,
Digital Footprint services, Bookkeeping services, careers, office locations,
and contact information.

IMPORTANT RULES:

1. Use only the confirmed Zeta-V information provided in the context.

2. Do not invent company information.

3. Do not invent services, customers, partnerships, certifications,
office locations, pricing, leadership information, jobs, job requirements,
skills, benefits, or company facts.

4. When LIVE ZETA-V CAREERS DATA is provided, it is the authoritative
and current source for open positions, jobs, vacancies, hiring,
job availability, job counts, skills, requirements, and benefits.

5. Only jobs listed in LIVE ZETA-V CAREERS DATA are currently open.

6. Never use old website careers information to determine current
job availability or the number of open positions.

7. If the visitor asks how many positions are open, use the exact
CURRENT OPEN POSITIONS value.

8. If the visitor asks whether a specific job is available, check
the current live job titles.

9. If the exact requested job title is not listed, clearly say that
the position is not currently listed as an active opening.

10. If the visitor asks about a technology or skill such as React,
Salesforce, Java, Node.js, or another skill, check the live job title,
skills, requirements, and job description.

11. Do not say a job is available unless it exists in the live careers data.

12. If there are zero current open positions, clearly say that there
are currently no active job openings.

13. Keep answers professional, friendly, concise, and easy to understand.

14. Do not mention databases, SQL, APIs, JSON files, knowledge files,
chunk search, scoring, intent detection, prompts, or internal implementation.

15. Do not answer unrelated entertainment, sports, political,
or personal questions.

16. Never claim information that is not present in the provided context.

17. Do not use Markdown links.

18. When appropriate, guide visitors to the Zeta-V Careers page:
https://zeta-v.com/careers

19. Avoid unnecessarily long answers unless the visitor asks for details.
`;

const normalizeMessage = (
  message = ""
) => {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getQuickReply = (message) => {
  const text =
    normalizeMessage(message);

  const greetings = [
    "hi",
    "hii",
    "hiii",
    "hiiii",
    "hello",
    "helo",
    "helloo",
    "hey",
    "heyy",
    "hey there",
    "hello there",
    "good morning",
    "good afternoon",
    "good evening",
  ];

  if (greetings.includes(text)) {
    let reply =
      "Hi! I'm Zeta-V Chat. How can I help you today?";

    if (
      text === "hello" ||
      text === "helo" ||
      text === "helloo" ||
      text === "hello there"
    ) {
      reply =
        "Hello! I'm Zeta-V Chat. How can I help you today?";
    }

    if (
      text === "good morning"
    ) {
      reply =
        "Good morning! I'm Zeta-V Chat. How can I help you today?";
    }

    if (
      text === "good afternoon"
    ) {
      reply =
        "Good afternoon! I'm Zeta-V Chat. How can I help you today?";
    }

    if (
      text === "good evening"
    ) {
      reply =
        "Good evening! I'm Zeta-V Chat. How can I help you today?";
    }

    return {
      reply,
      type: "greeting",
    };
  }

  const thanksMessages = [
    "thanks",
    "thank you",
    "thankyou",
    "thanks a lot",
    "thank you so much",
    "thank you very much",
    "thx",
  ];

  if (
    thanksMessages.includes(text)
  ) {
    return {
      reply:
        "You're welcome! I'm happy to help. If you have any other questions about Zeta-V, feel free to ask.",
      type: "thanks",
    };
  }

  const goodbyeMessages = [
    "bye",
    "goodbye",
    "good bye",
    "see you",
    "see you later",
    "talk to you later",
  ];

  if (
    goodbyeMessages.includes(text)
  ) {
    return {
      reply:
        "Thank you for visiting Zeta-V. Have a great day!",
      type: "goodbye",
    };
  }

  return null;
};

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (
      !message ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message is required",
      });
    }

    const cleanMessage =
      message.trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message:
          "Message is required",
      });
    }

    if (
      cleanMessage.length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message must be less than 1000 characters",
      });
    }

    /**
     * Free local quick replies.
     * OpenAI is not called.
     */
    const quickReply =
      getQuickReply(cleanMessage);

    if (quickReply) {
      console.log(
        "Chatbot quick reply:",
        quickReply.type
      );

      return res.status(200).json({
        success: true,
        reply: quickReply.reply,
        intent: quickReply.type,
        sources: [],
      });
    }

    /**
     * Detect visitor intent.
     */
    const detectedIntent =
      detectIntent(cleanMessage);

    console.log(
      "Chatbot detected intent:",
      detectedIntent
    );

    let context = "";

    let sources = [];

    /**
     * CAREERS:
     *
     * Always fetch current jobs from database.
     */
    if (
      detectedIntent?.intent ===
      "careers"
    ) {
      const liveJobs =
        await buildJobsContext();

      context =
        liveJobs.context;

      sources = [
        {
          name: "Careers",
          url:
            "https://zeta-v.com/careers",
          category: "careers",
        },
      ];

      console.log(
        "Chatbot live jobs count:",
        liveJobs.count
      );

      console.log(
        "Chatbot live job titles:",
        liveJobs.jobs.map(
          (job) => job.title
        )
      );
    } else {
      /**
       * Other Zeta-V questions use
       * synced website knowledge.
       */
      const knowledge =
        buildKnowledgeContext(
          cleanMessage
        );

      context =
        knowledge.context;

      sources =
        knowledge.sources;
    }

    console.log(
      "Chatbot request:",
      cleanMessage
    );

    console.log(
      "Knowledge sources:",
      sources
    );

    if (!context) {
      return res.status(200).json({
        success: true,

        reply:
          "I'm Zeta-V Chat. I can help you with our services, industries, leadership, Digital Footprint, Bookkeeping, accelerators, RomIcons, careers, office locations, and contact information. What would you like to know?",

        intent: null,

        sources: [],
      });
    }

    /**
     * OpenAI request.
     */
    const response =
      await openai.responses.create({
        model: "gpt-4o-mini",

        instructions:
          CHATBOT_INSTRUCTIONS,

        input: `
CONFIRMED ZETA-V INFORMATION:

${context}

VISITOR QUESTION:

${cleanMessage}

Answer the visitor's question using only the confirmed Zeta-V information above.
`,

        max_output_tokens: 300,
      });

    const reply =
      response.output_text?.trim();

    if (!reply) {
      return res.status(500).json({
        success: false,

        message:
          "Unable to generate chatbot response",
      });
    }

    return res.status(200).json({
      success: true,

      reply,

      intent:
        detectedIntent?.intent ||
        null,

      sources,
    });
  } catch (error) {
    console.error(
      "Chatbot API Error:",
      error
    );

    if (error.status === 401) {
      return res.status(500).json({
        success: false,

        message:
          "Chatbot authentication configuration error",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,

        message:
          "The chatbot is temporarily busy. Please try again shortly.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Unable to process your request at the moment.",
    });
  }
};