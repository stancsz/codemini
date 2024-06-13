import React from 'react';
import JSZip from 'jszip';

interface UploadDownloadProps {
    onFilesUpload: (files: { filename: string; code: string }[]) => void;
    getFilteredFiles: () => { filename: string; code: string }[];
}

const UploadDownload: React.FC<UploadDownloadProps> = ({ onFilesUpload, getFilteredFiles }) => {
    const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList) {
            const filesArray = Array.from(fileList).map(file => ({
                file,
                relativePath: (file as any).webkitRelativePath || file.name
            }));

            const allFiles: { filename: any; code: string; }[] = [];

            for (const fileObj of filesArray) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    allFiles.push({ filename: fileObj.relativePath, code: content });

                    // If all files are read, call the callback
                    if (allFiles.length === filesArray.length) {
                        onFilesUpload(allFiles);
                    }
                };
                reader.readAsText(fileObj.file);
            }
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = event.target.files;
        if (fileList) {
            const filesArray = Array.from(fileList).map(file => ({
                file,
                relativePath: file.name
            }));

            const allFiles: { filename: any; code: string; }[] = [];

            for (const fileObj of filesArray) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    allFiles.push({ filename: fileObj.relativePath, code: content });

                    // If all files are read, call the callback
                    if (allFiles.length === filesArray.length) {
                        onFilesUpload(allFiles);
                    }
                };
                reader.readAsText(fileObj.file);
            }

            // Check if 'mini_chat.json' exists and load its content to chat box
            const miniChatFile = filesArray.find(file => file.file.name === 'mini_chat.json');
            if (miniChatFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const content = e.target?.result as string;
                    if (content) {
                        const parsedMessages = JSON.parse(content);
                        localStorage.setItem('chatMessages', JSON.stringify(parsedMessages));
                    }
                };
                reader.readAsText(miniChatFile.file);
            }
        }
    };

    const handleDownload = () => {
        const zip = new JSZip();

        const filteredFiles = getFilteredFiles();
        filteredFiles.forEach(({ filename, code }) => {
            zip.file(filename, code);
        });

        // Add mini_chat.json containing chat messages
        const chatMessages = localStorage.getItem('chatMessages');
        if (chatMessages) {
            zip.file('mini_chat.json', chatMessages);
        } else {
            zip.file('mini_chat.json', JSON.stringify([])); // Add an empty array if no chat messages
        }

        zip.generateAsync({ type: 'blob' }).then(content => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            const now = new Date();
            const dateString = now.toISOString().slice(0, 16).replace(/[:T]/g, '-');
            link.download = `mini-${dateString}.zip`;
            link.click();
        });
    };

    return (
        <>
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
            <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                    type="file"
                    onChange={handleFileChange}
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
                    Upload File
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
        </>
    );
};

export default UploadDownload;
