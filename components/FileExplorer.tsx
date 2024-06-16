import React, { useCallback, useState } from 'react';
import UploadDownload from './UploadDownload';

interface FileExplorerProps {
  files: { filename: string; code: string }[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onFileOpen: (file: { filename: string; code: string }) => void;
  onFileDelete: (filename: string) => void;
  onFilesUpload: (newFiles: { filename: string; code: string }[]) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, filter, onFilterChange, onFileOpen, onFileDelete, onFilesUpload }) => {
  const [folderState, setFolderState] = useState<{ [key: string]: boolean }>({});

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
            {Object.entries(node).map(([key, value]) => (
              <li key={key} className={`file-tree-item level-${level}`} style={{ marginLeft: level * 20 }}>
                {typeof value === 'object' && value !== null && !(value.code) ? (
                  <>
                    <span onClick={() => handleFolderClick(`${path}/${key}`)} className="folder-name">
                      {folderState[`${path}/${key}`] ? '▼' : '▶'} {key}
                    </span>
                    {folderState[`${path}/${key}`] && renderTree(value, `${path}/${key}`, level + 1)}
                  </>
                ) : (
                  <span onClick={() => onFileOpen(value)} className="file-name">
                    {key}
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileDelete(value.filename);
                      }}
                      className="delete-icon"
                    >❌</span>
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

  return (
    <div className="files-list">
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
