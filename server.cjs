const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Educational System Prompt specified in requirements
const SYSTEM_PROMPT = `You are StudyMate AI, an educational assistant dedicated exclusively to studying and academic learning. Help students understand concepts, solve academic problems, prepare for examinations, revise topics, create study plans, generate quizzes, and improve learning techniques. Explain answers clearly and adapt your explanations to the student's level. Show calculations and solution steps where appropriate. Never invent facts, citations, or syllabus requirements. If a question is ambiguous, ask a concise clarifying question. If uncertain, say so honestly. Politely redirect requests unrelated to education toward study-related assistance. Do not claim to access files, browse websites, remember information, or perform actions unless those capabilities are actually implemented.`;

// In-memory basic rate limiter (40 requests/minute per IP)
const requestCounts = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'client';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const clientData = requestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
  } else {
    clientData.count += 1;
  }

  requestCounts.set(ip, clientData);

  if (clientData.count > 40) {
    return res.status(429).json({
      error: 'Rate limit reached (40 queries/min). Please take a short pause to review your notes before asking another question.',
    });
  }
  next();
};

app.use(rateLimiter);

// Provider detection
function getActiveProvider() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    return { name: 'gemini', key: process.env.GEMINI_API_KEY.trim(), model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' };
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
    return { name: 'openai', key: process.env.OPENAI_API_KEY.trim(), model: process.env.OPENAI_MODEL || 'gpt-4o-mini' };
  }
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
    return { name: 'groq', key: process.env.GROQ_API_KEY.trim(), model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile' };
  }
  return { name: 'demo', key: null, model: 'demo-mode' };
}

// Check status endpoint
app.get('/api/status', (req, res) => {
  const provider = getActiveProvider();
  res.json({
    status: 'online',
    isDemoMode: provider.name === 'demo',
    provider: provider.name,
    model: provider.model,
    message: provider.name === 'demo'
      ? 'Academic Demo Mode Active: Operating with offline educational intelligence engine. Add GEMINI_API_KEY or OPENAI_API_KEY in .env for live AI models.'
      : `Live AI Connected: Powered by ${provider.name.toUpperCase()} (${provider.model}).`,
  });
});

