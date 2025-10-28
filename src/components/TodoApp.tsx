import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, CheckCircle2, Circle, Edit3, Download, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import UserMenu from './auth/UserMenu'
import DatePicker from './DatePicker'
import DueDateBadge from './DueDateBadge'
import ExportButton from './ExportButton'
import BatchExport from './BatchExport'
import RichTextEditor from './RichTextEditor'
import MarkdownContent from './MarkdownContent'
import { isOverdue, isDueToday } from '@/utils/dateUtils'
import { ChevronDown, ChevronUp } from 'lucide-react'

// 定义 Todo 类型
interface Todo {
  id: number
  title: string
  content?: string
  completed: boolean
  created_at: string
  updated_at: string
  user_id: string
  due_date?: string | null
}

export default function TodoApp(): React.ReactElement {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<string>('')
  const [newTodoDueDate, setNewTodoDueDate] = useState<string | null>(null)
  const [editingDueDate, setEditingDueDate] = useState<number | null>(null)
  const [editingTodo, setEditingTodo] = useState<number | null>(null)
  const [editingText, setEditingText] = useState<string>('')
  const [expandedTodo, setExpandedTodo] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState<number | null>(null)
  const [contentText, setContentText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [showBatchExport, setShowBatchExport] = useState<boolean>(false)
  const { user } = useAuth()

  // 获取当前用户的待办事项
  const fetchTodos = async (): Promise<void> => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  // 添加新的待办事项
  const addTodo = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    if (!newTodo.trim() || !user) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ 
          title: newTodo.trim(),
          user_id: user.id,
          due_date: newTodoDueDate
        }])
        .select()
      
      if (error) throw error
      if (data) {
        setTodos([...data, ...todos])
      }
      setNewTodo('')
      setNewTodoDueDate(null)
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  // 切换待办事项完成状态
  const toggleTodo = async (id: number, completed: boolean): Promise<void> => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ))
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }

  // 删除待办事项
  const deleteTodo = async (id: number): Promise<void> => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  // 更新待办事项截止日期
  const updateTodoDueDate = async (id: number, dueDate: string | null): Promise<void> => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          due_date: dueDate,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, due_date: dueDate } : todo
      ))
      setEditingDueDate(null)
    } catch (error) {
      console.error('Error updating todo due date:', error)
    }
  }

  // 开始编辑待办事项标题
  const startEditingTodo = (id: number, currentTitle: string): void => {
    setEditingTodo(id)
    setEditingText(currentTitle)
  }

  // 更新待办事项标题
  const updateTodoTitle = async (id: number): Promise<void> => {
    if (!user || !editingText.trim()) {
      setEditingTodo(null)
      return
    }
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          title: editingText.trim(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, title: editingText.trim() } : todo
      ))
      setEditingTodo(null)
      setEditingText('')
    } catch (error) {
      console.error('Error updating todo title:', error)
    }
  }

  // 取消编辑
  const cancelEditing = (): void => {
    setEditingTodo(null)
    setEditingText('')
  }

  // 切换任务展开/折叠状态
  const toggleExpand = (id: number): void => {
    if (expandedTodo === id) {
      setExpandedTodo(null)
      setEditingContent(null)
    } else {
      setExpandedTodo(id)
    }
  }

  // 开始编辑内容
  const startEditingContent = (id: number, currentContent: string): void => {
    setEditingContent(id)
    setContentText(currentContent || '')
  }

  // 更新任务内容
  const updateTodoContent = async (id: number): Promise<void> => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .update({ 
          content: contentText,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
      
      if (error) throw error
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, content: contentText } : todo
      ))
      setEditingContent(null)
      setContentText('')
    } catch (error) {
      console.error('Error updating todo content:', error)
    }
  }

  // 取消内容编辑
  const cancelContentEditing = (): void => {
    setEditingContent(null)
    setContentText('')
  }

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user])

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  // 对待办事项进行排序：逾期 > 今天到期 > 其他未完成 > 已完成
  const sortedTodos = [...todos].sort((a, b) => {
    // 已完成的任务排在最后
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    
    // 对于未完成的任务，按截止日期优先级排序
    if (!a.completed && !b.completed) {
      const aOverdue = a.due_date && isOverdue(a.due_date)
      const bOverdue = b.due_date && isOverdue(b.due_date)
      const aDueToday = a.due_date && isDueToday(a.due_date)
      const bDueToday = b.due_date && isDueToday(b.due_date)
      
      // 逾期任务优先
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1
      }
      
      // 今天到期的任务其次
      if (aDueToday !== bDueToday) {
        return aDueToday ? -1 : 1
      }
      
      // 有截止日期的任务优先于没有截止日期的
      if ((a.due_date !== null) !== (b.due_date !== null)) {
        return a.due_date ? -1 : 1
      }
      
      // 如果都有截止日期，按日期排序
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      }
    }
    
    // 最后按创建时间排序
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-6">
              {/* 用户信息、导出按钮和菜单 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    你好，{user?.user_metadata?.full_name || user?.email?.split('@')[0] || '用户'}！
                  </h1>
                  <p className="text-sm text-gray-600">
                    欢迎回到您的待办事项管理
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {todos.length > 0 && (
                    <>
                      <ExportButton todos={todos} />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowBatchExport(true)}
                        className="flex items-center gap-2"
                      >
                        <Package className="w-4 h-4" />
                        批量导出
                      </Button>
                    </>
                  )}
                  <UserMenu />
                </div>
              </div>
              
              <div className="text-center">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  我的待办事项
                </CardTitle>
                <p className="text-muted-foreground mt-2">
                  已完成 {completedCount} / {totalCount} 项任务
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <motion.div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 添加新任务表单 */}
              <form onSubmit={addTodo} className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="添加新的待办事项..."
                    value={newTodo}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewTodo(e.target.value)}
                    className="flex-1 border-2 border-gray-200 focus:border-indigo-500 transition-colors"
                  />
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                </div>
                
                {/* 截止日期选择器 */}
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={newTodoDueDate}
                    onChange={setNewTodoDueDate}
                    placeholder="设置截止日期（可选）"
                    className="flex-1"
                  />
                  {newTodoDueDate && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewTodoDueDate(null)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      清除
                    </Button>
                  )}
                </div>
              </form>

              {/* 待办事项列表 */}
              <div className="space-y-3">
                <AnimatePresence>
                  {sortedTodos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        todo.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 p-4">
                      <button
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                        className="flex-shrink-0 transition-colors duration-200"
                        type="button"
                      >
                        {todo.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-500" />
                        )}
                      </button>
                      
                      <div className="flex-1 space-y-2">
                        {editingTodo === todo.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={editingText}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  updateTodoTitle(todo.id)
                                } else if (e.key === 'Escape') {
                                  cancelEditing()
                                }
                              }}
                              className="flex-1 border-2 border-indigo-500 focus:border-indigo-600"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateTodoTitle(todo.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              type="button"
                            >
                              保存
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                              type="button"
                            >
                              取消
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span 
                              className={`block flex-1 transition-all duration-200 ${
                                todo.completed 
                                  ? 'text-green-700 line-through opacity-75' 
                                  : 'text-gray-800'
                              }`}
                            >
                              {todo.title}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingTodo(todo.id, todo.title)}
                              className="text-gray-400 hover:text-indigo-500 p-1 h-auto opacity-0 group-hover:opacity-100 transition-opacity"
                              type="button"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                        
                        {/* 截止日期显示 */}
                        <div className="flex items-center gap-2">
                          <DueDateBadge 
                            dueDate={todo.due_date} 
                            completed={todo.completed}
                          />
                          
                          {/* 编辑截止日期按钮 */}
                          {editingDueDate === todo.id ? (
                            <DatePicker
                              value={todo.due_date}
                              onChange={(date) => updateTodoDueDate(todo.id, date)}
                              placeholder="设置截止日期"
                              className="w-48"
                            />
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingDueDate(todo.id)}
                              className="text-gray-400 hover:text-indigo-500 p-1 h-auto"
                              type="button"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpand(todo.id)}
                          className="text-gray-400 hover:text-indigo-500 p-1 h-auto"
                          type="button"
                          title="展开/折叠详细内容"
                        >
                          {expandedTodo === todo.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTodo(todo.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 p-1 h-auto"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 展开的详细内容 */}
                    {expandedTodo === todo.id && (
                      <div className="px-4 pb-4 border-t border-gray-200 mt-2 pt-4">
                        {editingContent === todo.id ? (
                          <div className="space-y-3">
                            <RichTextEditor
                              content={contentText}
                              onChange={setContentText}
                              placeholder="添加详细内容..."
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelContentEditing}
                                type="button"
                              >
                                取消
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateTodoContent(todo.id)}
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
                                type="button"
                              >
                                保存内容
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <MarkdownContent content={todo.content || ''} />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditingContent(todo.id, todo.content || '')}
                              className="flex items-center gap-2"
                              type="button"
                            >
                              <Edit3 className="w-3 h-3" />
                              {todo.content ? '编辑内容' : '添加内容'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                  ))}
                </AnimatePresence>
                
                {todos.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-500"
                  >
                    <Circle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">还没有待办事项</p>
                    <p className="text-sm">添加一个新任务开始吧！</p>
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* 批量导出对话框 */}
        <BatchExport
          todos={todos}
          isOpen={showBatchExport}
          onClose={() => setShowBatchExport(false)}
        />
      </div>
    </div>
  )
}
