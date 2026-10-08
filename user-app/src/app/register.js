import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

export default function Register() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (value) => setForm({ ...form, [field]: value });

  async function handleRegister() {
    setSubmitting(true);
    try {
      await api.post('/auth/register', { ...form, role: 'user' });
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) throw new Error(error.message);
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng ký</Text>
      <TextInput placeholderTextColor="#94a3b8" style={styles.input} placeholder="Họ tên" value={form.full_name} onChangeText={update('full_name')} />
      <TextInput placeholderTextColor="#94a3b8" style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={form.phone} onChangeText={update('phone')} />
      <TextInput placeholderTextColor="#94a3b8" style={styles.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={update('email')} />
      <TextInput placeholderTextColor="#94a3b8" style={styles.input} placeholder="Mật khẩu (tối thiểu 6 ký tự)" secureTextEntry value={form.password} onChangeText={update('password')} />
      <Pressable style={[styles.button, submitting && { opacity: 0.5 }]}
        onPress={handleRegister} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Đang đăng ký...' : 'Đăng ký'}</Text>
      </Pressable>
      <Link href="/login" style={styles.link}>Đã có tài khoản? Đăng nhập</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#f1f5f9' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, color: '#0f172a', backgroundColor: '#ffffff' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '600' },
  link: { textAlign: 'center', color: '#2563eb', marginTop: 8 },
});

