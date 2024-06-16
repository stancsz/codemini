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
  const [folderState, setFolderState] = useState<{ [key: string]: boolean }>({});
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; filename: string | null }>({ visible: false, x: 0, y: 0, filename: null });
  const [currentFile, setCurrentFile] = useState<string | null>(null);

  const getFilteredFiles = useCallback(() => {
    if (!filter) return files;
    const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());
    return files.filter(file => suffixes.some(suffix => file.filename.endsWith(suffix)));
  }, [filter, files]);

  const handleFolderClick = (folderPath: string) => {
    setFolderState(prevState => ({
      ...prevState,
      [folderPath]: !prevState[folderPath],
    }));
  };

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

  const renderFileTree = (files: { filename: string; code: string }[]) => {
    const fileTree: any = {};

    files.forEach(file => {
      const pathParts = file.filename.split('/');
      let currentLevel = fileTree;

      pathParts.forEach((part, index) => {
        const isFile = index === pathParts.length - 1 && part.includes('.');

        if (!currentLevel[part]) {
          if (isFile) {
            currentLevel[part] = file;
          } else {
            currentLevel[part] = {};
          }
        }
        currentLevel = currentLevel[part];
      });
    });

    const renderTree = (node: any, path: string = '', level: number = 0) => {
      if (typeof node === 'object' && node !== null) {
        return (
          <ul key={path} className={`folder level-${level}`}>
            {Object.entries(node).map(([key, value]: [string, any]) => (
              <li
                key={key}
                className={`file-tree-item level-${level} ${currentFile === value.filename ? 'highlighted' : ''}`}
                style={{ marginLeft: level * 20 }}
                onContextMenu={(e) => handleContextMenu(e, typeof value === 'object' && value !== null && 'filename' in value ? value.filename : null)}>
                {typeof value === 'object' && value !== null && !('code' in value) ? (
                  <>
                    <span onClick={() => handleFolderClick(`${path}/${key}`)} className="folder-name">
                      {folderState[`${path}/${key}`] ? '▼' : '▶'} {key}
                    </span>
                    {folderState[`${path}/${key}`] && renderTree(value, `${path}/${key}`, level + 1)}
                  </>
                ) : (
                  <span onClick={() => { onFileOpen(value); setCurrentFile(value.filename); }} className="file-name">
                    {key}
                  </span>
                )}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    };

    return renderTree(fileTree);
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
      <div className="file-tree">
        {renderFileTree(getFilteredFiles())}
      </div>
    </div>
  );
};

export default FileExplorer;