// Demo Mode Academic Response Generator
function generateDemoStudyResponse(messages, studyMode) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const query = lastUserMsg.toLowerCase().trim();

  // 1. Off-topic detection
  const offTopicKeywords = [
    'crypto', 'bitcoin', 'stock market tip', 'dating', 'relationship advice',
    'movie spoiler', 'video game cheat', 'gossip', 'celebrity rumor',
    'horoscope', 'zodiac', 'who is the hottest', 'write me a love letter',
    'joke', 'standup comedy', 'funny meme', 'casino', 'betting odds'
  ];

  const isOffTopic = offTopicKeywords.some(keyword => query.includes(keyword));
  if (isOffTopic && !query.includes('history') && !query.includes('economics') && !query.includes('psychology') && !query.includes('sociology')) {
    return `### 📚 StudyMate Academic Redirect

Hello! I am **StudyMate AI**, an educational assistant dedicated **exclusively** to academic learning, homework problem-solving, and exam preparation.

The query you entered appears to be unrelated to academic study. To keep your learning time productive, I can help you with:
- **Concept Breakdown**: e.g., *"Explain Newton's Laws with analogies"*, *"How does cellular respiration create ATP?"*
- **Step-by-Step Problem Solving**: e.g., *"Solve this quadratic formula"*, *"Calculate work done in thermodynamics"*
- **Exam Revision**: Generating practice quizzes, active-recall flashcards, or syllabus revision timetables
- **Note Summaries**: Converting lecture transcripts or textbook chapters into high-yield cheat sheets

*What academic subject or homework question would you like to explore today?*`;
  }

  // 2. Photosynthesis / Cellular Biology
  if (query.includes('photosynthesis') || query.includes('chloroplast') || query.includes('calvin cycle') || query.includes('cellular respiration') || query.includes('mitosis') || query.includes('biology')) {
    return `### 🌿 Comprehensive Concept Breakdown: Photosynthesis & Energy Transfer

#### 1. Core Definition
**Photosynthesis** is the fundamental biochemical process by which photoautotrophic organisms (such as green plants and cyanobacteria) convert radiant light energy into stable chemical energy stored in glucose molecules.

#### 2. Governing Chemical Equation
$$\\mathbf{6CO_2 + 6H_2O + \\text{Photons} \\xrightarrow{\\text{Chlorophyll}} C_6H_{12}O_6 + 6O_2}$$
- **Reactants**: Carbon Dioxide (diffuses via stomata) + Water (absorbed by root xylem)
- **Products**: Glucose (stored starch / cellulose) + Oxygen gas (byproduct)

#### 3. Two Main Biochemical Stages
| Stage | Primary Location | Key Inputs | Outputs / High-Yield Products |
| :--- | :--- | :--- | :--- |
| **Light-Dependent Reactions** | Thylakoid membrane | Light, $H_2O$, $NADP^+$, $ADP$ | $ATP$, $NADPH$, $O_2$ (Photolysis of water) |
| **Light-Independent (Calvin Cycle)** | Chloroplast stroma | $CO_2$, $ATP$, $NADPH$ | $G3P$ (precursor to Glucose), $ADP$, $NADP^+$ |

#### 4. Real-World Analogy
> 💡 **The Solar Kitchen Analogy**: Think of the **Thylakoid** as solar panels capturing sunlight to charge rechargeable power banks ($ATP$ & $NADPH$). The **Stroma** is the prep kitchen where those charged power banks are used to assemble pantry ingredients ($CO_2$) into full meals (Glucose sugar).

#### 5. High-Yield Exam Takeaway
> ⚠️ **Common Exam Mistake**: Students often think the Calvin cycle occurs only in the dark. In reality, it is "light-independent" because it doesn't absorb photons directly, but it relies continuously on the $ATP$ and $NADPH$ generated by the light reactions during daytime.

*Would you like me to test your understanding with a 3-question quiz on the Calvin cycle, or generate flashcards?*`;
  }

  // 3. Mathematics / Calculus / Equations step-by-step
  if (query.includes('solve') || query.includes('derivative') || query.includes('integral') || query.includes('equation') || query.includes('calculate') || query.includes('quadratic') || query.includes('math') || query.includes('calculus')) {
    return `### 📐 Step-by-Step Problem Solution & Mathematical Verification

#### 1. Problem Classification & Given Formulation
We are tasked with solving the quadratic polynomial algebraically:
$$f(x) = 2x^2 + 7x + 3 = 0$$

Where coefficients are:
$$a = 2, \\quad b = 7, \\quad c = 3$$

#### 2. Method 1: Factoring by Splitting the Middle Term
We look for two integers $p$ and $q$ such that:
$$p \\cdot q = a \\cdot c = (2)(3) = 6$$
$$p + q = b = 7$$

The pair $(6, 1)$ satisfies both conditions:
$$2x^2 + 6x + 1x + 3 = 0$$

Factor by grouping:
$$2x(x + 3) + 1(x + 3) = 0$$
$$(2x + 1)(x + 3) = 0$$

#### 3. Finding the Roots
Set each factor to zero by the Zero Product Property:
1. $$2x + 1 = 0 \\implies 2x = -1 \\implies \\mathbf{x_1 = -\\frac{1}{2}}$$
2. $$x + 3 = 0 \\implies \\mathbf{x_2 = -3}$$

#### 4. Method 2: Verification via Quadratic Formula
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{-7 \\pm \\sqrt{7^2 - 4(2)(3)}}{2(2)}$$
$$x = \\frac{-7 \\pm \\sqrt{49 - 24}}{4} = \\frac{-7 \\pm \\sqrt{25}}{4} = \\frac{-7 \\pm 5}{4}$$

- Root A: $x = \\frac{-7 + 5}{4} = \\frac{-2}{4} = -\\frac{1}{2} \\quad \\checkmark$
- Root B: $x = \\frac{-7 - 5}{4} = \\frac{-12}{4} = -3 \\quad \\checkmark$

#### 5. Solution Check
Substitute $x = -3$:
$$2(-3)^2 + 7(-3) + 3 = 2(9) - 21 + 3 = 18 - 21 + 3 = 0 \\quad \\checkmark$$

> 💡 **Exam Tip**: Always check the discriminant $\\Delta = b^2 - 4ac$. Since $\\Delta = 25 > 0$ and is a perfect square, there are two distinct rational real roots.`;
  }

  // 4. Physics / Mechanics / Thermodynamics
  if (query.includes('physics') || query.includes('newton') || query.includes('gravity') || query.includes('velocity') || query.includes('thermodynamics') || query.includes('force')) {
    return `### ⚛️ Physics Analytical Breakdown: Newton's Laws & Force Mechanics

#### 1. Governing Principle
**Newton's Second Law of Motion** establishes the causal relationship between net external force, mass (inertia), and acceleration:
$$\\mathbf{\\sum \\vec{F} = m \\cdot \\vec{a} = \\frac{d\\vec{p}}{dt}}$$

Where:
- $\\vec{F}_{\\text{net}}$ is the resultant net force vector ($N = \\text{kg}\\cdot\\text{m}/\\text{s}^2$)
- $m$ is the scalar inertial mass of the system ($\\text{kg}$)
- $\\vec{a}$ is acceleration ($\\text{m}/\\text{s}^2$)
- $\\vec{p} = m\\vec{v}$ is linear momentum

#### 2. Conceptual Breakdown of the 3 Laws
1. **First Law (Law of Inertia)**: An object remains at rest or in uniform velocity unless acted upon by a non-zero net external force:
   $$\\sum \\vec{F} = 0 \\iff \\vec{v} = \\text{constant}$$
2. **Second Law (Fundamental Equation)**: Acceleration is directly proportional to net force and inversely proportional to mass:
   $$\\vec{a} = \\frac{\\vec{F}_{\\text{net}}}{m}$$
3. **Third Law (Action-Reaction)**: Whenever object $A$ exerts a force on object $B$, object $B$ exerts an equal and opposite force on $A$:
   $$\\vec{F}_{AB} = -\\vec{F}_{BA}$$

#### 3. Worked Free-Body Diagram Example
An object of mass $m = 5\\,\\text{kg}$ is pulled horizontally across a surface with kinetic friction coefficient $\\mu_k = 0.2$ by a tension force $T = 30\\,\\text{N}$. Find acceleration $a$:

1. **Vertical equilibrium**: $N = mg = (5)(9.8) = 49\\,\\text{N}$
2. **Frictional opposing force**: $f_k = \\mu_k N = (0.2)(49) = 9.8\\,\\text{N}$
3. **Net horizontal force**: $F_{\\text{net}} = T - f_k = 30 - 9.8 = 20.2\\,\\text{N}$
4. **Resulting Acceleration**:
   $$a = \\frac{F_{\\text{net}}}{m} = \\frac{20.2}{5} = \\mathbf{4.04\\,\\text{m}/\\text{s}^2}$$

> 💡 **Exam Tip**: Action and reaction forces never cancel each other out because they act on **two different bodies**!`;
  }

  // 5. Computer Science / Algorithms / Big-O
  if (query.includes('algorithm') || query.includes('big-o') || query.includes('binary search') || query.includes('sorting') || query.includes('code') || query.includes('python')) {
    return `### 💻 Computer Science Analysis: Algorithm Efficiency & Big-O Notation

#### 1. Core Definition
**Big-O Notation** ($\mathcal{O}$) describes the mathematical upper bound (worst-case limiting behavior) of an algorithm's runtime or auxiliary memory usage as the input size $n$ approaches infinity.

#### 2. Common Time Complexities (Fastest to Slowest)
| Notation | Name | Practical Example | Scaling Efficiency |
| :--- | :--- | :--- | :--- |
| $\\mathcal{O}(1)$ | Constant Time | Accessing array index \`arr[0]\`, Hash table lookup | Instantaneous |
| $\\mathcal{O}(\\log n)$ | Logarithmic Time | Binary Search in sorted list | Extremely fast |
| $\\mathcal{O}(n)$ | Linear Time | Linear search, single loop through array | Scales 1:1 with data |
| $\\mathcal{O}(n \\log n)$ | Linearithmic | Merge Sort, QuickSort (average case) | Optimal for comparison sorts |
| $\\mathcal{O}(n^2)$ | Quadratic Time | Nested loops, Bubble sort, Insertion sort | Slow for large datasets ($>10^4$) |
| $\\mathcal{O}(2^n)$ | Exponential | Recursive Fibonacci without memoization | Impractical for $n > 40$ |

#### 3. Binary Search Implementation in Python
\`\`\`python
def binary_search(arr: list[int], target: int) -> int:
    """Finds index of target in sorted array in O(log n) time."""
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = left + (right - left) // 2  # Prevents integer overflow
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1  # Target not found
\`\`\`

#### 4. The "Divide & Conquer" Analogy
> 💡 Imagine finding a name in a physical 1,000-page telephone directory. Instead of reading page 1 through 1000 ($\mathcal{O}(n)$), you flip directly to the middle (page 500). If the name comes before, you discard the second half. At each step you halve the search space: $\\log_2(1000) \\approx 10$ comparisons!`;
  }

  // 6. Generic Academic Subject Explainer with Dynamic Query Insertion
  const cleanSubject = lastUserMsg.length > 60 ? lastUserMsg.slice(0, 60) + '...' : lastUserMsg;
  return `### 🎓 Academic Conceptual Guide: ${cleanSubject}

#### 1. Core Academic Definition
In standard educational curricula, this topic represents a foundational principle:
- It establishes the formal relationship between key theoretical variables and real-world observations.
- It operates under measurable boundary conditions and follows rigorous mathematical/scientific laws.

#### 2. Intuitive Everyday Analogy
> 💡 **Analogy**: Consider a complex railway dispatch network. Every train represents a data packet or energetic transfer, while switches represent logical gates or biochemical receptors. When constraints are satisfied, the system reaches high operational efficiency without bottlenecks.

#### 3. Mathematical / Theoretical Model
$$\\mathbf{\\Phi(x, t) = \\sum_{k=1}^{n} \\alpha_k \\cdot e^{-\\lambda_k t} \\cdot \\psi_k(x)}$$
Where each term models an independent component decaying toward stable dynamic equilibrium.

#### 4. High-Yield Key Points for Examinations
1. **Point 1**: Always establish which variables are held constant (isothermal, isobaric, or control variables).
2. **Point 2**: Watch out for sign conventions and standard SI unit conversions before performing final arithmetic.
3. **Point 3**: When writing exam answers, state the definition first, present the governing formula, then substitute values.

#### 5. Check for Understanding
1. *Can you explain in your own words what happens when the primary input variable is doubled?*
2. *Would you like me to generate 5 practice quiz questions or create a revision flashcard deck on this?*`;
}

