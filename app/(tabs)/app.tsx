import React, { useState, useEffect } from "react";
import {SafeAreaView, View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert,  KeyboardAvoidingView, Platform,} from "react-native";

// Types
type DDDResponse = {
  state: string;
  cities: string[];
};

// Componente principal
export default function App() {
  const [ddd, setDdd] = useState<string>("");
  const [data, setData] = useState<DDDResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [trigger, setTrigger] = useState<string | null>(null);

  useEffect(() => {
    if (trigger === null) return;

    let cancelled = false;

    const fetchDDD = async () => {
      setLoading(true);
      setData(null);

      try {
        const response = await fetch(
          `https://brasilapi.com.br/api/ddd/v1/${trigger}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? `DDD ${trigger} não encontrado.`
              : `Erro ${response.status}`
          );
        }

        const json: DDDResponse = await response.json();

        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "Erro inesperado.";
          Alert.alert("Erro", msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDDD();

    return () => {
      cancelled = true;
    };
  }, [trigger]);

  const handleSearch = () => {
    if (!/^\d{2}$/.test(ddd)) {
      Alert.alert("DDD inválido", "Digite exatamente 2 dígitos numéricos.");
      return;
    }
    setTrigger(ddd);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Consulta de DDD</Text>

          <TextInput
            style={styles.input}
            value={ddd}
            onChangeText={(t) => setDdd(t.replace(/\D/g, "").slice(0, 2))}
            placeholder="Ex: 11"
            keyboardType="numeric"
            maxLength={2}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Buscando..." : "Buscar"}
            </Text>
          </TouchableOpacity>

          {loading && <ActivityIndicator size="large" color="#2563eb" />}

          {data && (
            <View style={styles.result}>
              <Text style={styles.state}>Estado: {data.state}</Text>
              <Text style={styles.citiesLabel}>
                Cidades ({data.cities.length}):
              </Text>
              <FlatList
                data={data.cities}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <Text style={styles.city}>• {item}</Text>
                )}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: "900", marginBottom: 24, color: "#0f172a" },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    padding: 14,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 4,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  result: { flex: 1 },
  state: { fontSize: 20, fontWeight: "800", color: "#1e40af", marginBottom: 8 },
  citiesLabel: { fontSize: 14, color: "#64748b", marginBottom: 8 },
  city: { fontSize: 14, color: "#334155", paddingVertical: 4 },
});