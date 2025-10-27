// 日期工具函数

/**
 * 检查日期是否已过期
 */
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const now = new Date()
  return due < now
}

/**
 * 检查日期是否在今天
 */
export function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const today = new Date()
  return (
    due.getFullYear() === today.getFullYear() &&
    due.getMonth() === today.getMonth() &&
    due.getDate() === today.getDate()
  )
}

/**
 * 检查日期是否在明天
 */
export function isDueTomorrow(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return (
    due.getFullYear() === tomorrow.getFullYear() &&
    due.getMonth() === tomorrow.getMonth() &&
    due.getDate() === tomorrow.getDate()
  )
}

/**
 * 格式化日期显示
 */
export function formatDueDate(dueDate: string | null, completed: boolean = false): string {
  if (!dueDate) return ''
  
  const due = new Date(dueDate)
  const now = new Date()
  
  // 如果任务已完成，只显示日期，不显示逾期状态
  if (completed) {
    return due.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  if (isOverdue(dueDate)) {
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `逾期 ${diffDays} 天`
  }
  
  if (isDueToday(dueDate)) {
    return '今天到期'
  }
  
  if (isDueTomorrow(dueDate)) {
    return '明天到期'
  }
  
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 7) {
    return `${diffDays} 天后到期`
  }
  
  return due.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * 获取日期状态样式类名
 */
export function getDueDateClassName(dueDate: string | null): string {
  if (!dueDate) return ''
  
  if (isOverdue(dueDate)) {
    return 'text-red-600 bg-red-50 border-red-200'
  }
  
  if (isDueToday(dueDate)) {
    return 'text-orange-600 bg-orange-50 border-orange-200'
  }
  
  if (isDueTomorrow(dueDate)) {
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }
  
  return 'text-blue-600 bg-blue-50 border-blue-200'
}

/**
 * 将日期转换为 HTML input[type="datetime-local"] 格式
 */
export function toDateTimeLocalString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * 从 HTML input[type="datetime-local"] 格式转换为 ISO 字符串
 */
export function fromDateTimeLocalString(dateTimeLocal: string): string {
  return new Date(dateTimeLocal).toISOString()
}
