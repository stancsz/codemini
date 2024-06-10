"use client";
// page.tsx
import React, { useState } from 'react';
import CodeEditor from '../../components/CodeEditor';
import ChatBox from '../../components/ChatBox';

const CodeEditorPage: React.FC = () => {
    const [files, setFiles] = useState<{ filename: string; code: string }[]>([]);
    const [filter, setFilter] = useState<string>('');

    const handleFileChange = (filename: string, code: string) => {
        setFiles((prevFiles) => {
            const fileIndex = prevFiles.findIndex(file => file.filename === filename);
            if (fileIndex >= 0) {
                const updatedFiles = [...prevFiles];
                updatedFiles[fileIndex].code = code;
                return updatedFiles;
            } else {
                return [...prevFiles, { filename, code }];
            }
        });
    };

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
    };

    const filteredFiles = files.filter(file => file.filename.includes(filter));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            <h1>Code Editor</h1>
            <div style={{ display: 'flex', flex: 1 }}>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    <CodeEditor files={filteredFiles} onFileChange={handleFileChange} />
                </div>
                <div style={{ width: '40%', overflow: 'auto' }}>
                    <ChatBox files={filteredFiles} onFilterChange={handleFilterChange} />
                </div>


            </div>
        </div>
    );
};

export default CodeEditorPage;