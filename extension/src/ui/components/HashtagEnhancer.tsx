import { h, RefObject } from 'preact';
import { useEffect, useRef } from 'preact/hooks';

interface HashtagEnhancerProps {
  inputRef: RefObject<HTMLInputElement>;
  value: string;
}

export function HashtagEnhancer({ inputRef, value }: HashtagEnhancerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputRef.current || !overlayRef.current) return;

    // Process the text to identify hashtags
    const processText = (text: string) => {
      // First, replace all sequences of # with a placeholder to avoid matching them
      // Then find single # followed by content
      let result = '';
      let i = 0;
      
      while (i < text.length) {
        if (text[i] === '#') {
          // Count consecutive #s
          let hashCount = 0;
          let j = i;
          while (j < text.length && text[j] === '#') {
            hashCount++;
            j++;
          }
          
          // Check what comes after the #s
          if (j < text.length && text[j] !== ' ' && text[j] !== '#') {
            // We have content after the #s
            // Find the end of the hashtag content
            let endIndex = j;
            while (endIndex < text.length && text[endIndex] !== ' ' && text[endIndex] !== '#') {
              endIndex++;
            }
            
            // Add the leading #s as regular text (except the last one)
            if (hashCount > 1) {
              result += '#'.repeat(hashCount - 1).replace(/ /g, '&nbsp;');
            }
            
            // Add the hashtag with highlight
            const hashtagContent = text.slice(j, endIndex);
            result += `<span class="hashtag-highlight">#${hashtagContent}</span>`;
            
            i = endIndex;
          } else {
            // Just #s with no content or space after
            result += '#'.repeat(hashCount).replace(/ /g, '&nbsp;');
            i = j;
          }
        } else {
          // Regular character
          if (text[i] === ' ') {
            result += '&nbsp;';
          } else if (text[i] === '&') {
            result += '&amp;';
          } else if (text[i] === '<') {
            result += '&lt;';
          } else if (text[i] === '>') {
            result += '&gt;';
          } else {
            result += text[i];
          }
          i++;
        }
      }
      
      return result;
    };

    // Update overlay content
    overlayRef.current.innerHTML = processText(value);

    // Sync overlay position and style with input
    const input = inputRef.current;
    const overlay = overlayRef.current;
    
    // Copy computed styles
    const inputStyles = window.getComputedStyle(input);
    overlay.style.font = inputStyles.font;
    overlay.style.fontSize = inputStyles.fontSize;
    overlay.style.lineHeight = inputStyles.lineHeight;
    overlay.style.padding = inputStyles.padding;
    overlay.style.border = `1px solid transparent`;
    overlay.style.letterSpacing = inputStyles.letterSpacing;
  }, [value, inputRef]);

  return (
    <div 
      ref={overlayRef}
      className="hashtag-overlay-display"
      aria-hidden="true"
    />
  );
}