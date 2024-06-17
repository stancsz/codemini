import React, { useCallback, useState, useEffect } from 'react';
import UploadDownload from './UploadDownload';
import '../styles/FileExplorer.css';

interface FileExplorerProps {
  files: { filename: string; code: string }[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onFileOpen: (file: { filename: string; code: string }) => void;
  onFileAction: (filename: string, action: 'delete' | 'rename' | 'download') => void;
  onFilesUpload: (newFiles: { filename: string; code: string }[]) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, filter, onFilterChange, onFileOpen, onFileAction, onFilesUpload }) => {
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; filename: string | null }>({ visible: false, x: 0, y: 0, filename: null });
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const getFilteredFiles = useCallback(() => {
    if (!filter) return files;
    const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());
    return files.filter(file => suffixes.some(suffix => file.filename.endsWith(suffix)));
  }, [filter, files]);

  const handleContextMenu = (event: React.MouseEvent, filename: string) => {
    event.preventDefault();
    setContextMenu({ visible: true, x: event.clientX, y: event.clientY, filename });
  };

  const handleFileAction = (action: 'delete' | 'rename' | 'download') => {
    if (contextMenu.filename) {
      onFileAction(contextMenu.filename, action);
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  const renderFileList = (files: { filename: string; code: string }[]) => {
    const fileTree: any = {};

    files.forEach(file => {
      const parts = file.filename.split('/');
      let currentLevel = fileTree;
      parts.forEach((part, index) => {
        if (!currentLevel[part]) {
          currentLevel[part] = { __files: [] };
        }
        if (index === parts.length - 1) {
          currentLevel[part].__files.push(file);
        }
        currentLevel = currentLevel[part];
      });
    });

    const renderFolder = (folder: any, path: string, indent: number) => {
      const indentStyle = { marginLeft: `${indent * 5}px` };
      return (
        <>
          {Object.entries(folder).map(([name, content]: [string, any]) => {
            if (name === '__files') return null;
            return (
              <div key={path + name} className="folder-container" style={indentStyle}>
                <div className="folder-name">📁{name}</div>
                {renderFolder(content, path + name + '/', indent + 1)}
              </div>
            );
          })}
          {folder.__files &&
            folder.__files.map((file: any) => (
              <div
                key={file.filename}
                className={`file-item ${currentFile === file.filename ? 'highlighted' : ''}`}
                style={indentStyle}
                onContextMenu={(e) => handleContextMenu(e, file.filename)}
                onClick={() => { onFileOpen(file); setCurrentFile(file.filename); }}
              >
                📄 {file.filename.split('/').pop()}
              </div>
            ))}
        </>
      );
    };

    return (
      <div className="file-list">
        {renderFolder(fileTree, '', 0)}
      </div>
    );
  };

  useEffect(() => {
    const handleClick = () => {
      setContextMenu({ ...contextMenu, visible: false });
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu]);

  return (
    <div className="files-list">
      <div className={contextMenu.visible ? 'context-menu active' : 'context-menu'} style={{ top: contextMenu.y, left: contextMenu.x }}>
        <div onClick={() => handleFileAction('delete')}>Delete</div>
        <div onClick={() => handleFileAction('rename')}>Rename</div>
        <div onClick={() => handleFileAction('download')}>Download</div>
      </div>
      <UploadDownload onFilesUpload={onFilesUpload} getFilteredFiles={getFilteredFiles} />
      <input
        type="text"
        placeholder="Filter by suffix (e.g., .js,.ts)"
        value={filter}
        onChange={(e) => onFilterChange(e.target.value)}
        className="filter-input"
      />
      <div className="file-list-container">
        {renderFileList(getFilteredFiles())}
      </div>
    </div>
  );
};

export default FileExplorer;
