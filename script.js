// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "apar-order-management.firebaseapp.com",
    projectId: "apar-order-management",
    storageBucket: "apar-order-management.appspot.com",
    messagingSenderId: "1066699957208",
    appId: "1:1066699957208:web:675e2317e01438097d88ad",
    measurementId: "G-Y9YNKET9C6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to Add a Person
window.addPerson = async function() {
    const personName = document.getElementById("personInput").value;
    if (!personName) return alert("Please enter a person's name");

    try {
        await addDoc(collection(db, "people"), { name: personName });
        alert("Person Added!");
        document.getElementById("personInput").value = "";
        fetchPeople(); // Refresh dropdown
    } catch (error) {
        console.error("Error adding person: ", error);
    }
};

// Function to Load People into Dropdown
window.fetchPeople = async function() {
    const querySnapshot = await getDocs(collection(db, "people"));
    const personSelect = document.getElementById("personSelect");
    personSelect.innerHTML = `<option value="">Select a person</option>`;

    querySnapshot.forEach((doc) => {
        const option = document.createElement("option");
        option.value = doc.data().name;
        option.textContent = doc.data().name;
        personSelect.appendChild(option);
    });
};

// Function to Add an Order
window.addOrder = async function() {
    const orderInput = document.getElementById("orderInput").value;
    const personSelect = document.getElementById("personSelect").value;
    const date = new Date().toISOString().split("T")[0]; // Get today's date

    if (!personSelect) return alert("Please select a person");
    if (!orderInput) return alert("Please enter an order");

    try {
        await addDoc(collection(db, "orders"), {
            person: personSelect,
            text: orderInput,
            date: date
        });
        alert("Order Added!");
        document.getElementById("orderInput").value = "";
        fetchOrders();
    } catch (error) {
        console.error("Error adding order: ", error);
    }
};

// Function to Fetch Orders Based on Selected Person and Date
window.fetchOrders = async function() {
    const personSelect = document.getElementById("personSelect").value;
    const selectedDate = document.getElementById("dateSelect").value;
    const orderList = document.getElementById("orderList");
    
    orderList.innerHTML = ""; // Clear previous orders

    if (!personSelect) return;

    let q = query(collection(db, "orders"), where("person", "==", personSelect));
    if (selectedDate) {
        q = query(collection(db, "orders"), where("person", "==", personSelect), where("date", "==", selectedDate));
    }

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const li = document.createElement("li");
        li.textContent = `${doc.data().text} `;
        orderList.appendChild(li);
    });
};

// Fetch people on page load
fetchPeople();
