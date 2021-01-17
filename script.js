const ctx = document.getElementById('myChart').getContext('2d');
const displayDatas = document.getElementsByClassName("displayValues")
const buttons = document.querySelectorAll("footer button")
const dataAreas = document.querySelectorAll(".setDataAreas")
const dataLabels = document.getElementsByClassName("dataLabels")
const dataInputs = document.getElementsByClassName("dataInputs")
const submitData = document.querySelectorAll(".submit")
const list = document.querySelector(".incomes")
const inputDatas = document.querySelector(".inputData")
const moreList = document.querySelector(".othersList")
const addMore = document.querySelector("#submit")
const newDataInput = document.querySelector(".newData input")
const addNewDailyInputs = document.querySelectorAll("#addNewDailyInputs input")

const month = (new Date).getMonth() + 1
const year = (new Date).getFullYear()
const date = `${month}-${year}`
let dataBasedata;


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

const addData = (data) => {
    chart.data.labels = []
    chart.data.datasets[0].data = []
    const dataLab = Object.keys(data)
    const dataValue = Object.values(data)
    const total = data.salary + data.others;
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
        values.push(data[[labels[index]]]);
    }

    budget = total - values.reduce((a, b) => a + b)
    chart.data.labels.push("Budget")
    values.push(budget)

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

const updateInputs = () => {
    const dataLab = Object.keys(dataBasedata)
    const dataToAdd = []

    console.log(dataInputs);
    console.log(savedInputs);
    console.log(dataLab);


    dataLab.forEach(data => {
        if (!savedInputs.includes(data)) {
            dataToAdd.push(data)
            console.log(data);
        }
    })

    console.log(dataToAdd);

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
}

const updateSavedInputs = () => {
    for (let i = 0; i < dataInputs.length; i++) {
        savedInputs.push(dataInputs[i].name)
    }
}

const fixedRef = db.collection("expenses").doc("Ezio").collection("Fixed Incomes-Expenses").doc(date);
const dailyRef = db.collection("expenses").doc("Ezio").collection("Daily Incomes-Expenses").doc(date);



const getNewDatas = () => {
    fixedRef.get().then(function (doc) {
        if (doc.exists) {
            dataBasedata = doc.data()
            addData(doc.data())
            updateInputs()
            updateValues(doc.data())
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

addNewDailyInputs[4].addEventListener("click", (e) => {
    e.preventDefault()
    const type = addNewDailyInputs[1].checked ? addNewDailyInputs[1].id : addNewDailyInputs[0].id

    dailyRef.get().then(function (doc) {
        if (!doc.exists) {
            db.collection("expenses").doc("Ezio").collection("Daily Incomes-Expenses").doc(date).set({
                [addNewDailyInputs[2].value]: Number(addNewDailyInputs[3].value)
            })
        } else {
            if (type === "income") {
                db.collection("expenses").doc("Ezio").collection("Daily Incomes-Expenses").doc(date).update({
                    [addNewDailyInputs[2].value]: Number(addNewDailyInputs[3].value)
                })
            } else {
                db.collection("expenses").doc("Ezio").collection("Daily Incomes-Expenses").doc(date).update({
                    [addNewDailyInputs[2].value]: Number(-addNewDailyInputs[3].value)
                })
            }
        }
    })
})


buttons.forEach(button => {
    button.addEventListener("click", () => {
        inputDatas.style.display = "block"
        dataAreas.forEach(dataAreas => dataAreas.style.display = "none")

        if (button.innerHTML === "Set fixed incomes") {
            dataAreas[0].style.display = "flex"
        } else if (button.innerHTML === "Add Daily Incomes/Expenses") {
            dataAreas[1].style.display = "flex"
        }
    })
})



getNewDatas()
updateSavedInputs()

