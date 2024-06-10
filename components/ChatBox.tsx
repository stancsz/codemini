// ChatBox.tsx
import React, { useState } from 'react';

interface ChatBoxProps {
  files: { filename: string; code: string }[];
  onFilterChange: (filter: string) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ files, onFilterChange }) => {
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      console.log('Message sent:', message);
      setMessage('');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilter = e.target.value;
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  return (
    <div style={{ flexShrink: 0, padding: '16px', border: '1px solid #ccc' }}>
      <div>
        <input
          type="text"
          placeholder="Filter files"
          value={filter}
          onChange={handleFilterChange}
        />
      </div>
      <div className="flex items-end gap-1.5 md:gap-2 p-4 border rounded-lg">
        <div className="flex flex-col">
          <input type="file" className="hidden" />
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded="false"
            className="text-token-text-primary border border-transparent inline-flex items-center justify-center gap-1 rounded-lg text-sm leading-none outline-none cursor-pointer hover:bg-token-main-surface-secondary m-0 h-0 w-0 border-none bg-transparent p-0"
          />
          <button className="flex items-center justify-center text-token-text-primary h-8 w-8 rounded-full focus-visible:outline-black mb-1 ml-1.5" aria-disabled="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path fill="currentColor" fill-rule="evenodd" d="M9 7a5 5 0 0 1 10 0v8a7 7 0 1 1-14 0V9a1 1 0 0 1 2 0v6a5 5 0 0 0 10 0V7a3 3 0 1 0-6 0v8a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v6a3 3 0 1 1-6 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <textarea
            id="prompt-textarea"
            rows={1}
            placeholder="Message ChatGPT"
            className="m-0 resize-none border-0 bg-transparent px-0 text-token-text-primary focus:ring-0 focus-visible:ring-0 max-h-[25dvh] max-h-52"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ height: '64px', overflowY: 'hidden' }}
          />
        </div>
        <button
          data-testid="fruitjuice-send-button"
          className="mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:outline-black disabled:bg-[#D7D7D7] disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:bg-white dark:text-black dark:focus-visible:outline-white disabled:dark:bg-token-text-quaternary dark:disabled:text-token-main-surface-secondary"
          onClick={handleSendMessage}
          disabled={message.trim() === ''}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 32 32" className="icon-2xl">
            <path fill="currentColor" fill-rule="evenodd" d="M15.192 8.906a1.143 1.143 0 0 1 1.616 0l5.143 5.143a1.143 1.143 0 0 1-1.616 1.616l-3.192-3.192v9.813a1.143 1.143 0 0 1-2.286 0v-9.813l-3.192 3.192a1.143 1.143 0 1 1-1.616-1.616z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
      <div>
        <h3>Filtered Files:</h3>
        <ul>
          {files.map(file => (
            <li key={file.filename}>{file.filename}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatBox;