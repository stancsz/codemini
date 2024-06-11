"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import UploadDownload from './UploadDownload';

interface CodeEditorProps {
    language?: string;
    onFilteredFilesChange: (filteredFiles: { filename: string; code: string }[]) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language = "javascript", onFilteredFilesChange }) => {
    const [code, setCode] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);
    const [files, setFiles] = useState<{ filename: string; code: string }[]>([]);
    const [filter, setFilter] = useState('');

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    }, []);

    const openFile = useCallback((file: { filename: string; code: string }) => {
        setCode(file.code);
        setFileName(file.filename);
    }, []);

    const getFilteredFiles = useCallback(() => {
        if (!filter) return files;

        const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());
        return files.filter(file => suffixes.some(suffix => file.filename.endsWith(suffix)));
    }, [filter, files]);

    const filteredFiles = useMemo(getFilteredFiles, [getFilteredFiles]);

    useEffect(() => {
        onFilteredFilesChange(filteredFiles);
    }, [filteredFiles, onFilteredFilesChange]);

    return (
        <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ width: '250px', padding: '10px', borderRight: '1px solid #ccc' }}>
                <UploadDownload onFilesUpload={setFiles} getFilteredFiles={getFilteredFiles} />
                <input
                    type="text"
                    placeholder="Filter by suffix (e.g., .js,.ts)"
                    value={filter}
                    onChange={handleFilterChange}
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <div style={{ marginTop: '20px' }}>
                    <div>Opened file: {fileName}</div>
                    <div>
                        {filteredFiles.map((file, index) => (
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
                    height="90vh"
                    language={language}
                    value={code}
                    onChange={(newValue) => {
                        if (fileName) {
                            setFiles((prevFiles) =>
                                prevFiles.map(file =>
                                    file.filename === fileName ? { ...file, code: newValue || '' } : file
                                )
                            );
                        }
                        setCode(newValue || '');
                    }}
                />
            </div>
        </div>
    );
};

export default CodeEditor;