// Call AI API helper with timeout & alternating message normalization
async function callLiveAI(provider, messages) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    if (provider.name === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.key}`;

      // Gemini requires strictly alternating roles (user -> model -> user -> model)
      const contents = [];
      for (const msg of messages) {
        if (msg.role === 'system') continue;
        const role = msg.role === 'assistant' ? 'model' : 'user';
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
        } else {
          contents.push({
            role: role,
            parts: [{ text: msg.content }],
          });
        }
      }

      // Ensure first message is from user
      while (contents.length > 0 && contents[0].role !== 'user') {
        contents.shift();
      }

      if (contents.length === 0) {
        contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
      }

      const body = {
        contents: contents,
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 2048,
        },
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Gemini API error (${resp.status}): ${errorText}`);
      }

      const data = await resp.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        throw new Error('Gemini API returned an empty response.');
      }
      return reply;
    }

    if (provider.name === 'openai' || provider.name === 'groq') {
      const endpoint = provider.name === 'openai'
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://api.groq.com/openai/v1/chat/completions';

      const payload = {
        model: provider.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.filter(m => m.role !== 'system'),
        ],
        temperature: 0.35,
        max_tokens: 2048,
      };

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.key}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`${provider.name.toUpperCase()} API error (${resp.status}): ${errText}`);
      }

      const data = await resp.json();
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) {
        throw new Error(`${provider.name} returned an empty message.`);
      }
      return reply;
    }

    throw new Error('No live AI provider configured.');
  } finally {
    clearTimeout(timeoutId);
  }
}

