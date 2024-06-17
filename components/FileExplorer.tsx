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
    const sortedFiles = files.sort((a, b) => a.filename.localeCompare(b.filename));

    return (
      <ul className="file-list">
        {sortedFiles.map(file => (
          <li
            key={file.filename}
            className={`file-item ${currentFile === file.filename ? 'highlighted' : ''}`}
            onContextMenu={(e) => handleContextMenu(e, file.filename)}
            onClick={() => { onFileOpen(file); setCurrentFile(file.filename); }}
          >
            {file.filename}
          </li>
        ))}
      </ul>
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
