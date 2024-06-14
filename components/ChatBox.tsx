import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';  // Adjust the path according to your project structure
import { doc, setDoc, getDocs, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import sendMessage from './sendMessage';
import '../styles/ChatBox.css';  // Import the new CSS file

interface ChatBoxProps {
  files: { filename: string; code: string }[];
  onFilesUpdate: (updatedFiles: { filename: string; code: string }[]) => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ files, onFilesUpdate }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);

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
        fetchProjects(user.uid);
      } else {
        setUser(null);
        setProjects([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProjects = async (uid: string) => {
    const querySnapshot = await getDocs(collection(db, `user/${uid}/project`));
    const userProjects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProjects(userProjects);
  };

  const handleSendMessage = async () => {
    if (message.trim() === '') {
      return;
    }

    const codeFiles = files.map(file => `# Filename: ${file.filename}
# Code:
${file.code}`).join('\n\n');
    const fullMessage = `${message}\n\nFiles:\n${codeFiles}`;
    const newChatMessages = [...chatMessages, { role: 'user', content: message }];
    setChatMessages(newChatMessages);

    try {
      const response = await sendMessage(fullMessage);
      const chatGPTResponse = response ? JSON.parse(response) : null;

      if (chatGPTResponse) {
        const newAssistantMessages = [{ role: 'assistant', content: chatGPTResponse.message }];

        setChatMessages(prevChatMessages => [...prevChatMessages, ...newAssistantMessages]);

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

  const displayNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSaveProject = async () => {
    if (user) {
      const projectRef = doc(db, `user/${user.uid}/project/${selectedProject || `project-${Date.now()}`}`);

      try {
        await setDoc(projectRef, { files, message: chatMessages });
        displayNotification('success', 'Project saved successfully!');
        fetchProjects(user.uid);  // Refresh project list
      } catch (error) {
        console.error('Error saving project:', error);
        displayNotification('error', 'Failed to save project.');
      }
    } else {
      displayNotification('error', 'User not logged in.');
    }
  };

  const handleClearCache = async () => {
    setChatMessages([]); // Clear chat messages
    onFilesUpdate([]); // Clear files

    if (selectedProject && user) {
      const projectRef = doc(db, `user/${user.uid}/project/${selectedProject}`);

      try {
        await deleteDoc(projectRef);
        displayNotification('success', 'Project deleted successfully!');
        setSelectedProject(null);
        fetchProjects(user.uid); // Refresh project list
      } catch (error) {
        console.error('Error deleting project:', error);
        displayNotification('error', 'Failed to delete project.');
      }
    } else {
      displayNotification('error', 'No project selected.');
    }
  };

  const handleLoadProject = (project: any) => {
    onFilesUpdate(project.files);
    setChatMessages(project.message);
    setSelectedProject(project.id);
  };

  return (
    <div className="chatbox-container">
      {notification && (
        <div className={`notification ${notification.type}`}>{notification.message}</div>
      )}
      <button
        onClick={handleSaveProject}
        className="save-project-button"
      >
        💾
      </button>
      <button
        onClick={handleClearCache}
        className="clear-cache-button"
      >
        🗑️
      </button>
      <select
        value={selectedProject || ''}
        onChange={(e) => {
          const projectId = e.target.value;
          const project = projects.find(proj => proj.id === projectId);
          if (project) {
            handleLoadProject(project);
          }
        }}
        className="project-selector"
      >
        <option value="" disabled>Select a Project</option>
        {projects.map((project, index) => (
          <option key={index} value={project.id}>{`Project ${index + 1}`}</option>
        ))}
      </select>
      <div className="chat-messages">
        {chatMessages.map((msg, index) => (
          <div key={index} className="message-box">
            <strong>{msg.role === 'user' ? '✨User' : '🐣Mini'}:</strong>
            <pre className="message-content">{msg.content}</pre>
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <textarea
          id="prompt-textarea"
          rows={1}
          placeholder="Message ChatGPT"
          className="message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          onClick={handleSendMessage}
          disabled={message.trim() === ''}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
