import {useLayoutEffect, useRef} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathFormula({expression, display}) {
  const element = useRef(null);
  useLayoutEffect(() => {
    try {
      katex.render(expression, element.current, {
        displayMode: display, output: 'htmlAndMathml', trust: false,
        throwOnError: true, maxExpand: 500, maxSize: 12,
      });
    } catch {
      element.current.textContent = expression;
    }
  }, [expression, display]);
  return <span ref={element} className={display ? 'apex-formula display' : 'apex-formula'} />;
}
