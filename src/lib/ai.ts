import { supabase } from './supabaseClient'

export async function generateAIResponse(query: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-service`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ query })
      }
    )

    if (!response.ok) {
      throw new Error('AI request failed')
    }

    const data = await response.json()
    return data.response

  } catch (error) {
    console.error('Error generating AI response:', error)
    throw error
  }
} 