"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import UploadDownload from './UploadDownload';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';  // Adjust the path according to your project structure
import { onAuthStateChanged, User } from 'firebase/auth';
import '../styles/CodeEditor.css';  // Import the new CSS file

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

  const deleteFile = useCallback(async (filename: string) => {
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

  const getFilteredFiles = useCallback(() => {
    if (!filter) return files;
    const suffixes = ("" + filter).split(/[,;]/).map(suffix => suffix.trim());
    return files.filter(file => suffixes.some(suffix => file.filename.endsWith(suffix)));
  }, [filter, files]);

  const filteredFiles = useMemo(getFilteredFiles, [getFilteredFiles]);

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
      <div className="files-list">
        <UploadDownload onFilesUpload={handleFilesUpload} getFilteredFiles={getFilteredFiles} />
        <input
          type="text"
          placeholder="Filter by suffix (e.g., .js,.ts)"
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="filter-input"
        />
        <div className="opened-file">Opened file: {fileName}</div>
        <div className="file-links">
          {filteredFiles.map((file, index) => (
            <div
              key={index}
              onClick={() => openFile(file)}
              className="file-link"
            >
              {file.filename}
              <span onClick={(e) => {
                e.stopPropagation();
                deleteFile(file.filename);
              }}
              className="delete-icon"
              >❌</span>
            </div>
          ))}
        </div>
      </div>
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