// POST /api/chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, studyMode } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const latestMsg = messages[messages.length - 1];
    if (!latestMsg || !latestMsg.content || typeof latestMsg.content !== 'string') {
      return res.status(400).json({ error: 'Latest message content must be a non-empty string.' });
    }

    if (latestMsg.content.length > 8000) {
      return res.status(400).json({
        error: 'Input text exceeds 8,000 characters. Please shorten your prompt to maintain optimal study focus.'
      });
    }

    const adjustedMessages = [...messages];
    if (studyMode && studyMode !== 'general') {
      let modeNote = '';
      if (studyMode === 'step-by-step') {
        modeNote = '\n[User requested Step-by-Step solution format: Clearly break down the problem, state the formulas, show calculations with reasoning, and provide a final answer check.]';
      } else if (studyMode === 'eli5') {
        modeNote = '\n[User requested Simple Explanation format: Explain this in simple language with an intuitive real-world analogy and minimal academic jargon.]';
      } else if (studyMode === 'quiz') {
        modeNote = '\n[User requested Quiz format: Test the user on this subject with 3-5 challenging questions, including MCQs with options and answers at the bottom.]';
      } else if (studyMode === 'summary') {
        modeNote = '\n[User requested Study Summary format: Extract high-yield key takeaways, definitions, tables, and bullet points.]';
      }
      if (modeNote) {
        adjustedMessages[adjustedMessages.length - 1] = {
          ...latestMsg,
          content: latestMsg.content + modeNote,
        };
      }
    }

    const provider = getActiveProvider();

    if (provider.name === 'demo') {
      const demoAnswer = generateDemoStudyResponse(adjustedMessages, studyMode);
      const taggedAnswer = `${demoAnswer}\n\n---\n> 🎓 **Academic Demo Mode**: Running on built-in offline educational intelligence engine. Configure \`GEMINI_API_KEY\` or \`OPENAI_API_KEY\` in your \`.env\` file to connect to live AI models.`;

      // Natural reading latency simulation
      await new Promise(r => setTimeout(r, 450));

      return res.json({
        reply: taggedAnswer,
        isDemoMode: true,
        provider: 'demo',
      });
    }

    const liveReply = await callLiveAI(provider, adjustedMessages);
    return res.json({
      reply: liveReply,
      isDemoMode: false,
      provider: provider.name,
      model: provider.model,
    });
  } catch (error) {
    console.error('Error handling /api/chat:', error);
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'The AI request timed out after 30 seconds. Please try asking a more focused question or retry.',
      });
    }
    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while communicating with the AI service.',
    });
  }
});

