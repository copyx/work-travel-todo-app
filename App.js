import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto } from "@expo/vector-icons";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});

  useEffect(() => {
    const loadToDos = async () => {
      const stringToDos = await AsyncStorage.getItem(STORAGE_KEY);
      setToDos(JSON.parse(stringToDos));
    };
    loadToDos();
  }, []);

  useEffect(() => {
    const saveToDos = async () =>
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toDos));
    saveToDos();
  }, [toDos]);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (text) => setText(text);
  const addToDo = () => {
    if (text === "") return;

    setToDos((toDos) => ({ ...toDos, [Date.now()]: { text, work: working } }));
    setText("");
  };
  const deleteToDo = (id) => {
    Alert.alert("Delete ToDo", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Sure",
        style: "destructive",
        onPress: () =>
          setToDos((toDos) => {
            delete toDos[id];
            return { ...toDos };
          }),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{ ...styles.btnText, color: working ? theme.grey : "white" }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          returnKeyType="done"
          onChangeText={onChangeText}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
          value={text}
        />
      </View>
      <ScrollView>
        {toDos &&
          Object.entries(toDos)
            .filter(([, { work }]) => work === working)
            .map(([key, { text }]) => (
              <View key={key} style={styles.toDo}>
                <Text style={styles.toDoText}>{text}</Text>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={20} color={theme.grey} />
                </TouchableOpacity>
              </View>
            ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 100,
  },
  btnText: {
    fontSize: 40,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
  },
});
