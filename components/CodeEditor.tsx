"use client"; // Add this line if you're using client-side code in Next.js

import * as React from 'react';
import { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface CodeEditorProps {
    initialCode: string;
    language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ initialCode, language = 'javascript' }) => {
    const [code, setCode] = useState(initialCode);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCode(e.target?.result as string);
                setFileName(file.name);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            {fileName && <div>Opened file: {fileName}</div>}
            <MonacoEditor
                height="90vh"
                language={language}
                value={code}
                onChange={(value) => setCode(value || '')}
            />
        </div>
    );
};

export default CodeEditor;