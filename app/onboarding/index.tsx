/**
 * Onboarding Screen - Swipeable onboarding flow
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  StatusBar,
  ViewToken,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/Colors';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { SpringConfigs } from '@/animations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Evini bir dokunuşla kontrol et',
    description:
      'TV, ışıklar ve tüm akıllı cihazlarını tek bir uygulamadan yönet. Artık uzaktan kumandalara ihtiyacın yok.',
    icon: 'tv-outline',
    gradient: [Colors.primary, '#0066CC'],
  },
  {
    id: '2',
    title: 'Sana özel akıllı öneriler',
    description:
      'Yapay zeka alışkanlıklarını öğrenir ve en uygun anda önerilerde bulunur. Evdeki zamanın daha akıllı hale gelir.',
    icon: 'bulb-outline',
    gradient: [Colors.accent, '#FF6B00'],
  },
  {
    id: '3',
    title: "Türkçe sesle konuş, TV'n cevap versin",
    description:
      '"Hey Evim, haberleri aç" de, gerisini biz halledelim. Sesli komutlarla hayatı kolaylaştır.',
    icon: 'mic-outline',
    gradient: ['#30D158', '#00A86B'],
  },
];

export default function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      router.replace('/auth');
    }
  };

  const handleSkip = () => {
    router.replace('/auth');
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <SlideItem
        item={item}
        index={index}
        scrollX={scrollX}
        colors={colors}
        isDark={isDark}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Skip Button */}
      <View style={styles.header}>
        <Button
          title="Atla"
          onPress={handleSkip}
          variant="ghost"
          size="small"
        />
      </View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Pagination */}
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <PaginationDot
              key={index}
              index={index}
              scrollX={scrollX}
              colors={colors}
            />
          ))}
        </View>

        {/* Continue Button */}
        <Button
          title={currentIndex === slides.length - 1 ? 'Başla' : 'Devam Et'}
          onPress={handleNext}
          variant="primary"
          size="large"
          fullWidth
          icon={
            <Ionicons
              name={currentIndex === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20}
              color="#FFFFFF"
            />
          }
          iconPosition="right"
        />
      </View>
    </View>
  );
}

// Slide Item Component
interface SlideItemProps {
  item: OnboardingSlide;
  index: number;
  scrollX: Animated.SharedValue<number>;
  colors: typeof Colors.light;
  isDark: boolean;
}

function SlideItem({ item, index, scrollX, colors, isDark }: SlideItemProps) {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [100, 0, -100],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.slide}>
      {/* Icon Container */}
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        <LinearGradient
          colors={item.gradient}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name={item.icon} size={80} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>

      {/* Text Content */}
      <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
        <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {item.description}
        </Text>
      </Animated.View>
    </View>
  );
}

// Pagination Dot Component
interface PaginationDotProps {
  index: number;
  scrollX: Animated.SharedValue<number>;
  colors: typeof Colors.light;
}

function PaginationDot({ index, scrollX, colors }: PaginationDotProps) {
  const inputRange = [
    (index - 1) * SCREEN_WIDTH,
    index * SCREEN_WIDTH,
    (index + 1) * SCREEN_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: Colors.primary },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xxl,
  },
  iconGradient: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  title: {
    ...Typography.headlineMedium,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    ...Typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 50,
    gap: Spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

