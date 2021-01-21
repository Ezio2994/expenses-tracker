const headerButtons = document.querySelectorAll("header button")
const ctx = document.getElementById('myChart').getContext('2d');
const displayDatas = document.getElementsByClassName("displayValues")
const buttons = document.querySelectorAll("footer button")
const dataAreas = document.querySelectorAll(".setDataAreas")
const dataLabels = document.getElementsByClassName("dataLabels")
const dataInputs = document.getElementsByClassName("dataInputs")
const dailyExpensesSelector = document.getElementsByClassName("remove")
const submitData = document.querySelectorAll(".submit")
const list = document.querySelector(".otherFixedExpenses")
const inputDatas = document.querySelector(".inputData")
const moreList = document.querySelector(".othersList")
const addMore = document.querySelector("#submit")
const newDataInput = document.querySelector(".newData input")
const addNewDailyInputs = document.querySelectorAll("#addNewDailyInputs input")
const addNewDailyHeader = document.querySelector("#addNewDailyInputs h2")
const dailyExpensesList = document.querySelector(".dailyExpensesList")
const dailyIncomesList = document.querySelector(".dailyIncomesList")
const closeWindow = document.querySelectorAll(".setDataAreas button")
const reportInputs = document.querySelectorAll(".report input")
const reportsList = document.querySelector("#reportsList")
const reports = document.querySelectorAll(".reports tr")

const month = (new Date).getMonth() + 1;
const year = (new Date).getFullYear()
const date = `${month}-${year}`
let dataBaseFixed;
let dataBaseDailyExpenses;
let dataBaseDailyIncomes;
let userId;
let userIp;
let fixedRef;
let dailyExpensesRef;
let dailyIncomesRef;
let reportsRef;


var firebaseConfig = {
    apiKey: "AIzaSyA0CgP6TBgWhROuPJzH5x0sXRNW2-Hqwug",
    authDomain: "expenses-tracker-179c9.firebaseapp.com",
    projectId: "expenses-tracker-179c9",
    storageBucket: "expenses-tracker-179c9.appspot.com",
    messagingSenderId: "256181405537",
    appId: "1:256181405537:web:87bccabb15f677b60e6720",
    measurementId: "G-XBRLEC43J7"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();

var provider = new firebase.auth.GoogleAuthProvider();

const signIn = () => {
    firebase.auth().signInWithRedirect(provider);
    getUser()
}

const signOut = () => {
    firebase.auth().signOut().then(() => {
        window.location.reload()
    }).catch((error) => {
        console.log(error);
    });
}

headerButtons[0].onclick = () => headerButtons[0].innerHTML === "SignIn" ? signIn() : signOut()
headerButtons[1].onclick = () => {
    inputDatas.style.display = "block"
    dataAreas.forEach(dataAreas => dataAreas.style.display = "none")
    dataAreas[2].style.display = "flex"
}

const getJSON = () => {
    const url = `https://api.astroip.co/2.99.115.173?api_key=a45dc99e-f914-4961-8009-54fca96d8819`
    const proxyUrl = `https://agile-island-79839.herokuapp.com/`
    fetch(proxyUrl + url)
        .then((res) => res.json())
        .then((res) => {
            userIp = res.requester_ip
        })
        .then(() => updateRef())
        .catch((err) => {
            console.log(err);
        });
};

const getUser = () => {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            userId = user.uid
            console.log(userId);
            headerButtons[0].innerHTML = "SignOut"
            updateRef()
        } else {
            userId = undefined
            headerButtons[0].innerHTML = "SignIn"
            getJSON()
        }
    });
};

const updateRef = () => {
    const user = userId ? userId : userIp
    fixedRef = db.collection("users").doc(user).collection("Fixed Incomes-Expenses").doc(date);
    dailyExpensesRef = db.collection("users").doc(user).collection("Daily Expenses").doc(date);
    dailyIncomesRef = db.collection("users").doc(user).collection("Daily Incomes").doc(date);
    reportsRef = db.collection("users").doc(user).collection("reports").doc(date);
    createNewUserDataBase()
    getNewDatas()

    const incomes = [];
    const expenses = [];
    const saved = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    db.collection("users").doc(user).collection("reports").get().then((querySnapshot) => {
        querySnapshot.docs.map((doc) => {
            reportsList.innerHTML += `<option value="${doc.id}">${doc.id}</option>`
            incomes.push(doc.data().totalIncomes);
            expenses.push(doc.data().totalSpent);
            saved.push(doc.data().moneySaved);
            reports[0].innerHTML += `<th>${months[doc.id.charAt(0) - 1]}</th>`
            reports[1].innerHTML += `<td>£${doc.data().totalIncomes}</td>`
            reports[2].innerHTML += `<td>£${doc.data().totalSpent}</td>`
            reports[3].innerHTML += `<td>£${doc.data().moneySaved}</td>`
        })

        document.querySelector("#reportSum").innerHTML = `
        Total this year: Incomes: ${incomes.reduce((a, b) => a + b)} - Expenses: ${expenses.reduce((a, b) => a + b)} - Saved: ${saved.reduce((a, b) => a + b)}`
    }).catch((error) => null)

}

