import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ExportDialog from './ExportDialog'
import { Todo } from '@/types/ui'

interface ExportButtonProps {
  todos: Todo[]
  className?: string
}

export default function ExportButton({ todos, className }: ExportButtonProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowExportDialog(true)}
        className={`flex items-center gap-2 ${className}`}
        disabled={todos.length === 0}
      >
        <Download className="w-4 h-4" />
        导出
      </Button>

      <ExportDialog
        todos={todos}
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
    </>
  )
}
