import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { db, auth } from '../firebase';  // Adjust the path according to your project structure
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface ChatBoxProps {
  files: { filename: string; code: string }[];
  onFilesUpdate: (updatedFiles: { filename: string; code: string }[]) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ files, onFilesUpdate }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [user, setUser] = useState(null);

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

  useEffect(() => {
    localStorage.setItem('files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    const codeFiles = files.map(file => `# Filename: ${file.filename}\n# Code:\n${file.code}`).join('\n\n');
    const fullMessage = `${message}\n\nFiles:\n${codeFiles}`;
    const newChatMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newChatMessages);

    try {
      const response = await axios.post('/api/sendMessage', { message: fullMessage });
      const chatGPTResponse = JSON.parse(response.data.response);

      if (chatGPTResponse) {
        const newAssistantMessages = [
          { role: 'assistant', content: chatGPTResponse.message },
        ];

        setChatMessages(prevChatMessages => [
          ...prevChatMessages,
          ...newAssistantMessages,
        ]);

        const updatedFiles = chatGPTResponse.files;
        if (updatedFiles) {
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

    for (let file of existingFiles) {
      fileMap.set(file.filename, file.code);
    }

    for (let file of newFiles) {
      fileMap.set(file.filename, file.code);
    }

    return Array.from(fileMap.entries()).map(([filename, code]) => ({ filename, code }));
  };

  const handleSaveProject = async () => {
    if (user) {
      const projectId = `project-${Date.now()}`;
      const projectRef = doc(db, `user/${user.uid}/project/${projectId}`);

      try {
        await setDoc(projectRef, { files, message: chatMessages });
        alert('Project saved successfully!');
      } catch (error) {
        console.error('Error saving project:', error);
        alert('Failed to save project.');
      }
    } else {
      alert('User not logged in.');
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem('files');
    localStorage.removeItem('chatMessages');
    onFilesUpdate([]);
    setChatMessages([]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', border: '1px solid #ccc', height: 'calc(100vh - 10vh)', position: 'relative' }}>
      <button
        onClick={handleSaveProject}
        style={{ position: 'absolute', top: 0, right: 0, margin: '10px', padding: '8px 16px', backgroundColor: 'green', color: 'white', borderRadius: '4px', zIndex: 10 }}
      >
        Save Project
      </button>
      <button
        onClick={handleClearCache}
        style={{ position: 'absolute', top: 0, right: '120px', margin: '10px', padding: '8px 16px', backgroundColor: 'gray', color: 'white', borderRadius: '4px', zIndex: 10 }}
      >
        🗑️
      </button>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', marginTop: '40px' }}>
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
      </div>
    </div>
  );
};

export default ChatBox;