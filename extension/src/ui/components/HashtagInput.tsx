import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import clsx from 'clsx';

interface HashtagInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function HashtagInput({ value, onChange, placeholder, className }: HashtagInputProps) {
  const [segments, setSegments] = useState<Array<{ text: string; isHashtag: boolean }>>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parts = value.split(/(\s+)/);
    const newSegments: Array<{ text: string; isHashtag: boolean }> = [];
    
    parts.forEach(part => {
      if (part.match(/^\s+$/)) {
        newSegments.push({ text: part, isHashtag: false });
      } else if (part.startsWith('#') && part.length > 1) {
        newSegments.push({ text: part, isHashtag: true });
      } else {
        newSegments.push({ text: part, isHashtag: false });
      }
    });
    
    setSegments(newSegments);
  }, [value]);

  const handleInput = (e: Event) => {
    const target = e.target as HTMLDivElement;
    const text = target.textContent || '';
    onChange(text);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className={clsx('relative', className)}>
      <div
        ref={inputRef}
        className="hashtag-input"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
      >
        {segments.map((segment, index) => (
          <span
            key={index}
            className={clsx({
              'hashtag-box': segment.isHashtag
            })}
          >
            {segment.text}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HashtagDisplay({ text }: { text: string }) {
  const parts = text.split(/(\s+)/);
  
  return (
    <div className="hashtag-display">
      {parts.map((part, index) => {
        const isHashtag = part.startsWith('#') && part.length > 1 && !part.match(/^\s+$/);
        
        if (isHashtag) {
          return (
            <span key={index} className="hashtag-box">
              {part}
            </span>
          );
        }
        
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}