import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getSettings } from '../../state/storage';
import { Settings } from '../../types';

interface AddTaskProps {
  onAdd: (title: string) => void;
}

const placeholders = [
  "What do you need to accomplish?",
  "What would you like to do?",
  "What do you aspire for?",
  "What do you want to do?",
  "What would make you happy?",
  "What would you like to achieve?",
  "What would make yourself proud?",
  "What do you want to focus on?",
  "What do you want to improve?",
  "What do you want to learn?",
  "What do you want to create?",
  "What do you want to build?",
  "What do you want to explore?",
];

export default function AddTask({ onAdd }: AddTaskProps) {
  const [title, setTitle] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  // Load settings
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!settings) return;
    
    // Add initial delay before starting to type
    if (charIndex === 0 && isTyping && currentPlaceholderIndex === 0 && placeholder === '') {
      const timeout = setTimeout(() => {
        setCharIndex(1);
        setPlaceholder(placeholders[0].slice(0, 1));
      }, 500); // Wait 500ms before starting
      return () => clearTimeout(timeout);
    }
    
    const currentText = placeholders[currentPlaceholderIndex];
    
    if (isTyping) {
      // Typing forward
      if (charIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setPlaceholder(currentText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 70); // Type speed (slower)
        return () => clearTimeout(timeout);
      } else {
        // Finished typing, wait then start deleting (only if rotation is enabled)
        if (settings.enablePlaceholderRotation) {
          const timeout = setTimeout(() => {
            setIsTyping(false);
            setCharIndex(currentText.length);
          }, 3000); // Wait 3 seconds before deleting
          return () => clearTimeout(timeout);
        }
      }
    } else {
      // Deleting backward
      if (charIndex > 0) {
        const timeout = setTimeout(() => {
          setPlaceholder(currentText.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 50); // Delete speed
        return () => clearTimeout(timeout);
      } else {
        // Finished deleting, move to next placeholder
        setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
        setCharIndex(0);
      }
    }
  }, [charIndex, isTyping, currentPlaceholderIndex, settings]);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={title}
        onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
        autoFocus
      />
      <button
        type="submit"
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
      >
        Add
      </button>
    </form>
  );
}