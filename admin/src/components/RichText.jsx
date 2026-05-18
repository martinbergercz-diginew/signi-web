import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { uploadImage } from '../api.js';

// `value` is the initial HTML — RichText is only mounted once the article has
// loaded, so the editor owns the content from then on and pushes changes up.
export default function RichText({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const toggleLink = () => {
    const url = window.prompt('URL odkazu (prázdné = odebrat):', '');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const url = await uploadImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (e) {
        window.alert(e.message);
      }
    };
    input.click();
  };

  const Btn = ({ onClick, active, children }) => (
    <button
      type="button"
      className={active ? 'tb-btn active' : 'tb-btn'}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );

  return (
    <div className="richtext">
      <div className="toolbar">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <em>I</em>
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          • Seznam
        </Btn>
        <Btn onClick={toggleLink} active={editor.isActive('link')}>
          Odkaz
        </Btn>
        <Btn onClick={insertImage}>Obrázek</Btn>
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  );
}
