"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import UploadDownload from './UploadDownload';

interface CodeEditorProps {
    files: { filename: string; code: string, }[];
    onFilesUpdate: (updatedFiles: { filename: string; code: string }[]) => void;
    filter: string;
    onFilterChange: (filter: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ files, onFilesUpdate, filter, onFilterChange }) => {
    const [code, setCode] = useState('');
    const [fileName, setFileName] = useState<string | null>(null);

    const openFile = useCallback((file: { filename: string; code: string }) => {
        setCode(file.code);
        setFileName(file.filename);
    }, []);

    const deleteFile = useCallback((filename: string) => {
        const updatedFiles = files.filter(file => file.filename !== filename);
        onFilesUpdate(updatedFiles);
    }, [files, onFilesUpdate]);

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
        const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());
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
        const updatedFiles = files.slice(); // Create a shallow copy of the existing files array
        newFiles.forEach(newFile => {
            const existingFile = updatedFiles.find(file => file.filename === newFile.filename);
            if (existingFile) {
                // If the file already exists, append the new code to the existing code
                existingFile.code += newFile.code;
            } else {
                // Otherwise, add the new file to the array
                updatedFiles.push(newFile);
            }
        });
        onFilesUpdate(updatedFiles);
    };

    return (
        <div style={{ display: 'flex', flex: 1, width: '70vw' }}>
            <div style={{ padding: '10px', borderRight: '1px solid #ccc', height: 'calc(100vh - 10vh)' }}>
                <UploadDownload onFilesUpload={handleFilesUpload} getFilteredFiles={getFilteredFiles} />
                <input
                    type="text"
                    placeholder="Filter by suffix (e.g., .js,.ts)"
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value)}
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                <div style={{ marginTop: '20px' }}>
                    <div>Opened file: {fileName}</div>
                    <div>
                        {filteredFiles.map((file, index) => (
                            <div
                                key={index}
                                onClick={() => openFile(file)}
                                style={{ position: 'relative', cursor: 'pointer', padding: '5px', borderBottom: '1px solid #ccc' }}
                                onMouseEnter={e => e.currentTarget.querySelector('.delete-icon')!.style.display = 'inline'}
                                onMouseLeave={e => e.currentTarget.querySelector('.delete-icon')!.style.display = 'none'}
                            >
                                {file.filename}
                                <span onClick={() => deleteFile(file.filename)}
                                      style={{ position: 'absolute', right: '5px', cursor: 'pointer', display: 'none' }}
                                      className='delete-icon'
                                >❌</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div style={{ flexGrow: 1 }}>
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