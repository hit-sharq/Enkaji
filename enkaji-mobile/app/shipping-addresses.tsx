import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/lib/theme'

interface Address {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  county: string
  isDefault: boolean
}

export default function ShippingAddressesScreen() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      name: 'My Home',
      phone: '',
      address: '',
      city: '',
      county: 'Nairobi',
      isDefault: true,
    },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ label: '', name: '', phone: '', address: '', city: '', county: '' })

  const handleAdd = () => {
    if (!form.label || !form.address || !form.city) {
      return Alert.alert('Error', 'Label, address, and city are required.')
    }
    const newAddr: Address = {
      id: Date.now().toString(),
      ...form,
      isDefault: addresses.length === 0,
    }
    setAddresses([...addresses, newAddr])
    setForm({ label: '', name: '', phone: '', address: '', city: '', county: '' })
    setShowForm(false)
  }

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  const deleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== id)) },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Shipping Addresses</Text>
        <TouchableOpacity onPress={() => setShowForm(true)}>
          <Feather name="plus" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="map-pin" size={60} color={Colors.border} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
              <Text style={styles.addBtnText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr.id} style={[styles.card, addr.isDefault && styles.cardDefault]}>
              <View style={styles.cardTop}>
                <View style={styles.cardLabel}>
                  <Feather name="map-pin" size={14} color={addr.isDefault ? Colors.primary : Colors.text.secondary} />
                  <Text style={[styles.labelText, addr.isDefault && styles.labelTextDefault]}>{addr.label}</Text>
                  {addr.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                </View>
                <View style={styles.cardActions}>
                  {!addr.isDefault && (
                    <TouchableOpacity onPress={() => setDefault(addr.id)} style={styles.actionBtn}>
                      <Text style={styles.setDefaultText}>Set default</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => deleteAddress(addr.id)} style={styles.actionBtn}>
                    <Feather name="trash-2" size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {addr.name && <Text style={styles.addressText}>{addr.name}</Text>}
              {addr.address && <Text style={styles.addressText}>{addr.address}</Text>}
              <Text style={styles.addressText}>{[addr.city, addr.county].filter(Boolean).join(', ')}</Text>
              {addr.phone && <Text style={styles.addressText}>{addr.phone}</Text>}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Feather name="x" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Address</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {[
              { key: 'label', label: 'Label (e.g. Home, Office)', placeholder: 'Home' },
              { key: 'name', label: 'Full Name', placeholder: 'joshua mwendwa' },
              { key: 'phone', label: 'Phone', placeholder: '0712345678' },
              { key: 'address', label: 'Street Address', placeholder: '123 Kenyatta Ave' },
              { key: 'city', label: 'City / Town', placeholder: 'Nairobi' },
              { key: 'county', label: 'County', placeholder: 'Nairobi County' },
            ].map(({ key, label, placeholder }) => (
              <View key={key}>
                <Text style={styles.inputLabel}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChangeText={(t) => setForm({ ...form, [key]: t })}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Save Address</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  content: { padding: 16, gap: 12 },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  cardDefault: { borderColor: Colors.primary },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelText: { fontSize: 14, fontWeight: '700', color: Colors.text.secondary },
  labelTextDefault: { color: Colors.primary },
  defaultBadge: {
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionBtn: { padding: 4 },
  setDefaultText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  addressText: { fontSize: 14, color: Colors.text.secondary },
  empty: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: '700' },
  modal: { flex: 1, backgroundColor: Colors.background },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: Colors.text.primary },
  modalContent: { padding: 16, gap: 4, paddingBottom: 40 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text.primary,
  },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
