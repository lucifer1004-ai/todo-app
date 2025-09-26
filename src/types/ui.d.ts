// UI 组件类型声明
declare module '@/components/ui/button' {
  import { ButtonHTMLAttributes, ReactNode } from 'react'
  
  interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    children?: ReactNode
  }
  
  export const Button: React.FC<ButtonProps>
}

declare module '@/components/ui/input' {
  import { InputHTMLAttributes } from 'react'
  
  interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}
  
  export const Input: React.FC<InputProps>
}

declare module '@/components/ui/card' {
  import { HTMLAttributes, ReactNode } from 'react'
  
  interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
  }
  
  export const Card: React.FC<CardProps>
  export const CardHeader: React.FC<CardProps>
  export const CardTitle: React.FC<CardProps>
  export const CardContent: React.FC<CardProps>
}

declare module '@/components/ui/checkbox' {
  import { InputHTMLAttributes } from 'react'
  
  interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {}
  
  export const Checkbox: React.FC<CheckboxProps>
}
