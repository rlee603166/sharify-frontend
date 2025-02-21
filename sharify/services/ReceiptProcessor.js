export class Person {
    constructor(name, id, phone = null) {
        if (!name || !id) {
            throw new Error("Name and ID are required for Person");
        }
        this.name = name;
        this.id = id;
        this.phone = phone;
        this.items = [];
        this.subtotal = 0;
        this.tip = 0;
        this.tax = 0;
        this.misc = 0;
        this.finalTotal = 0;
    }

    addItem(item) {
        if (!(item instanceof Item)) {
            throw new Error("Invalid item type");
        }
        this.items.push(item);
        this.recalculateSubtotal();
    }

    recalculateSubtotal() {
        this.subtotal = this.items.reduce((total, item) => total + item.getPricePer(), 0);
        this.finalTotal = this.subtotal + this.tax + this.tip + this.misc;
    }
}

export default class ReceiptProcessor {
    constructor() {
        this.people = new Map();
    }

    getPeopleHashMap() {
        const hashMap = {};
        this.people.forEach((person, id) => {
            hashMap[id] = person.name;
        });
        return hashMap;
    }

    validateReceipt(receipt) {
        if (!receipt || typeof receipt !== "object") {
            throw new Error("Invalid receipt format: receipt must be an object");
        }

        if (!Array.isArray(receipt.items)) {
            throw new Error("Invalid receipt format: items must be an array");
        }

        if (typeof receipt.subtotal !== "number") {
            throw new Error("Invalid receipt format: subtotal must be a number");
        }

        if (!receipt.additional || typeof receipt.additional !== "object") {
            throw new Error("Invalid receipt format: additional charges must be an object");
        }

        receipt.items.forEach(item => {
            if (!item.name || typeof item.price !== "number" || !Array.isArray(item.people)) {
                throw new Error("Invalid item format in receipt");
            }
        });
    }

    processTransaction(receipt, group) {
        this.validateReceipt(receipt);
        const personTotals = {};

        // Initialize person totals
        group.members.forEach(person => {
            personTotals[person.id] = new Person(person.name, person.id, person.phone);
            this.people.set(person.id, person);
        });

        // Process each item and assign to people
        receipt.items.forEach(item => {
            const size = item.people.length || 1;
            item.people.forEach(personId => {
                const person = personTotals[personId];
                if (!person) {
                    throw new Error(`Person ${personId} not found in group`);
                }
                // Create a new Item instance with the correct properties
                person.addItem(new Item(item.name, Number(item.price), size));
            });
        });

        return personTotals;
    }

    processAdditionalCharges(subtotal, processed, additionalCharges) {
        const { tax = 0, tip = 0, misc = 0 } = additionalCharges;
        const roundToTwo = num => Math.round((num + Number.EPSILON) * 100) / 100;

        let totalSubtotal = 0;
        Object.values(processed).forEach(person => {
            if (person instanceof Person) {
                totalSubtotal += person.subtotal;
            }
        });

        Object.values(processed).forEach(person => {
            if (person instanceof Person) {
                const ratio = person.subtotal / totalSubtotal;
                person.tax = roundToTwo(tax * ratio);
                person.tip = roundToTwo(tip * ratio);
                person.misc = roundToTwo(misc * ratio);
                person.finalTotal = roundToTwo(
                    person.subtotal + person.tax + person.tip + person.misc
                );
            }
        });

        return processed;
    }

    processReceipt(receipt, group) {
        const processed = this.processTransaction(receipt, group);
        return this.processAdditionalCharges(receipt.subtotal, processed, receipt.additional);
    }
}

export class Item {
    constructor(name, price, users = 1) {
        if (!name || typeof price !== "number" || price < 0) {
            throw new Error("Invalid item parameters");
        }
        this.name = name;
        this.price = price;
        this.users = Math.max(1, users); // Ensure at least 1 user
    }

    getName() {
        return this.name;
    }

    getPricePer() {
        return this.price / this.users;
    }
}

export function formatForAPI(processedReceipt, receipt_id) {
    const { tip = 0, tax = 0, misc = 0 } = processedReceipt;

    const personEntries = Object.entries(processedReceipt).filter(
        ([key, value]) => value instanceof Person
    );

    return {
        receipt_id,
        summary: {
            tip,
            tax,
            misc,
            subtotal: personEntries.reduce((sum, [_, person]) => sum + person.subtotal, 0),
            total: personEntries.reduce((sum, [_, person]) => sum + person.finalTotal, 0),
        },
        splits: personEntries.map(([_, person]) => ({
            name: person.name,
            id: person.id,
            ...(person.phone &&
            /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i.test(person.id)
                ? { phone: person.phone }
                : {}),
            subtotal: person.subtotal,
            finalTotal: person.finalTotal,
            tip: person.tip || 0,
            tax: person.tax || 0,
            misc: person.misc || 0,
            items: person.items.map(item => ({
                name: item.getName(),
                price: item.getPricePer(),
                totalPrice: item.price,
            })),
        })),
    };
}


export function generateGroupMessage(id, processedReceipt, venmoUsername) {
    if (!venmoUsername) {
      throw new Error("Venmo username is required to generate deep links");
    }
  
    let message = `🧾 Sharify Bill Split 🧾\n\n`;
    let count = 1;
  
    Object.values(processedReceipt).forEach(person => {
      // Skip the user entry
      if (person.id === "you") {
        console.log("Skipping user");
        return;
      }
      
      // Make sure we're dealing with a valid Person instance
      if (!(person instanceof Person)) return;
  
      // Person header
      message += `${count}) ${person.name}\n`;
  
      // Amount
      message += `💸 $${person.finalTotal.toFixed(2)}\n`;
  
      // Items
      const itemsList = person.items.map(item => item.getName()).join(", ");
      message += `🛒 ${itemsList}\n`;
  
      // Venmo link
      const venmoLink = `venmo://paycharge?txn=pay&recipients=${venmoUsername}&amount=${person.finalTotal.toFixed(2)}`;
      message += `🔗 ${venmoLink}\n\n`;
  
      count++;
    });
  
    // Closing prompt
    message += `👉 Tap your link above to pay!`;
  
    return message;
  }
  