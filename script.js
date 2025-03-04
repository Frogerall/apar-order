// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
// Function to Delete a Person and Their Orders
window.deletePerson = async function() {
    const personSelect = document.getElementById("personSelect").value;

    if (!personSelect) {
        alert("Please select a person to delete.");
        return;
    }

    if (!confirm(`Are you sure you want to delete ${personSelect} and all their orders?`)) return;

    try {
        // Query for the person's document
        const peopleCollection = collection(db, "people");
        const personQuery = query(peopleCollection, where("name", "==", personSelect));
        const personSnapshot = await getDocs(personQuery);

        if (!personSnapshot.empty) {
            const personDoc = personSnapshot.docs[0]; // Assuming names are unique
            await deleteDoc(doc(db, "people", personDoc.id)); // Delete person document

            // Query and delete all associated orders
            const ordersCollection = collection(db, "orders");
            const ordersQuery = query(ordersCollection, where("person", "==", personSelect));
            const ordersSnapshot = await getDocs(ordersQuery);

            const deletePromises = ordersSnapshot.docs.map(orderDoc => deleteDoc(doc(db, "orders", orderDoc.id)));
            await Promise.all(deletePromises); // Delete all orders

            alert(`${personSelect} and their orders have been deleted.`);
            fetchPeople(); // Refresh dropdown
            fetchOrders(); // Refresh order list
        } else {
            alert("Person not found.");
        }
    } catch (error) {
        console.error("Error deleting person and orders: ", error);
    }
};
// Function to Edit a Person's Name
window.editPerson = async function() {
    const oldName = document.getElementById("personSelect").value;
    if (!oldName) {
        alert("Please select a person to edit.");
        return;
    }

    const newName = prompt("Enter new name:", oldName);
    if (!newName || newName.trim() === "") return;

    try {
        const db = getFirestore();

        // Query for the person's document
        const personQuery = query(collection(db, "people"), where("name", "==", oldName));
        const personSnapshot = await getDocs(personQuery);

        if (!personSnapshot.empty) {
            const personDoc = personSnapshot.docs[0]; // Assuming names are unique
            await updateDoc(doc(db, "people", personDoc.id), { name: newName }); // Update person's name

            // Query and update all related orders
            const ordersQuery = query(collection(db, "orders"), where("person", "==", oldName));
            const ordersSnapshot = await getDocs(ordersQuery);

            const updatePromises = ordersSnapshot.docs.map(orderDoc =>
                updateDoc(doc(db, "orders", orderDoc.id), { person: newName })
            );
            await Promise.all(updatePromises); // Update all orders in parallel

            alert(`Updated ${oldName} to ${newName}`);
            fetchPeople(); // Refresh dropdown
            fetchOrders(); // Refresh order list
        } else {
            alert("Person not found.");
        }
    } catch (error) {
        console.error("Error updating person and orders: ", error);
        alert("Failed to update person. Check console for details.");
    }
};

// Function to Add an Order
window.addOrder = async function() {
    const orderInput = document.getElementById("orderInput").value;
    const personSelect = document.getElementById("personSelect").value;
    const date = document.getElementById("dateSelect").value;

    if (!personSelect) return alert("Please select a person");
    if (!orderInput) return alert("Please enter an order");
    if (!date) return alert("Please select a date");

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

    if (!personSelect || !selectedDate) return;

    const q = query(collection(db, "orders"), where("person", "==", personSelect), where("date", "==", selectedDate));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnapshot) => {
        const orderData = docSnapshot.data();
        const orderId = docSnapshot.id;

        const li = document.createElement("li");
        li.innerHTML = `
            ${orderData.text} 
            <button onclick="editOrder('${orderId}', '${orderData.text}')">✏️</button>
            <button onclick="deleteOrder('${orderId}')">❌</button>
        `;
        orderList.appendChild(li);
    });
};


// Function to Delete an Order
window.deleteOrder = async function(orderId) {
    if (confirm("Are you sure you want to delete this order?")) {
        try {
            await deleteDoc(doc(db, "orders", orderId));
            alert("Order deleted!");
            fetchOrders(); // Refresh the list
        } catch (error) {
            console.error("Error deleting order: ", error);
        }
    }
};

// Function to Edit an Order
window.editOrder = async function(orderId, oldText) {
    const newText = prompt("Edit order:", oldText);
    if (newText === null || newText.trim() === "") return;

    try {
        await updateDoc(doc(db, "orders", orderId), { text: newText });
        alert("Order updated!");
        fetchOrders(); // Refresh the list
    } catch (error) {
        console.error("Error updating order: ", error);
    }
};

// Function to Print Orders
window.printOrders = function() {
    const personSelect = document.getElementById("personSelect").value;
    const selectedDate = document.getElementById("dateSelect").value;
    const orderList = document.getElementById("orderList").innerHTML;

    if (!personSelect || !selectedDate) {
        alert("Please select a person and date before printing.");
        return;
    }

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
        <html>
        <head>
            <title>Order List</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { text-align: center; }
                ul { list-style-type: none; padding: 0; }
                ul li { padding: 5px; border-bottom: 1px solid #ddd; }
                .date { font-style: italic; }
            </style>
        </head>
        <body>
            <h2>Orders for ${personSelect}</h2>
            <p class="date">Date: ${selectedDate}</p>
            <ul>${orderList}</ul>
            <script>window.print();</script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

// Fetch people on page load
fetchPeople();
if (window.matchMedia("(display-mode: standalone)").matches) {
    console.log("Running as an installed app!");
}

