import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
} from "react-native";
import ReceiptItemView from "../../components/receipt/ReceiptItem";
import theme from "../../theme";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const springConfig = {
  duration: 250,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    springDamping: 0.7,
  },
};

// Keep your existing mock data...
const mockGroup = {
  id: "1",
  name: "Dinner Group",
  members: [
    { id: "1", name: "John" },
    { id: "2", name: "Alice" },
    { id: "3", name: "Bob" },
  ],
};

const mockTransaction = {
  id: "1",
  subtotal: 156.5,
  items: [
    {
      id: "1",
      name: "Pasta Carbonara",
      price: 22.5,
      quantity: 2,
    },
    {
      id: "2",
      name: "Caesar Salad",
      price: 15.0,
      quantity: 1,
    },
    {
      id: "3",
      name: "Grilled Salmon",
      price: 32.0,
      quantity: 2,
    },
    {
      id: "4",
      name: "Glass of Wine",
      price: 12.5,
      quantity: 3,
    },
  ],
};

const ReceiptView = ({ isLoading }) => {
  const [transaction, setTransaction] = useState({ ...mockTransaction });
  const [group, setGroup] = useState({ ...mockGroup });
  const [error, setError] = useState(null);
  const [disableAll, setDisableAll] = useState(false);
  const [totalAmount, setTotalAmount] = useState(
    transaction ? transaction.subtotal : 0
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        LayoutAnimation.configureNext(springConfig);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        LayoutAnimation.configureNext(springConfig);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleUpdate = (itemId, updatedItem) => {
    setTransaction((prev) => {
      const newItems = prev.items.map((item) =>
        item.id === itemId ? updatedItem : item
      );

      // Calculate new total from updated items
      const newTotal = newItems.reduce((total, item) => {
        const itemPrice =
          typeof item.price === "string" ? parseFloat(item.price) : item.price;
        return total + (isNaN(itemPrice) ? 0 : itemPrice);
      }, 0);

      // Update total amount
      setTotalAmount(newTotal);

      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const handleBackgroundPress = () => {
    setDisableAll(true);
    Keyboard.dismiss();
  };

  const handleSplitBill = async () => {
    try {
      console.log(transaction);
      console.log(totalAmount);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Items:</Text>

      <TouchableWithoutFeedback onPress={handleBackgroundPress}>
        <View style={styles.innerContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: keyboardHeight + 100 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {transaction.items.map((item) => (
              <ReceiptItemView
                key={item.id}
                group={group}
                item={item}
                onUpdateItem={handleUpdate}
                disabled={disableAll}
                setDisabled={setDisableAll}
              />
            ))}
          </ScrollView>

          <View
            style={[
              styles.totalContainerWrapper,
              Platform.OS === "ios"
                ? { bottom: keyboardHeight ? keyboardHeight - 25 : 0 }
                : { bottom: keyboardHeight ? keyboardHeight - 16 : 0 },
            ]}
          >
            <TotalAmountView
              totalAmount={totalAmount}
              isLoading={isLoading}
              onSplitBill={handleSplitBill}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            onPress={() => setError(null)}
            style={styles.errorButton}
          >
            <Text style={styles.errorButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const TotalAmountView = ({ totalAmount, isLoading, onSplitBill }) => (
  <View style={styles.totalContainer}>
    <View>
      <Text style={styles.totalLabel}>Total Amount</Text>
      <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
    </View>

    <TouchableOpacity
      style={[styles.splitButton, isLoading && styles.splitButtonDisabled]}
      onPress={onSplitBill}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={styles.splitButtonText}>Split Bill</Text>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    padding: 20,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 10,
  },
  totalContainerWrapper: {
    // position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: "#fafafa",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 4,
  },
  splitButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  splitButtonDisabled: {
    backgroundColor: "#999",
  },
  splitButtonText: {
    color: "white",
    fontWeight: "500",
  },
  errorContainer: {
    position: "absolute",
    top: "50%",
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  errorButton: {
    alignSelf: "flex-end",
  },
  errorButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default ReceiptView;
