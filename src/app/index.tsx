// Reactの状態管理機能を読み込む
import { useState } from "react";

// React Nativeで使用する画面部品を読み込む
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  // ゲームを開始したかどうかを記録する
  const [isStarted, setIsStarted] = useState(false);

  // スタートボタンを押した後の画面
  if (isStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.smallText}>市政</Text>
          <Text style={styles.year}>1年目</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.smallText}>創生期の都市戦略</Text>
          <Text style={styles.cardTitle}>発展費用を誰が負担するか</Text>
          <Text style={styles.description}>
            道路・上下水道・学校を整えるため、 誰を中心に合意を作るか決めます。
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // アプリを開いた直後の画面
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.startArea}>
        <Text style={styles.logo}>市</Text>
        <Text style={styles.title}>まちのかけひき</Text>

        <Text style={styles.description}>
          政策と交渉によって街の50年間をつくる まちづくりゲーム
        </Text>

        <Pressable
          style={styles.startButton}
          onPress={() => setIsStarted(true)}
        >
          <Text style={styles.startButtonText}>市政を始める</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// 画面のデザイン
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DFCC",
  },

  startArea: {
    flex: 1,
    justifyContent: "center",
    padding: 28,
  },

  logo: {
    width: 56,
    height: 56,
    marginBottom: 20,
    color: "#0D2538",
    backgroundColor: "#D99A37",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 56,
    borderRadius: 12,
  },

  title: {
    color: "#142436",
    fontSize: 32,
    fontWeight: "bold",
  },

  description: {
    marginTop: 14,
    color: "#65717D",
    fontSize: 16,
    lineHeight: 26,
  },

  startButton: {
    marginTop: 36,
    padding: 18,
    backgroundColor: "#0D2538",
    borderRadius: 8,
  },

  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  gameHeader: {
    padding: 24,
    backgroundColor: "#0D2538",
  },

  smallText: {
    color: "#65717D",
    fontSize: 14,
    fontWeight: "bold",
  },

  year: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },

  card: {
    margin: 16,
    padding: 22,
    backgroundColor: "#FFFDF7",
    borderTopWidth: 5,
    borderTopColor: "#C95D36",
  },

  cardTitle: {
    marginTop: 10,
    color: "#142436",
    fontSize: 24,
    fontWeight: "bold",
  },
});
