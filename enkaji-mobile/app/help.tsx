import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/lib/theme'
import api from '@/lib/api'

const FAQS = [
  {
    q: 'How do I place an order?',
    a: 'Browse products, add items to your cart, then proceed to checkout. You can pay via M-Pesa, card, or other methods.',
  },
  {
    q: 'How do I become a seller?',
    a: 'Go to your profile tab and tap "Become a Seller". Fill in your business details and start listing products immediately.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Delivery times vary by seller and location. Nairobi orders typically take 1–2 days, upcountry 3–7 days.',
  },
  {
    q: 'Can I return or refund an order?',
    a: 'Yes. Contact the seller within 7 days of delivery. If the seller is unresponsive, contact Enkaji support.',
  },
  {
    q: 'How are payments processed?',
    a: 'Payments go through PesaPal which supports M-Pesa, Airtel Money, and major credit/debit cards.',
  },
  {
    q: 'Is my payment information safe?',
    a: 'Yes. We use PesaPal — a PCI-DSS compliant payment processor. We never store your card details.',
  },
]

export default function HelpScreen() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return Alert.alert('Error', 'Please enter your message.')
    setIsSending(true)
    try {
      await api.submitContact({
        email: '',
        subject: subject.trim() || 'Mobile App Support Request',
        message: message.trim(),
      })
      Alert.alert('Sent!', 'Your message has been received. We will respond within 24 hours.')
      setMessage('')
      setSubject('')
    } catch {
      Alert.alert('Error', 'Could not send message. Please email us directly at support@enkaji.co.ke')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contactRow}>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:support@enkaji.co.ke')}>
            <Feather name="mail" size={24} color={Colors.primary} />
            <Text style={styles.contactLabel}>Email Us</Text>
            <Text style={styles.contactValue}>support@enkaji.co.ke</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('https://wa.me/254700000000')}>
            <Feather name="message-circle" size={24} color="#25D366" />
            <Text style={styles.contactLabel}>WhatsApp</Text>
            <Text style={styles.contactValue}>+254 700 000 000</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQS.map((faq, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqCard}
            onPress={() => setExpanded(expanded === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQ}>{faq.q}</Text>
              <Feather name={expanded === i ? 'chevron-up' : 'chevron-down'} size={18} color={Colors.text.tertiary} />
            </View>
            {expanded === i && <Text style={styles.faqA}>{faq.a}</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Send Us a Message</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="What is your question about?"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor={Colors.text.tertiary}
          />
          <Text style={styles.label}>Message *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Describe your issue or question..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            placeholderTextColor={Colors.text.tertiary}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isSending}>
            {isSending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendBtnText}>Send Message</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: { padding: 16, paddingBottom: 40 },
  contactRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  contactCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactLabel: { fontSize: 13, fontWeight: '700', color: Colors.text.primary },
  contactValue: { fontSize: 11, color: Colors.text.secondary, textAlign: 'center' },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 4,
  },
  faqCard: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, flex: 1, paddingRight: 8 },
  faqA: { fontSize: 14, color: Colors.text.secondary, marginTop: 10, lineHeight: 20 },
  form: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text.primary,
    backgroundColor: Colors.backgroundSecondary,
  },
  textarea: { height: 100 },
  sendBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
