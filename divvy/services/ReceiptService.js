export class Person {
    constructor(name) {
        this.name = name;
        this.items = [];
        this.subtotal = 0;
    }

    addItem(item) {
        this.items = [...this.items, item];
        this.subtotal = this.items.reduce((total, item) => total + item.getPricePer(), 0);
    }
    
    setItems(items) {
        this.items = items;
        this.subtotal = this.items.reduce((total, item) => total + item.getPricePer(), 0);
    }

    getItems() {
        return this.items;
    }

    getName() {
        return this.name;
    }

    toString() {
        return `<Person ${this.name}>`
    }
}

export class Item {
    constructor(name, price, users) {
        this.name = name;
        this.price = price;
        this.users = users; 
    }

    getName() {
        return this.name;
    }

    getPricePer() {
        return this.price / this.users;
    }
}

export default class ReceiptService {
    constructor() {}

    processTransaction(receipt, group) {
        const personTotals = {};
        
        group.members.forEach((person) => {
            personTotals[person.name] = new Person(person.name);
        });

        receipt.items.forEach((item) => {
            const size = item.people.length;
            item.people.forEach((person) => {
                personTotals[person].addItem(new Item(item.name, item.price, size));  
            });
        });

        return personTotals;
    }

    processReceipt(receipt, group) {
        const result = this.processTransaction(receipt, group);
        // more logic
        return result;
    }
}

// Test data setup
const mockTransaction = {
  id: "1",
  subtotal: 82,
  items: [
    {
      id: "1",
      name: "Pasta Carbonara",
      price: 22.5,
      people: ["John", "Alice"]
    },
    {
      id: "2",
      name: "Caesar Salad",
      price: 15.0,
      people: ["John", "Alice"]
    },
    {
      id: "3",
      name: "Grilled Salmon",
      price: 32.0,
      people: ["Alice", "Bob", "John"]
    },
    {
      id: "4",
      name: "Glass of Wine",
      price: 12.5,
      people: ["Alice", "Bob", "John"]
    },
  ],
};
const mockReceipt = {
    items: [
        { name: "Pizza", price: 20, people: ["John", "Alice"] },
        { name: "Salad", price: 15, people: ["Bob"] },
        { name: "Wine", price: 30, people: ["Alice", "Bob", "John"] }
    ]
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

// Test the implementation
const receiptService = new ReceiptService();
const result = receiptService.processTransaction(mockTransaction, mockGroup);


