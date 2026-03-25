import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSignIn } from '@clerk/clerk-expo'
import { Colors } from '@/lib/theme'

type Step = 'email' | 'reset'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    if (!isLoaded) return

    setIsLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim().toLowerCase(),
      })
      setStep('reset')
    } catch (error: any) {
      const message = error.errors?.[0]?.message || error.message || 'Failed to send reset code'
      Alert.alert('Error', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter the verification code')
      return
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    if (!isLoaded) return

    setIsLoading(true)
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password: newPassword,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        Alert.alert('Success', 'Your password has been reset successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ])
      } else {
        Alert.alert('Error', 'Password reset failed. Please try again.')
      }
    } catch (error: any) {
      const message = error.errors?.[0]?.message || error.message || 'Failed to reset password'
      Alert.alert('Error', message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!isLoaded) return
    setIsLoading(true)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim().toLowerCase(),
      })
      Alert.alert('Code Sent', 'A new reset code has been sent to your email')
    } catch (error: any) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroOverlay}>
              <View style={styles.iconCircle}>
                <Feather
                  name={step === 'email' ? 'lock' : 'shield'}
                  size={40}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.brandName}>Enkaji</Text>
              <Text style={styles.tagline}>
                {step === 'email' ? 'Reset Your Password' : 'Create New Password'}
              </Text>
            </View>
          </View>

          <View style={styles.formSection}>
            {step === 'email' ? (
              <>
                <Text style={styles.welcomeText}>Forgot Password?</Text>
                <Text style={styles.subtitleText}>
                  Enter your email address and we'll send you a code to reset your password.
                </Text>

                <View style={styles.form}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Feather name="mail" size={20} color={Colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email address"
                      placeholderTextColor={Colors.text.muted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoFocus
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleSendCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={Colors.text.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Send Reset Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.welcomeText}>Check Your Email</Text>
                <Text style={styles.subtitleText}>
                  We sent a reset code to{'\n'}
                  <Text style={styles.emailHighlight}>{email}</Text>
                </Text>

                <View style={styles.form}>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Feather name="hash" size={20} color={Colors.primary} />
                    </View>
                    <TextInput
                      style={[styles.input, styles.codeInput]}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={Colors.text.muted}
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Feather name="lock" size={20} color={Colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="New password (min 8 characters)"
                      placeholderTextColor={Colors.text.muted}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={Colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Feather name="lock" size={20} color={Colors.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor={Colors.text.muted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Feather
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={Colors.text.tertiary}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={Colors.text.white} />
                    ) : (
                      <Text style={styles.primaryButtonText}>Reset Password</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendCode}
                    disabled={isLoading}
                  >
                    <Text style={styles.resendText}>
                      Didn't receive the code?{' '}
                      <Text style={styles.resendLink}>Resend</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => (step === 'reset' ? setStep('email') : router.back())}
            >
              <Feather name="arrow-left" size={16} color={Colors.text.tertiary} />
              <Text style={styles.backText}>
                {step === 'reset' ? 'Change email' : 'Back to Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  heroOverlay: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.text.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text.white,
    letterSpacing: 1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  formSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitleText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginBottom: 32,
    lineHeight: 24,
  },
  emailHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  inputIcon: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
  },
  codeInput: {
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '700',
  },
  eyeButton: {
    padding: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.text.white,
    fontSize: 17,
    fontWeight: '700',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 24,
    padding: 8,
  },
  resendText: {
    fontSize: 15,
    color: Colors.text.tertiary,
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 32,
    padding: 8,
  },
  backText: {
    fontSize: 15,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
})
