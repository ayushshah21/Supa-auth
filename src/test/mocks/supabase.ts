import { vi } from 'vitest'

export const mockSupabaseClient = {
    auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        getUser: vi.fn()
    }
}

vi.mock('../../lib/supabaseClient', () => ({
    supabase: mockSupabaseClient
})) 