document.querySelector("#submitReport").addEventListener("click", () => {
    const user = userId ? userId : userIp

    fixedRef = db.collection("users").doc(user).collection("Fixed Incomes-Expenses").doc(reportsList.value);
    dailyExpensesRef = db.collection("users").doc(user).collection("Daily Expenses").doc(reportsList.value);
    dailyIncomesRef = db.collection("users").doc(user).collection("Daily Incomes").doc(reportsList.value);

    savedInputs = ["savings", "rent", "others", "salary"]
    list.innerHTML = ""
    moreList.innerHTML = ""
    dailyExpensesList.innerHTML = ""
    dailyIncomesList.innerHTML = ""

    setTimeout(getNewDatas, 1000)
    inputDatas.style.display = "none"

})


const createNewUserDataBase = () => {
    // if (userId) {
    fixedRef.get().then(function (doc) {
        if (!doc.exists) {
            fixedRef.set({
                others: 0,
                rent: 0,
                salary: 0,
                savings: 0
            }).then(() => importPrevFixed())
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });
    // }
}

const importPrevFixed = () => {
    const user = userId ? userId : userIp

    db.collection("users").doc(user).collection("Fixed Incomes-Expenses").doc(`${month - 1}-${year}`).get().then((doc) => {
        previusData = doc.data()

        fixedRef.update({
            ...previusData
        })
    })
}

const getNewDatas = () => {
    fixedRef.get().then(function (doc) {
        if (doc.exists) {
            dataBaseFixed = doc.data()
            addData()
            updateInputs()
            updateValues()
        } else {
            console.log("No such document!");
            setTimeout(getNewDatas, 1000)
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    })

    dailyExpensesRef.get().then(function (doc) {
        dataBaseDailyExpenses = doc.data()
        addData()
        updateInputs()
        updateValues()
    }).catch(function (error) {
        console.log("Error getting document:", error);
    })

    dailyIncomesRef.get().then(function (doc) {
        dataBaseDailyIncomes = doc.data()
        addData()
        updateInputs()
        updateValues()
    }).catch(function (error) {
        console.log("Error getting document:", error);
    })
}

const chart = new Chart(ctx, {
    type: 'pie',

    data: {
        labels: [],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: ["blue", "red", "orange", "yellow", "lightgreen", "pink", "lightblue"],
            borderColor: 'black',
            data: []
        }]
    },

    options: {}
});

const addData = () => {
    chart.data.labels = []
    chart.data.datasets[0].data = []
    const dataLab = dataBaseFixed ? Object.keys(dataBaseFixed) : null
    const dataValue = dataBaseFixed ? Object.values(dataBaseFixed) : null
    let total = dataBaseFixed ? dataBaseFixed.salary + dataBaseFixed.others : dataBaseFixed.salary;
    const moreIncomes = dataBaseDailyIncomes !== undefined && Object.values(dataBaseDailyIncomes).length ? Object.values(dataBaseDailyIncomes).reduce((a, b) => a + b) : 0
    let labels = [];
    let values = [];
    let dataToOrder = [];


    total = total + moreIncomes



    for (let i = 0; i < dataLab.length; i++) {
        dataToOrder.push([dataLab[i], dataValue[i]])
    }

    dataToOrder.sort((a, b) => a[1] - b[1]).reverse()

    dataToOrder.forEach(data => {
        if (data[0] !== "salary" && data[0] !== "others") {
            chart.data.labels.push(data[0].charAt(0).toUpperCase() + data[0].slice(1))
            labels.push(data[0])
        }
    })

    for (let index = 0; index < chart.data.labels.length; index++) {
        values.push(dataBaseFixed[[labels[index]]]);
    }

    if (dataBaseDailyExpenses) {
        const dailyIE = Object.values(dataBaseDailyExpenses).length ? Object.values(dataBaseDailyExpenses).reduce((a, b) => a + b) : 0
        chart.data.labels.push("Daily Expenses")
        values.push(dailyIE)
    }

    totalSpent = values.length ? values.reduce((a, b) => a + b) : 0

    budget = total - totalSpent
    reportInputs[0].value = dataBaseFixed.savings + budget
    reportInputs[1].value = budget
    chart.data.labels.push("Left Over")
    values.push(budget)

    values.forEach(value => {
        const percentage = value / total * 100;
        chart.data.datasets[0].data.push(Math.round(percentage))
    })

    reportsRef.get().then(function (doc) {
        if (!doc.exists) {
            reportsRef.set({
                totalIncomes: total,
                moneySaved: dataBaseFixed.savings + budget,
                totalSpent: totalSpent - dataBaseFixed.savings
            })
        } else {
            reportsRef.update({
                totalIncomes: total,
                moneySaved: dataBaseFixed.savings + budget,
                totalSpent: totalSpent - dataBaseFixed.savings
            })
        }
    })


    chart.update();

}

