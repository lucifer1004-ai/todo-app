import React, { useState } from 'react'
import { Download, FileText, Table, Calendar, Code, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Todo } from '@/types/ui'
import { 
  ExportFormat, 
  exportTodos, 
  downloadFile, 
  getMimeType, 
  generateFilename 
} from '@/utils/exportUtils'

interface BatchExportProps {
  todos: Todo[]
  isOpen: boolean
  onClose: () => void
}

const quickExportFormats: Array<{
  format: ExportFormat
  name: string
  description: string
  icon: React.ReactNode
  color: string
}> = [
  {
    format: 'json',
    name: 'JSON 备份',
    description: '完整数据备份，包含所有信息',
    icon: <Code className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  {
    format: 'csv',
    name: 'Excel 表格',
    description: '可在 Excel 中打开编辑',
    icon: <Table className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  {
    format: 'ical',
    name: '日历事件',
    description: '导入到日历应用中',
    icon: <Calendar className="w-6 h-6" />,
    color: 'bg-purple-500'
  },
  {
    format: 'markdown',
    name: 'Markdown 文档',
    description: '适合阅读和分享的格式',
    icon: <FileText className="w-6 h-6" />,
    color: 'bg-orange-500'
  }
]

export default function BatchExport({ todos, isOpen, onClose }: BatchExportProps) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null)

  if (!isOpen) return null

  const handleQuickExport = async (format: ExportFormat) => {
    setExportingFormat(format)
    
    try {
      const options = {
        format,
        includeCompleted: true,
        includeDueDates: true
      }
      
      const content = exportTodos(todos, options)
      const filename = generateFilename(format)
      const mimeType = getMimeType(format)
      
      downloadFile(content, filename, mimeType)
      
      setTimeout(() => {
        setExportingFormat(null)
      }, 1000)
    } catch (error) {
      console.error('导出失败:', error)
      setExportingFormat(null)
    }
  }

  const handleExportAll = async () => {
    setExportingFormat('json')
    
    try {
      // 导出所有格式
      for (const { format } of quickExportFormats) {
        const options = {
          format,
          includeCompleted: true,
          includeDueDates: true
        }
        
        const content = exportTodos(todos, options)
        const filename = generateFilename(format, `todo-complete-backup-${new Date().toISOString().split('T')[0]}`)
        const mimeType = getMimeType(format)
        
        downloadFile(content, filename, mimeType)
        
        // 添加小延迟避免浏览器阻止多个下载
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setTimeout(() => {
        setExportingFormat(null)
        onClose()
      }, 1000)
    } catch (error) {
      console.error('批量导出失败:', error)
      setExportingFormat(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            批量导出 - 快速备份
          </CardTitle>
          <p className="text-sm text-gray-600">
            选择格式快速导出，或一键导出所有格式的完整备份
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 快速导出选项 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickExportFormats.map(({ format, name, description, icon, color }) => (
              <button
                key={format}
                onClick={() => handleQuickExport(format)}
                disabled={exportingFormat !== null}
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-left group hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className={`${color} text-white p-3 rounded-lg group-hover:scale-105 transition-transform`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{description}</p>
                    <div className="flex items-center gap-2">
                      {exportingFormat === format ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span className="text-sm text-gray-600">导出中...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">点击导出</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* 统计信息 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">导出统计</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">总任务数</span>
                <p className="font-semibold text-lg">{todos.length}</p>
              </div>
              <div>
                <span className="text-gray-600">已完成</span>
                <p className="font-semibold text-lg text-green-600">
                  {todos.filter(t => t.completed).length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">未完成</span>
                <p className="font-semibold text-lg text-orange-600">
                  {todos.filter(t => !t.completed).length}
                </p>
              </div>
              <div>
                <span className="text-gray-600">有截止日期</span>
                <p className="font-semibold text-lg text-blue-600">
                  {todos.filter(t => t.due_date).length}
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={exportingFormat !== null}
            >
              关闭
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleExportAll}
                disabled={exportingFormat !== null || todos.length === 0}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100"
              >
                {exportingFormat === 'json' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    批量导出中...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 mr-2" />
                    一键导出全部格式
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
