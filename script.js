const ctx = document.getElementById('myChart').getContext('2d');
const displayDatas = document.getElementsByClassName("displayValues")
const buttons = document.querySelectorAll("footer button")
const dataAreas = document.querySelectorAll(".setDataAreas")
const dataLabels = document.getElementsByClassName("dataLabels")
const dataInputs = document.getElementsByClassName("dataInputs")
const dailyExpensesSelector = document.getElementsByClassName("remove")
const submitData = document.querySelectorAll(".submit")
const list = document.querySelector(".incomes")
const inputDatas = document.querySelector(".inputData")
const moreList = document.querySelector(".othersList")
const addMore = document.querySelector("#submit")
const newDataInput = document.querySelector(".newData input")
const addNewDailyInputs = document.querySelectorAll("#addNewDailyInputs input")
const dailyExpensesList = document.querySelector(".dailyExpensesList")
const closeWindow = document.querySelectorAll(".setDataAreas button")

const month = (new Date).getMonth() + 1
const year = (new Date).getFullYear()
const date = `${month}-${year}`
let dataBaseFixed;
let dataBaseDaily;


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

const chart = new Chart(ctx, {
    type: 'pie',

    data: {
        labels: [],
        datasets: [{
            label: 'My First dataset',
            backgroundColor: ["blue", "red", "orange", "yellow", "green", "pink", "lightblue"],
            borderColor: 'black',
            data: []
        }]
    },

    options: {}
});

const addData = () => {
    chart.data.labels = []
    chart.data.datasets[0].data = []
    const dataLab = Object.keys(dataBaseFixed)
    const dataValue = Object.values(dataBaseFixed)
    const total = dataBaseFixed.others ? dataBaseFixed.salary + dataBaseFixed.others : dataBaseFixed.salary;
    console.log(dataLab);
    let labels = [];
    let values = [];
    let dataToOrder = [];



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

    if (dataBaseDaily) {
        const dailyIE = Object.values(dataBaseDaily).length ? Object.values(dataBaseDaily).reduce((a, b) => a + b) : null
        chart.data.labels.push("Daily Expenses")
        values.push(dailyIE)
    }
    console.log(values);


    budget = total - values.reduce((a, b) => a + b)
    chart.data.labels.push("Budget")
    values.push(budget)
    console.log(budget);
    console.log(values);


    values.forEach(value => {
        const percentage = value / total * 100;
        chart.data.datasets[0].data.push(Math.round(percentage))
    })


    chart.update();

}

let savedInputs = [];
let toSave = [];

addMore.addEventListener("click", (e) => {
    e.preventDefault()

    for (let i = 0; i < dataInputs.length; i++) {
        toSave.push(dataInputs[i].value)
    }

    if (newDataInput.value !== "") {
        moreList.innerHTML += `
            <article>
                <label class="dataLabels" for="${newDataInput.value}">${newDataInput.value}:</label>
                <input class="dataInputs" type="number" min="1" step="any" id="${newDataInput.value}" name="${newDataInput.value}">
            </article>`

        list.innerHTML += `
            <p>${newDataInput.value}: £<input class="displayValues" type="number" readonly value="0" name="display${newDataInput.value}" id="display${newDataInput.value}"></p>`
    }

    savedInputs.push(newDataInput.value)
    newDataInput.value = ""

    for (let i = 0; i < dataInputs.length; i++) {
        dataInputs[i].value = toSave[i]
    }

    toSave = []

})

let dailyPrinted = false;

