// client/src/data/fallbackLessons.js - Offline bundled lessons
export const fallbackLessons = [
  {
    grade: 5,
    topic: "Fractions",
    slug: "fractions",
    difficulty: "easy",
    estimatedMinutes: 10,
    infographicType: "pizza",
    objectives: [
      "Understand fractions as parts of an equal whole",
      "Identify the numerator (top) and denominator (bottom)",
      "Recognize equivalent fractions like 1/2 and 2/4",
      "Add and subtract fractions with like denominators",
    ],
    explanation:
      "A fraction represents a part of a whole thing that has been split into equal parts. Think of a delicious round pizza cut into 4 identical slices. If you eat 1 slice, you have eaten 1/4 of the pizza! The top number (1) is the numerator—it tells you how many slices you took. The bottom number (4) is the denominator—it tells you the total number of equal slices the whole pizza was cut into.",
    workedExamples: [
      {
        problem:
          "Rohan has a chocolate bar divided into 8 equal pieces. He gives 3 pieces to his friend Kabir. What fraction did Rohan give away, and what fraction remains?",
        steps: [
          "Step 1: The chocolate bar is divided into 8 equal pieces, so the denominator is 8.",
          "Step 2: Rohan gives away 3 pieces, so the fraction given away is 3/8.",
          "Step 3: The pieces remaining are 8 - 3 = 5 pieces.",
          "Step 4: The fraction remaining is 5/8.",
        ],
        answer: "3/8 given away, 5/8 remains",
      },
      {
        problem:
          "Priya ran 2/7 of a kilometre in the morning and 3/7 of a kilometre in the evening. How much total distance did Priya run?",
        steps: [
          "Step 1: Check if the denominators are the same: both are 7.",
          "Step 2: Add the numerators together: 2 + 3 = 5.",
          "Step 3: Keep the denominator the same: 7.",
          "Step 4: Total distance = 5/7 km.",
        ],
        answer: "5/7 km",
      },
    ],
    realLifeExample:
      "When sharing an 8-slice pizza with your family, if your brother eats 2 slices, he ate 2/8 (or 1/4) of the pizza. If you eat 3 slices, you ate 3/8. Together you ate 2/8 + 3/8 = 5/8 of the whole pizza!",
    keyPoints: [
      "The numerator is the top number: how many parts you have.",
      "The denominator is the bottom number: total equal parts in the whole.",
      "Equivalent fractions look different but represent the exact same value (e.g. 1/2 = 2/4 = 4/8).",
      "When adding fractions with the same denominator, add only the numerators and keep the denominator unchanged.",
    ],
  },
];
