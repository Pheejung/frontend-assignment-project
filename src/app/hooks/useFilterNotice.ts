import { useEffect, useRef, useState } from "react"

export function useFilterNotice() {
  const [filterNotice, setFilterNotice] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  function showFilterNotice(message: string) {
    setFilterNotice(message)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setFilterNotice(null)
    }, 1800)
  }

  return { filterNotice, showFilterNotice }
}
