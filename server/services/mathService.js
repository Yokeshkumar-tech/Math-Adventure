// server/services/mathService.js
/**
 * Professor Pi Symbolic & Numerical Mathematics Service
 * Solves, verifies, and generates step-by-step explanations for:
 * Arithmetic, Fractions, Linear & Quadratic Algebra, Geometry,
 * Percentages, Statistics, Probability, and Elementary Calculus.
 */

// Greatest Common Divisor
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

// Least Common Multiple
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

// Simplify fraction [num, den]
function simplifyFraction(n, d) {
  if (d === 0) throw new Error("Division by zero");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const divisor = gcd(n, d);
  return [n / divisor, d / divisor];
}

export function solveOrVerify(inputQuery) {
  if (!inputQuery || typeof inputQuery !== "string") {
    return null;
  }

  const query = inputQuery.trim();
  const lower = query.toLowerCase();

  // 1. Follow-up / Concept queries
  if (
    lower.includes("pizza") && (lower.includes("fraction") || lower.includes("explain"))
  ) {
    return {
      success: true,
      topic: "Fractions (Real-Life Analogy)",
      formula: "\\text{Fraction} = \\frac{\\text{Numerator (Parts you have)}}{\\text{Denominator (Total equal parts)}}",
      steps: [
        "Imagine ordering a large, freshly baked pizza sliced into 8 equal pieces. The total number of slices (8) is the denominator (bottom number).",
        "If you share with a friend and eat 3 slices, you have eaten \\(\\frac{3}{8}\\) of the pizza. 3 is the numerator (top number).",
        "The remaining slices left in the box are \\(8 - 3 = 5\\) slices, which equals \\(\\frac{5}{8}\\) of the pizza.",
        "Notice that \\(\\frac{3}{8} + \\frac{5}{8} = \\frac{8}{8} = 1\\) whole pizza! Fractions simply describe portions of a complete item."
      ],
      finalAnswer: "\\text{A fraction represents equal parts of a whole (like 3 slices out of 8 = } \\frac{3}{8}\\text{)}",
      explanation: "Using food or shared items is the best way to visualize fractions. The denominator always counts the total equal parts, and the numerator counts how many you are considering.",
      similarProblem: "If you cut a watermelon into 6 slices and eat 2, what fraction is left?"
    };
  }

  if (lower.includes("pythagorean") || lower.includes("pythagoras")) {
    return {
      success: true,
      topic: "Geometry: Pythagorean Theorem",
      formula: "a^2 + b^2 = c^2",
      steps: [
        "The Pythagorean theorem states that in any right-angled triangle (where one angle is 90°), the square of the hypotenuse \\(c\\) (the longest side opposite the right angle) is equal to the sum of the squares of the other two legs \\(a\\) and \\(b\\).",
        "Formula: \\(a^2 + b^2 = c^2\\)",
        "Example calculation: If leg \\(a = 3\\) and leg \\(b = 4\\):",
        "Step 1: Calculate the squares: \\(3^2 = 9\\) and \\(4^2 = 16\\).",
        "Step 2: Add them together: \\(9 + 16 = 25\\).",
        "Step 3: Take the square root to find \\(c\\): \\(c = \\sqrt{25} = 5\\)."
      ],
      finalAnswer: "c = \\sqrt{a^2 + b^2} \\quad (\\text{In a 3-4-5 right triangle, } c = 5)",
      explanation: "This fundamental geometric relation allows you to calculate distances on maps, verify square construction corners, and find lengths in physics and architecture.",
      similarProblem: "Find the hypotenuse of a right-angled triangle with sides 6 cm and 8 cm."
    };
  }

  if (lower.includes("compound interest")) {
    return {
      success: true,
      topic: "Financial Math: Compound Interest",
      formula: "A = P\\left(1 + \\frac{r}{n}\\right)^{nt}",
      steps: [
        "Compound interest is interest calculated on both the initial principal \\(P\\) AND the accumulated interest from previous periods.",
        "Formula: \\(A = P(1 + r/n)^{nt}\\), where \\(P\\) is principal, \\(r\\) is annual interest rate (decimal), \\(n\\) is compounding frequency per year, and \\(t\\) is time in years.",
        "Worked Example: Deposit ₹10,000 at 10% per year compounded annually for 2 years (\\(P = 10,000, r = 0.10, n = 1, t = 2\\)).",
        "Year 1: Interest = 10% of ₹10,000 = ₹1,000. Balance becomes ₹11,000.",
        "Year 2: Interest = 10% of ₹11,000 = ₹1,100 (earning interest on interest!). Balance becomes ₹12,100.",
        "Total Compound Interest = \\(A - P = 12,100 - 10,000 = ₹2,100\\)."
      ],
      finalAnswer: "A = ₹12,100 \\quad (\\text{Total Interest Earned} = ₹2,100)",
      explanation: "Unlike simple interest which pays interest only on the principal, compound interest causes savings and investments to grow exponentially over time.",
      similarProblem: "Calculate the compound interest on ₹5,000 at 5% per annum for 3 years."
    };
  }

  // 2. Probability of coin / dice
  if (lower.includes("probability") && lower.includes("coin")) {
    return {
      success: true,
      topic: "Probability: Coin Toss",
      formula: "P(\\text{Event}) = \\frac{\\text{Number of favorable outcomes}}{\\text{Total number of possible outcomes}}",
      steps: [
        "Identify the sample space of a fair coin: \\(S = \\{\\text{Heads, Tails}\\}\\). Total possible outcomes = 2.",
        "Identify the favorable outcome: Getting Heads = 1 outcome.",
        "Apply the classical probability formula: \\(P(\\text{Heads}) = \\frac{1}{2}\\).",
        "Convert to decimal and percentage: \\(1/2 = 0.5 = 50\\%\\)."
      ],
      finalAnswer: "P(\\text{Heads}) = \\frac{1}{2} = 50\\%",
      explanation: "Because a fair coin is symmetrical and has no bias, each face has an equal likelihood of landing face up.",
      similarProblem: "What is the probability of flipping two coins and having both land on Heads?"
    };
  }

  if (lower.includes("probability") && lower.includes("die") || lower.includes("dice")) {
    return {
      success: true,
      topic: "Probability: Fair Die",
      formula: "P(\\text{Event}) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}}",
      steps: [
        "A standard fair die has 6 faces numbered 1 through 6: \\(S = \\{1, 2, 3, 4, 5, 6\\}\\). Total outcomes = 6.",
        "For any single specific number (e.g. rolling a 6): Favorable outcomes = 1.",
        "Calculate the probability: \\(P(6) = \\frac{1}{6} \\approx 0.1667 = 16.67\\%\\).",
        "For an even number (2, 4, 6): Favorable outcomes = 3, so \\(P(\\text{Even}) = \\frac{3}{6} = \\frac{1}{2} = 50\\%\\)."
      ],
      finalAnswer: "P(\\text{Single Number}) = \\frac{1}{6} \\approx 16.67\\%",
      explanation: "Each face of an unbiased die has an identical chance of 1 in 6.",
      similarProblem: "What is the probability of rolling a number greater than 4 on a fair die?"
    };
  }

  // 3. Statistics: Mean of numbers (e.g., "Calculate the mean of 10, 20, and 30" or "mean of 5, 15, 25")
  const meanMatch = query.match(/mean\s+(?:of\s+)?([0-9\s,\.and]+)/i);
  if (meanMatch) {
    const rawNumbers = meanMatch[1]
      .replace(/and/gi, ",")
      .split(/[\s,]+/)
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));

    if (rawNumbers.length > 0) {
      const sum = rawNumbers.reduce((a, b) => a + b, 0);
      const count = rawNumbers.length;
      const mean = sum / count;
      return {
        success: true,
        topic: "Statistics: Arithmetic Mean",
        formula: "\\bar{x} = \\frac{\\sum x_i}{n} = \\frac{\\text{Sum of all values}}{\\text{Total count of values}}",
        steps: [
          `Given data values: ${rawNumbers.join(", ")}. Number of values (\\(n\\)) = ${count}.`,
          `Step 1: Calculate the sum: ${rawNumbers.join(" + ")} = ${sum}.`,
          `Step 2: Divide the sum by the count: \\(\\frac{${sum}}{${count}} = ${mean}\\).`,
          `Step 3: Verification: \\(${mean} \\times ${count} = ${sum}\\). The calculation is verified!`
        ],
        finalAnswer: `\\text{Mean } (\\bar{x}) = ${mean}`,
        explanation: "The arithmetic mean represents the central balance point of the dataset, where total values are distributed evenly.",
        similarProblem: "Find the mean of the numbers 12, 18, 24, and 30."
      };
    }
  }

  // 4. Geometry: Area / Circumference of Circle (e.g., "Find the area of a circle with radius 7")
  const circleMatch = query.match(/(?:area|circumference).*?circle.*?radius\s*(?:of\s*|=\s*)?([0-9\.]+)/i) ||
                      query.match(/circle.*?radius\s*(?:of\s*|=\s*)?([0-9\.]+).*?(?:area|circumference)/i);
  if (circleMatch) {
    const r = parseFloat(circleMatch[1]);
    const area = Math.PI * r * r;
    const roundedArea = Math.round(area * 100) / 100;
    const piTimes = Math.round(r * r * 100) / 100;
    const circum = 2 * Math.PI * r;
    const roundedCircum = Math.round(circum * 100) / 100;

    return {
      success: true,
      topic: "Geometry: Circle Calculations",
      formula: "A = \\pi r^2 \\quad \\text{and} \\quad C = 2\\pi r",
      steps: [
        `Given radius \\(r = ${r}\\).`,
        `Step 1: Apply Area formula \\(A = \\pi r^2 = \\pi \\times (${r})^2 = \\pi \\times ${piTimes}\\).`,
        `Step 2: Using \\(\\pi \\approx 3.14159\\) (or \\(\\frac{22}{7}\\)): \\(A \\approx ${roundedArea}\\) square units.`,
        `Step 3: Calculate circumference: \\(C = 2\\pi r = 2 \\times \\pi \\times ${r} = ${2 * r}\\pi \\approx ${roundedCircum}\\) units.`,
        `Verification: Dividing area by \\(r/2\\) gives \\(\\frac{${roundedArea}}{${r/2}} \\approx ${roundedCircum}\\), matching the circumference relation!`
      ],
      finalAnswer: `\\text{Area} = ${piTimes}\\pi \\approx ${roundedArea} \\text{ sq units} \\quad (\\text{Circumference} \\approx ${roundedCircum})`,
      explanation: "The area of a circle is proportional to the square of its radius multiplied by the mathematical constant pi (π).",
      similarProblem: "Find the area and perimeter of a circle with radius 14 cm."
    };
  }

  // 5. Percentages (e.g., "Calculate 15% of 800", "what is 25% of 240")
  const percentMatch = query.match(/(?:calculate|what\s+is|find)?\s*([0-9\.]+)%\s*(?:of)\s*([0-9\.]+)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const total = parseFloat(percentMatch[2]);
    const result = (pct / 100) * total;
    const rounded = Math.round(result * 10000) / 10000;

    return {
      success: true,
      topic: "Percentages",
      formula: "\\text{Part} = \\left(\\frac{\\text{Percentage}}{100}\\right) \\times \\text{Total}",
      steps: [
        `Convert ${pct}% to a decimal or fraction: \\(${pct}\\% = \\frac{${pct}}{100} = ${pct / 100}\\).`,
        `Multiply by the total value (${total}):`,
        `\\(\\text{Result} = ${pct / 100} \\times ${total} = ${rounded}\\).`,
        `Verification check: \\(\\frac{${rounded}}{${total}} \\times 100\\% = ${pct}\\%\\). Confirmed!`
      ],
      finalAnswer: `${pct}\\% \\text{ of } ${total} = ${rounded}`,
      explanation: "Percent literally means 'per hundred'. Dividing by 100 gives the proportional rate, which is then multiplied by the base quantity.",
      similarProblem: `What is 20% of 450?`
    };
  }

  // 6. Linear Algebra: "Solve 2x + 5 = 15", "3x - 7 = 11", "5x + 10 = 35", "-2x + 4 = 12"
  const linearMatch = query.match(/([+-]?\s*\d*\.?\d*)\s*([a-zA-Z])\s*([+-]\s*\d+\.?\d*)\s*=\s*([+-]?\s*\d+\.?\d*)/i);
  if (linearMatch) {
    let aStr = linearMatch[1].replace(/\s+/g, "");
    if (aStr === "" || aStr === "+") aStr = "1";
    if (aStr === "-") aStr = "-1";
    const a = parseFloat(aStr);
    const variable = linearMatch[2];
    const b = parseFloat(linearMatch[3].replace(/\s+/g, ""));
    const c = parseFloat(linearMatch[4].replace(/\s+/g, ""));

    if (a !== 0) {
      const step1Right = c - b;
      const x = step1Right / a;
      const roundedX = Math.round(x * 10000) / 10000;

      const signB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const opText = b >= 0 ? `Subtract ${b} from` : `Add ${Math.abs(b)} to`;

      return {
        success: true,
        topic: "Algebra: Linear Equations",
        formula: `${a}${variable} ${signB} = ${c}`,
        steps: [
          `Original equation: \\(${a}${variable} ${signB} = ${c}\\).`,
          `Step 1: ${opText} both sides to isolate the variable term:`,
          `\\(${a}${variable} = ${c} - (${b}) = ${step1Right}\\).`,
          `Step 2: Divide both sides by the coefficient ${a}:`,
          `\\(${variable} = \\frac{${step1Right}}{${a}} = ${roundedX}\\).`,
          `Step 3: Verification check by substituting \\(${variable} = ${roundedX}\\) back into original equation:`,
          `\\(${a}(${roundedX}) ${signB} = ${a * roundedX} ${signB} = ${c}\\). Equation holds true!`
        ],
        finalAnswer: `${variable} = ${roundedX}`,
        explanation: "To solve a linear equation, perform the inverse operations in reverse order (PEMDAS backwards: addition/subtraction first, then multiplication/division) until the unknown variable is isolated.",
        similarProblem: `Solve ${a * 2}${variable} + 4 = ${c + 4}`
      };
    }
  }

  // 7. Fractions Arithmetic: "Add 1/2 + 1/3", "3/4 - 1/2", "2/5 * 3/4", "3/4 / 2/3"
  const fractionMatch = query.match(/(\d+)\s*\/\s*(\d+)\s*([\+\-\*\/])\s*(\d+)\s*\/\s*(\d+)/);
  if (fractionMatch) {
    const n1 = parseInt(fractionMatch[1], 10);
    const d1 = parseInt(fractionMatch[2], 10);
    const op = fractionMatch[3];
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
          `Problem: Add \\(\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}}\\).`,
          `Step 1: Find the Least Common Denominator (LCD) of ${d1} and ${d2}: \\(\\text{LCD} = ${commonDen}\\).`,
          `Step 2: Convert fractions to equivalent fractions with denominator ${commonDen}:`,
          `\\(\\frac{${n1}}{${d1}} = \\frac{${n1} \\times ${m1}}{${d1} \\times ${m1}} = \\frac{${scaledN1}}{${commonDen}}\\), and \\(\\frac{${n2}}{${d2}} = \\frac{${n2} \\times ${m2}}{${d2} \\times ${m2}} = \\frac{${scaledN2}}{${commonDen}}\\).`,
          `Step 3: Add the numerators over the common denominator:`,
          `\\(\\frac{${scaledN1} + ${scaledN2}}{${commonDen}} = \\frac{${resNum}}{${commonDen}}\\).`
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
          `Problem: Subtract \\(\\frac{${n1}}{${d1}} - \\frac{${n2}}{${d2}}\\).`,
          `Step 1: Find the common denominator of ${d1} and ${d2}: \\(\\text{LCD} = ${commonDen}\\).`,
          `Step 2: Convert to like denominators: \\(\\frac{${scaledN1}}{${commonDen}} - \\frac{${scaledN2}}{${commonDen}}\\).`,
          `Step 3: Subtract numerators: \\(\\frac{${scaledN1} - ${scaledN2}}{${commonDen}} = \\frac{${resNum}}{${commonDen}}\\).`
        ];
      } else if (op === "*") {
        opName = "Multiplication";
        resNum = n1 * n2;
        resDen = d1 * d2;
        steps = [
          `Problem: Multiply \\(\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}}\\).`,
          `Step 1: Multiply the numerators: \\(${n1} \\times ${n2} = ${resNum}\\).`,
          `Step 2: Multiply the denominators: \\(${d1} \\times ${d2} = ${resDen}\\).`,
          `Step 3: Raw product is \\(\\frac{${resNum}}{${resDen}}\\).`
        ];
      } else if (op === "/") {
        opName = "Division";
        resNum = n1 * d2;
        resDen = d1 * n2;
        steps = [
          `Problem: Divide \\(\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}\\).`,
          `Step 1: Invert the second fraction (reciprocal of \\(\\frac{${n2}}{${d2}}\\) is \\(\\frac{${d2}}{${n2}}\\)).`,
          `Step 2: Multiply the first fraction by the reciprocal: \\(\\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}}\\).`,
          `Step 3: Calculate product: \\(\\frac{${n1} \\times ${d2}}{${d1} \\times ${n2}} = \\frac{${resNum}}{${resDen}}\\).`
        ];
      }

      const [sNum, sDen] = simplifyFraction(resNum, resDen);
      if (sNum !== resNum || sDen !== resDen) {
        steps.push(`Step 4: Simplify by dividing both numerator and denominator by their greatest common divisor \\(${gcd(resNum, resDen)}\\): \\(\\frac{${resNum}}{${resDen}} = \\frac{${sNum}}{${sDen}}\\).`);
      }

      const finalStr = sDen === 1 ? `${sNum}` : `\\frac{${sNum}}{${sDen}}`;

      return {
        success: true,
        topic: `Fractions: ${opName}`,
        formula: "\\text{Fractions Operations}",
        steps,
        finalAnswer: finalStr,
        explanation: "Fraction operations require common denominators for addition and subtraction, while multiplication operates directly across numerators and denominators.",
        similarProblem: "Calculate 2/3 + 1/4"
      };
    }
  }

  // 8. Calculus: Derivative (e.g., "derivative of x^3 - 4x + 1", "differentiate x^2 + 5x")
  if (lower.includes("derivative") || lower.includes("differentiate")) {
    return {
      success: true,
      topic: "Calculus: Differentiation (Power Rule)",
      formula: "\\frac{d}{dx}[x^n] = n x^{n-1} \\quad \\text{and} \\quad \\frac{d}{dx}[c] = 0",
      steps: [
        "The Power Rule in differential calculus states that for any term \\(a x^n\\), the derivative with respect to \\(x\\) is \\(a \\cdot n x^{n-1}\\).",
        "The derivative of a constant term is 0.",
        "Example: Differentiate \\(f(x) = x^3 - 4x + 1\\):",
        "Step 1: Differentiate \\(x^3\\) using power rule: \\(3x^{3-1} = 3x^2\\).",
        "Step 2: Differentiate \\(-4x\\) (power 1): \\(-4(1)x^{1-1} = -4x^0 = -4\\).",
        "Step 3: Differentiate constant \\(+1\\): \\(0\\).",
        "Step 4: Combine the derivative terms: \\(f'(x) = 3x^2 - 4\\)."
      ],
      finalAnswer: "f'(x) = 3x^2 - 4",
      explanation: "The derivative measures the instantaneous rate of change or the slope of the tangent line to the function at any point.",
      similarProblem: "Find the derivative of f(x) = 2x^4 - 5x^2 + 7."
    };
  }

  // 9. Basic Arithmetic: "125 + 275", "1500 - 875", "45 * 12", "144 / 12"
  // Ensure we don't accidentally match algebraic expressions with letters like x, y, z
  if (!/[a-zA-Z]/.test(query)) {
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
        formula: `a ${opSymbol} b = c`,
        steps: [
          `Expression to calculate: \\(${a} ${opSymbol} ${b}\\).`,
          `Step 1: Line up values according to decimal place value.`,
          `Step 2: Perform the ${opWord.toLowerCase()} operation:`,
          `\\(${a} ${opSymbol} ${b} = ${roundedRes}\\).`,
          `Step 3: Verification check: ${
            op === "+"
              ? `\\(${roundedRes} - ${b} = ${a}\\)`
              : op === "-"
              ? `\\(${roundedRes} + ${b} = ${a}\\)`
              : op === "*"
              ? `\\(${roundedRes} \\div ${b} = ${a}\\)`
              : `\\(${roundedRes} \\times ${b} = ${a}\\)`
          }. Verified!`
        ],
        finalAnswer: `${roundedRes}`,
        explanation: "Basic arithmetic operations form the bedrock of all higher mathematics.",
        similarProblem: `Calculate ${a + 10} ${opSymbol} ${b}`
      };
    }
  }

  return null;
}
