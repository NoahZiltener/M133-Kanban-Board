import { Application, Router, send } from "https://deno.land/x/oak@v6.3.1/mod.ts";

let cards = [];
let id = 0;
let columns = [
    {
        id : "todo",
        name: "ToDo",
        color: "orange"
    },
    {
        id : "inprogress",
        name: "In Progress",
        color: "lightskyblue"
    },
    {
        id : "done",
        name: "Done",
        color: "limegreen"
    }
]

const app = new Application();
const router = new Router();

router
    .get("/cards", context => context.response.body = cards)
    .post("/cards", async context => {
        const card = await context.request.body({ type: "json" }).value;
        card.id = id;
        id++;
        cards = [
            ...cards,
            card
        ];
        context.response.body = "Card created!";
        context.response.status = 201;
    })
    .put("/cards/:id", async context => {
        const id = context.params.id;
        const newcard = await context.request.body({ type: "json" }).value;
        const oldcard = cards.find(card => card.id == id);
        const index = cards.indexOf(oldcard);
        newcard.id = parseInt(id, 10);
        cards[index] = newcard
        context.response.body = "Card updated!";
        context.response.status = 200;
    })
    .delete("/cards/:id", context => {
        const id = context.params.id
        cards = cards.filter(card => card.id != id)
        context.response.body = "Card deleted!";
        context.response.status = 200;
    })
    .get("/columns", async context => {
        context.response.body = columns;
        context.response.status = 200;
    })
    .get("/static/:filename", async context => {
        const filename = context.params.filename;
        await send(context, `/frontend/${filename}`)
    })
    .get("/", async context => {
        await send(context, context.request.url.pathname, {
          root: `${Deno.cwd()}/frontend`,
          index: "index.html",
        })
    })

app.use(router.routes());
app.listen({ port: 8000 });
console.log("App running on http://localhost:8000/");