import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Clock, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toDateTimeLocalString, fromDateTimeLocalString } from '@/utils/dateUtils'

interface DatePickerProps {
  value?: string | null
  onChange: (date: string | null) => void
  placeholder?: string
  className?: string
}

export default function DatePicker({ 
  value, 
  onChange, 
  placeholder = "设置截止日期",
  className = ""
}: DatePickerProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const [tempDate, setTempDate] = useState<string>('')

  // 初始化临时日期值
  React.useEffect(() => {
    if (value) {
      const date = new Date(value)
      setTempDate(toDateTimeLocalString(date))
    } else {
      // 默认设置为今天下午6点
      const defaultDate = new Date()
      defaultDate.setHours(18, 0, 0, 0)
      setTempDate(toDateTimeLocalString(defaultDate))
    }
  }, [value, isOpen])

  const handleConfirm = () => {
    if (tempDate) {
      onChange(fromDateTimeLocalString(tempDate))
    }
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setIsOpen(false)
  }

  const handleQuickSet = (hours: number) => {
    const date = new Date()
    date.setHours(date.getHours() + hours, 0, 0, 0)
    setTempDate(toDateTimeLocalString(date))
  }

  const formatDisplayDate = (dateString: string | null | undefined) => {
    if (!dateString) return placeholder
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`justify-start text-left font-normal ${
          value ? 'text-gray-900' : 'text-gray-500'
        }`}
        type="button"
      >
        <Calendar className="w-4 h-4 mr-2" />
        {formatDisplayDate(value)}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* 日期选择器弹窗 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-12 left-0 z-50 w-80"
            >
              <Card className="shadow-xl border-0 bg-white">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* 标题 */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">设置截止日期</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                        className="h-6 w-6 p-0"
                        type="button"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* 快速设置按钮 */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSet(1)}
                        className="text-xs"
                        type="button"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        1小时后
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSet(24)}
                        className="text-xs"
                        type="button"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        明天
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSet(24 * 7)}
                        className="text-xs"
                        type="button"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        下周
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickSet(24 * 30)}
                        className="text-xs"
                        type="button"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        下月
                      </Button>
                    </div>

                    {/* 自定义日期时间输入 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        自定义日期时间
                      </label>
                      <Input
                        type="datetime-local"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleConfirm}
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                        size="sm"
                        type="button"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        确定
                      </Button>
                      {value && (
                        <Button
                          variant="outline"
                          onClick={handleClear}
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          type="button"
                        >
                          <X className="w-4 h-4 mr-1" />
                          清除
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
