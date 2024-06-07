"use client"; // This line should only be added for client-side components in Next.js

import * as React from 'react';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';

interface CodeEditorProps {
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language = "python" }) => {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [files, setFiles] = useState<{ file: File, relativePath: string }[]>([]);
  const [filter, setFilter] = useState('');

  const handleFolderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList).map(file => ({
        file,
        relativePath: (file as any).webkitRelativePath || file.name
      }));
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
      setFileName((file as any).webkitRelativePath || file.name);
    };
    reader.readAsText(file);
  };

  const getFilteredFiles = () => {
    if (!filter) return files;

    const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());

    return files.filter(({ file }) => suffixes.some(suffix => file.name.endsWith(suffix)));
  };

  const handleDownload = () => {
    const zip = new JSZip();
    const filteredFiles = getFilteredFiles();

    filteredFiles.forEach(({ file, relativePath }) => {
      zip.file(relativePath, file);
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
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '250px', padding: '10px', borderRight: '1px solid #ccc' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <input
            type="file"
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            mozdirectory="true"
            onChange={handleFolderChange}
            style={{ display: 'none' }}
          />
          <span 
            style={{ 
              display: 'inline-block', 
              width: '100%', 
              backgroundColor: 'black', 
              color: 'white', 
              padding: '10px', 
              textAlign: 'center',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'darkgray'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'black'}
          >
            Upload Folder
          </span>
        </label>
        <input
          type="text"
          placeholder="Filter by suffix (e.g., .js,.ts)"
          value={filter}
          onChange={handleFilterChange}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <button
          onClick={handleDownload}
          style={{ 
            display: 'block', 
            width: '100%', 
            backgroundColor: 'black', 
            color: 'white', 
            padding: '10px',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'darkgray'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'black'}
        >
          Download All
        </button>
        <div style={{ marginTop: '20px' }}>
          <div>Opened file: {fileName}</div>
          <div>
            {filteredFiles.map(({ file, relativePath }, index) => (
              <div 
                key={index} 
                onClick={() => openFile(file)}
                style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #ccc' }}
              >
                {relativePath}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100vh"
          language={language}
          value={code}
          onChange={(newValue) => setCode(newValue || '')}
        />
      </div>
    </div>
  );
};

export default CodeEditor;