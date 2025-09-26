import React from 'react'
import { Calendar, AlertTriangle, Clock } from 'lucide-react'
import { formatDueDate, getDueDateClassName, isOverdue, isDueToday } from '@/utils/dateUtils'

interface DueDateBadgeProps {
  dueDate: string | null | undefined
  completed?: boolean
  className?: string
}

export default function DueDateBadge({ 
  dueDate, 
  completed = false, 
  className = "" 
}: DueDateBadgeProps): React.ReactElement | null {
  if (!dueDate) return null

  const isTaskOverdue = isOverdue(dueDate) && !completed
  const isTaskDueToday = isDueToday(dueDate) && !completed
  const dateText = formatDueDate(dueDate)
  const badgeClassName = getDueDateClassName(dueDate)

  // 如果任务已完成，使用灰色样式
  const finalClassName = completed 
    ? 'text-gray-500 bg-gray-50 border-gray-200'
    : badgeClassName

  const getIcon = () => {
    if (completed) {
      return <Calendar className="w-3 h-3" />
    }
    
    if (isTaskOverdue) {
      return <AlertTriangle className="w-3 h-3" />
    }
    
    if (isTaskDueToday) {
      return <Clock className="w-3 h-3" />
    }
    
    return <Calendar className="w-3 h-3" />
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${finalClassName} ${className}`}>
      {getIcon()}
      <span>{dateText}</span>
    </div>
  )
}
