
import React, { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUp, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type FileType = 'pdf' | 'doc' | 'txt';

const FileUploader = () => {
  const { addSource } = useAppContext();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (fileName: string): FileType | null => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (extension === 'doc' || extension === 'docx') return 'doc';
    if (extension === 'txt') return 'txt';
    return null;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFileSelection(file);
  };

  const handleFileSelection = (file: File | null) => {
    if (!file) return;
    
    const fileType = getFileType(file.name);
    
    if (!fileType) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a PDF, DOC, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    handleFileSelection(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    
    const fileType = getFileType(selectedFile.name);
    
    if (!fileType) {
      toast({
        title: "Unsupported file format",
        description: "Please upload a PDF, DOC, or TXT file.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would actually upload the file to a server here
    // For now, we'll just simulate it by adding to our sources
    addSource({
      type: 'file',
      name: selectedFile.name,
      filePath: URL.createObjectURL(selectedFile), // This is temporary and will only work during the session
      fileType
    });
    
    toast({
      title: "File added",
      description: `${selectedFile.name} has been added to your sources.`
    });
    
    setSelectedFile(null);
  };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept=".pdf,.doc,.docx,.txt"
        className="hidden"
      />
      
      {!selectedFile ? (
        <Card 
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-thoughtweb-purple bg-thoughtweb-purple/10' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <FileUp size={40} className="text-thoughtweb-purple" />
            <div>
              <p className="font-medium">Drop your file here, or click to browse</p>
              <p className="text-sm text-gray-500 mt-1">Supports PDF, DOC, and TXT files</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-thoughtweb-purple/10 rounded">
                <FileUp size={24} className="text-thoughtweb-purple" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X size={16} />
            </Button>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleUpload}>Upload File</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FileUploader;
