import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
  Animated,
  Pressable,
} from "react-native";
import { X, Plus } from "lucide-react-native";
import ReceiptItemView from "../../components/receipt/ReceiptItem";
import theme, { profileTheme } from "../../theme";
import { padding } from "polished";
import ReceiptService from "../../services/ReceiptService";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Custom animation configuration
// Update the custom animation configuration
const customLayoutAnimation = {
  duration: 300, // Increased from 300
  create: {
    type: LayoutAnimation.Types.easeInEaseOut, // Changed from spring to smoother transition
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut, // Changed from spring
    property: LayoutAnimation.Properties.scaleXY,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut, // Changed from spring
    property: LayoutAnimation.Properties.scaleXY,
  },
};

// Update the fade animation timing in toggleEditMode

const springConfig = {
  duration: 250,
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    springDamping: 0.7,
  },
};

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
  subtotal: 82,
  items: [
    {
      id: "1",
      name: "Pasta Carbonara",
      price: 22.5,
      people: []
    },
    {
      id: "2",
      name: "Caesar Salad",
      price: 15.0,
      people: []
    },
    {
      id: "3",
      name: "Grilled Salmon",
      price: 32.0,
      people: []
    },
    {
      id: "4",
      name: "Glass of Wine",
      price: 12.5,
      people: []
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const receiptService = new ReceiptService();

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => {
        LayoutAnimation.configureNext(customLayoutAnimation);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        LayoutAnimation.configureNext(customLayoutAnimation);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const toggleEditMode = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100, // Increased from 100
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200, // Increased from 200
        useNativeDriver: true,
      }),
    ]).start();

    LayoutAnimation.configureNext(customLayoutAnimation);
    setIsEditMode(!isEditMode);
  };

  const handleUpdate = (itemId, updatedItem) => {
    LayoutAnimation.configureNext(customLayoutAnimation);
    setTransaction((prev) => {
      const newItems = prev.items.map((item) =>
        item.id === itemId ? updatedItem : item
      );
      updateTotalAmount(newItems);
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  // const handleUpdate = (itemId, updatedItem) => {
  //   LayoutAnimation.configureNext(customLayoutAnimation);
  //   setTransaction((prev) => {
  //     const newItems = prev.items.map((item) =>
  //       item.id === itemId 
  //         ? {...updatedItem, people: [...updatedItem.people]} // Create deep copy of the people array
  //         : {...item, people: [...item.people]} // Ensure we create new arrays for unchanged items too
  //     );
      
  //     console.log('newItems:', JSON.stringify(newItems, null, 2));
  //     updateTotalAmount(newItems);
      
  //     const newTransaction = {
  //       ...prev,
  //       items: newItems,
  //     };
      
  //     console.log('new transaction:', JSON.stringify(newTransaction, null, 2));
  //     return newTransaction;
  //   });
  // };

  const updateTotalAmount = (items) => {
    const newTotal = items.reduce((total, item) => {
      const itemTotal =
        typeof item.price === "string" ? parseFloat(item.price) : item.price;
      return total + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);
    setTotalAmount(newTotal);
  };

  const handleDeleteItem = (itemId) => {
    LayoutAnimation.configureNext(customLayoutAnimation);
    setTransaction((prev) => {
      const newItems = prev.items.filter((item) => item.id !== itemId);
      updateTotalAmount(newItems);
      return {
        ...prev,
        items: newItems,
      };
    });
  };

  const handleAddItem = () => {
    const newItemWithId = {
      id: Date.now().toString(),
      name: "New Item",
      price: 0,
      people: []
    };

    LayoutAnimation.configureNext(customLayoutAnimation);
    setTransaction((prev) => {
      const newItems = [...prev.items, newItemWithId];
      updateTotalAmount(newItems);
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
      // prettyPrint(transaction)
      // // console.log(transaction.items[0].people);
      // // console.log(totalAmount);

      // console.log(JSON.stringify(transaction, null, 2)); 
      const result = receiptService.processTransaction(transaction, group);

      console.log("Full Results:");
      console.log(JSON.stringify(result, null, 2));

      // Print individual breakdowns
      Object.values(result).forEach(person => {
          console.log(`\n${person.toString()}`);
          console.log("Items:", person.getItems().map(item => ({
              name: item.getName(),
              originalPrice: item.price,
              pricePerPerson: item.getPricePer()
          })));
          console.log("Subtotal:", person.subtotal);
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const prettyPrint = (data, indent = 2) => {
    try {
      // Special handling for undefined and null
      if (data === undefined) return 'undefined';
      if (data === null) return 'null';
      
      // Convert to formatted JSON string
      const formatted = JSON.stringify(data, (key, value) => {
        // Handle special cases like undefined, functions, etc.
        if (value === undefined) return 'undefined';
        if (typeof value === 'function') return '[Function]';
        if (value instanceof Error) return value.toString();
        return value;
      }, indent);
      
      console.log(formatted);
      return formatted;
    } catch (error) {
      console.log('Error in prettyPrint:', error.message);
      // Fallback to basic console.log
      console.log(data);
      return String(data);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Items:</Text>
        <Pressable
          onPress={toggleEditMode}
          style={({ pressed }) => [
            styles.editButton,
            { transform: [{ scale: pressed ? 0.98 : 1 }] },
          ]}
        >
          <Animated.Text style={styles.editButtonText}>
            {isEditMode ? "Done" : "Edit"}
          </Animated.Text>
        </Pressable>
      </View>

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
            <Animated.View style={{ opacity: fadeAnim }}>
              {transaction.items.map((item) => (
                <View key={item.id} style={styles.itemContainer}>
                  <View style={styles.receiptItemWrapper}>
                    <ReceiptItemView
                      group={group}
                      item={item}
                      onUpdateItem={handleUpdate}
                      disabled={disableAll || isEditMode}
                      setDisabled={setDisableAll}
                      isEditMode={isEditMode}
                    />
                  </View>
                  {isEditMode && (
                    <Pressable
                      onPress={() => handleDeleteItem(item.id)}
                      style={({ pressed }) => [
                        styles.deleteButton,
                        { transform: [{ scale: pressed ? 0.92 : 1 }] },
                      ]}
                    >
                      <X
                        width={16}
                        height={16}
                        color="white"
                        style={styles.deleteX}
                      />
                    </Pressable>
                  )}
                </View>
              ))}
            </Animated.View>
            <Pressable
              onPress={handleAddItem}
              style={({ pressed }) => [
                styles.newItemButton,
                {
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={styles.plusIcon}>
                <Plus size={16} color={theme.colors.primary} />
              </View>
              <Text style={styles.newItemButtonText}>Add New Item</Text>
            </Pressable>
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
              disabled={isEditMode}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => setError(null)}
            style={({ pressed }) => [
              styles.errorButton,
              { transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <Text style={styles.errorButtonText}>OK</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const TotalAmountView = ({ totalAmount, isLoading, onSplitBill, disabled }) => (
  <View style={styles.totalContainer}>
    <View>
      <Text style={styles.totalLabel}>Total Amount</Text>
      <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
    </View>

    <Pressable
      onPress={onSplitBill}
      disabled={isLoading || disabled}
      style={({ pressed }) => [
        styles.splitButton,
        (isLoading || disabled) && styles.splitButtonDisabled,
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={styles.splitButtonText}>Split Bill</Text>
      )}
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
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
  itemContainer: {
    position: "relative",
    marginBottom: 8,
    marginTop: 8,
  },

  receiptItemWrapper: {
    flex: 1,
  },

  deleteButton: {
    position: "absolute",
    top: -12, // Move up to slightly overlap with the ReceiptItemView
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: profileTheme.colors.red,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 2, // Ensure it stays above the receipt item
  },
  deleteX: {
    width: 16,
    height: 16,
    color: "white",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "500",
    textAlign: "center", // Center the text in the button
  },
  newItemButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  newItemButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  plusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  totalContainerWrapper: {
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
