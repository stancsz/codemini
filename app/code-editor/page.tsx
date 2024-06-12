"use client";
import React, { useState, useCallback } from 'react';
import CodeEditor from '../../components/CodeEditor';
import ChatBox from '../../components/ChatBox';

const CodeEditorPage: React.FC = () => {
  const [files, setFiles] = useState<{ filename: string; code: string }[]>([]);
  const [filter, setFilter] = useState('');

  const handleFilesUpdate = useCallback((updatedFiles: { filename: string; code: string }[]) => {
    setFiles(updatedFiles);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 10vh)' }}>
      <h1>Code Editor</h1>
      <div style={{ display: 'flex', flex: 1 }}>
        <div>
          <CodeEditor files={files} onFilesUpdate={handleFilesUpdate} filter={filter} onFilterChange={setFilter} />
        </div>
        <div>
          <ChatBox files={files} onFilesUpdate={handleFilesUpdate} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;