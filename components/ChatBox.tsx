import React, { useState } from 'react';
import axios from 'axios';

interface ChatBoxProps { 
  files: { filename: string; code: string }[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ files }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    // Add user message to chat
    const newChatMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newChatMessages);

    try {
      const response = await axios.post('/api/sendMessage', { message }); 
      const chatGPTResponse = response.data.response;

      // Add ChatGPT response to chat
      setChatMessages([...newChatMessages, { role: 'assistant', content: chatGPTResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }

    setMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'flex-end', border: '1px solid #ccc' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {chatMessages.map((msg, index) => (
          <div key={index} style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
            <strong>{msg.role === 'user' ? 'You' : '🐣Mini'}:</strong>
            <pre>{msg.content}</pre>
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
          style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px' }}
        />
        <button
          onClick={handleSendMessage}
          disabled={message.trim() === ''}
          style={{ marginLeft: '8px', padding: '8px 16px', backgroundColor: 'black', color: 'white', borderRadius: '4px' }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;