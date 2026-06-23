import { supabase } from './supabaseClient';

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes('Invalid login')) {
      throw new Error('Usuário ou senha incorretos.');
    }
    throw new Error('Erro ao autenticar.');
  }
  return data.session.access_token;
}

export async function signUp(name, email, password) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) {
    if (error.message.includes('already registered')) {
      throw new Error('Usuário já cadastrado.');
    }
    throw new Error('Erro ao cadastrar usuário.');
  }
}