import type { Database } from '../../types/supabase';
import { supabase } from './client';

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getUserRole = async (userId: string) => {
    try {
        console.log('Getting role for user:', userId);
        
        // Get auth user details first to have email available
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;
        
        if (!authUser) {
            throw new Error('No authenticated user found');
        }

        console.log('Auth user details:', { id: authUser.id, email: authUser.email });

        // Try to find user by either ID or email using proper parameter binding
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, role, email')
            .or(`id.eq.${userId},and(email.eq.${authUser.email})`.replace(/['"]/g, ''))
            .maybeSingle();

        console.log('User lookup result:', { existingUser, checkError });

        if (existingUser) {
            // If IDs don't match but email does, update the ID
            if (existingUser.id !== userId) {
                console.log('Updating user ID to match auth ID...');
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ id: userId })
                    .eq('id', existingUser.id);
                
                if (updateError) {
                    console.error('Failed to update user ID:', updateError);
                }
            }
            
            console.log('Returning existing user role:', existingUser.role);
            return existingUser.role;
        }

        // If no user found at all, create a new one
        console.log('Creating new user record...');
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                email: authUser.email,
                role: 'CUSTOMER',
                preferences: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('role')
            .single();

        if (insertError) {
            console.error('Failed to create user record:', insertError);
            throw insertError;
        }

        console.log('New user created:', newUser);
        return newUser?.role;
    } catch (error) {
        console.error('Error in getUserRole:', error);
        throw error;
    }
};

export const getUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    return { data, error };
};

export const updateUser = async (id: string, updates: Database['public']['Tables']['users']['Update']) => {
    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
    return { data, error };
};

export const signUpUser = async (email: string, password: string) => {
    try {
        // 1. Sign up with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });
        if (authError) throw authError;

        // 2. If signup successful, create user record with CUSTOMER role
        if (authData.user) {
            const { error: dbError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email: authData.user.email,
                    role: 'CUSTOMER',
                    preferences: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
            
            if (dbError) {
                console.error('Error creating user record:', dbError);
                // Attempt to clean up auth user if db insert fails
                await supabase.auth.admin.deleteUser(authData.user.id);
                throw dbError;
            }
        }

        return authData;
    } catch (error) {
        console.error('Error in signUpUser:', error);
        throw error;
    }
};

// Function to promote user role (admin only)
export const promoteUserRole = async (userId: string, newRole: 'WORKER' | 'ADMIN') => {
    // First verify the current user is an admin
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Not authenticated');
    
    const currentRole = await getUserRole(currentUser.id);
    if (currentRole !== 'ADMIN') throw new Error('Only admins can promote users');

    // Update the user's role
    const { data, error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}; 