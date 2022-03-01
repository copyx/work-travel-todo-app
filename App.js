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
  Modal,
  Button,
} from "react-native";
import { theme } from "./colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Fontisto, AntDesign } from "@expo/vector-icons";

const STORAGE_KEY = Object.freeze({
  TODOS: "@toDos",
  IS_WORKING: "@isWorking",
});

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  const [visibleEditModal, setVisibleEditModal] = useState(false);
  const [idToEdit, setIdToEdit] = useState();
  const [textToEdit, setTextToEdit] = useState("");

  useEffect(() => {
    const loadToDos = async () => {
      try {
        const stringToDos = await AsyncStorage.getItem(STORAGE_KEY.TODOS);
        setToDos(stringToDos ? JSON.parse(stringToDos) : {});
      } catch (e) {
        console.error(e);
      }
    };
    loadToDos();

    const loadIsWorking = async () => {
      try {
        const stringIsWorking = await AsyncStorage.getItem(
          STORAGE_KEY.IS_WORKING
        );
        setWorking(stringIsWorking ? JSON.parse(stringIsWorking) : true);
      } catch (e) {
        console.error(e);
      }
    };
    loadIsWorking();
  }, []);

  useEffect(() => {
    const saveToDos = async () =>
      await AsyncStorage.setItem(STORAGE_KEY.TODOS, JSON.stringify(toDos));
    saveToDos();
  }, [toDos]);

  useEffect(() => {
    const saveIsWorking = async () =>
      await AsyncStorage.setItem(
        STORAGE_KEY.IS_WORKING,
        JSON.stringify(working)
      );
    saveIsWorking();
  }, [working]);

  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const addToDo = () => {
    if (text === "") return;

    setToDos((toDos) => ({
      ...toDos,
      [Date.now()]: { text, work: working, done: false },
    }));
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
  const toggleDoneToDo = (id) => {
    setToDos((toDos) => {
      toDos[id].done = !toDos[id].done;
      return { ...toDos };
    });
  };
  const showEditModal = () => setVisibleEditModal(true);
  const editToDoText = (id, text) =>
    setToDos((toDos) => {
      toDos[id].text = text;
      return { ...toDos };
    });

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: working ? theme.grey : "white",
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          onSubmitEditing={addToDo}
          returnKeyType="done"
          onChangeText={setText}
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={styles.input}
          value={text}
        />
      </View>
      <ScrollView>
        {toDos &&
          Object.entries(toDos)
            .filter(([, { work }]) => work === working)
            .map(([key, { text, done }]) => (
              <View key={key} style={styles.toDo}>
                <TouchableOpacity
                  style={styles.toDoCheckbox}
                  onPress={() => toggleDoneToDo(key)}
                >
                  <Fontisto
                    name={done ? "checkbox-active" : "checkbox-passive"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
                <Text style={styles.toDoText}>{text}</Text>
                <View style={styles.toDoButtonBox}>
                  <TouchableOpacity
                    style={styles.toDoButton}
                    onPress={() => {
                      setIdToEdit(key);
                      setTextToEdit(text);
                      showEditModal();
                    }}
                  >
                    <AntDesign name="edit" size={20} color={theme.grey} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.toDoButton}
                    onPress={() => deleteToDo(key)}
                  >
                    <Fontisto name="trash" size={20} color={theme.grey} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
      </ScrollView>
      <Modal
        visible={visibleEditModal}
        transparent={true}
        onRequestClose={() => setVisibleEditModal(false)}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.editModal}>
            <Text style={styles.modalTitle}>Change Text</Text>
            <TextInput
              style={styles.modalTextInput}
              value={textToEdit}
              onChangeText={setTextToEdit}
              autoFocus={true}
            />
            <View
              style={{
                width: "100%",
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <Button
                title="Close"
                onPress={() => setVisibleEditModal(false)}
              />
              <Button
                title="Save"
                onPress={() => {
                  editToDoText(idToEdit, textToEdit);
                  setVisibleEditModal(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    flexGrow: 1,
  },
  toDoCheckbox: {
    marginRight: 20,
    flexGrow: 0,
  },
  toDoButton: {
    marginLeft: 20,
    flexGrow: 0,
  },
  toDoButtonBox: {
    flexDirection: "row",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  editModal: {
    backgroundColor: "white",
    width: "80%",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
  },
  modalTextInput: {
    borderBottomColor: theme.grey,
    borderBottomWidth: 1,
    width: "100%",
    fontSize: 18,
    marginTop: 20,
    padding: 10,
  },
});
