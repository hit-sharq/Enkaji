import React, { useState } from 'react'
import { View, TextInput, Pressable, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

interface SearchBarProps {
  value?: string
  onChangeText?: (text: string) => void
  onSearch?: (text: string) => void
  onFilterPress?: () => void
  placeholder?: string
  editable?: boolean
}

export function SearchBar({
  value = '',
  onChangeText,
  onSearch,
  onFilterPress,
  placeholder = 'Search products...',
  editable = true,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View
      style={[
        styles.container,
        isFocused && styles.containerFocused,
      ]}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color="#7f8c8d"
        style={styles.searchIcon}
      />

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#95a5a6"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={() => onSearch?.(value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        editable={editable}
      />

      {value.length > 0 && (
        <Pressable
          style={styles.clearButton}
          onPress={() => onChangeText?.('')}
        >
          <MaterialCommunityIcons
            name="close-circle"
            size={18}
            color="#7f8c8d"
          />
        </Pressable>
      )}

      <Pressable
        style={styles.filterButton}
        onPress={onFilterPress}
      >
        <MaterialCommunityIcons
          name="tune"
          size={20}
          color="#3498db"
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  containerFocused: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  filterButton: {
    padding: 8,
    marginLeft: 4,
  },
})
