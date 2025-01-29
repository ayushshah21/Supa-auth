import { supabase } from '../lib/supabaseClient'

// interface AIResponse {
//   content?: string;
//   error?: string;
// }

export async function generateTicketResponse(ticketContent: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-service`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ query: ticketContent })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'AI request failed')
    }

    const data = await response.json()
    return {
      content: data.response,
      error: null
    }

  } catch (error) {
    console.error('Error generating AI response:', error)
    return {
      content: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function querySimilarContent(query: string) {
  try {
    const { data, error } = await supabase.functions.invoke('ai-service', {
      body: {
        action: 'query-similar',
        data: { query }
      }
    })

    if (error) throw error
    return data.matches

  } catch (error) {
    console.error('Error querying similar content:', error)
    throw error
  }
} 