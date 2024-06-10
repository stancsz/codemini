// CodeEditor.tsx
"use client"; // This line should only be added for client-side components in Next.js

import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';

interface CodeEditorProps {
  files: { filename: string; code: string }[];
  onFileChange: (filename: string, code: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ files, onFileChange }) => {
  const [code, setCode] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const filesArray = Array.from(fileList).map(file => ({
        file,
        relativePath: (file as any).webkitRelativePath || file.name
      }));

      for (const fileObj of filesArray) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileChange(fileObj.relativePath, content);
        };
        reader.readAsText(fileObj.file);
      }
    }
  };

  const openFile = (file: { filename: string; code: string }) => {
    setCode(file.code);
    setFileName(file.filename);
  };

  const handleDownload = () => {
    const zip = new JSZip();

    files.forEach(({ filename, code }) => {
      zip.file(filename, code);
    });

    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = 'files.zip';
      link.click();
    });
  };

  useEffect(() => {
    if (files.length > 0 && fileName) {
      const file = files.find(file => file.filename === fileName);
      if (file) {
        setCode(file.code);
      }
    }
  }, [files, fileName]);

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
            {files.map((file, index) => (
              <div
                key={index}
                onClick={() => openFile(file)}
                style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #ccc' }}
              >
                {file.filename}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ flexGrow: 1 }}>
        <Editor
          height="100vh"
          language="javascript"  // Replace with your desired language
          value={code}
          onChange={(newValue) => {
            setCode(newValue || '');
            if (fileName) {
              onFileChange(fileName, newValue || '');
            }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;