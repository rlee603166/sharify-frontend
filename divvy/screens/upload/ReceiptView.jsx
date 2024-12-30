import React, { useState, useEffect } from "react";
import {
  Alert,
  View,
  Text,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
  Animated,
  Pressable,
  TouchableOpacity,
  Modal,
  Dimensions
} from "react-native";
import { X, Plus, UserPlus } from "lucide-react-native";
import ContactList from "../../components/main/ContactList";
import ReceiptItemView from "../../components/receipt/ReceiptItem";
import theme, { profileTheme } from "../../theme";
import ReceiptService from "../../services/ReceiptService";


if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

const customLayoutAnimation = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
};

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

const blankTransaction = {
  id: "1",
  subtotal: 0,
  items: [],
};



const mockTransaction = {
  id: "1",
  subtotal: 82,
  items: [
    {
      id: "1",
      name: "Pasta Carbonara",
      price: 22.5,
      people: [],
    },
    {
      id: "2",
      name: "Caesar Salad",
      price: 15.0,
      people: [],
    },
    {
      id: "3",
      name: "Grilled Salmon",
      price: 32.0,
      people: [],
    },
    {
      id: "4",
      name: "Glass of Wine",
      price: 12.5,
      people: [],
    },
  ],
};

const BottomSheetModal = ({ visible, onClose, children }) => {
  const [animation] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [isVisible, setIsVisible] = useState(false);

  // Create interpolated opacity based on modal position
  const opacity = animation.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start();
    } else {
      Animated.spring(animation, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 65,
        friction: 11
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  const handleClose = () => {
    Animated.spring(animation, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11
    }).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  if (!isVisible && !visible) return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      onRequestClose={handleClose}
      animationType="none"
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: opacity,
            backgroundColor: 'rgba(0, 0, 0, 0.25)'
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.modalBackground}
          activeOpacity={1} 
          onPress={handleClose}
        >
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                transform: [{ translateY: animation }],
              },
            ]}
          >
            <View style={styles.bottomSheetHeader}>
              <View style={styles.pullBar} />
            </View>
            <TouchableWithoutFeedback>
              <View style={styles.bottomSheetContent}>
                {children}
              </View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
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

const ReceiptView = ({ isLoading, setStep, onProcessed, selectedPeople }) => {
  const [transaction, setTransaction] = useState({ ...blankTransaction });
  const [group, setGroup] = useState({});
  const [error, setError] = useState(null);
  const [disableAll, setDisableAll] = useState(false);
  const [totalAmount, setTotalAmount] = useState(
    transaction ? transaction.subtotal : 0
  );
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
    const [showContactList, setShowContactList] = useState(false);
    const [doneGroup, setDoneGroup] = useState(false);

  const receiptService = new ReceiptService();

    useEffect(() => {
        if(group) setDoneGroup(true);
    }, [group]);

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

      transformNames(selectedPeople, true);

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

    const transformNames = (users, isInit) => {
        const newMembers = users.selectedItem.map(user => ({
            id: user.id,
            name: user.name,
        }));
        if (isInit){
            setGroup(prev => ({
                id: 1,
                name: "Bree Flowies",
                members: [...newMembers]
            }));           
        } else {
            setGroup(prev => ({
                ...prev,
                members: [...prev.members, ...newMembers],
            }));
        }
    }

  const toggleEditMode = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    LayoutAnimation.configureNext(customLayoutAnimation);
    setIsEditMode(!isEditMode);
  };

  const handleAddPerson = () => {
    setShowContactList(true);
  };

  const handleSelectPeople = ({ type, selectedItem }) => {
    if (type === 'contacts') {
      const newMembers = selectedItem.map(contact => ({
        id: contact.id,
        name: contact.name
      }));
      
      setGroup(prevGroup => ({
        ...prevGroup,
        members: [...prevGroup.members, ...newMembers]
      }));
    } else {
      const allMembers = selectedItem.flatMap(group => 
        group.members.map((name, index) => ({
          id: `${group.id}-${index}`,
          name
        }))
      );
      
      setGroup(prevGroup => ({
        ...prevGroup,
        members: [...prevGroup.members, ...allMembers]
      }));
    }
    setShowContactList(false);
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
      people: [],
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
      const result = receiptService.processTransaction(transaction, group);
      console.log("Full Results:", JSON.stringify(result, null, 2));
        onProcessed(result);
        setStep(4);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    setStep(2);
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <Text style={styles.title}>Items:</Text>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={handleAddPerson}
              style={({ pressed }) => [
                styles.addPersonButton,
                { transform: [{ scale: pressed ? 0.98 : 1 }] },
              ]}
            >
              <UserPlus size={20} color={theme.colors.primary} />
            </Pressable>
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
        </View>

        <TouchableWithoutFeedback onPress={handleBackgroundPress}>
          <View style={styles.innerContainer}>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[
                styles.scrollContent,
                { paddingBottom: keyboardHeight + 10 },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <Animated.View style={{ opacity: fadeAnim }}>
                {transaction.items.map((item) => (
                  <View key={item.id} style={styles.itemContainer}>
                    <View style={styles.receiptItemWrapper}>
                    {doneGroup ?
                        <ReceiptItemView
                        group={group}
                        item={item}
                        onUpdateItem={handleUpdate}
                        disabled={disableAll || isEditMode}
                        setDisabled={setDisableAll}
                        isEditMode={isEditMode}
                        />
                        :
                        <></>}
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
            />
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

        <TotalAmountView
          totalAmount={totalAmount}
          isLoading={isLoading}
          onSplitBill={handleSplitBill}
          disabled={isEditMode}
        />

        <BottomSheetModal
          visible={showContactList}
          onClose={() => setShowContactList(false)}
        >
          <ContactList
            setStep={() => setShowContactList(false)}
            onSelectPeople={handleSelectPeople}
          />
        </BottomSheetModal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  editButton: {
    padding: 8,
  },
  addPersonButton: {
    padding: 8,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    // backgroundColor: 'rgba(0, 194, 68, 0.1)', // Light green background
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
    marginBottom: 4,
    marginTop: 4,
  },
  receiptItemWrapper: {
    flex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  deleteButton: {
    position: "absolute",
    top: -12,
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
    zIndex: 2,
  },
  deleteX: {
    width: 16,
    height: 16,
    color: "white",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "500",
    textAlign: "center",
  },
  newItemButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
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
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Lighter opacity
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,

  },
  bottomSheetHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: 'rgba(0, 0, 0, 0)',
    borderBottomWidth: 1,
  },
  pullBar: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D1D6',
    borderRadius: 2,
  },
  bottomSheetContent: {
    flex: 1,
  }
});

export default ReceiptView;
