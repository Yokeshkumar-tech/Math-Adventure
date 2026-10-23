// server/utils/validateQuestion.js
// Exact fraction arithmetic so 1/3 + 1/3 or 3/4*20 is checked without rounding errors.

export const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export class Frac {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("div by 0");
    const s = d < 0 ? -1 : 1;
    const g = gcd(Math.abs(n), Math.abs(d)) || 1;
    this.n = (s * n) / g;
    this.d = (s * d) / g;
  }

  add(o) {
    return new Frac(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  sub(o) {
    return new Frac(this.n * o.d - o.n * this.d, this.d * o.d);
  }

  mul(o) {
    return new Frac(this.n * o.n, this.d * o.d);
  }

  div(o) {
    if (o.n === 0) throw new Error("div by 0");
    return new Frac(this.n * o.d, this.d * o.n);
  }

  equals(o) {
    if (!o) return false;
    return this.n === o.n && this.d === o.d;
  }

  toNumber() {
    return this.n / this.d;
  }

  toString() {
    return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`;
  }
}

// Parses "3/4", "0.75", "15", "-2", "2 1/2", "15 m", "Rs 40", "10 sq cm"
export function parseAnswer(text) {
  if (text === null || text === undefined) return null;
  const raw = String(text).trim();
  // Strip common words/units: "m", "meters", "cm", "sq cm", "Rs", "rupees", "%"
  const cleaned = raw
    .replace(/(sq\s*cm|cm|meters|meter|m|kg|g|rupees|rs\.?|%)/gi, "")
    .trim();

  let m;
  // Mixed number: "2 1/2" or "-1 3/4"
  if ((m = cleaned.match(/^(-?\d+)\s+(\d+)\/(\d+)$/))) {
    const w = parseInt(m[1], 10);
    const num = parseInt(m[2], 10);
    const den = parseInt(m[3], 10);
    const sign = w < 0 ? -1 : 1;
    return new Frac(Math.abs(w) * den * sign + num * sign, den);
  }

  // Fraction: "3/4" or "-5/6"
  if ((m = cleaned.match(/^(-?\d+)\/(\d+)$/))) {
    return new Frac(parseInt(m[1], 10), parseInt(m[2], 10));
  }

  // Decimal: "0.75" or "-2.5"
  if ((m = cleaned.match(/^(-?\d+)\.(\d+)$/))) {
    const whole = m[1];
    const frac = m[2];
    const scale = 10 ** frac.length;
    const val = Math.round(parseFloat(`${whole}.${frac}`) * scale);
    return new Frac(val, scale);
  }

  // Integer: "15", "-2"
  if ((m = cleaned.match(/^(-?\d+)$/))) {
    return new Frac(parseInt(m[1], 10), 1);
  }

  return null; // non-numeric answer
}

// Safe evaluator for + - * / ( ) and fractions/numbers - never uses eval()
export function evaluate(expr) {
  if (!expr || typeof expr !== "string") return null;

  // Tokenize numbers, decimals, and operators
  const tokens = [];
  const regex = /\s*([()+*/-]|(?:\d+\.\d+)|(?:\d+))\s*/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(expr)) !== null) {
    if (match.index !== lastIndex) {
      // Unrecognized characters
      return null;
    }
    tokens.push(match[1]);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex !== expr.length) return null;

  // Shunting-yard algorithm
  const outputQueue = [];
  const operatorStack = [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (/^\d/.test(token)) {
      outputQueue.push(parseAnswer(token));
    } else if (token in precedence) {
      // Handle unary minus e.g. at start or after "("
      if (token === "-" && (i === 0 || tokens[i - 1] === "(")) {
        // Unary minus: treat as 0 - token
        outputQueue.push(new Frac(0, 1));
      }
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== "(" &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === "(") {
      operatorStack.push(token);
    } else if (token === ")") {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== "(") {
        outputQueue.push(operatorStack.pop());
      }
      if (operatorStack.length === 0) return null; // mismatched parenthesis
      operatorStack.pop(); // pop "("
    }
  }

  while (operatorStack.length > 0) {
    const op = operatorStack.pop();
    if (op === "(" || op === ")") return null;
    outputQueue.push(op);
  }

  // RPN evaluation
  const valStack = [];
  for (const item of outputQueue) {
    if (item instanceof Frac) {
      valStack.push(item);
    } else {
      const b = valStack.pop();
      const a = valStack.pop();
      if (!a || !b) return null;
      try {
        if (item === "+") valStack.push(a.add(b));
        else if (item === "-") valStack.push(a.sub(b));
        else if (item === "*") valStack.push(a.mul(b));
        else if (item === "/") valStack.push(a.div(b));
      } catch {
        return null;
      }
    }
  }

  return valStack.length === 1 ? valStack[0] : null;
}

export function validateQuestion(q) {
  const errors = [];
  if (!q) {
    return { ok: false, errors: ["Missing question data"] };
  }
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push("need 4 options");
  } else {
    const trimmedOptions = q.options.map((o) => String(o).trim());
    if (new Set(trimmedOptions).size !== q.options.length) {
      errors.push("duplicate options");
    }
    if (!q.options.map(String).includes(String(q.correctAnswer))) {
      errors.push("answer not in options");
    }
  }

  if (q.expression) {
    const expected = evaluate(q.expression);
    const given = parseAnswer(q.correctAnswer);
    if (!expected || !given || !expected.equals(given)) {
      errors.push("answer does not match maths");
    }
    if (Array.isArray(q.options) && expected) {
      const matches = q.options.filter((o) => {
        const v = parseAnswer(o);
        return v && v.equals(expected);
      });
      if (matches.length !== 1) {
        errors.push("exactly one option must be correct");
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
