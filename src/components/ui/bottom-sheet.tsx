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
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
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
      {/* C'est ici que la magie opère pour débloquer le scroll des enfants */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        >
          <Pressable className="flex-1" onPress={onClose} />
        </Animated.View>

        <KeyboardAvoidingView
          className="flex-1 justify-end"
          pointerEvents="box-none"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Animated.View style={sheetStyle}>
            <View
              style={{
                height: screenHeight * 0.6,
                paddingBottom: insets.bottom,
              }}
              className="bg-dark/80 backdrop-blur-sm rounded-t-3xl overflow-hidden"
            >
              <GestureDetector gesture={panGesture}>
                <View className="items-center p-4">
                  <View className="h-1.5 w-10 bg-white/20 rounded-full" />
                </View>
              </GestureDetector>
              <View className="flex-1">{children}</View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.5)" },
});
