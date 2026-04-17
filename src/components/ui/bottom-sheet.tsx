import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";

const OPEN_SPRING = { damping: 28, stiffness: 400, mass: 0.7 } as const;
const CLOSE_SPRING = { damping: 35, stiffness: 380, mass: 0.7 } as const;
const DISMISS_VELOCITY = 700;
const DISMISS_DISTANCE = 100;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function BottomSheet({ visible, onClose, children, title }: BottomSheetProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(screenHeight);
  const backdropOpacity = useSharedValue(0);
  const gestureStartY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = screenHeight;
      backdropOpacity.value = 0;
      setModalVisible(true);
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(screenHeight, CLOSE_SPRING, (finished) => {
        if (finished) runOnJS(setModalVisible)(false);
      });
    }
  }, [visible, screenHeight]);

  const handleShow = useCallback(() => {
    translateY.value = withSpring(0, OPEN_SPRING);
    backdropOpacity.value = withTiming(1, { duration: 250 });
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      gestureStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, gestureStartY.value + e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, OPEN_SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onShow={handleShow}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.flex} onPress={onClose} />

        <Animated.View style={sheetStyle}>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleZone}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            {title && (
              <View style={styles.titleContainer}>
                <AppText variant="title">{title}</AppText>
              </View>
            )}

            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { backgroundColor: "rgba(0,0,0,0.65)" },
  sheet: {
    backgroundColor: "rgba(14,14,14,0.98)",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  handleZone: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
});
