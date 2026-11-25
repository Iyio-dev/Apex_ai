import React, {lazy, Suspense} from 'react';

const MathFormula = lazy(() => import('./MathFormula'));
// Explicit delimiters support nested LaTeX. Legacy matches are deliberately limited
// to unambiguous powers, simple fractions and square roots in older questions.
const formulas = /(\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$(?!\s)([^$\n]+?)(?<!\s)\$|\\frac\{[^{}\n]+\}\{[^{}\n]+\}|\\sqrt\{[^{}\n]+\}|(?:[A-Za-z]|\d+)\^(?:\{-?\d+\}|-?\d+))/g;

export function QuestionText({children}) {
  const text = String(children ?? '');
  const parts = [];
  let end = 0;
  for (const match of text.matchAll(formulas)) {
    parts.push(text.slice(end, match.index));
    const expression = match[2] ?? match[3] ?? match[4] ?? match[5] ?? match[0].replace(/\^(-?\d+)$/, '^{$1}');
    parts.push(<Suspense key={match.index} fallback={expression}>
      <MathFormula expression={expression} display={Boolean(match[2] || match[3])} />
    </Suspense>);
    end = match.index + match[0].length;
  }
  parts.push(text.slice(end));
  return <span className="apex-question-text">{parts}</span>;
}
