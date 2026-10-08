import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) Alert.alert('Lỗi', 'Email hoặc mật khẩu không đúng');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AutoConnect</Text>
      <TextInput placeholderTextColor="#94a3b8" style={styles.input} placeholder="Email" autoCapitalize="none"
        keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput placeholderTextColor="#94a3b8" style={styles.input} placeholder="Mật khẩu" secureTextEntry
        value={password} onChangeText={setPassword} />
      <Pressable style={[styles.button, submitting && { opacity: 0.5 }]}
        onPress={handleLogin} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</Text>
      </Pressable>
      <Link href="/register" style={styles.link}>Chưa có tài khoản? Đăng ký</Link>
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

