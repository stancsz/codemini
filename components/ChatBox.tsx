import React, { useState } from 'react';
import axios from 'axios';

interface ChatBoxProps {
  files: { filename: string; code: string }[];
  onFilesUpdate: (updatedFiles: { filename: string; code: string }[]) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ files, onFilesUpdate }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    // Add user message to chat
    const codeFiles = files.map(file => `# Filename: ${file.filename}\n# Code:\n${file.code}`).join('\n\n');
    const fullMessage = `${message}\n\nFiles:\n${codeFiles}`;
    const newChatMessages = [...chatMessages, { role: 'user', content: fullMessage }];
    setChatMessages(newChatMessages);

    try {
      const response = await axios.post('/api/sendMessage', { message: fullMessage });
      const chatGPTResponse = response.data.response;

      // Add ChatGPT response to chat
      setChatMessages([...newChatMessages, { role: 'assistant', content: chatGPTResponse }]);
      // setChatMessages([...newChatMessages, { role: 'assistant', content: chatGPTResponse.message }]);

      // Update files based on ChatGPT response
      const updatedFiles = chatGPTResponse.files;
      if (updatedFiles) {
        onFilesUpdate(updatedFiles);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-end', border: '1px solid #ccc', height: '100vh' }}>
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
          style={{ marginLeft: '8px', padding: '8px 16px', backgroundColor: 'black', color: 'white', borderRadius: '4px'}}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;