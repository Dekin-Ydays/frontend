import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  ScrollView,
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

const OPEN_SPRING = { damping: 28, stiffness: 400, mass: 0.7 } as const;
const CLOSE_SPRING = { damping: 35, stiffness: 380, mass: 0.7 } as const;
const DISMISS_VELOCITY = 700;
const DISMISS_DISTANCE = 100;

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
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
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View style={sheetStyle}>
          <View className="relative bg-dark/80 backdrop-blur-sm p-4 gap-4 rounded-t-[30px]">
            <GestureDetector gesture={panGesture}>
              <View className="flex items-center">
                <View className="h-1.5 w-10 bg-white/20 rounded-full" />
              </View>
            </GestureDetector>

            <View className="flex-1">{children}</View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.5)" },
});
