import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ReceiptView from "./ReceiptView";
import ReviewScreen from "../../components/receipt/ReviewScreen";
import ReviewWrapper from "./ReviewWrapper";
import SwipeReview from "./SwipeReview";

const TestScreen = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <>
      <ReceiptView
        // group={mockGroup}
        // transaction={mockTransaction}
        isLoading={isLoading}
        // onUpdateItem={handleUpdateItem}
        // onSplitBill={handleSplitBill}
      />
      {/* <ReviewWrapper /> */}
      {/* <SwipeReview /> */}
    </>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//   },
// });

export default TestScreen;
