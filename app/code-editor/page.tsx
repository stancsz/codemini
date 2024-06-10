import React from 'react';
import CodeEditor from '../../components/CodeEditor';
import ChatBox from '../../components/ChatBox';

const CodeEditorPage: React.FC = () => {
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <div style={{ flex: 1, overflow: 'auto' }}>
                <CodeEditor />
            </div>
            <div style={{ width: '40%', overflow: 'auto' }}>
                <ChatBox />
            </div>
        </div>
    );
};

export default CodeEditorPage;