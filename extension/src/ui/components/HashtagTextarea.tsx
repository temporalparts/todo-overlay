import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import clsx from 'clsx';

interface HashtagTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  hashtagStyle?: 'default' | 'pill' | 'minimal' | 'highlight';
  onHashtagClick?: (hashtag: string) => void;
}

export function HashtagTextarea({ 
  value, 
  onChange, 
  placeholder,
  className,
  hashtagStyle = 'default',
  onHashtagClick
}: HashtagTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<h.JSX.Element[]>([]);

  const processText = (text: string) => {
    const regex = /(#[^\s]+)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (part.match(/^#[^\s]+$/)) {
        const styleClass = hashtagStyle !== 'default' ? `style-${hashtagStyle}` : '';
        return (
          <span
            key={index}
            className={clsx('hashtag-box animate', styleClass)}
            onClick={() => onHashtagClick?.(part)}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  useEffect(() => {
    setProcessedContent(processText(value));
  }, [value, hashtagStyle]);

  const handleInput = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    onChange(target.value);
    syncScroll();
  };

  const syncScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  return (
    <div className={clsx('hashtag-textarea-container', className)}>
      <div 
        ref={overlayRef}
        className="hashtag-overlay"
        aria-hidden="true"
      >
        {processedContent}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onInput={handleInput}
        onScroll={syncScroll}
        placeholder={placeholder}
        className="hashtag-textarea"
      />
    </div>
  );
}

export function InlineHashtagInput({
  value,
  onChange,
  placeholder,
  className,
  hashtagStyle = 'default'
}: HashtagTextareaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState<h.JSX.Element[]>([]);

  useEffect(() => {
    const regex = /(#[^\s]+)/g;
    const parts = value.split(regex);
    
    const elements = parts.map((part, index) => {
      if (part.match(/^#[^\s]+$/)) {
        const styleClass = hashtagStyle !== 'default' ? `style-${hashtagStyle}` : '';
        return (
          <span
            key={index}
            className={clsx('hashtag-box', styleClass)}
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
    
    setDisplayValue(elements);
  }, [value, hashtagStyle]);

  return (
    <div className={clsx('inline-hashtag-container', className)}>
      <div className="hashtag-display-overlay">
        {displayValue}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        placeholder={placeholder}
        className="hashtag-input-field"
      />
    </div>
  );
}