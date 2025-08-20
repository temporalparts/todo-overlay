import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { getSettings } from '../../state/storage';
import { Settings, Priority } from '../../types';
import TaskForm from './shared/TaskForm';

interface AddTaskProps {
  onAdd: (title: string, priority?: Priority, dueDate?: string) => void;
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
  const [placeholder, setPlaceholder] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [hasText, setHasText] = useState(false);

  // Load settings
  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (!settings) return;
    
    // Pause the animation if there's text in the input
    if (hasText) return;
    
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
  }, [charIndex, isTyping, currentPlaceholderIndex, settings, hasText]);

  const handleAdd = (title: string, priority?: Priority, dueDate?: string) => {
    onAdd(title, priority, dueDate);
    setHasText(false); // Reset text state for placeholder animation
  };

  // Track if there's text in the form (passed via a callback from TaskForm)
  // For now, we'll just use the default placeholder behavior
  
  return (
    <TaskForm
      onSave={handleAdd}
      submitLabel="Add"
      placeholder={placeholder}
      initialDueDate={new Date().toISOString().split('T')[0]}
      autoFocus={true}
      showTestDateOptions={true}
    />
  );
}