let toSave = [];

addMore.addEventListener("click", (e) => {
    e.preventDefault()

    for (let i = 0; i < dataInputs.length; i++) {
        toSave.push(dataInputs[i].value)
    }

    if (newDataInput.value !== "") {
        newDataInput.value = newDataInput.value.includes("/") ? newDataInput.value.replace("/", "-") : newDataInput.value
        moreList.innerHTML += `
            <article>
                <label class="dataLabels" for="${newDataInput.value}">${newDataInput.value}:</label>
                <input class="dataInputs" type="number" min="1" step="any" id="${newDataInput.value}" name="${newDataInput.value}">
            </article>`
    }
    newDataInput.value = ""

    for (let i = 0; i < dataInputs.length; i++) {
        dataInputs[i].value = toSave[i]
    }

    toSave = []

})

const updateInputs = () => {
    const dataLab = Object.keys(dataBaseFixed)
    const dataToAdd = []
    const savedInputs = ["rent", "savings", "others", "salary"];
    list.innerHTML = ""
    moreList.innerHTML = ""
    dailyExpensesList.innerHTML = ""
    dailyIncomesList.innerHTML = ""

    dataLab.forEach(data => {
        if (!savedInputs.includes(data)) {
            dataToAdd.push(data)
        }
    })

    dataToAdd.forEach(data => {
        moreList.innerHTML += `
    <article>
        <label class="dataLabels" for="${data}">${data}:</label>
        <input class="dataInputs" type="number" min="1" step="any" id="${data}" name="${data}">
    </article>`

        list.innerHTML += `
        <p><button value="${data}"><i class="fas fa-minus-circle"></i></button> ${data}: £<input class="displayValues" type="number" readonly value="0" name="display${data}" id="display${data}"></p>`
    })

    if (dataBaseDailyExpenses) {
        for (let i = 0; i < Object.keys(dataBaseDailyExpenses).length; i++) {
            dailyExpensesList.innerHTML += `
        <p><button value="${Object.keys(dataBaseDailyExpenses)[i]}"><i class="fas fa-minus-circle"></i></button> ${Object.keys(dataBaseDailyExpenses)[i]}: £<input class="displayValues" type="number" readonly value="${Object.values(dataBaseDailyExpenses)[i]}" name="${Object.keys(dataBaseDailyExpenses)[i]}" id="display${Object.keys(dataBaseDailyExpenses)[i]}"></p>`
        }
    }

    if (dataBaseDailyIncomes) {
        for (let i = 0; i < Object.keys(dataBaseDailyIncomes).length; i++) {
            dailyIncomesList.innerHTML += `
        <p><button value="${Object.keys(dataBaseDailyIncomes)[i]}"><i class="fas fa-minus-circle"></i></button> ${Object.keys(dataBaseDailyIncomes)[i]}: £<input class="displayValues" type="number" readonly value="${Object.values(dataBaseDailyIncomes)[i]}" name="${Object.keys(dataBaseDailyIncomes)[i]}" id="display${Object.keys(dataBaseDailyIncomes)[i]}"></p>`
        }
    }
}


