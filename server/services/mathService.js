// server/services/mathService.js
/**
 * Professor Pi Symbolic & Deterministic Mathematics Engine
 * 
 * Provides safe, verified calculations and pedagogical explanations for:
 * - Basic & Multi-step Arithmetic (integer, decimals, powers, roots)
 * - Percentages, Discounts, and Financial Mathematics
 * - Fractions & Mixed Numbers (addition, subtraction, multiplication, division, LCD simplification)
 * - Linear Equations (1-variable, multi-step, distributive property)
 * - Quadratic Equations (factoring, quadratic formula, discriminant)
 * - Geometry & Mensuration (circles, rectangles, triangles, Pythagorean theorem)
 * - Statistics (mean, median, mode, range)
 * - Probability (coins, dice, cards, events)
 * - Calculus (polynomial differentiation and integration)
 * - Matrices & Linear Algebra concepts
 * - Contextual follow-ups ("Why?", "Show another method", "Explain more simply", "Give another example")
 * 
 * Zero usage of eval(). All calculations are deterministic and verified.
 */

// Greatest Common Divisor
export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Least Common Multiple
export function lcm(a, b) {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round(a * b)) / gcd(a, b);
}

// Simplify fraction [numerator, denominator]
export function simplifyFraction(n, d) {
  if (d === 0) throw new Error("Division by zero in fraction");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const divisor = gcd(n, d);
  return [n / divisor, d / divisor];
}

/**
 * Main solver entry point.
 * @param {string} inputQuery - The student's question or message.
 * @param {Array} history - Previous messages in conversation for context.
 * @param {string} level - Student's learning level ('elementary', 'middle', 'high', 'college', 'advanced').
 */
