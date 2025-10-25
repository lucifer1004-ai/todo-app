import { Todo } from '@/types/ui'

// 导出格式类型
export type ExportFormat = 'json' | 'csv' | 'ical' | 'markdown'

// 导出选项接口
export interface ExportOptions {
  format: ExportFormat
  includeCompleted?: boolean
  includeDueDates?: boolean
  filename?: string
}

// 生成文件名
export const generateFilename = (format: ExportFormat, customName?: string): string => {
  const timestamp = new Date().toISOString().split('T')[0]
  const baseName = customName || `todo-export-${timestamp}`
  
  const extensions: Record<ExportFormat, string> = {
    json: 'json',
    csv: 'csv',
    ical: 'ics',
    markdown: 'md'
  }
  
  return `${baseName}.${extensions[format]}`
}

// 导出为 JSON 格式
export const exportToJSON = (todos: Todo[], options: ExportOptions): string => {
  const filteredTodos = options.includeCompleted 
    ? todos 
    : todos.filter(todo => !todo.completed)
  
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTodos: filteredTodos.length,
    todos: filteredTodos.map(todo => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      ...(options.includeDueDates && todo.due_date && { dueDate: todo.due_date }),
      createdAt: todo.created_at
    }))
  }
  
  return JSON.stringify(exportData, null, 2)
}

// 导出为 CSV 格式
export const exportToCSV = (todos: Todo[], options: ExportOptions): string => {
  const filteredTodos = options.includeCompleted 
    ? todos 
    : todos.filter(todo => !todo.completed)
  
  const headers = ['标题', '状态', '创建时间']
  if (options.includeDueDates) {
    headers.push('截止时间')
  }
  
  const csvRows = [headers.join(',')]
  
  filteredTodos.forEach(todo => {
    const row = [
      `"${todo.title.replace(/"/g, '""')}"`,
      todo.completed ? '已完成' : '未完成',
      `"${new Date(todo.created_at).toLocaleString('zh-CN')}"`
    ]
    
    if (options.includeDueDates) {
      row.push(todo.due_date ? `"${new Date(todo.due_date).toLocaleString('zh-CN')}"` : '无')
    }
    
    csvRows.push(row.join(','))
  })
  
  return csvRows.join('\n')
}

// 导出为 iCal 格式 (RFC 5545)
export const exportToICal = (todos: Todo[], options: ExportOptions): string => {
  const filteredTodos = options.includeCompleted 
    ? todos 
    : todos.filter(todo => !todo.completed)
  
  const now = new Date()
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Todo App//Todo Export//CN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ]
  
  filteredTodos.forEach(todo => {
    const uid = `todo-${todo.id}@todoapp.local`
    const created = formatDate(new Date(todo.created_at))
    const summary = todo.title.replace(/\n/g, '\\n')
    
    icalContent.push('BEGIN:VTODO')
    icalContent.push(`UID:${uid}`)
    icalContent.push(`DTSTAMP:${formatDate(now)}`)
    icalContent.push(`CREATED:${created}`)
    icalContent.push(`SUMMARY:${summary}`)
    icalContent.push(`STATUS:${todo.completed ? 'COMPLETED' : 'NEEDS-ACTION'}`)
    icalContent.push('PRIORITY:5')
    
    if (todo.due_date && options.includeDueDates) {
      const dueDate = formatDate(new Date(todo.due_date))
      icalContent.push(`DUE:${dueDate}`)
    }
    
    if (todo.completed) {
      icalContent.push(`COMPLETED:${created}`)
      icalContent.push('PERCENT-COMPLETE:100')
    } else {
      icalContent.push('PERCENT-COMPLETE:0')
    }
    
    icalContent.push('END:VTODO')
  })
  
  icalContent.push('END:VCALENDAR')
  
  return icalContent.join('\r\n')
}

// 导出为 Markdown 格式
export const exportToMarkdown = (todos: Todo[], options: ExportOptions): string => {
  const filteredTodos = options.includeCompleted 
    ? todos 
    : todos.filter(todo => !todo.completed)
  
  const completedTodos = filteredTodos.filter(todo => todo.completed)
  const incompleteTodos = filteredTodos.filter(todo => !todo.completed)
  
  let markdown = `# 待办事项导出\n\n`
  markdown += `导出时间：${new Date().toLocaleString('zh-CN')}\n`
  markdown += `总计：${filteredTodos.length} 项任务\n\n`
  
  if (incompleteTodos.length > 0) {
    markdown += `## 未完成任务 (${incompleteTodos.length})\n\n`
    incompleteTodos.forEach(todo => {
      markdown += `- [ ] ${todo.title}`
      if (todo.due_date && options.includeDueDates) {
        const dueDate = new Date(todo.due_date)
        markdown += ` ⏰ ${dueDate.toLocaleString('zh-CN')}`
      }
      markdown += '\n'
    })
    markdown += '\n'
  }
  
  if (completedTodos.length > 0 && options.includeCompleted) {
    markdown += `## 已完成任务 (${completedTodos.length})\n\n`
    completedTodos.forEach(todo => {
      markdown += `- [x] ${todo.title}`
      if (todo.due_date && options.includeDueDates) {
        const dueDate = new Date(todo.due_date)
        markdown += ` ⏰ ${dueDate.toLocaleString('zh-CN')}`
      }
      markdown += '\n'
    })
  }
  
  return markdown
}

// 主导出函数
export const exportTodos = (todos: Todo[], options: ExportOptions): string => {
  switch (options.format) {
    case 'json':
      return exportToJSON(todos, options)
    case 'csv':
      return exportToCSV(todos, options)
    case 'ical':
      return exportToICal(todos, options)
    case 'markdown':
      return exportToMarkdown(todos, options)
    default:
      throw new Error(`不支持的导出格式: ${options.format}`)
  }
}

// 下载文件函数
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

// MIME 类型映射
export const getMimeType = (format: ExportFormat): string => {
  const mimeTypes: Record<ExportFormat, string> = {
    json: 'application/json',
    csv: 'text/csv',
    ical: 'text/calendar',
    markdown: 'text/markdown'
  }
  
  return mimeTypes[format]
}

// 格式描述
export const getFormatDescription = (format: ExportFormat): string => {
  const descriptions: Record<ExportFormat, string> = {
    json: 'JSON 数据格式，适用于程序处理和备份',
    csv: 'CSV 表格格式，可在 Excel 等软件中打开',
    ical: 'iCal 日历格式，可导入到日历应用中',
    markdown: 'Markdown 文档格式，适合阅读和分享'
  }
  
  return descriptions[format]
}
