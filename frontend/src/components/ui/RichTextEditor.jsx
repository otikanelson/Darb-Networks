import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "Enter text...",
  height = "200px",
  error = null
}) => {
  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  }), []);

  // Quill formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'align',
    'link'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ height: height }}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <style jsx>{`
        .rich-text-editor-wrapper :global(.ql-container) {
          min-height: ${height};
          font-family: inherit;
        }
        .rich-text-editor-wrapper :global(.ql-editor) {
          min-height: ${height};
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