const updateInputs = () => {
    const dataLab = Object.keys(dataBaseFixed)
    const dataToAdd = []
    dailyExpensesList.innerHTML = ''

    dataLab.forEach(data => {
        if (!savedInputs.includes(data)) {
            dataToAdd.push(data)
            console.log(data);
        }
    })

    dataToAdd.forEach(data => {
        moreList.innerHTML += `
    <article>
        <label class="dataLabels" for="${data}">${data}:</label>
        <input class="dataInputs" type="number" min="1" step="any" id="${data}" name="${data}">
    </article>`

        list.innerHTML += `
        <p>${data}: £<input class="displayValues" type="number" readonly value="0" name="display${data}" id="display${data}"></p>`
    })
    updateSavedInputs()

    if (dataBaseDaily) {
        for (let i = 0; i < Object.keys(dataBaseDaily).length; i++) {
            dailyExpensesList.innerHTML += `
        <p class="dailyExpensesSelector"><button value="${Object.keys(dataBaseDaily)[i]}"><i class="fas fa-minus-circle"></i></button> ${Object.keys(dataBaseDaily)[i]}: £<input class="displayValues" type="number" readonly value="${Object.values(dataBaseDaily)[i]}" name="${Object.keys(dataBaseDaily)[i]}" id="display${Object.keys(dataBaseDaily)[i]}"></p>`
        }
    }
}


dailyExpensesList.addEventListener("click", (e) => {
    console.log(e.target.tagName);
    if (e.target.tagName === "BUTTON") {
        dailyRef.update({
            [e.target.value]: firebase.firestore.FieldValue.delete()
        })
        setTimeout(getNewDatas, 50)
    }
})

const updateSavedInputs = () => {
    for (let i = 0; i < dataInputs.length; i++) {
        savedInputs.push(dataInputs[i].name)
    }
}

const fixedRef = db.collection("expenses").doc("Ezio").collection("Fixed Incomes-Expenses").doc(date);
const dailyRef = db.collection("expenses").doc("Ezio").collection("Daily Expenses").doc(date);



const getNewDatas = () => {
    fixedRef.get().then(function (doc) {
        if (doc.exists) {
            dataBaseFixed = doc.data()
            addData()
            updateInputs()
            updateValues(doc.data())
            console.log(dataBaseFixed);
        } else {
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });

    dailyRef.get().then(function (doc) {
        if (doc.exists) {
            dataBaseDaily = doc.data()
            addData()
            updateInputs()
        } else {
            console.log("No such document!");
        }
    }).catch(function (error) {
        console.log("Error getting document:", error);
    });


}

const updateValues = (data) => {
    const dataLab = Object.keys(data)
    const dataValue = Object.values(data)

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
                db.collection("expenses").doc("Ezio").collection("Fixed Incomes-Expenses").doc(date).update({
                    [name]: Number(value)
                })
            } else {
                db.collection("expenses").doc("Ezio").collection("Fixed Incomes-Expenses").doc(date).set({
                    [name]: Number(value)
                })
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
    const isObject = dataBaseDaily ? Object.keys(dataBaseDaily) : "null"

    if (isObject.includes(addNewDailyInputs[0].value)) {
        db.collection("expenses").doc("Ezio").collection("Daily Expenses").doc(date).update({
            [addNewDailyInputs[0].value]: Number(addNewDailyInputs[1].value) + Number(dataBaseDaily[[addNewDailyInputs[0].value]])
        })

    } else {

        dailyRef.get().then(function (doc) {
            if (!doc.exists) {
                db.collection("expenses").doc("Ezio").collection("Daily Expenses").doc(date).set({
                    [addNewDailyInputs[0].value]: Number(addNewDailyInputs[1].value)
                })
            } else {
                db.collection("expenses").doc("Ezio").collection("Daily Expenses").doc(date).update({
                    [addNewDailyInputs[0].value]: Number(addNewDailyInputs[1].value)
                })
            }
        })
    }
    setTimeout(getNewDatas, 2000)

    // dailyExpensesList.innerHTML += `
    // <p>${addNewDailyInputs[0].value}: £<input class="displayValues" type="number" readonly value="${addNewDailyInputs[1].value}" name="display${addNewDailyInputs[0].value}" id="display${addNewDailyInputs[0].value}"></p>`

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
        }
    })
})

closeWindow.forEach(button => button.addEventListener("click", () => inputDatas.style.display = "none"))



getNewDatas()
updateSavedInputs()

