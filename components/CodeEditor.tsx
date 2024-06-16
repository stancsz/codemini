"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';  // Adjust the path according to your project structure
import { onAuthStateChanged, User } from 'firebase/auth';
import FileExplorer from './FileExplorer';  // Import the new FileExplorer component
import '../styles/CodeEditor.css';  // Import the CSS file

interface CodeEditorProps {
  files: { filename: string; code: string, }[];
  onFilesUpdate: (updatedFiles: { filename: string; code: string }[]) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ files, onFilesUpdate, filter, onFilterChange }) => {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

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

  const openFile = useCallback((file: { filename: string; code: string }) => {
    setCode(file.code);
    setFileName(file.filename);
  }, []);

  const handleFileAction = useCallback(async (filename: string, action: 'delete' | 'rename' | 'download') => {
    if (action === 'delete') {
      const updatedFiles = files.filter(file => file.filename !== filename);
      onFilesUpdate(updatedFiles);
      setCode('');
      setFileName(null);

      // Firestore deletion
      if (filename && filename.startsWith('project-') && user) { // Assuming project filenames start with 'project-'
        const projectRef = doc(db, `user/${user.uid}/project/${filename}`);
        try {
          await deleteDoc(projectRef);
        } catch (error) {
          console.log('Error deleting file from Firestore: ', error);
        }
      }
    }
    // Handle other file actions like 'rename' and 'download' here.
  }, [files, onFilesUpdate, user]);

  const getLanguageFromFilename = (filename: string) => {
    const ext = filename.split('.').pop();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
        return 'javascript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'cpp':
        return 'cpp';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  useEffect(() => {
    if (fileName) {
      const currentFile = files.find(file => file.filename === fileName);
      if (currentFile) {
        setCode(currentFile.code);
      }
    }
  }, [files, fileName]);

  const handleCodeChange = (newValue: string | undefined) => {
    if (fileName) {
      const updatedFiles = files.map(file =>
        file.filename === fileName ? { ...file, code: newValue || '' } : file
      );
      onFilesUpdate(updatedFiles);
    }
    setCode(newValue || '');
  };

  const handleFilesUpload = (newFiles: { filename: string; code: string }[]) => {
    const updatedFiles = files.slice(); 
    newFiles.forEach(newFile => {
      const existingFile = updatedFiles.find(file => file.filename === newFile.filename);
      if (existingFile) {
        existingFile.code += newFile.code;
      } else {
        updatedFiles.push(newFile);
      }
    });
    onFilesUpdate(updatedFiles);
  };

  return (
    <div className="codeeditor-container">
      <FileExplorer
        files={files}
        filter={filter}
        onFilterChange={onFilterChange}
        onFileOpen={openFile}
        onFileAction={handleFileAction}
        onFilesUpload={handleFilesUpload}
      />
      <div className="editor-section">
        <Editor
          height="100%"
          language={fileName ? getLanguageFromFilename(fileName) : 'plaintext'}
          value={code}
          onChange={handleCodeChange}
          options={{
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            tabCompletion: 'off',
            snippetSuggestions: 'none',
            disableLayerHinting: true,
            quickSuggestionsDelay: 0
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
