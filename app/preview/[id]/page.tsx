'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

export default function PreviewPage() {
  const params = useParams()
  const [html, setHtml] = useState('')
  const [css, setCss] = useState('')

  useEffect(() => {
    async function fetchPreview() {
      try {
        const response = await fetch(`/api/preview/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch preview')
        }
        const data = await response.json()
        setHtml(data.html)
        setCss(data.css)
      } catch (error) {
        console.error('Error fetching preview:', error)
      }
    }

    if (params.id) {
      fetchPreview()
    }
  }, [params.id])

  if (!html) {
    return <div>Loading...</div>
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* Reset default styles */
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }
        
        #preview-content {
          width: 100%;
          min-height: 100vh;
        }

        /* Custom styles */
        ${css}
      `}} />
      <div 
        id="preview-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
