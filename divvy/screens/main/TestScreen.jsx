import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ReceiptView from "./ReceiptView";
import ReviewScreen from "../../components/receipt/ReviewScreen";
import ReviewWrapper from "./ReviewWrapper";

const TestScreen = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* <ReceiptView
        // group={mockGroup}
        // transaction={mockTransaction}
        isLoading={isLoading}
        // onUpdateItem={handleUpdateItem}
        // onSplitBill={handleSplitBill}
      /> */}
      {/* <ReviewScreen /> */}
      <ReviewWrapper />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
});

export default TestScreen;
