import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ChatBoxProps {
  files: { filename: string; code: string }[];
  onFilesUpdate: (updatedFiles: { filename: string; code: string }[]) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ files, onFilesUpdate }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);

  // Load state from localStorage on component mount
  useEffect(() => {
    const cachedFiles = localStorage.getItem('files');
    const cachedChatMessages = localStorage.getItem('chatMessages');

    if (cachedFiles) {
      onFilesUpdate(JSON.parse(cachedFiles));
    }

    if (cachedChatMessages) {
      setChatMessages(JSON.parse(cachedChatMessages));
    }
  }, [onFilesUpdate]);

  // Save files and chatMessages to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    // Add user message to chat
    const codeFiles = files.map(file => `# Filename: ${file.filename}\n# Code:\n${file.code}`).join('\n\n');
    const fullMessage = `${message}\n\nFiles:\n${codeFiles}`;
    const newChatMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newChatMessages);

    try {
      const response = await axios.post('/api/sendMessage', { message: fullMessage });
      const chatGPTResponse = JSON.parse(response.data.response); // Parse the response as JSON

      if (chatGPTResponse) {
        const newAssistantMessages = [
          { role: 'assistant', content: chatGPTResponse.message },
        ];

        setChatMessages(prevChatMessages => [
          ...prevChatMessages,
          ...newAssistantMessages,
        ]);

        // Update files based on ChatGPT response
        const updatedFiles = chatGPTResponse.files;
        if (updatedFiles) {
          // Merge new files with existing files
          const mergedFiles = mergeFiles(files, updatedFiles);
          onFilesUpdate(mergedFiles);
        }
      } else {
        console.error('No response from ChatGPT');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessage('');
  };

  const mergeFiles = (existingFiles: { filename: string; code: string }[], newFiles: { filename: string; code: string }[]): { filename: string; code: string }[] => {
    const fileMap = new Map<string, string>();

    // Add all existing files to the map
    for (let file of existingFiles) {
      fileMap.set(file.filename, file.code);
    }

    // Add new files to the map, overwriting any existing files with the same filename
    for (let file of newFiles) {
      fileMap.set(file.filename, file.code);
    }

    // Convert the map back to an array
    return Array.from(fileMap.entries()).map(([filename, code]) => ({ filename, code }));
  };

  const handleClearCache = () => {
    localStorage.removeItem('files');
    localStorage.removeItem('chatMessages');
    onFilesUpdate([]); // Clear files state
    setChatMessages([]); // Clear chat messages state
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', border: '1px solid #ccc', height: 'calc(100vh - 10vh)'}}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {chatMessages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', wordWrap: 'break-word' }}>
            <strong>{msg.role === 'user' ? '✨User' : '🐣Mini'}:</strong>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{msg.content}</pre>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderTop: '1px solid #ccc' }}>
        <textarea
          id="prompt-textarea"
          rows={1}
          placeholder="Message ChatGPT"
          className="resize-none bg-transparent w-full"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', flex: 1 }}
        />
        <button
          onClick={handleSendMessage}
          disabled={message.trim() === ''}
          style={{ marginLeft: '8px', padding: '8px 16px', backgroundColor: 'black', color: 'white', borderRadius: '4px' }}
        >
          Send
        </button>
        <button
          onClick={handleClearCache}
          style={{ marginLeft: '8px', padding: '8px 16px', backgroundColor: 'red', color: 'white', borderRadius: '4px' }}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
