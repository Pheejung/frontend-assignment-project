interface ErrorFallbackProps {
  message?: string
}

export function ErrorFallback({ message }: ErrorFallbackProps) {
  return <p className="status-message error">{message ?? 'Unexpected error occurred.'}</p>
}
