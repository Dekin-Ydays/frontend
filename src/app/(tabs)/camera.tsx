import { StyleSheet, View } from "react-native";

import { PoseCamera } from "@/components/pose-camera";
import { usePoseLandmarkStreaming } from "@/hooks/use-pose-landmark-streaming";

export default function CameraScreen() {
  const { sendLandmarks } = usePoseLandmarkStreaming({ fps: 10 });

  return (
    <View style={styles.container}>
      <PoseCamera onLandmarks={sendLandmarks} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
});
