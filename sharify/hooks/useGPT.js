import { useEffect, useRef } from "react";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";
import OpenAI from "openai";

const useGPT = () => {
    const gptInstance = useRef(null);

    useEffect(() => {
        // Initialize the GPT instance once
        if (!gptInstance.current) {
            gptInstance.current = new GPT();
        }
    }, []);

    class GPT {
        constructor() {
            this.apiURL = "http://47.144.148.193:8000/api/v1/gpt/";
            this.client = null;
            this.setClient();
        }

        async fetchToken() {
            try {
                const accessToken = await SecureStore.getItemAsync("access_token");
                console.log("Access Token:", accessToken);
                const response = await fetch(this.apiURL, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken.trim()}`,
                    },
                });

                console.log("Response Status:", response.status);
                console.log("Response Headers:", response.headers);

                if (!response.ok) {
                    const errorResponse = await response.text();
                    console.error("Error Response:", errorResponse);
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error("Error fetching token:", error);
                throw error;
            }
        }

        async setClient() {
            try {
                const key = await this.fetchToken();
                console.log(`fetched openai key: ${JSON.stringify(key, null, 2)}`);
                if (key) this.client = new OpenAI({ apiKey: key.apiKey });
            } catch (error) {
                console.error("Error setting client:", error);
                throw error;
            }
        }

        async encodeImageToBase64(photoUri) {
            try {
                const base64 = await FileSystem.readAsStringAsync(photoUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                return base64;
            } catch (error) {
                console.error("Error encoding image to base64:", error);
                throw error;
            }
        }

        async upload(photoUri) {
            try {
                const base64Img = await this.encodeImageToBase64(photoUri);

                const systemMessage = {
                    role: "system",
                    content:
                        "You are an assistant that extracts and formats receipt data into structured JSON for a food-sharing app. Ensure that all extracted items are logically consistent, correlate with the receipt's cuisine or category, and make sense together.",
                };

                const userMessage = {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `
                            Extract the items and prices from the following receipt image and return them as JSON with this exact structure:
                            {
                                "items": [
                                    {
                                        "id": "<unique_id>",
                                        "name": "<item_name>",
                                        "price": <price>,
                                        "people": []
                                    }
                                ],
                                "additional": {
                                    "tax": <tax>,
                                    "tip": <tip>,
                                    "credit_charge": <credit_charge>
                                }
                            }
                            Use an incrementing numeric ID for each item, starting from 1. Ensure the names and prices are accurate.
                            Return only valid JSON, without any additional text or formatting.
                            `,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/png;base64,${base64Img}`,
                                detail: "auto",
                            },
                        },
                    ],
                };

                const fetchData = async () => {
                    const response = await this.client.chat.completions.create({
                        model: "gpt-4o-mini",
                        messages: [systemMessage, userMessage],
                        max_tokens: 1000,
                    });

                    const jsonResponse = response.choices[0].message.content;
                    return JSON.parse(jsonResponse); // Parse response into JSON
                };

                try {
                    const parsedData = await fetchData();
                    return parsedData;
                } catch (error) {
                    // If JSON parsing fails, refetch the data once more
                    console.warn("Parsing error, retrying...");
                    const retryData = await fetchData();
                    return retryData;
                }
            } catch (error) {
                console.error("Error processing receipt:", error);
                throw error;
            }
        }
    }

    return gptInstance.current;
};

export default useGPT;
