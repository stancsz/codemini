import React, { useCallback } from 'react';
import UploadDownload from "./UploadDownload";

interface FileExplorerProps {
  files: { filename: string; code: string }[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onFileOpen: (file: { filename: string; code: string }) => void;
  onFileDelete: (filename: string) => void;
  onFilesUpload: (newFiles: { filename: string; code: string }[]) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ files, filter, onFilterChange, onFileOpen, onFileDelete, onFilesUpload }) => {
  const getFilteredFiles = useCallback(() => {
    if (!filter) return files;
    const suffixes = filter.split(/[,;]/).map(suffix => suffix.trim());
    return files.filter(file => suffixes.some(suffix => file.filename.endsWith(suffix)));
  }, [filter, files]);

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
      <div className="file-links">
        {getFilteredFiles().map((file, index) => (
          <div
            key={index}
            onClick={() => onFileOpen(file)}
            className="file-link"
          >
            {file.filename}
            <span
              onClick={(e) => {
                e.stopPropagation();
                onFileDelete(file.filename);
              }}
              className="delete-icon"
            >❌</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