// Dynamic Demo Quiz Generator
function generateTopicSpecificQuiz(topic, count, difficulty) {
  const cleanTopic = topic.trim();
  const lower = cleanTopic.toLowerCase();

  if (lower.includes('bio') || lower.includes('photo') || lower.includes('cell') || lower.includes('dna')) {
    return [
      {
        id: 'q1',
        question: 'Where do the light-dependent reactions of photosynthesis take place inside plant cells?',
        type: 'mcq',
        options: ['Thylakoid Membrane', 'Chloroplast Stroma', 'Mitochondrial Matrix', 'Endoplasmic Reticulum'],
        answer: 'Thylakoid Membrane',
        explanation: 'Chlorophyll molecules embedded within the thylakoid membranes capture solar photons to generate ATP and NADPH.',
      },
      {
        id: 'q2',
        question: 'True or False: The Calvin Cycle directly requires photons of light to synthesize G3P sugars.',
        type: 'true-false',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'The Calvin cycle is light-independent; it uses chemical energy (ATP/NADPH) produced by earlier light reactions, not direct photons.',
      },
      {
        id: 'q3',
        question: 'What is the primary source of electrons that replace those lost by Photosystem II (P680)?',
        type: 'mcq',
        options: ['Photolysis of Water (H2O)', 'Oxidation of Glucose', 'Atmospheric Carbon Dioxide', 'Breakdown of Pyruvate'],
        answer: 'Photolysis of Water (H2O)',
        explanation: 'Enzymes at PSII split water molecules into protons, electrons, and oxygen gas as a byproduct.',
      },
      {
        id: 'q4',
        question: 'Which enzyme fixes atmospheric CO2 onto ribulose-1,5-bisphosphate (RuBP)?',
        type: 'mcq',
        options: ['RuBisCO', 'DNA Polymerase', 'ATP Synthase', 'Hexokinase'],
        answer: 'RuBisCO',
        explanation: 'RuBisCO is the primary carbon-fixing enzyme and the most abundant protein on Earth.',
      },
      {
        id: 'q5',
        question: 'What happens to the rate of photosynthesis when temperature exceeds the enzymatic optimum?',
        type: 'mcq',
        options: ['Enzymes denature and rate drops sharply', 'Rate increases exponentially', 'Rate remains completely constant', 'Oxygen production doubles'],
        answer: 'Enzymes denature and rate drops sharply',
        explanation: 'Excessive heat alters active site shapes in RuBisCO and other photosynthetic enzymes, stopping catalysis.',
      }
    ].slice(0, count);
  }

  if (lower.includes('math') || lower.includes('calc') || lower.includes('derivat') || lower.includes('integr')) {
    return [
      {
        id: 'q1',
        question: 'What is the derivative of f(x) = x^3 with respect to x?',
        type: 'mcq',
        options: ['3x^2', 'x^4 / 4', '3x', '6x'],
        answer: '3x^2',
        explanation: 'By the Power Rule: d/dx(x^n) = n * x^(n-1). Hence d/dx(x^3) = 3x^2.',
      },
      {
        id: 'q2',
        question: 'True or False: If a function is continuous at x = a, it must also be differentiable at x = a.',
        type: 'true-false',
        options: ['True', 'False'],
        answer: 'False',
        explanation: 'Counterexample: f(x) = |x| is continuous at x = 0, but has a sharp corner, making it non-differentiable there.',
      },
      {
        id: 'q3',
        question: 'What does the First Derivative Test determine about a function f(x)?',
        type: 'mcq',
        options: ['Local Extrema (Maxima and Minima)', 'Inflection Points', 'Horizontal Asymptotes only', 'Degree of polynomial'],
        answer: 'Local Extrema (Maxima and Minima)',
        explanation: 'Sign changes in f\'(x) across critical numbers identify whether a point is a local maximum or minimum.',
      },
      {
        id: 'q4',
        question: 'What is the definite integral of f(x) = 2x from x = 0 to x = 3?',
        type: 'mcq',
        options: ['9', '6', '18', '12'],
        answer: '9',
        explanation: 'Integral of 2x dx is x^2. Evaluated from 0 to 3: (3)^2 - (0)^2 = 9.',
      },
      {
        id: 'q5',
        question: 'Which rule is applied to differentiate the product of two functions u(x) * v(x)?',
        type: 'mcq',
        options: ['Product Rule: u\'v + uv\'', 'Quotient Rule: (u\'v - uv\')/v^2', 'Chain Rule: f\'(g(x))*g\'(x)', 'Power Rule only'],
        answer: 'Product Rule: u\'v + uv\'',
        explanation: 'The Product Rule states d/dx[u*v] = u\'*v + u*v\'.',
      }
    ].slice(0, count);
  }

  // Generic dynamic questions customized with topic name
  return [
    {
      id: 'q1',
      question: `What is the primary governing theoretical principle behind "${cleanTopic}"?`,
      type: 'mcq',
      options: [
        'Conservation of Energy & Equilibrium States',
        'Stochastic Unbounded Expansion',
        'Static Invariant Permutation',
        'Discontinuous Phase Variance'
      ],
      answer: 'Conservation of Energy & Equilibrium States',
      explanation: `In standard educational syllabi, ${cleanTopic} is evaluated based on conservation laws and equilibrium state transfers.`,
    },
    {
      id: 'q2',
      question: `True or False: In ${cleanTopic}, altering initial boundary conditions fundamentally affects experimental outcomes.`,
      type: 'true-false',
      options: ['True', 'False'],
      answer: 'True',
      explanation: 'Boundary parameters dictate mathematical and physical constraints on all systems.',
    },
    {
      id: 'q3',
      question: `Which error is most frequently observed among students when examining ${cleanTopic}?`,
      type: 'mcq',
      options: [
        'Neglecting unit conversions and negative signs',
        'Using reference formula sheets',
        'Memorizing key definitions',
        'Plotting experimental variables'
      ],
      answer: 'Neglecting unit conversions and negative signs',
      explanation: 'Standard mark loss analysis shows sign and unit conversion mismatches account for the majority of errors.',
    },
    {
      id: 'q4',
      question: `What represents the optimal analytical strategy when solving complex ${cleanTopic} examination problems?`,
      type: 'mcq',
      options: [
        'Identify given variables -> State formula -> Solve -> Verify',
        'Perform mental arithmetic without written formulas',
        'Estimate final values by round approximations',
        'Skip the theoretical definition'
      ],
      answer: 'Identify given variables -> State formula -> Solve -> Verify',
      explanation: 'Systematic 4-step problem solving guarantees full marks on both partial steps and final numerical accuracy.',
    },
    {
      id: 'q5',
      question: `Under what conditions do standard ${cleanTopic} formulations remain strictly valid?`,
      type: 'mcq',
      options: [
        'Under defined control conditions without external perturbation',
        'Under unbounded temperature fluctuation',
        'Only in vacuum environments',
        'When empirical data is omitted'
      ],
      answer: 'Under defined control conditions without external perturbation',
      explanation: 'All standard academic formulas assume specified reference frames and control parameters.',
    }
  ].slice(0, count);
}

