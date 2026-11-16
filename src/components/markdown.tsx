import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Lightweight Markdown renderer for chat bubbles.
 * Styled with Tailwind classes so it inherits the Siphox light theme.
 */
export default function Markdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => (
          <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{props.children}</p>
        ),
        strong: (props) => (
          <strong className="font-semibold text-foreground">{props.children}</strong>
        ),
        em: (props) => <em className="italic">{props.children}</em>,
        ul: (props) => <ul className="my-1.5 list-disc space-y-1 pl-5">{props.children}</ul>,
        ol: (props) => (
          <ol className="my-1.5 list-decimal space-y-1 pl-5">{props.children}</ol>
        ),
        li: (props) => <li className="leading-relaxed">{props.children}</li>,
        h1: (props) => (
          <h3 className="mt-2.5 mb-1 text-sm font-semibold text-foreground">{props.children}</h3>
        ),
        h2: (props) => (
          <h3 className="mt-2.5 mb-1 text-sm font-semibold text-foreground">{props.children}</h3>
        ),
        h3: (props) => (
          <h4 className="mt-2 mb-0.5 text-[13px] font-semibold text-foreground">{props.children}</h4>
        ),
        a: (props) => (
          <a className="text-accent-deep underline" href={props.href} target="_blank" rel="noreferrer">
            {props.children}
          </a>
        ),
        blockquote: (props) => (
          <blockquote className="my-1.5 border-l-2 border-border-c pl-3 text-muted">
            {props.children}
          </blockquote>
        ),
        pre: (props) => (
          <pre className="my-1.5 overflow-x-auto rounded-lg bg-soft p-3 text-xs">
            {props.children}
          </pre>
        ),
        code: (props) => (
          <code className="rounded bg-soft px-1 py-0.5 font-mono text-[12px]">
            {props.children}
          </code>
        ),
        hr: () => <hr className="my-3 border-border-c" />,
        table: (props) => <table className="my-2 w-full border-collapse text-xs">{props.children}</table>,
        thead: (props) => <thead>{props.children}</thead>,
        tbody: (props) => <tbody>{props.children}</tbody>,
        tr: (props) => <tr className="border-b border-border-c last:border-0">{props.children}</tr>,
        th: (props) => (
          <th className="py-1 pr-3 text-left font-semibold text-foreground">{props.children}</th>
        ),
        td: (props) => <td className="py-1 pr-3 align-top text-muted">{props.children}</td>,
      }}
    >
      {text}
    </ReactMarkdown>
  );
}