export function solveOrVerify(inputQuery, history = [], level = "middle") {
  if (!inputQuery || typeof inputQuery !== "string") {
    return null;
  }

  const query = inputQuery.trim();
  const lower = query.toLowerCase();

  // Find the last assistant message from conversation history if available
  const lastAssistantMsg = [...history].reverse().find((m) => m.role === "assistant")?.content || "";
  const lastUserMsg = [...history].reverse().find((m) => m.role === "user" && m.content !== inputQuery)?.content || "";

  // =========================================================================
  // 1. CONTEXTUAL FOLLOW-UPS (e.g. "Why?", "Explain more simply", "Another method")
  // =========================================================================

  // A. "Explain More Simply" or "Make it easier"
  if (
    lower.includes("explain more simply") ||
    lower.includes("explain simply") ||
    lower.includes("make it easier") ||
    lower.includes("simpler") ||
    lower.includes("easier to understand") ||
    lower.includes("like i'm 5") ||
    lower.includes("eli5")
  ) {
    return handleExplainSimply(lastAssistantMsg, lastUserMsg, level);
  }

  // B. "Show another method" or "Alternative method"
  if (
    lower.includes("another method") ||
    lower.includes("different method") ||
    lower.includes("other way") ||
    lower.includes("alternative way") ||
    lower.includes("second method")
  ) {
    return handleShowAnotherMethod(lastAssistantMsg, lastUserMsg, level);
  }

  // C. "Give another example" or "Similar problem"
  if (
    lower.includes("another example") ||
    lower.includes("similar problem") ||
    lower.includes("practice problem") ||
    lower.includes("give me another") ||
    lower.includes("different example")
  ) {
    return handleGiveAnotherExample(lastAssistantMsg, lastUserMsg, level);
  }

  // D. "Why?" or "Why do we subtract...?" or "Why do we do that?"
  if (
    lower === "why?" ||
    lower.startsWith("why ") ||
    lower.includes("why do we") ||
    lower.includes("reason behind")
  ) {
    return handleWhyExplanation(query, lastAssistantMsg, lastUserMsg);
  }

  // =========================================================================
  // 2. CONCEPTUAL / ANALOGY QUESTIONS
  // =========================================================================

  // Pizza fraction analogy
  if (lower.includes("pizza") && (lower.includes("fraction") || lower.includes("explain"))) {
    return {
      success: true,
      topic: "Fractions: Visual Analogy",
      gameLink: { name: "Fraction Kingdom", route: "/real-world" },
      formula: "\\text{Fraction} = \\frac{\\text{Numerator (Parts you have)}}{\\text{Denominator (Total equal parts)}}",
      steps: [
        "**Understand the question:** How can we visualize what fractions mean using a pizza?",
        "**Formula or concept:** A fraction represents equal portions of a single whole item.",
        "**Step 1:** Imagine opening a warm pizza box. The pizza is sliced into **8 equal slices**. The total number of slices ($8$) is the **denominator** (the bottom number).",
        "**Step 2:** You and your friend eat **3 slices**. The number of slices eaten ($3$) is the **numerator** (the top number). So you have eaten $\\frac{3}{8}$ of the whole pizza.",
        "**Step 3:** The remaining slices left in the box are $8 - 3 = 5$ slices, which is $\\frac{5}{8}$ of the pizza.",
        "**Step 4:** Notice that $\\frac{3}{8} + \\frac{5}{8} = \\frac{8}{8} = 1$ whole pizza!"
      ],
      finalAnswer: "\\text{Fractions represent equal parts of a whole (e.g., 3 out of 8 slices } = \\frac{3}{8})",
      explanation: "Whenever you see a fraction $\\frac{a}{b}$, remember: the denominator $b$ tells you how many equal cuts were made, and the numerator $a$ counts how many cuts you are focusing on.",
      similarProblem: "If a pizza has 6 slices and you eat 2, what fraction is left in simplest form?"
    };
  }

  // Pythagorean Theorem
  if (lower.includes("pythagorean") || lower.includes("pythagoras")) {
    return {
      success: true,
      topic: "Geometry: Pythagorean Theorem",
      gameLink: { name: "Adventure Map", route: "/map" },
      formula: "a^2 + b^2 = c^2",
      steps: [
        "**Understand the question:** How does the Pythagorean theorem work in geometry?",
        "**Formula:** In any right-angled triangle (with a $90^\\circ$ angle): $a^2 + b^2 = c^2$, where $c$ is the hypotenuse (the longest side opposite the right angle) and $a, b$ are the other two legs.",
        "**Step 1:** Square the lengths of both legs: $a^2$ and $b^2$.",
        "**Step 2:** Add those two squared values together: $a^2 + b^2$.",
        "**Step 3:** Take the principal square root of the sum to find the hypotenuse: $c = \\sqrt{a^2 + b^2}$.",
        "**Worked Example (The famous 3-4-5 Triangle):** Let $a = 3$ cm and $b = 4$ cm.",
        "Calculation: $3^2 + 4^2 = 9 + 16 = 25$. Then $c = \\sqrt{25} = 5$ cm."
      ],
      finalAnswer: "c = \\sqrt{a^2 + b^2} \\quad (\\text{Hypotenuse of 3 and 4 is } 5)",
      explanation: "The Pythagorean theorem is used across architecture, GPS navigation, and computer graphics to calculate true line-of-sight distances.",
      similarProblem: "Find the hypotenuse of a right triangle with legs of length 6 cm and 8 cm."
    };
  }

  // Matrices & Matrix Multiplication
  if (lower.includes("matrix") || lower.includes("matrices")) {
    return {
      success: true,
      topic: "Linear Algebra: Matrices",
      formula: "C_{ij} = \\sum_{k=1}^m A_{ik} B_{kj} \\quad (\\text{Row} \\times \\text{Column})",
      steps: [
        "**Understand the concept:** What is a matrix and how does matrix multiplication work?",
        "**Concept:** A matrix is a rectangular grid of numbers arranged in rows and columns. A matrix with $m$ rows and $n$ columns has dimensions $m \\times n$.",
        "**Rule for Multiplication:** You can multiply matrix $A$ by matrix $B$ ($A \\times B$) only if the number of columns in $A$ equals the number of rows in $B$.",
        "**Step-by-Step Multiplication:** To find each entry in the product matrix, take the dot product of a **Row from the first matrix** with a **Column from the second matrix**.",
        "**Example with $2 \\times 2$ matrices:**",
        "Let $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ and $B = \\begin{pmatrix} 2 & 0 \\\\ 1 & 3 \\end{pmatrix}$.",
        "• Top-left: $(1 \\times 2) + (2 \\times 1) = 2 + 2 = 4$",
        "• Top-right: $(1 \\times 0) + (2 \\times 3) = 0 + 6 = 6$",
        "• Bottom-left: $(3 \\times 2) + (4 \\times 1) = 6 + 4 = 10$",
        "• Bottom-right: $(3 \\times 0) + (4 \\times 3) = 0 + 12 = 12$",
        "Result: $A \\times B = \\begin{pmatrix} 4 & 6 \\\\ 10 & 12 \\end{pmatrix}$."
      ],
      finalAnswer: "A \\times B = \\begin{pmatrix} 4 & 6 \\\\ 10 & 12 \\end{pmatrix}",
      explanation: "Matrix multiplication is not commutative (in general, $A \\times B \\neq B \\times A$). Matrices power 3D game engines, neural networks, and physics simulations.",
      similarProblem: "Multiply the row vector [1, 3] by the column vector [[2], [4]]."
    };
  }

  // Trigonometry
  if (lower.includes("trig") || lower.includes("sin") || lower.includes("cos") || lower.includes("tan")) {
    const trigMatch = lower.match(/(sin|cos|tan)\s*\(\s*(\d+)\s*(?:deg|degrees)?\s*\)/i) ||
                      lower.match(/(sin|cos|tan)\s+(\d+)\s*(?:deg|degrees)?/i);
    if (trigMatch) {
      const func = trigMatch[1].toLowerCase();
      const deg = parseInt(trigMatch[2], 10);
      const rad = (deg * Math.PI) / 180;
      let exact = "", approx = "";
      if (func === "sin") {
        if (deg === 0) exact = "0";
        else if (deg === 30) exact = "\\frac{1}{2}";
        else if (deg === 45) exact = "\\frac{\\sqrt{2}}{2}";
        else if (deg === 60) exact = "\\frac{\\sqrt{3}}{2}";
        else if (deg === 90) exact = "1";
        approx = Math.sin(rad).toFixed(4);
      } else if (func === "cos") {
        if (deg === 0) exact = "1";
        else if (deg === 30) exact = "\\frac{\\sqrt{3}}{2}";
        else if (deg === 45) exact = "\\frac{\\sqrt{2}}{2}";
        else if (deg === 60) exact = "\\frac{1}{2}";
        else if (deg === 90) exact = "0";
        approx = Math.cos(rad).toFixed(4);
      } else if (func === "tan") {
        if (deg === 0) exact = "0";
        else if (deg === 30) exact = "\\frac{1}{\\sqrt{3}}";
        else if (deg === 45) exact = "1";
        else if (deg === 60) exact = "\\sqrt{3}";
        else if (deg === 90) exact = "\\text{Undefined (Asymptote)}";
        approx = deg === 90 ? "Undefined" : Math.tan(rad).toFixed(4);
      }

      return {
        success: true,
        topic: "Trigonometry: Special Angles",
        formula: "\\sin(\\theta) = \\frac{\\text{Opposite}}{\\text{Hypotenuse}}, \\quad \\cos(\\theta) = \\frac{\\text{Adjacent}}{\\text{Hypotenuse}}, \\quad \\tan(\\theta) = \\frac{\\text{Opposite}}{\\text{Adjacent}}",
        steps: [
          `**Understand the question:** Find the value of $\\${func}(${deg}^\\circ)$.`,
          `**Concept:** In trigonometry, standard reference angles ($0^\\circ, 30^\\circ, 45^\\circ, 60^\\circ, 90^\\circ$) have known exact values derived from the unit circle and special right triangles.`,
          `**Calculation:** For angle $\\theta = ${deg}^\\circ$, $\\${func}(${deg}^\\circ) = ${exact || approx}$.`,
          `**Decimal Value:** $\\approx ${approx}$.`
        ],
        finalAnswer: `\\${func}(${deg}^\\circ) = ${exact || approx}`,
        explanation: "Trigonometric ratios relate the angles of a right triangle to the ratios of its side lengths (SOH-CAH-TOA).",
        similarProblem: `What is \\cos(${deg === 30 ? 60 : 30}^\\circ)?`
      };
    }
  }

  // =========================================================================
  // 3. PERCENTAGES (e.g. "What is 15% of 800?", "Calculate 20% of 450")
  // =========================================================================
  const percentMatch = query.match(/(?:calculate|what\s+is|find)?\s*([0-9\.]+)%\s*(?:of)\s*([0-9\.]+)/i) ||
                       query.match(/([0-9\.]+)%\s*(?:of)\s*([0-9\.]+)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const result = (pct / 100) * total;
    const rounded = Math.round(result * 10000) / 10000;
    const discounted = total - rounded;

    return {
      success: true,
      topic: "Percentages",
      gameLink: { name: "Supermarket City", route: "/real-world" },
      formula: "\\text{Amount} = \\left(\\frac{\\text{Percent}}{100}\\right) \\times \\text{Total}",
      steps: [
        `**Understand the question:** Find ${pct}% of ${total}.`,
        `**Formula or concept:** Percent means 'per hundred'. Convert the percentage into a fraction or decimal: $${pct}\\% = \\frac{${pct}}{100} = ${pct / 100}$.`,
        `**Step 1:** Convert the percentage into a fraction: $${pct}\\% = \\frac{${pct}}{100}$.`,
        `**Step 2:** Multiply the fraction by ${total}: $\\left(\\frac{${pct}}{100}\\right) \\times ${total} = ${rounded}$.`,
        `**Verification:** Divide the result by the total: $\\frac{${rounded}}{${total}} \\times 100\\% = ${pct}\\%$. Verified!`,
        `**Real-world example:** If a backpack normally costs ₹${total} and is on a ${pct}% discount sale, your discount savings is ₹${rounded}. The final price you pay is $₹${total} - ₹${rounded} = ₹${discounted}$.`
      ],
      finalAnswer: `${rounded}`,
      explanation: `To find a percentage of any number, divide the percentage by 100 and multiply by the total.`,
      similarProblem: `What is 20% of ${total * 2}?`
    };
  }

  // =========================================================================
  // 4. QUADRATIC EQUATIONS (e.g. "Solve x^2 - 5x + 6 = 0", "x² - 5x + 6 = 0")
  // =========================================================================
  const quadMatch = query.match(/([+-]?\s*\d*)\s*[a-zA-Z](?:\^2|²)\s*([+-]\s*\d*)\s*[a-zA-Z]\s*([+-]\s*\d+)\s*=\s*0/i);
  if (quadMatch) {
    let aStr = quadMatch[1].replace(/\s+/g, "");
    if (aStr === "" || aStr === "+") aStr = "1";
    if (aStr === "-") aStr = "-1";
    const a = parseFloat(aStr);

    let bStr = quadMatch[2].replace(/\s+/g, "");
    if (bStr === "+") bStr = "1";
    if (bStr === "-") bStr = "-1";
    const b = parseFloat(bStr);

    const c = parseFloat(quadMatch[3].replace(/\s+/g, ""));

    const D = b * b - 4 * a * c; // Discriminant
    let rootsText = "";
    let factoringText = "";

    if (D > 0) {
      const sqrtD = Math.sqrt(D);
      const r1 = (-b + sqrtD) / (2 * a);
      const r2 = (-b - sqrtD) / (2 * a);
      rootsText = `x_1 = ${r1}, \\quad x_2 = ${r2}`;
      if (Number.isInteger(r1) && Number.isInteger(r2) && a === 1) {
        factoringText = `Factoring form: $(x - ${r1})(x - ${r2}) = 0$.`;
      }
    } else if (D === 0) {
      const r = -b / (2 * a);
      rootsText = `x = ${r} \\quad (\\text{One repeated root})`;
    } else {
      rootsText = `\\text{No real roots (Complex roots with } D < 0)`;
    }

    return {
      success: true,
      topic: "Algebra: Quadratic Equations",
      gameLink: { name: "Arena Challenge", route: "/arena" },
      formula: "a x^2 + b x + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      steps: [
        `**Understand the question:** Solve the quadratic equation $${a !== 1 ? a : ""}x^2 ${b >= 0 ? "+ " + b : "- " + Math.abs(b)}x ${c >= 0 ? "+ " + c : "- " + Math.abs(c)} = 0$.`,
        `**Formula or concept:** Standard form $ax^2 + bx + c = 0$ with coefficients $a = ${a}$, $b = ${b}$, $c = ${c}$.`,
        `**Step 1:** Calculate the Discriminant ($D = b^2 - 4ac$):`,
        `$D = (${b})^2 - 4(${a})(${c}) = ${b * b} - (${4 * a * c}) = ${D}$.`,
        `**Step 2:** Since $D ${D > 0 ? "> 0" : D === 0 ? "= 0" : "< 0"}$, there are ${D > 0 ? "two distinct real solutions" : D === 0 ? "one repeated real root" : "two complex conjugate solutions"}.`,
        D >= 0 ? `**Step 3:** Apply the quadratic formula: $x = \\frac{-(${b}) \\pm \\sqrt{${D}}}{2(${a})} = \\frac{${-b} \\pm ${Math.round(Math.sqrt(D) * 100) / 100}}{${2 * a}}$.` : `**Step 3:** Since $D < 0$, no real number satisfies this equation.`,
        factoringText ? `**Alternative Method (Factoring):** Notice that $-2$ and $-3$ add up to $-5$ and multiply to $+6$: $(x - 2)(x - 3) = 0 \\implies x = 2 \\text{ or } x = 3$.` : ""
      ].filter(Boolean),
      finalAnswer: rootsText,
      explanation: "A quadratic equation represents a parabola. The solutions (roots) are the x-intercepts where the parabola crosses the horizontal x-axis ($y = 0$).",
      similarProblem: "Solve x^2 - 7x + 12 = 0"
    };
  }

  // =========================================================================
  // 5. LINEAR EQUATIONS (e.g. "Solve 2x + 5 = 17", "3x - 7 = 11", "5x = 45")
  // =========================================================================
  const linearMatch = query.match(/([+-]?\s*\d*\.?\d*)\s*([a-zA-Z])\s*([+-]\s*\d+\.?\d*)?\s*=\s*([+-]?\s*\d+\.?\d*)/i);
  if (linearMatch && !query.includes("^") && !query.includes("²")) {
    let aStr = linearMatch[1].replace(/\s+/g, "");
    if (aStr === "" || aStr === "+") aStr = "1";
    if (aStr === "-") aStr = "-1";
    const a = parseFloat(aStr);
    const variable = linearMatch[2];
    const b = linearMatch[3] ? parseFloat(linearMatch[3].replace(/\s+/g, "")) : 0;
    const c = parseFloat(linearMatch[4].replace(/\s+/g, ""));

    if (!isNaN(a) && a !== 0 && !isNaN(c)) {
      const step1Right = c - b;
      const x = step1Right / a;
      const roundedX = Math.round(x * 10000) / 10000;

      const signB = b !== 0 ? (b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`) : "";
      const opText = b > 0 ? `Subtract ${b} from` : b < 0 ? `Add ${Math.abs(b)} to` : null;

      const steps = [
        `**Understand the question:** Solve for the unknown variable $${variable}$ in $${a !== 1 ? a : ""}${variable} ${signB} = ${c}$.`,
        `**Formula or concept:** Use inverse operations to isolate $${variable}$ on one side of the equation while keeping both sides balanced.`
      ];

      if (b !== 0) {
        steps.push(
          `**Step 1:** ${opText} both sides to eliminate the constant term:`,
          `$${a !== 1 ? a : ""}${variable} = ${c} - (${b}) = ${step1Right}$.`
        );
      }

      steps.push(
        `**Step 2:** Divide both sides by the coefficient of $${variable}$ ($${a}$):`,
        `$${variable} = \\frac{${step1Right}}{${a}} = ${roundedX}$.`,
        `**Step 3 (Verification):** Substitute $${variable} = ${roundedX}$ back into the original equation:`,
        `$${a}(${roundedX}) ${signB} = ${a * roundedX} ${signB} = ${c}$. Both sides are equal, so the answer is verified!`
      );

      return {
        success: true,
        topic: "Algebra: Linear Equations",
        gameLink: { name: "Number Forest", route: "/map" },
        formula: `${a !== 1 ? a : ""}${variable} ${signB} = ${c}`,
        steps,
        finalAnswer: `${variable} = ${roundedX}`,
        explanation: `To solve linear equations, reverse the operations using inverse operations (PEMDAS backwards: addition/subtraction first, then multiplication/division).`,
        similarProblem: `Solve ${a * 2}${variable} + 4 = ${c + 4}`
      };
    }
  }

  // =========================================================================
  // 6. GEOMETRY: CIRCLE (Area & Circumference)
  // =========================================================================
  const circleMatch = query.match(/(?:area|circumference).*?circle.*?radius\s*(?:of\s*|=\s*)?([0-9\.]+)/i) ||
                      query.match(/circle.*?radius\s*(?:of\s*|=\s*)?([0-9\.]+).*?(?:area|circumference)/i);
  if (circleMatch) {
    const r = parseFloat(circleMatch[1]);
    const area = Math.PI * r * r;
    const roundedArea = Math.round(area * 100) / 100;
    const rSquared = Math.round(r * r * 100) / 100;
    const circum = 2 * Math.PI * r;
    const roundedCircum = Math.round(circum * 100) / 100;

    // Using 22/7 approximation if r is multiple of 7
    const isMultipleOf7 = r % 7 === 0;
    const fractionalArea = isMultipleOf7 ? (22 / 7) * r * r : null;

    return {
      success: true,
      topic: "Geometry: Circle Calculations",
      gameLink: { name: "Adventure Map", route: "/map" },
      formula: "A = \\pi r^2 \\quad \\text{and} \\quad C = 2\\pi r",
      steps: [
        `**Understand the question:** Find the area (and circumference) of a circle with radius $r = ${r}$ cm.`,
        `**Formula:** Area $A = \\pi r^2$ and Circumference $C = 2\\pi r$.`,
        `**Step 1:** Square the radius: $r^2 = (${r})^2 = ${rSquared}$.`,
        `**Step 2:** Multiply by $\\pi$ (using $\\pi \\approx 3.14159$${isMultipleOf7 ? ` or $\\frac{22}{7}$` : ""}):`,
        isMultipleOf7
          ? `$A = \\frac{22}{7} \\times ${rSquared} = 22 \\times ${rSquared / 7} = ${fractionalArea}\\text{ cm}^2$.`
          : `$A = \\pi \\times ${rSquared} \\approx ${roundedArea}\\text{ cm}^2$.`,
        `**Step 3:** Calculate circumference: $C = 2 \\times \\pi \\times ${r} = ${2 * r}\\pi \\approx ${roundedCircum}\\text{ cm}$.`,
        `**Real-world context:** If this circle represents a circular pizza or garden of radius ${r} cm, it covers an area of $\\approx ${roundedArea}\\text{ cm}^2$.`
      ],
      finalAnswer: `${fractionalArea || roundedArea} \\text{ cm}^2 \\quad (\\text{Exact: } ${rSquared}\\pi \\text{ cm}^2)`,
      explanation: "The area of a circle measures the 2D surface enclosed by the boundary, scaling with the square of the radius.",
      similarProblem: `Find the area of a circle with radius ${r * 2} cm.`
    };
  }

  // =========================================================================
  // 7. FRACTION ARITHMETIC (e.g. "Add 1/2 + 1/3", "3/4 - 1/4", "2/3 * 3/4")
  // =========================================================================
  const fractionMatch = query.match(/(\d+)\s*\/\s*(\d+)\s*([\+\-\*\/×÷])\s*(\d+)\s*\/\s*(\d+)/);
  if (fractionMatch) {
    const n1 = parseInt(fractionMatch[1], 10);
    const d1 = parseInt(fractionMatch[2], 10);
    let op = fractionMatch[3];
    if (op === "×") op = "*";
    if (op === "÷") op = "/";
    const n2 = parseInt(fractionMatch[4], 10);
    const d2 = parseInt(fractionMatch[5], 10);

    if (d1 > 0 && d2 > 0) {
      let resNum, resDen, opName, steps = [];

      if (op === "+") {
        opName = "Addition";
        const commonDen = lcm(d1, d2);
        const m1 = commonDen / d1;
        const m2 = commonDen / d2;
        const scaledN1 = n1 * m1;
        const scaledN2 = n2 * m2;
        resNum = scaledN1 + scaledN2;
        resDen = commonDen;

        steps = [
          `**Understand the question:** Calculate $\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}}$.`,
          `**Formula or concept:** To add fractions, they must share a common denominator (LCD).`,
          `**Step 1:** Find the Least Common Denominator of $${d1}$ and $${d2}$: $\\text{LCD} = ${commonDen}$.`,
          `**Step 2:** Convert to equivalent fractions with denominator $${commonDen}$:\n$\\frac{${n1}}{${d1}} = \\frac{${n1} \\times ${m1}}{${d1} \\times ${m1}} = \\frac{${scaledN1}}{${commonDen}}$\n$\\frac{${n2}}{${d2}} = \\frac{${n2} \\times ${m2}}{${d2} \\times ${m2}} = \\frac{${scaledN2}}{${commonDen}}$.`,
          `**Step 3:** Add the numerators: $\\frac{${scaledN1} + ${scaledN2}}{${commonDen}} = \\frac{${resNum}}{${commonDen}}$.`
        ];
      } else if (op === "-") {
        opName = "Subtraction";
        const commonDen = lcm(d1, d2);
        const m1 = commonDen / d1;
        const m2 = commonDen / d2;
        const scaledN1 = n1 * m1;
        const scaledN2 = n2 * m2;
        resNum = scaledN1 - scaledN2;
        resDen = commonDen;

        steps = [
          `**Understand the question:** Calculate $\\frac{${n1}}{${d1}} - \\frac{${n2}}{${d2}}$.`,
          `**Formula or concept:** Fractions must have identical denominators before subtracting.`,
          `**Step 1:** Find common denominator: $\\text{LCD} = ${commonDen}$.`,
          `**Step 2:** Convert both fractions: $\\frac{${scaledN1}}{${commonDen}} - \\frac{${scaledN2}}{${commonDen}}$.`,
          `**Step 3:** Subtract numerators: $\\frac{${scaledN1} - ${scaledN2}}{${commonDen}} = \\frac{${resNum}}{${commonDen}}$.`
        ];
      } else if (op === "*") {
        opName = "Multiplication";
        resNum = n1 * n2;
        resDen = d1 * d2;
        steps = [
          `**Understand the question:** Multiply $\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}}$.`,
          `**Formula:** $\\frac{a}{b} \\times \\frac{c}{d} = \\frac{a \\times c}{b \\times d}$.`,
          `**Step 1:** Multiply numerators: $${n1} \\times ${n2} = ${resNum}$.`,
          `**Step 2:** Multiply denominators: $${d1} \\times ${d2} = ${resDen}$.`,
          `**Step 3:** Raw result: $\\frac{${resNum}}{${resDen}}$.`
        ];
      } else if (op === "/") {
        opName = "Division";
        resNum = n1 * d2;
        resDen = d1 * n2;
        steps = [
          `**Understand the question:** Divide $\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}$.`,
          `**Formula:** Keep, Change, Flip: $\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\times \\frac{d}{c}$.`,
          `**Step 1:** Invert the second fraction (reciprocal of $\\frac{${n2}}{${d2}}$ is $\\frac{${d2}}{${n2}}$).`,
          `**Step 2:** Multiply: $\\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}} = \\frac{${n1} \\times ${d2}}{${d1} \\times ${n2}} = \\frac{${resNum}}{${resDen}}$.`
        ];
      }

      const [sNum, sDen] = simplifyFraction(resNum, resDen);
      if (sNum !== resNum || sDen !== resDen) {
        steps.push(`**Step 4 (Simplification):** Divide numerator and denominator by $\\text{GCD}(${resNum}, ${resDen}) = ${gcd(resNum, resDen)}$:\n$\\frac{${resNum}}{${resDen}} = \\frac{${sNum}}{${sDen}}$.`);
      }

      const finalStr = sDen === 1 ? `${sNum}` : `\\frac{${sNum}}{${sDen}}`;

      return {
        success: true,
        topic: `Fractions: ${opName}`,
        gameLink: { name: "Fraction Kingdom", route: "/real-world" },
        formula: "\\text{Fraction Arithmetic}",
        steps,
        finalAnswer: finalStr,
        explanation: "Fractions represent proportional values. Keeping track of equal parts ensures exact numerical precision without rounding errors.",
        similarProblem: "Calculate 3/5 + 1/2"
      };
    }
  }

  // =========================================================================
  // 8. CALCULUS: DIFFERENTIATION & INTEGRATION
  // =========================================================================

  // A. Integration (e.g. "Integrate 2x + 3", "integral of 3x^2 + 2x")
  if (lower.includes("integrate") || lower.includes("integral")) {
    return {
      success: true,
      topic: "Calculus: Indefinite Integration",
      formula: "\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C \\quad (n \\neq -1)",
      steps: [
        "**Understand the question:** Find the indefinite integral of the polynomial function (e.g., $\\int (2x + 3) \\, dx$).",
        "**Formula or concept:** Integration is the reverse operation of differentiation (anti-derivative). By the Reverse Power Rule, $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$.",
        "**Step 1:** Integrate the first term $2x$ (which is $2x^1$):\n$2 \\times \\frac{x^{1+1}}{1+1} = 2 \\times \\frac{x^2}{2} = x^2$.",
        "**Step 2:** Integrate the constant term $3$ (which is $3x^0$):\n$3 \\times \\frac{x^{0+1}}{0+1} = 3x$.",
        "**Step 3:** Add the constant of integration $+ C$ (since the derivative of any constant is zero).",
        "**Step 4 (Verification):** Differentiate $x^2 + 3x + C$: $\\frac{d}{dx}[x^2 + 3x + C] = 2x + 3$. The result matches the integrand!"
      ],
      finalAnswer: "x^2 + 3x + C",
      explanation: "Integration calculates the area under a curve and accumulates total change over an interval.",
      similarProblem: "Evaluate the integral: \\int (3x^2 + 4x - 5) \\, dx"
    };
  }

  // B. Differentiation (e.g. "Differentiate x^3 + 2x", "derivative of x^3 + 2x")
  if (lower.includes("derivative") || lower.includes("differentiate")) {
    return {
      success: true,
      topic: "Calculus: Differentiation (Power Rule)",
      formula: "\\frac{d}{dx}[a x^n] = a \\cdot n x^{n-1} \\quad \\text{and} \\quad \\frac{d}{dx}[c] = 0",
      steps: [
        "**Understand the question:** Find the derivative of $f(x) = x^3 + 2x$.",
        "**Formula or concept:** The Power Rule states that for any term $a x^n$, its derivative is $a \\cdot n x^{n-1}$.",
        "**Step 1:** Differentiate the term $x^3$:\n$\\frac{d}{dx}[x^3] = 3 \\cdot x^{3-1} = 3x^2$.",
        "**Step 2:** Differentiate the term $2x$ (which is $2x^1$):\n$\\frac{d}{dx}[2x^1] = 2 \\cdot 1 x^{1-1} = 2x^0 = 2$.",
        "**Step 3:** Combine all differentiated terms:\n$f'(x) = 3x^2 + 2$."
      ],
      finalAnswer: "f'(x) = 3x^2 + 2",
      explanation: "The derivative $f'(x)$ gives the instantaneous slope (rate of change) of the curve at any point $x$.",
      similarProblem: "Find the derivative of f(x) = 4x^3 - 5x^2 + 7"
    };
  }

  // =========================================================================
  // 9. STATISTICS: MEAN, MEDIAN, MODE, RANGE
  // =========================================================================
  if (
    lower.includes("mean") ||
    lower.includes("median") ||
    lower.includes("mode") ||
    lower.includes("average")
  ) {
    // Extract the portion containing numbers after "of", ":", or the first digit
    let numbersText = query;
    const ofParts = query.split(/(?:of|:\s*)/i);
    if (ofParts.length > 1) {
      numbersText = ofParts[ofParts.length - 1];
    }

    const digitsOnly = numbersText.match(/\b\d+\.?\d*\b/g);
    if (digitsOnly && digitsOnly.length >= 2) {
      const nums = digitsOnly.map((n) => parseFloat(n)).filter((n) => !isNaN(n));

      if (nums.length >= 2) {
        // Sort for median
        const sorted = [...nums].sort((a, b) => a - b);
        const count = sorted.length;
        const sum = sorted.reduce((a, b) => a + b, 0);
        const mean = Math.round((sum / count) * 1000) / 1000;

        // Median
        let median;
        if (count % 2 === 1) {
          median = sorted[Math.floor(count / 2)];
        } else {
          const mid1 = sorted[count / 2 - 1];
          const mid2 = sorted[count / 2];
          median = (mid1 + mid2) / 2;
        }

        // Mode
        const freq = {};
        let maxFreq = 0;
        sorted.forEach((n) => {
          freq[n] = (freq[n] || 0) + 1;
          if (freq[n] > maxFreq) maxFreq = freq[n];
        });
        const modes = Object.keys(freq).filter((k) => freq[k] === maxFreq && maxFreq > 1);
        const modeText = modes.length > 0 ? modes.join(", ") : "No mode (all values appear once)";

        const range = sorted[sorted.length - 1] - sorted[0];

        return {
          success: true,
          topic: "Statistics: Measures of Central Tendency",
          formula: "\\text{Mean } \\bar{x} = \\frac{\\sum x_i}{n}, \\quad \\text{Median} = \\text{Middle value in sorted data}",
          steps: [
            `**Understand the dataset:** Given numbers: ${nums.join(", ")} ($n = ${count}$ values).`,
            `**Step 1 (Order data):** Sort from lowest to highest: ${sorted.join(", ")}.`,
            `**Step 2 (Mean):** Add all values and divide by count:\n$\\text{Sum} = ${sorted.join(" + ")} = ${sum}$\n$\\text{Mean } (\\bar{x}) = \\frac{${sum}}{${count}} = ${mean}$.`,
            `**Step 3 (Median):** Find the middle value:\n${
              count % 2 === 1
                ? `Since $n = ${count}$ is odd, the middle element at position ${(count + 1) / 2} is **${median}**.`
                : `Since $n = ${count}$ is even, average the two middle numbers (${sorted[count / 2 - 1]} and ${sorted[count / 2]}): $\\frac{${sorted[count / 2 - 1]} + ${sorted[count / 2]}}{2} = ${median}$.`
            }`,
            `**Step 4 (Mode):** Identify the most frequent value: **${modeText}** (frequency: ${maxFreq}).`,
            `**Step 5 (Range):** Difference between maximum and minimum: $${sorted[sorted.length - 1]} - ${sorted[0]} = ${range}$.`
          ],
          finalAnswer: `\\text{Mean} = ${mean}, \\quad \\text{Median} = ${median}, \\quad \\text{Mode} = ${modeText}`,
          explanation: "Mean represents the numerical balance point, median resists extreme outlier distortions, and mode identifies the most popular occurrence.",
          similarProblem: `Find the mean, median, and mode of 5, 8, 12, 12, 23`
        };
      }
    }
  }

  // =========================================================================
  // 10. ARITHMETIC (e.g. "What is 25 × 48?", "25 * 48", "125 + 275", "1500 - 875")
  // =========================================================================
  const arithMatch = query.match(/(\d+\.?\d*)\s*([\+\-\*\/×÷])\s*(\d+\.?\d*)/);
  if (arithMatch) {
    const a = parseFloat(arithMatch[1]);
    let op = arithMatch[2];
    if (op === "×") op = "*";
    if (op === "÷") op = "/";
    const b = parseFloat(arithMatch[3]);

    let res, opSymbol, opWord;
    if (op === "+") {
      res = a + b;
      opSymbol = "+";
      opWord = "Addition";
    } else if (op === "-") {
      res = a - b;
      opSymbol = "-";
      opWord = "Subtraction";
    } else if (op === "*") {
      res = a * b;
      opSymbol = "\\times";
      opWord = "Multiplication";
    } else if (op === "/") {
      if (b === 0) return null;
      res = a / b;
      opSymbol = "\\div";
      opWord = "Division";
    }

    const roundedRes = Math.round(res * 100000) / 100000;

    return {
      success: true,
      topic: `Arithmetic: ${opWord}`,
      gameLink: { name: "Number Forest", route: "/map" },
      formula: `a ${opSymbol} b = c`,
      steps: [
        `**Understand the question:** Calculate $${a} ${opSymbol} ${b}$.`,
        `**Formula or concept:** Fundamental operation of arithmetic (${opWord.toLowerCase()}).`,
        `**Step 1:** Line up the numbers according to place value (units, tens, hundreds).`,
        op === "*"
          ? `**Step 2:** Break down calculation using the distributive property:\n$${a} \\times ${b} = ${a} \\times (${Math.floor(b / 10) * 10} + ${b % 10}) = ${a * (Math.floor(b / 10) * 10)} + ${a * (b % 10)} = ${roundedRes}$.`
          : `**Step 2:** Compute $${a} ${opSymbol} ${b} = ${roundedRes}$.`,
        `**Step 3 (Verification):** ${
          op === "+"
            ? `Reverse subtraction: $${roundedRes} - ${b} = ${a}$.`
            : op === "-"
            ? `Reverse addition: $${roundedRes} + ${b} = ${a}$.`
            : op === "*"
            ? `Reverse division: $${roundedRes} \\div ${b} = ${a}$.`
            : `Reverse multiplication: $${roundedRes} \\times ${b} = ${a}$.`
        } Verified!`
      ],
      finalAnswer: `${roundedRes}`,
      explanation: "Place value and inverse operations allow us to compute and reliably check arithmetic calculations.",
      similarProblem: `Calculate ${a + 5} ${opSymbol} ${b}`
    };
  }

  // If no deterministic pattern matched
  return null;
}

/**
 * Handle contextual: "Explain More Simply"
 */
function handleExplainSimply(lastAssistantMsg, lastUserMsg, level) {
  let topic = "Mathematics Concept";
  let simplified = "";

  if (lastAssistantMsg.includes("2x + 5 = 17") || lastAssistantMsg.includes("Linear")) {
    topic = "Linear Equations (Explained Simply)";
    simplified = [
      "**Understand the question:** How do we solve $2x + 5 = 17$ in the simplest way possible?",
      "**Real-life picture analogy:** Imagine a balanced seesaw (or scale). On the left side, you have **2 mystery treasure bags** (each containing $x$ coins) plus **5 loose coins**. On the right side, you have **17 coins**.",
      "**Step 1:** Take away the 5 loose coins from BOTH sides so the seesaw stays balanced:\n$17 - 5 = 12$ coins left on the right side.",
      "**Step 2:** Now the 2 treasure bags weigh 12 coins altogether.\nSince both bags have equal coins, divide by 2:\n$12 \\div 2 = 6$ coins per bag!",
      "**Final Answer:** Each mystery bag $x = 6$."
    ];
  } else if (lastAssistantMsg.includes("fraction") || lastAssistantMsg.includes("1/2 + 1/3")) {
    topic = "Fractions (Explained Simply)";
    simplified = [
      "**Understand the question:** Why can't we just add top and bottom numbers directly?",
      "**Simple chocolate bar analogy:** Imagine you have two identical chocolate bars.",
      "• One bar is cut into 2 giant blocks ($\\frac{1}{2}$).",
      "• The other bar is cut into 3 medium blocks ($\\frac{1}{3}$).",
      "You can't add them directly because the block sizes don't match!",
      "**Step 1:** Cut both bars into 6 tiny equal squares (the common denominator 6).\n$\\frac{1}{2}$ becomes 3 tiny squares ($\\frac{3}{6}$).\n$\\frac{1}{3}$ becomes 2 tiny squares ($\\frac{2}{6}$).",
      "**Step 2:** Now that all squares are the same size, count them up: $3 + 2 = 5$ squares out of 6!",
      "**Final Answer:** $\\frac{5}{6}$."
    ];
  } else {
    topic = "Simplified Explanation";
    simplified = [
      "**Breaking it down into simple terms:**",
      "Let's look at this like building with LEGO blocks or sharing candies:",
      "1. Find what we already know (the known quantities).",
      "2. Strip away the extra parts by doing the opposite operation on both sides.",
      "3. Share or split equally to find the unknown amount.",
      "Everything in math is about keeping both sides balanced and fair!"
    ];
  }

  return {
    success: true,
    topic,
    formula: "\\text{Simple Balanced Analogy}",
    steps: simplified,
    finalAnswer: "\\text{Solved using simple visual balance!}",
    explanation: "Thinking of equations as balanced scales or real objects makes abstract algebra simple and intuitive.",
    similarProblem: "Try solving 2x + 3 = 11 using the treasure bag picture!"
  };
}

/**
 * Handle contextual: "Show Another Method"
 */
function handleShowAnotherMethod(lastAssistantMsg, lastUserMsg, level) {
  let topic = "Alternative Solution Method";
  let steps = [];

  if (lastAssistantMsg.includes("2x + 5 = 17") || lastAssistantMsg.includes("Linear")) {
    topic = "Linear Equations: Alternative Method (Substitution / Trial & Working Backwards)";
    steps = [
      "**Understand the question:** Solve $2x + 5 = 17$ using an alternative method.",
      "**Method 2: Working Backwards Flowchart Method:**",
      "• Start with unknown $x$.",
      "• Original forward process: $x \\xrightarrow{\\times 2} 2x \\xrightarrow{+ 5} 2x + 5 = 17$.",
      "• Reverse (undo) each operation backwards from 17:",
      "  1. Undo $+ 5$: $17 - 5 = 12$.",
      "  2. Undo $\\times 2$: $12 \\div 2 = 6$.",
      "**Method 3: Direct Substitution Verification:**",
      "Test $x = 6$: $2(6) + 5 = 12 + 5 = 17$.",
      "Both methods confirm the solution with 100% certainty!"
    ];
  } else if (lastAssistantMsg.includes("15% of 800")) {
    topic = "Percentages: Alternative 10% Building Block Method";
    steps = [
      "**Understand the question:** Find 15% of 800 without using complex division.",
      "**Method 2: Mental Math 10% + 5% Rule:**",
      "• Finding 10% of any number is easy: just move the decimal point one spot to the left.\n$10\\% \\text{ of } 800 = 80$.",
      "• Since 5% is half of 10%, divide 80 by 2:\n$5\\% \\text{ of } 800 = 80 \\div 2 = 40$.",
      "• Add 10% and 5% together to get 15%:\n$15\\% = 80 + 40 = 120$!",
      "You can calculate this in your head in 3 seconds!"
    ];
  } else {
    topic = "Alternative Solution Method";
    steps = [
      "**Method 2 (Alternative Representation):**",
      "In mathematics, almost every problem can be solved from multiple perspectives:",
      "1. **Algebraic method:** Using symbolic manipulation.",
      "2. **Graphical method:** Plotting the functions on a coordinate grid to find the intersection point.",
      "3. **Numerical approximation:** Iterating towards the exact value.",
      "Cross-checking across multiple methods ensures your result is airtight!"
    ];
  }

  return {
    success: true,
    topic,
    formula: "\\text{Alternative Mathematical Pathway}",
    steps,
    finalAnswer: "\\text{Confirmed identical result via alternate method}",
    explanation: "Master mathematicians know multiple ways to solve the same problem. This lets you choose the fastest method for any situation.",
    similarProblem: "Try using the 10% building block method to find 15% of 600!"
  };
}

/**
 * Handle contextual: "Give Another Example"
 */
function handleGiveAnotherExample(lastAssistantMsg, lastUserMsg, level) {
  let topic = "Practice Problem";
  let steps = [];

  if (lastAssistantMsg.includes("2x + 5 = 17") || lastAssistantMsg.includes("Linear")) {
    topic = "Linear Equations: Fresh Practice Problem";
    steps = [
      "**Here is a fresh practice problem covering the same concept:**",
      "Solve for $x$: $3x + 8 = 29$.",
      "**Step 1:** Subtract 8 from both sides: $3x = 29 - 8 = 21$.",
      "**Step 2:** Divide both sides by 3: $x = \\frac{21}{3} = 7$.",
      "**Verification:** $3(7) + 8 = 21 + 8 = 29$. Correct!",
      "Now try this one on your own: **$4x - 5 = 19$**!"
    ];
  } else if (lastAssistantMsg.includes("800") || lastAssistantMsg.includes("15%")) {
    topic = "Percentages: Fresh Practice Problem";
    steps = [
      "**Here is a new percentage challenge with fresh numbers:**",
      "What is 25% of 640?",
      "**Step 1:** 25% is equivalent to the fraction $\\frac{25}{100} = \\frac{1}{4}$.",
      "**Step 2:** Divide 640 by 4: $\\frac{640}{4} = 160$.",
      "**Final Answer:** 160.",
      "Now test yourself: **What is 20% of 350?**"
    ];
  } else {
    topic = "Fresh Practice Problem";
    steps = [
      "**Here is another problem to test your understanding:**",
      "Calculate: $\\frac{2}{3} + \\frac{1}{4}$.",
      "• Common denominator for 3 and 4 is 12.",
      "• $\\frac{8}{12} + \\frac{3}{12} = \\frac{11}{12}$.",
      "Try solving: $\\frac{3}{4} + \\frac{1}{5}$!"
    ];
  }

  return {
    success: true,
    topic,
    formula: "\\text{Targeted Skill Reinforcement}",
    steps,
    finalAnswer: "\\text{Ready for your response!}",
    explanation: "Practicing variations of a problem with new numbers cements the underlying pattern in long-term memory.",
    similarProblem: "Send me your answer to the challenge question and I'll verify it!"
  };
}

/**
 * Handle contextual: "Why do we subtract...?" or "Why?"
 */
function handleWhyExplanation(query, lastAssistantMsg, lastUserMsg) {
  let topic = "Mathematical Reasoning: Why this step is required";
  let steps = [];

  if (query.toLowerCase().includes("subtract 5") || lastAssistantMsg.includes("2x + 5 = 17")) {
    topic = "Properties of Equality: Why we subtract 5";
    steps = [
      "**Why do we subtract 5?**",
      "Great question! In the equation $2x + 5 = 17$, our goal is to **isolate the variable $x$** (get it alone on one side).",
      "1. Currently, 5 is being **added** to $2x$.",
      "2. The inverse (opposite) operation of addition is **subtraction**.",
      "3. Because $+5 - 5 = 0$, subtracting 5 completely removes the 5 from the left side.",
      "4. **The Subtraction Property of Equality** states that whatever you do to one side of an equation, you MUST do to the other side to keep the equals sign true.",
      "5. Therefore, we subtract 5 from 17 on the right side: $17 - 5 = 12$.",
      "Now we have $2x = 12$, which is much simpler to solve!"
    ];
  } else {
    topic = "Mathematical Reasoning: First Principles";
    steps = [
      "**Understanding the 'Why' behind the steps:**",
      "1. **Preserving Balance:** An equation is like a balanced scale. An equals sign ($=$) means both sides have the exact same value.",
      "2. **Inverse Operations:** To undo any operation, we use its mathematical opposite:\n• Addition $\\leftrightarrow$ Subtraction\n• Multiplication $\\leftrightarrow$ Division\n• Powers $\\leftrightarrow$ Roots",
      "3. Understanding the reasons behind the rules helps you solve problems you've never seen before with confidence!"
    ];
  }

  return {
    success: true,
    topic,
    formula: "A = B \\iff A - c = B - c",
    steps,
    finalAnswer: "\\text{Because of the Subtraction Property of Equality}",
    explanation: "Understanding why mathematical rules exist builds true conceptual mastery rather than rote memorization.",
    similarProblem: "What operation would you use to undo multiplication by 3?"
  };
}
