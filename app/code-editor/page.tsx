"use client";
import React, { useState } from 'react';
import CodeEditor from '../../components/CodeEditor';
import ChatBox from '../../components/ChatBox';

const CodeEditorPage: React.FC = () => {
  const [filteredFiles, setFilteredFiles] = useState<{ filename: string; code: string }[]>([]);

  const handleFilesUpdate = (updatedFiles: { filename: string; code: string }[]) => {
    setFilteredFiles(prevFiles => {
      const updatedFilesMap = Object.fromEntries(updatedFiles.map(file => [file.filename, file.code]));
      return prevFiles.map(file =>
        updatedFilesMap[file.filename]
          ? { ...file, code: updatedFilesMap[file.filename] }
          : file
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 10vh)' }}>
      <h1>Code Editor</h1>
      <div style={{ display: 'flex', flex: 1 }}>
        <div>
          <CodeEditor onFilteredFilesChange={setFilteredFiles} />
        </div>
        <div>
          <ChatBox files={filteredFiles} onFilesUpdate={handleFilesUpdate} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;