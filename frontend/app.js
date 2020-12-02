let apiroute = "http://localhost:8000"

let columns = [];
let cards = [];

createColumns();
getCards();

async function createColumns() {
    let container = document.querySelector('.container');

    let url = `${apiroute}/columns`;
    let response = await fetch(url);
    columns = await response.json();
    let html = ``;

    columns.forEach(element => {
        html = `
        <div class="column" id=${element.id} ondrop="drop(event)" ondragover="allowDrop(event)">
            <h1 class="title" style="background-color: ${element.color}">${element.name}</h1>
            <ul class="list" id="${element.id + "list"}"></ul>
            <form class="form hidden card" id="${element.id + "form"}">
                    <input type="text" name="cardvalue" required />
                    <input type="hidden" name="id" value="${element.id}" />
                    <br>
                    <button class="submitbutton" type="submit">Save</button>
                    <button class="clearbutton" type="reset">Cancel</button>
            </form>
            <button class="createbutton" id="${element.id + "createbutton"}" type="button">+</button>
        </div>
        `;

        container.innerHTML += html;
    });

    document.querySelectorAll(".createbutton").forEach(element => {
        let id = element.parentElement.id
        element.addEventListener('click', (event) => {
            toggleForm(id)
        })
    })

    document.querySelectorAll(".clearbutton").forEach(element => {
        let id = element.parentElement.parentElement.id
        element.addEventListener('click', (event) => {
            toggleForm(id);
        })
    })

    document.querySelectorAll(".form").forEach(element => {
        let id = element.parentElement.id
        element.addEventListener("submit", function (event) {
            event.preventDefault();
            let formdata = new FormData(element);
            let card = {
                status: formdata.get("id"),
                value: formdata.get("cardvalue")
            }
            createCard(card);
            toggleForm(id);
            element.reset();
        })
    })
}

async function clearLists() {
    let lists = document.querySelectorAll('.list');
    lists.forEach(element => {
        element.innerHTML = "";
    });
}

function toggleForm(id) {
    let form = document.querySelector(`#${id + "form"}`);
    let button = document.querySelector(`#${id + "createbutton"}`);
    button.classList.toggle("hidden");
    form.classList.toggle("hidden");
}

async function getCards() {
    let url = `${apiroute}/cards`;
    let response = await fetch(url);
    cards = await response.json();
    clearLists();
    cards.forEach(element => {
        if(columns.find(column => column.id == element.status)){
            let list = document.querySelector(`#${element.status + "list"}`);

            html = `
            <li class="card" id="${element.id}" draggable="true" ondragstart="drag(event)">
                <p>${element.value}</p>
                <button class="moveleft" type="button">←</button>
                <button class="moveright" type="button">→</button>
                <button class="deletebutton" type="button">🗑</button>
            </li>
            `;
    
            list.innerHTML += html;
        }  
    });

    document.querySelectorAll(".deletebutton").forEach(element => {
        element.addEventListener("click", (event) => {
            let id = element.parentElement.id;
            deleteCard(id);
        })
    })

    document.querySelectorAll(".moveleft").forEach(element => {
        element.addEventListener("click", (event) => {
            let id = element.parentElement.id;
            let card = cards.find(card => card.id == id);
            let oldstatus = columns.find(column => column.id == card.status)
            let index = columns.indexOf(oldstatus) - 1;
            if (index >= 0) {
                let newstatus = columns[index]
                card.status = newstatus.id;
                updateCard(card);
            }
        })
    })

    document.querySelectorAll(".moveright").forEach(element => {
        element.addEventListener("click", (event) => {
            let id = element.parentElement.id;
            let card = cards.find(card => card.id == id);
            let oldstatus = columns.find(column => column.id == card.status)
            let index = columns.indexOf(oldstatus) + 1;
            if (index <= columns.length - 1) {
                let newstatus = columns[index]
                card.status = newstatus.id;
                updateCard(card);
            }
        })
    })
}

async function createCard(card) {
    let url = `${apiroute}/cards`;
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(card),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
    getCards();
}

async function updateCard(card) {
    let url = `${apiroute}/cards/${card.id}`;
    fetch(url, {
        method: 'PUT',
        body: JSON.stringify(card),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
    getCards();
}

async function deleteCard(id) {
    let url = `${apiroute}/cards/${id}`;
    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
    })
    getCards();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("id", ev.target.id);
}

function drop(ev) { 
    ev.preventDefault();
    let cardid = ev.dataTransfer.getData("id");

    let target = ev.target;
    while(!(columns.find(column => column.id == target.id))){
        target = target.parentElement;
    }

    let card = cards.find(card => card.id == cardid);
    card.status = target.id;
    updateCard(card);
}