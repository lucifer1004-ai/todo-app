import React, { useState } from 'react'
import { Download, FileText, Table, Calendar, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Todo } from '@/types/ui'
import { 
  ExportFormat, 
  ExportOptions, 
  exportTodos, 
  downloadFile, 
  getMimeType, 
  generateFilename,
  getFormatDescription 
} from '@/utils/exportUtils'

interface ExportDialogProps {
  todos: Todo[]
  isOpen: boolean
  onClose: () => void
}

const formatIcons: Record<ExportFormat, React.ReactNode> = {
  json: <Code className="w-5 h-5" />,
  csv: <Table className="w-5 h-5" />,
  ical: <Calendar className="w-5 h-5" />,
  markdown: <FileText className="w-5 h-5" />
}

const formatNames: Record<ExportFormat, string> = {
  json: 'JSON',
  csv: 'CSV',
  ical: 'iCal',
  markdown: 'Markdown'
}

export default function ExportDialog({ todos, isOpen, onClose }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json')
  const [includeCompleted, setIncludeCompleted] = useState(true)
  const [includeDueDates, setIncludeDueDates] = useState(true)
  const [customFilename, setCustomFilename] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const options: ExportOptions = {
        format: selectedFormat,
        includeCompleted,
        includeDueDates,
        filename: customFilename
      }
      
      const content = exportTodos(todos, options)
      const filename = generateFilename(selectedFormat, customFilename)
      const mimeType = getMimeType(selectedFormat)
      
      downloadFile(content, filename, mimeType)
      
      // 延迟关闭对话框，让用户看到成功状态
      setTimeout(() => {
        onClose()
        setIsExporting(false)
      }, 1000)
    } catch (error) {
      console.error('导出失败:', error)
      setIsExporting(false)
    }
  }

  const getFilteredTodosCount = () => {
    return includeCompleted ? todos.length : todos.filter(todo => !todo.completed).length
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            导出待办事项
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 格式选择 */}
          <div>
            <Label className="text-base font-medium mb-3 block">选择导出格式</Label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(formatNames) as ExportFormat[]).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedFormat === format
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {formatIcons[format]}
                    <span className="font-medium">{formatNames[format]}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getFormatDescription(format)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 导出选项 */}
          <div>
            <Label className="text-base font-medium mb-3 block">导出选项</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCompleted"
                  checked={includeCompleted}
                  onCheckedChange={(checked) => setIncludeCompleted(checked as boolean)}
                />
                <Label htmlFor="includeCompleted" className="cursor-pointer">
                  包含已完成的任务
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeDueDates"
                  checked={includeDueDates}
                  onCheckedChange={(checked) => setIncludeDueDates(checked as boolean)}
                />
                <Label htmlFor="includeDueDates" className="cursor-pointer">
                  包含截止日期信息
                </Label>
              </div>
            </div>
          </div>

          {/* 文件名设置 */}
          <div>
            <Label htmlFor="filename" className="text-base font-medium mb-2 block">
              自定义文件名（可选）
            </Label>
            <Input
              id="filename"
              placeholder="留空使用默认文件名"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-1">
              预览: {generateFilename(selectedFormat, customFilename)}
            </p>
          </div>

          {/* 导出预览 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">导出预览</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>格式: {formatNames[selectedFormat]}</p>
              <p>任务数量: {getFilteredTodosCount()} 项</p>
              <p>包含已完成: {includeCompleted ? '是' : '否'}</p>
              <p>包含截止日期: {includeDueDates ? '是' : '否'}</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              取消
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || todos.length === 0}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  导出 ({getFilteredTodosCount()} 项)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
