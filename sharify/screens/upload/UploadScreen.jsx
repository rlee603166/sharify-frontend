import { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import CameraScreen from "../../components/upload/CameraScreen";
import ContactList from "../../components/main/ContactList";
import LoadingWrapper from "../../components/main/LoadingWrapper";
import ReceiptView from "./ReceiptView";
import ReviewWrapper from "./ReviewWrapper";
import PhotoReview from "./PhotoReviewScreen";

import ReceiptService from "../../services/ReceiptService";
import UserService from "../../services/UserService";

import useGPT from "../../hooks/useGPT";
import { useUser } from "../../services/UserProvider";
import { useFriends } from "../../hooks/useFriends";
import { useGroups } from "../../context/GroupsContext";

const UploadScreen = ({ navigation }) => {
    const [step, setStep] = useState(0);
    const [photoUri, setPhotoUri] = useState(null);
    const [selectedPeople, setSelectedPeople] = useState();
    const [processed, setProcessed] = useState({});
    const [peopleHashMap, setPeopleHashMap] = useState({});
    const [inputType, setInputType] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [receiptID, setReceiptID] = useState(null);
    const receiptIDRef = useRef(null);
    const [apiData, setApiData] = useState({});
    const [ocrData, setOcrData] = useState({});
    const [receiptItems, setReceiptItems] = useState([]);
    const [receiptTotal, setReceiptTotal] = useState(0);

    const gpt = useGPT();
    const { id } = useUser();
    const { friends, loadFriends } = useFriends();
    const { groups, loadGroups } = useGroups();

    const receiptService = new ReceiptService();
    const userService = new UserService();

    useEffect(() => {
        loadFriends(id);
        loadGroups(id);
    }, []);

    useEffect(() => {
        if (step === 3 && receiptItems.length > 0) {
            setIsLoading(false);
            setStep(3);
        }
    }, [receiptItems, step]);

    const optimizer = async uri => {
        const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 750 } }], {
            compress: 0.9,
            format: "webp",
        });
        return result.uri;
    };

    const upload = async uri => {
        const data = await gpt.upload(uri);
        setReceiptItems(data.items);
        const total = data.items.reduce((sum, item) => {
            const price = typeof item.price === "string" ? parseFloat(item.price) : item.price;
            return sum + (isNaN(price) ? 0 : price);
        }, 0);
        setReceiptTotal(total);
    };

    const handlePictureTaken = (uri, type = "camera") => {
        setInputType(type);
        if (type === "manual") {
            setStep(2);
        } else {
            upload(uri);
            setPhotoUri(uri);
            setStep(1);
        }
    };

    const handleBack = () => {
        if (inputType === "manual") {
            reset();
            setStep(0);
            return;
        }
        if (step === 3) {
            setReceiptItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    people: [],
                    users: 1,
                }))
            );
            setStep(2);
            return;
        }

        setStep(1);
    };

    const reset = () => {
        setInputType(null);
        setPhotoUri(null);
        setReceiptID(null);
        setReceiptItems([]);
        setReceiptTotal(0);
    };

    const onRetake = () => {
        reset();
        setStep(0);
    };

    const onAccept = () => {
        setStep(2);
    };

    const handleSelectPeople = async (selectedItems, isUpdate = false) => {
        setIsLoading(true);

        if (!isUpdate) {
            setReceiptItems(prevItems =>
                prevItems.map(item => ({
                    ...item,
                    people: [],
                    users: 1,
                }))
            );
        } else {
            const newUserIds = new Set(selectedItems.uniqueMemberIds.map(member => member.id));
            setReceiptItems(prevItems =>
                prevItems.map(item => {
                    const updatedPeople = (item.people || []).filter(person =>
                        newUserIds.has(person.id)
                    );

                    return {
                        ...item,
                        people: updatedPeople,
                        users: updatedPeople.length || 1,
                    };
                })
            );
        }

        setSelectedPeople(selectedItems);

        if (!isUpdate) {
            setStep(3);
            if (inputType === "manual") {
                setIsLoading(false);
                return true;
            }
        } else {
            setIsLoading(false);
        }
    };

    const handleReceiptUpdate = (items, total) => {
        setReceiptItems(items);
        setReceiptTotal(total);
    };

    const handleSplitBill = result => {
        setProcessed(result);
        setStep(4);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <CameraScreen navigation={navigation} onPictureTaken={handlePictureTaken} />;
            case 1:
                return <PhotoReview photoUri={photoUri} onRetake={onRetake} onAccept={onAccept} />;
            case 2:
                return (
                    <ContactList
                        setStep={setStep}
                        onSelectPeople={items => handleSelectPeople(items, false)}
                        type="Next"
                        handleBack={handleBack}
                        fetchedFriends={friends}
                        fetchedGroups={groups}
                        groupData={
                            Array.isArray(selectedPeople)
                                ? { uniqueMemberIds: [], friends: selectedPeople, groups: [] }
                                : selectedPeople
                        }
                    />
                );
            case 3:
                return (
                    <ReceiptView
                        navigation={navigation}
                        setStep={handleBack}
                        onProcessed={handleSplitBill}
                        selectedPeople={selectedPeople}
                        photoUri={photoUri}
                        ocrData={{
                            items: receiptItems,
                            subtotal: receiptTotal,
                        }}
                        setPeopleHashMap={setPeopleHashMap}
                        onUpdatePeople={items => handleSelectPeople(items, true)}
                        onUpdateReceipt={handleReceiptUpdate}
                        initialTotal={receiptTotal}
                    />
                );
            case 4:
                return (
                    <ReviewWrapper
                        setStep={newStep => {
                            if (newStep === 3) {
                                setStep(3);
                            } else if (newStep === 0) {
                                reset();
                                setStep(0);
                            }
                        }}
                        processed={processed}
                        receiptID={receiptID}
                        peopleHashMap={peopleHashMap}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <LoadingWrapper isLoading={isLoading}>{renderStep()}</LoadingWrapper>
        </View>
    );
};

export default UploadScreen;
