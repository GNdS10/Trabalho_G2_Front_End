import { supabase } from './supabaseClient';

export async function getPoints() {
  const { data, error } = await supabase
    .from('points')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error('Erro ao buscar pontos.');
  return data.map((point) => ({
    id: point.id,
    title: point.descricao,
    position: { lat: point.latitude, lng: point.longitude },
  }));
}

export async function postPoint(token, pointData) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('points')
    .insert([{
      user_id: user.id,
      descricao: pointData.descricao,
      latitude: pointData.latitude,
      longitude: pointData.longitude
    }])
    .select()
    .single();
  if (error) throw new Error('Erro ao cadastrar ponto.');
  return {
    id: data.id,
    descricao: data.descricao,
    latitude: data.latitude,
    longitude: data.longitude
  };
}