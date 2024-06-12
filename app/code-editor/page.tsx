"use client";
import React, { useState } from 'react';
import CodeEditor from '../../components/CodeEditor';
import ChatBox from '../../components/ChatBox';

const CodeEditorPage: React.FC = () => {
  const [shareFiles, setShareFiles] = useState<{ filename: string; code: string }[]>([]);
  const [shareFilter, setShareFilter] = useState<string>('');

  const handleFilesUpdate = (updatedFiles: { filename: string; code: string }[]) => {
    // Merge updated files with the current shareFiles
    const updatedFilesMap = Object.fromEntries(updatedFiles.map(file => [file.filename, file.code]));
    setShareFiles(prevFiles =>
      prevFiles.map(file =>
        updatedFilesMap[file.filename]
          ? { ...file, code: updatedFilesMap[file.filename] }
          : file
      )
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 10vh)' }}>
      <h1>Code Editor</h1>
      <div style={{ display: 'flex', flex: 1 }}>
        <div>
          <CodeEditor files={shareFiles} filter={shareFilter} onFilesChange={setShareFiles} onFilterChange={setShareFilter} />
        </div>
        <div>
          <ChatBox files={shareFiles} onFilesUpdate={handleFilesUpdate} />
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage;