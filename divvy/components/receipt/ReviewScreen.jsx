import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import theme from "../../theme";

const mockData = {
  John: {
    name: "John",
    items: [
      {
        name: "Caesar Salad",
        price: 15,
        users: 1,
      },
      {
        name: "Glass of Wine",
        price: 12.5,
        users: 3,
      },
    ],
    subtotal: 19.17,
  },
  Alice: {
    name: "Alice",
    items: [
      {
        name: "Pasta Carbonara",
        price: 22.5,
        users: 1,
      },
      {
        name: "Glass of Wine",
        price: 12.5,
        users: 3,
      },
    ],
    subtotal: 26.67,
  },
  Bob: {
    name: "Bob",
    items: [
      {
        name: "Grilled Salmon",
        price: 32,
        users: 1,
      },
      {
        name: "Glass of Wine",
        price: 12.5,
        users: 3,
      },
    ],
    subtotal: 36.17,
  },
};

const calculateTotals = (data) => {
  const subtotal = Object.values(data).reduce(
    (sum, person) => sum + person.subtotal,
    0
  );
  const tax = subtotal * 0.08;
  const tip = subtotal * 0.18;
  const total = subtotal + tax + tip;
  return { subtotal, tax, tip, total };
};

const ReviewScreen = () => {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get("window").height)
  ).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const totals = calculateTotals(mockData);

  const handlePersonPress = (name) => {
    setSelectedPerson(mockData[name]);
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCloseModal = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: Dimensions.get("window").height,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSelectedPerson(null);
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Receipt Review</Text>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Individual Shares</Text>
        <ScrollView style={styles.scrollView}>
          <View style={styles.section}>
            {Object.keys(mockData).map((name) => (
              <TouchableOpacity
                key={name}
                style={styles.shareCard}
                onPress={() => handlePersonPress(name)}
              >
                <Text style={styles.personName}>{name}</Text>
                <Text style={styles.amount}>
                  ${mockData[name].subtotal.toFixed(2)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.summaryContainer}>
          <View style={[styles.section, styles.summarySection]}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>${totals.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Tax (8%)</Text>
                <Text>${totals.tax.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Tip (18%)</Text>
                <Text>${totals.tip.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.boldText}>Total</Text>
                <Text style={styles.boldText}>${totals.total.toFixed(2)}</Text>
              </View>
            </View>
            <View style={styles.dragHandle}>
              <Text style={styles.chevron}>︿</Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
        animationType="none"
      >
        {selectedPerson && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={handleCloseModal}
          >
            <Animated.View
              style={[
                styles.modalOverlay,
                {
                  opacity: fadeAnim,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.modalContent,
                {
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={{ flex: 1 }}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {selectedPerson.name[0]}
                    </Text>
                  </View>
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>
                      {selectedPerson.name}'s Share
                    </Text>
                    <Text style={styles.headerSubtitle}>Order Details</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.itemsContainer}>
                    {selectedPerson.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <View>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {item.users > 1 && (
                            <Text style={styles.splitText}>
                              Split {item.users} ways
                            </Text>
                          )}
                        </View>
                        <Text style={styles.itemPrice}>
                          ${(item.price / item.users).toFixed(2)}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.totalContainer}>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Subtotal</Text>
                      <Text style={styles.totalAmount}>
                        ${selectedPerson.subtotal.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#f5f5f5",
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 16,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  shareCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  personName: {
    fontSize: 16,
    fontWeight: "500",
  },
  amount: {
    fontSize: 16,
  },
  summaryContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  summarySection: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    marginBottom: 0,
    paddingBottom: 0,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
    marginTop: 8,
  },
  boldText: {
    fontWeight: "bold",
  },
  dragHandle: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  chevron: {
    fontSize: 24,
    color: '#666',
    height: 24,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: Dimensions.get("window").height * 0.7,
    paddingVertical: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  modalScroll: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemName: {
    fontSize: 16,
    marginBottom: 4,
  },
  splitText: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
  },
  totalContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  doneButton: {
    backgroundColor: theme.colors.primary,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ReviewScreen;
