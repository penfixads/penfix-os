import React from 'react'

/**
 * Shared Penfix form controls — light underline style.
 * Styling lives in app/globals.css (.pf-* classes) as the single source
 * of truth, so restyling every form is a one-file change. These wrappers
 * are optional sugar; applying the classes directly works identically.
 */

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ')
}

interface FormFieldProps {
  label?: React.ReactNode
  required?: boolean
  htmlFor?: string
  hint?: React.ReactNode
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function FormField({ label, required, htmlFor, hint, children, className, style }: FormFieldProps) {
  return (
    <div className={cx('pf-field', className)} style={style}>
      {label && (
        <label className="pf-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="pf-req"> *</span>}
        </label>
      )}
      {children}
      {hint && <div style={{ fontSize: '0.72rem', color: '#a99', marginTop: '0.3rem' }}>{hint}</div>}
    </div>
  )
}

/** Grid row for pairing short fields side by side (stacks on narrow widths). */
export function FormRow({ children, columns = 2, style }: { children: React.ReactNode; columns?: number; style?: React.CSSProperties }) {
  return (
    <div className="pf-form-row" style={{ '--pf-row-cols': columns, ...style } as React.CSSProperties}>
      {children}
    </div>
  )
}

export const TextInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return <input ref={ref} className={cx('pf-input', className)} {...props} />
  }
)

export const TextArea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextArea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cx('pf-textarea', className)} {...props} />
  }
)

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select ref={ref} className={cx('pf-select', className)} {...props}>
        {children}
      </select>
    )
  }
)