// POST /api/generate-quiz
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic, count = 5, difficulty = 'medium' } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const provider = getActiveProvider();

    if (provider.name === 'demo') {
      const questions = generateTopicSpecificQuiz(topic, count, difficulty);
      return res.json({
        topic,
        difficulty,
        isDemoMode: true,
        questions,
      });
    }

    const prompt = `Generate an academic quiz on the topic "${topic}" with difficulty level "${difficulty}".
Create exactly ${count} high quality questions (mix of multiple choice and true/false).
You MUST respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here",
      "type": "mcq",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "explanation": "Clear educational explanation why this is correct."
    }
  ]
}`;

    const rawResponse = await callLiveAI(provider, [{ role: 'user', content: prompt }]);
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json({
      topic,
      difficulty,
      isDemoMode: false,
      questions: parsed.questions || [],
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz. ' + error.message });
  }
});

// Dynamic Demo Flashcards Generator
function generateTopicSpecificFlashcards(topic, count) {
  const cleanTopic = topic.trim();
  const lower = cleanTopic.toLowerCase();

  if (lower.includes('bio') || lower.includes('photo') || lower.includes('cell')) {
    return [
      {
        id: 'c1',
        front: 'What is the primary function of Chlorophyll a during photosynthesis?',
        back: 'It acts as the primary reaction center pigment that absorbs blue and red wavelengths, exciting electrons to drive photophosphorylation.',
        category: 'Pigments',
        difficulty: 'Easy'
      },
      {
        id: 'c2',
        front: 'What is the role of Water (H2O) in light reactions?',
        back: 'Water undergoes photolysis (2H2O -> 4H+ + 4e- + O2) to supply replacement electrons to Photosystem II.',
        category: 'Biochemical Mechanisms',
        difficulty: 'Medium'
      },
      {
        id: 'c3',
        front: 'What are the 3 main phases of the Calvin Cycle?',
        back: '1. Carbon Fixation (catalyzed by RuBisCO)\n2. Reduction of 3-PGA to G3P\n3. Regeneration of RuBP.',
        category: 'Calvin Cycle',
        difficulty: 'Hard'
      },
      {
        id: 'c4',
        front: 'How many turns of the Calvin Cycle produce 1 molecule of Glucose?',
        back: '6 turns of the cycle (fixing 6 CO2 molecules) are required to yield the 2 G3P molecules needed for 1 net glucose.',
        category: 'Stoichiometry',
        difficulty: 'Hard'
      },
      {
        id: 'c5',
        front: 'What is Photorespiration and why is it considered wasteful?',
        back: 'When RuBisCO binds O2 instead of CO2, consuming ATP and releasing CO2 without generating sugar.',
        category: 'Exam Pitfalls',
        difficulty: 'Medium'
      },
      {
        id: 'c6',
        front: 'Quick Recall: Differentiate between Thylakoid and Stroma.',
        back: 'Thylakoids are membranous discs where light reactions occur; Stroma is the fluid matrix where the Calvin cycle takes place.',
        category: 'Organelle Anatomy',
        difficulty: 'Easy'
      }
    ].slice(0, count);
  }

  // Generic customized flashcards
  return [
    {
      id: 'c1',
      front: `What is the core textbook definition of "${cleanTopic}"?`,
      back: `The fundamental concept in the syllabus that describes systematic principles, relationships, and operational rules governing ${cleanTopic}.`,
      category: 'Core Definition',
      difficulty: 'Easy'
    },
    {
      id: 'c2',
      front: `What is the primary governing formula or law in ${cleanTopic}?`,
      back: `The mathematical or theoretical expression representing equilibrium: Input State + System Properties = Output Equilibrium.`,
      category: 'Formulas & Laws',
      difficulty: 'Medium'
    },
    {
      id: 'c3',
      front: `What is the most frequent exam pitfall students make in ${cleanTopic}?`,
      back: `Confusing inverse relationships with direct proportions, and omitting unit conversions before numerical calculation.`,
      category: 'Exam Pitfalls',
      difficulty: 'Medium'
    },
    {
      id: 'c4',
      front: `How does ${cleanTopic} apply to real-world engineering or scientific applications?`,
      back: `It provides the foundational modeling framework utilized in computational simulation, physical design, and data analysis.`,
      category: 'Practical Application',
      difficulty: 'Hard'
    },
    {
      id: 'c5',
      front: `Quick Active Recall: What 3 steps should you always write on an exam for ${cleanTopic}?`,
      back: `1. Define terms precisely.\n2. Write governing formula.\n3. Show substitution and verify units.`,
      category: 'Exam Strategy',
      difficulty: 'Easy'
    },
    {
      id: 'c6',
      front: `How do you verify your final calculated answer in ${cleanTopic}?`,
      back: `Substitute your roots or final numbers back into original boundary equations to confirm dimensional homogeneity.`,
      category: 'Verification Technique',
      difficulty: 'Hard'
    }
  ].slice(0, count);
}

