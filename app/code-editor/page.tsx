import React from 'react';
import CodeEditor from '../../components/CodeEditor';

const CodeEditorPage: React.FC = () => {
    return (
        <div>
            <h1>Code Editor</h1>
            <CodeEditor language="javascript" />
        </div>
    );
};

export default CodeEditorPage;