const deleteValue = (e, whichRef) => {
    let reference;
    if (whichRef === "expenses") { reference = dailyExpensesRef }
    else if (whichRef === "incomes") { reference = dailyIncomesRef }
    else { reference = fixedRef }

    if (e.target.tagName === "BUTTON") {
        reference.update({
            [e.target.value]: firebase.firestore.FieldValue.delete()
        })
        setTimeout(getNewDatas, 500)
    }
}

dailyExpensesList.addEventListener("click", (e) => deleteValue(e, "expenses"))
dailyIncomesList.addEventListener("click", (e) => deleteValue(e, "incomes"))
list.addEventListener("click", (e) => deleteValue(e, "bills"))



const updateValues = () => {
    const dataLab = Object.keys(dataBaseFixed)
    const dataValue = Object.values(dataBaseFixed)

    let i = 0;
    let x = 0;

    while (i < displayDatas.length) {
        if (displayDatas[i].name === "display" + dataLab[x]) {
            displayDatas[i].value = dataValue[x]
            i++
            x = 0
        } else if (x > dataLab.length) {
            i++
            x = 0
        } else {
            x++
        }
    }
}

const unused = [];

class FixedIncomes {
    constructor(value, name) {
        this.value = Number(value);
        this.name = name;
    }

    addToDatabase(value, name) {
        fixedRef.get().then(function (doc) {
            if (doc.exists) {
                fixedRef.update({
                    [name]: Number(value)
                })
            } else {
                fixedRef.set({
                    [name]: Number(value)
                })
                console.log(userId);
                unused.push({ [name]: Number(value) })
                setTimeout(recall, 1000)
            }

        }).catch(function (error) {
            console.log("Error getting document:", error);
        });
    }
}
const recall = () => {
    unused.forEach(un => {
        const something = new FixedIncomes
        something.addToDatabase(Object.values(un), Object.keys(un))
    })
}


submitData.forEach(submit => {
    submit.addEventListener("click", () => {
        for (let i = 0; i < dataInputs.length; i++) {
            if (dataInputs[i].value !== "") {
                const something = new FixedIncomes
                something.addToDatabase(dataInputs[i].value, dataInputs[i].name)
            }
        }

        setTimeout(getNewDatas, 2000)
        inputDatas.style.display = "none"
    })
})

addNewDailyInputs[2].addEventListener("click", (e) => {
    e.preventDefault()
    const isExpensesObj = addNewDailyHeader.innerHTML === "Add Daily Expenses" ? dataBaseDailyExpenses : dataBaseDailyIncomes
    const isObject = isExpensesObj ? Object.keys(isExpensesObj) : "null"
    const isExpenses = addNewDailyHeader.innerHTML === "Add Daily Expenses" ? dailyExpensesRef : dailyIncomesRef
    const isExpensesRef = addNewDailyHeader.innerHTML === "Add Daily Expenses" ? dailyExpensesRef : dailyIncomesRef

    if (isObject.includes(addNewDailyInputs[0].value)) {
        isExpensesRef.update({
            [addNewDailyInputs[0].value]: Number(addNewDailyInputs[1].value) + Number(isExpensesObj[[addNewDailyInputs[0].value]])
        })

    } else {

        isExpensesRef.get().then(function (doc) {
            if (!doc.exists) {
                isExpenses.set({
                    [addNewDailyInputs[0].value]: Number(addNewDailyInputs[1].value)
                })
            } else {
                isExpenses.update({
                    [addNewDailyInputs[0].value]: Number(addNewDailyInputs[1].value)
                })
            }
        })
    }

    setTimeout(getNewDatas, 2000)
    setTimeout(clearInputs, 500)

})

const clearInputs = () => {
    addNewDailyInputs[0].value = ""
    addNewDailyInputs[1].value = ""
}


buttons.forEach(button => {
    button.addEventListener("click", () => {
        inputDatas.style.display = "block"
        dataAreas.forEach(dataAreas => dataAreas.style.display = "none")

        if (button.innerHTML === "Set fixed incomes") {
            dataAreas[0].style.display = "flex"
        } else if (button.innerHTML === "Add Daily Expenses") {
            dataAreas[1].style.display = "flex"
            addNewDailyHeader.innerHTML = "Add Daily Expenses"
        } else if (button.innerHTML === "Add Daily Incomes") {
            dataAreas[1].style.display = "flex"
            addNewDailyHeader.innerHTML = "Add Daily Incomes"
        }
    })
})

closeWindow.forEach(button => button.addEventListener("click", () => inputDatas.style.display = "none"))


getUser()