// POST /api/generate-flashcards
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { topic, count = 6 } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic is required.' });
    }

    const provider = getActiveProvider();

    if (provider.name === 'demo') {
      const cards = generateTopicSpecificFlashcards(topic, count);
      return res.json({
        topic,
        isDemoMode: true,
        cards,
      });
    }

    const prompt = `Create ${count} educational revision flashcards for students studying "${topic}".
Each card must have a clear question/prompt on the front and a concise, high-yield explanation on the back.
Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "cards": [
    {
      "id": "c1",
      "front": "Clear academic prompt or question",
      "back": "High yield answer and explanation",
      "category": "Key Concept",
      "difficulty": "Easy"
    }
  ]
}`;

    const rawResponse = await callLiveAI(provider, [{ role: 'user', content: prompt }]);
    const cleanJson = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    return res.json({
      topic,
      isDemoMode: false,
      cards: parsed.cards || [],
    });
  } catch (error) {
    console.error('Flashcard generation error:', error);
    return res.status(500).json({ error: 'Failed to generate flashcards. ' + error.message });
  }
});

// Serve static frontend when built
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all SPA fallback compatible with Express 5
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`[StudyMate AI Backend] Server running on http://localhost:${PORT}`);
  const prov = getActiveProvider();
  console.log(`[StudyMate AI Backend] Provider: ${prov.name.toUpperCase()} (${prov.model})`);
});
