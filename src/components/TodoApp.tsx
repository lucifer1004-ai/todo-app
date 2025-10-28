import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, CheckCircle2, Circle, Edit3, Download, Package, Check, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import UserMenu from './auth/UserMenu'
import DatePicker from './DatePicker'
import DueDateBadge from './DueDateBadge'
import ExportButton from './ExportButton'
import BatchExport from './BatchExport'
import RichTextEditor from './RichTextEditor'
import MarkdownContent from './MarkdownContent'
import { isOverdue, isDueToday } from '@/utils/dateUtils'


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
  const [expandedTodo, setExpandedTodo] = useState<number | null>(null)
  
  // 统一的编辑状态
  const [editingTodo, setEditingTodo] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>('')
  const [editingContent, setEditingContent] = useState<string>('')
  const [editingDueDate, setEditingDueDate] = useState<string | null>(null)
  
  const [loading, setLoading] = useState<boolean>(true)
  const [showBatchExport, setShowBatchExport] = useState<boolean>(false)
  
  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [todoToDelete, setTodoToDelete] = useState<{ id: number; title: string } | null>(null)
  
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

  // 打开删除确认对话框
  const openDeleteDialog = (id: number, title: string): void => {
    setTodoToDelete({ id, title })
    setDeleteDialogOpen(true)
  }

  // 执行删除
  const confirmDelete = async (): Promise<void> => {
    if (!user || !todoToDelete) return
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoToDelete.id)
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setTodos(todos.filter(todo => todo.id !== todoToDelete.id))
      toast.success('任务已删除', {
        description: `"${todoToDelete.title}" 已成功删除`
      })
      setDeleteDialogOpen(false)
      setTodoToDelete(null)
    } catch (error) {
      console.error('Error deleting todo:', error)
      toast.error('删除失败', {
        description: '请检查网络连接后重试'
      })
    }
  }

  // 切换任务展开/折叠状态
  const toggleExpand = (id: number): void => {
    if (expandedTodo === id) {
      setExpandedTodo(null)
    } else {
      setExpandedTodo(id)
    }
  }

  // 进入编辑模式
  const startEditing = (todo: Todo): void => {
    setEditingTodo(todo.id)
    setEditingTitle(todo.title)
    setEditingContent(todo.content || '')
    setEditingDueDate(todo.due_date || null)
    // 自动展开任务以显示内容编辑器
    setExpandedTodo(todo.id)
  }

  // 保存编辑
  const saveEditing = async (id: number): Promise<void> => {
    if (!user || !editingTitle.trim()) {
      toast.error('验证失败', {
        description: '任务标题不能为空'
      })
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ 
          title: editingTitle.trim(),
          content: editingContent,
          due_date: editingDueDate,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        toast.error('保存失败', {
          description: error.message
        })
        throw error
      }
      
      console.log('Todo saved successfully:', data)
      setTodos(todos.map(todo => 
        todo.id === id ? { 
          ...todo, 
          title: editingTitle.trim(),
          content: editingContent,
          due_date: editingDueDate
        } : todo
      ))
      
      // 清空编辑状态
      setEditingTodo(null)
      setEditingTitle('')
      setEditingContent('')
      setEditingDueDate(null)
      
      toast.success('保存成功', {
        description: '任务已更新'
      })
    } catch (error) {
      console.error('Error saving todo:', error)
    }
  }

  // 取消编辑
  const cancelEditing = (): void => {
    setEditingTodo(null)
    setEditingTitle('')
    setEditingContent('')
    setEditingDueDate(null)
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
                        {/* 标题显示/编辑 */}
                        {editingTodo === todo.id ? (
                          <Input
                            type="text"
                            value={editingTitle}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setEditingTitle(e.target.value)}
                            className="flex-1 border-2 border-indigo-500 focus:border-indigo-600"
                            placeholder="任务标题"
                            autoFocus
                          />
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
                          </div>
                        )}
                        
                        {/* 截止日期显示/编辑 */}
                        {editingTodo === todo.id ? (
                          <DatePicker
                            value={editingDueDate}
                            onChange={setEditingDueDate}
                            placeholder="设置截止日期（可选）"
                            className="w-full"
                          />
                        ) : (
                          <DueDateBadge 
                            dueDate={todo.due_date} 
                            completed={todo.completed}
                          />
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        {editingTodo === todo.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveEditing(todo.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1 h-auto"
                              type="button"
                              title="保存"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditing}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 p-1 h-auto"
                              type="button"
                              title="取消"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditing(todo)}
                              className="text-gray-400 hover:text-indigo-500 p-1 h-auto"
                              type="button"
                              title="编辑"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
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
                              onClick={() => openDeleteDialog(todo.id, todo.title)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 p-1 h-auto"
                              type="button"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 展开的详细内容 */}
                    {expandedTodo === todo.id && (
                      <div className="px-4 pb-4 border-t border-gray-200 mt-2 pt-4">
                        {editingTodo === todo.id ? (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">详细内容</div>
                            <RichTextEditor
                              content={editingContent}
                              onChange={setEditingContent}
                              placeholder="添加详细内容..."
                            />
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {todo.content ? (
                              <MarkdownContent content={todo.content} />
                            ) : (
                              <p className="text-gray-400 text-sm italic">暂无详细内容</p>
                            )}
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
        
        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                确认删除
              </AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除任务 <span className="font-semibold text-foreground">"{todoToDelete?.title}"</span> 吗？
                <br />
                <span className="text-red-500">此操作无法撤销。</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              >
                确认删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
