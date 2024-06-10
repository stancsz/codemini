"use client";
import React, { useState } from 'react';
import CodeEditor from '../../components/CodeEditor';
import ChatBox from '../../components/ChatBox';

const CodeEditorPage: React.FC = () => {
  const [filteredFiles, setFilteredFiles] = useState<{ filename: string; code: string }[]>([]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <h1>Code Editor</h1>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <CodeEditor onFilteredFilesChange={setFilteredFiles} />
        </div>
        <div style={{ width: '40%', overflow: 'auto' }}>
          <ChatBox files={filteredFiles} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;