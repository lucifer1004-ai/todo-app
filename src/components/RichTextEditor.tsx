import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Heading2,
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = '添加详细内容...',
  className = ''
}: RichTextEditorProps): React.ReactElement {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline hover:text-indigo-800',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  // 同步外部 content 变化
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return <div>加载编辑器...</div>
  }

  const addLink = () => {
    const url = window.prompt('输入链接地址:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* 工具栏 */}
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 h-8 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="粗体 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 h-8 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 h-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="标题"
        >
          <Heading2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 h-8 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 h-8 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 h-8 ${editor.isActive('blockquote') ? 'bg-gray-200' : ''}`}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 h-8 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
          title="代码块"
        >
          <Code className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={`p-2 h-8 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="添加链接"
        >
          <LinkIcon className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-gray-300 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 h-8"
          title="撤销 (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 h-8"
          title="重做 (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* 编辑器内容区 */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}

