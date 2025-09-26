import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, CheckCircle2, Circle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// 定义 Todo 类型
interface Todo {
  id: number
  title: string
  completed: boolean
  created_at: string
  updated_at: string
}

export default function TodoApp(): React.ReactElement {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)

  // 获取所有待办事项
  const fetchTodos = async (): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
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
    if (!newTodo.trim()) return

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{ title: newTodo.trim() }])
        .select()
      
      if (error) throw error
      if (data) {
        setTodos([...data, ...todos])
      }
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    }
  }

  // 切换待办事项完成状态
  const toggleTodo = async (id: number, completed: boolean): Promise<void> => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed, updated_at: new Date().toISOString() })
        .eq('id', id)
      
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
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

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
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                待办事项管理
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
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* 添加新任务表单 */}
              <form onSubmit={addTodo} className="flex gap-2">
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
              </form>

              {/* 待办事项列表 */}
              <div className="space-y-3">
                <AnimatePresence>
                  {todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        todo.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    >
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
                      
                      <span 
                        className={`flex-1 transition-all duration-200 ${
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
                        onClick={() => deleteTodo(todo.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
      </div>
    </div>
  )
}
