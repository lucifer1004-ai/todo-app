import React from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps): React.ReactElement {
  if (!content || content.trim() === '' || content === '<p></p>') {
    return (
      <div className={`text-gray-400 italic text-sm ${className}`}>
        暂无详细内容
      </div>
    )
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

