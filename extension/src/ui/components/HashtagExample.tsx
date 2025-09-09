import { h } from 'preact';
import { useState } from 'preact/hooks';
import { HashtagTextarea, InlineHashtagInput } from './HashtagTextarea';
import { HashtagDisplay } from './HashtagInput';

export function HashtagExample() {
  const [textareaValue, setTextareaValue] = useState('Type #hashtags here and they will be styled automatically');
  const [inputValue, setInputValue] = useState('#example #test #demo');
  const [selectedStyle, setSelectedStyle] = useState<'default' | 'pill' | 'minimal' | 'highlight'>('default');

  const handleHashtagClick = (hashtag: string) => {
    console.log('Clicked hashtag:', hashtag);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Hashtag Style Options</h3>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedStyle('default')}
            className={`px-3 py-1 rounded ${selectedStyle === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Default
          </button>
          <button
            onClick={() => setSelectedStyle('pill')}
            className={`px-3 py-1 rounded ${selectedStyle === 'pill' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Pill
          </button>
          <button
            onClick={() => setSelectedStyle('minimal')}
            className={`px-3 py-1 rounded ${selectedStyle === 'minimal' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Minimal
          </button>
          <button
            onClick={() => setSelectedStyle('highlight')}
            className={`px-3 py-1 rounded ${selectedStyle === 'highlight' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Highlight
          </button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Textarea with Hashtags</h3>
        <HashtagTextarea
          value={textareaValue}
          onChange={setTextareaValue}
          placeholder="Type something with #hashtags..."
          hashtagStyle={selectedStyle}
          onHashtagClick={handleHashtagClick}
          className="w-full"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Inline Input with Hashtags</h3>
        <InlineHashtagInput
          value={inputValue}
          onChange={setInputValue}
          placeholder="Type #hashtags..."
          hashtagStyle={selectedStyle}
          className="w-full"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Display Only</h3>
        <HashtagDisplay text="This is a text with #hashtag and #another-hashtag that are automatically styled" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Current Values</h3>
        <div className="p-3 bg-gray-100 rounded">
          <p><strong>Textarea:</strong> {textareaValue}</p>
          <p><strong>Input:</strong> {inputValue}</p>
        </div>
      </div>
    </div>
  );
}