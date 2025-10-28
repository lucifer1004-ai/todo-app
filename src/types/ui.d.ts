// Todo 数据类型
export interface Todo {
  id: number
  title: string
  content?: string
  completed: boolean
  created_at: string
  updated_at: string
  user_id: string
  due_date?: string | null
}
