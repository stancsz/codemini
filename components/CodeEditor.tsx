"use client"; // This line should only be added for client-side components in Next.js

import * as React from 'react';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';

interface CodeEditorProps {
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language = 'javascript' }) => {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filter, setFilter] = useState('');

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList);
      setFiles(filesArray);
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const openFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const getFilteredFiles = () => {
    if (!filter) return files;

    const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());

    return files.filter(file => suffixes.some(suffix => file.name.endsWith(suffix)));
  };

  const handleDownload = () => {
    const zip = new JSZip();
    const filteredFiles = getFilteredFiles();

    filteredFiles.forEach(file => {
      zip.file(file.name, file);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'files.zip';
      link.click();
    });
  };

  const filteredFiles = getFilteredFiles();

  return (
    <div>
      <input
        type="file"
        // @ts-ignore
        webkitdirectory="true"
        // @ts-ignore
        mozdirectory="true"
        onChange={handleFolderChange}
      />
      <input
        type="text"
        placeholder="Filter by suffix (e.g., .js,.ts)"
        value={filter}
        onChange={handleFilterChange}
      />
      <button onClick={handleDownload}>Download All</button>
      <div>
        Opened file: {fileName}
      </div>
      <div>
        {filteredFiles.map((file, index) => (
          <div key={index} onClick={() => openFile(file)}>
            {file.name}
          </div>
        ))}
      </div>
      <Editor
        height="90vh"
        language={language}
        value={code}
        onChange={(newValue) => setCode(newValue || '')}
      />
    </div>
  );
};

export default CodeEditor;