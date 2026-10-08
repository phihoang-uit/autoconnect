import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, Image, ScrollView, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { supabase } from '../../lib/supabase';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function VehicleForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', brand: '', model: '', year: '', plate_number: '', odometer: '',
  });
  const [imageUrl, setImageUrl] = useState(null); // ảnh đã lưu trên server
  const [asset, setAsset] = useState(null); // ảnh mới vừa chọn, chưa tải lên
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await api.get(`/vehicles/${id}`);
        setForm({
          name: data.name ?? '',
          brand: data.brand ?? '',
          model: data.model ?? '',
          year: data.year ? String(data.year) : '',
          plate_number: data.plate_number ?? '',
          odometer: String(data.odometer ?? 0),
        });
        setImageUrl(data.image_url);
      } catch {
        Alert.alert('Lỗi', 'Không tải được thông tin xe');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const update = (field) => (value) => setForm({ ...form, [field]: value });

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled) setAsset(result.assets[0]);
  }

  function removeImage() {
    setAsset(null);
    setImageUrl(null);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert('Thiếu thông tin', 'Hãy nhập tên xe');
      return;
    }
    setSaving(true);
    try {
      let image_url = imageUrl;

      if (asset) {
        const ext = asset.mimeType === 'image/png' ? 'png' : 'jpg';
        const path = `${session.user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('vehicle-images')
          .upload(path, decode(asset.base64), { contentType: asset.mimeType ?? 'image/jpeg' });
        if (uploadError) throw new Error('Không tải được ảnh lên: ' + uploadError.message);
        image_url = supabase.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl;
      }

      const payload = { ...form, image_url };
      if (isEdit) await api.patch(`/vehicles/${id}`, payload);
      else await api.post('/vehicles', payload);

      router.back();
    } catch (err) {
      Alert.alert('Lỗi', err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const preview = asset ? asset.uri : imageUrl;

  return (
    <ScrollView
      style={{ backgroundColor: '#f1f5f9' }}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={pickImage}>
        {preview ? (
          <Image source={{ uri: preview }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageEmpty]}>
            <Text style={{ fontSize: 40 }}>📷</Text>
            <Text style={styles.hint}>Chạm để chọn ảnh xe</Text>
          </View>
        )}
      </Pressable>
      {preview ? (
        <Pressable onPress={removeImage}>
          <Text style={styles.removeLink}>Xóa ảnh</Text>
        </Pressable>
      ) : null}

      <Text style={styles.label}>Tên xe *</Text>
      <TextInput style={styles.input} placeholder="Ví dụ: Xe A" placeholderTextColor="#94a3b8"
        value={form.name} onChangeText={update('name')} />

      <Text style={styles.label}>Biển số</Text>
      <TextInput style={styles.input} placeholder="Ví dụ: 59A1-12345" placeholderTextColor="#94a3b8"
        autoCapitalize="characters" value={form.plate_number} onChangeText={update('plate_number')} />

      <Text style={styles.label}>Hãng xe</Text>
      <TextInput style={styles.input} placeholder="Ví dụ: Honda" placeholderTextColor="#94a3b8"
        value={form.brand} onChangeText={update('brand')} />

      <Text style={styles.label}>Dòng xe</Text>
      <TextInput style={styles.input} placeholder="Ví dụ: Wave Alpha" placeholderTextColor="#94a3b8"
        value={form.model} onChangeText={update('model')} />

      <Text style={styles.label}>Năm sản xuất</Text>
      <TextInput style={styles.input} placeholder="Ví dụ: 2020" placeholderTextColor="#94a3b8"
        keyboardType="number-pad" maxLength={4} value={form.year} onChangeText={update('year')} />

      <Text style={styles.label}>Số km đã đi</Text>
      <TextInput style={styles.input} placeholder="Ví dụ: 15000" placeholderTextColor="#94a3b8"
        keyboardType="number-pad" value={form.odometer} onChangeText={update('odometer')} />

      <Pressable style={[styles.button, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 6, paddingBottom: 40 },
  image: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#e2e8f0' },
  imageEmpty: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  hint: { color: '#64748b' },
  removeLink: { color: '#dc2626', textAlign: 'center', marginTop: 4 },
  label: { color: '#334155', fontWeight: '600', marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, color: '#0f172a', backgroundColor: '#ffffff' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#ffffff', fontWeight: '600' },
});