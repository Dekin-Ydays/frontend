import { type ReactNode, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
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

/*
// Constants
*/
const SPRING_CONFIG = { damping: 50, stiffness: 400, mass: 0.8 } as const;
const DISMISS_VELOCITY = 800;
const DISMISS_DISTANCE = 120;

/*
// Types
*/
type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  /**
   * Content rendered inside the sliding sheet container.
   */
  children: ReactNode;
};

/*
// Main component
*/
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);
  const panStartY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = 600;
      backdropOpacity.value = 0;
      setModalVisible(true);
      // Entrance animation is triggered by onShow once the Modal is mounted
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withSpring(600, SPRING_CONFIG, (done) => {
        if (done) runOnJS(setModalVisible)(false);
      });
    }
  }, [visible]);

  const handleShow = () => {
    translateY.value = withSpring(0, SPRING_CONFIG);
    backdropOpacity.value = withTiming(1, { duration: 300 });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(0, panStartY.value + e.translationY);
    })
    .onEnd((e) => {
      const dismissed =
        e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY;
      if (dismissed) {
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const sheetAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimStyle = useAnimatedStyle(() => ({
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
      {/* Backdrop — visual only, touches handled by the Pressable above the sheet */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(0,0,0,0.7)" },
          backdropAnimStyle,
        ]}
        pointerEvents="none"
      />

      {/* Keyboard-aware layout */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Tap-to-close area above the sheet */}
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        {/* Sliding sheet */}
        <Animated.View style={sheetAnimStyle}>
          {/* Draggable handle — only this zone triggers dismiss gesture */}
          <GestureDetector gesture={panGesture}>
            <View style={styles.handleZone}>
              <View style={styles.handle} />
            </View>
          </GestureDetector>

          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/*
// Styles
*/
const styles = StyleSheet.create({
  handleZone: {
    alignItems: "center",
    paddingTop: 14,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});
