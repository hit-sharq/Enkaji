import React from 'react'
import { View, StyleSheet } from 'react-native'

interface LoadingSkeletonsProps {
  count?: number
  type?: 'product' | 'list' | 'card'
}

export function LoadingSkeletons({ count = 4, type = 'product' }: LoadingSkeletonsProps) {
  if (type === 'product') {
    return (
      <View style={styles.gridContainer}>
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <View key={i} style={styles.productSkeleton}>
              <View style={styles.skeletonImage} />
              <View style={styles.skeletonText} />
              <View style={[styles.skeletonText, { width: '70%' }]} />
            </View>
          ))}
      </View>
    )
  }

  if (type === 'list') {
    return (
      <View>
        {Array(count)
          .fill(0)
          .map((_, i) => (
            <View key={i} style={styles.listSkeleton}>
              <View style={styles.skeletonImage} />
              <View style={{ flex: 1 }}>
                <View style={styles.skeletonText} />
                <View style={[styles.skeletonText, { width: '70%' }]} />
              </View>
            </View>
          ))}
      </View>
    )
  }

  return (
    <View>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <View key={i} style={styles.cardSkeleton}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
            <View style={[styles.skeletonText, { width: '60%' }]} />
          </View>
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  productSkeleton: {
    width: '48%',
    marginVertical: 8,
  },
  listSkeleton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  cardSkeleton: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingBottom: 12,
  },
  skeletonImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonText: {
    width: '100%',
    height: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    marginBottom: 8,
  },
})
