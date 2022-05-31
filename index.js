import express from "express"
import Core from "./Core.js"

const app = express()
app.use(express.json())

const core = new Core()

const reqValidate = (req, res, next) => {
    const {client, method} = req.body;

    if (!client) {
        res.json(Core.errorHandler({message: "property 'client' is required"}))
    } else if (!method) {
        res.json(Core.errorHandler({message: "property 'method' is required"}))
    } else {
        next()
    }
}

app.post('/', reqValidate, async (req, res) => {
    const {client, method, params, options} = req.body;

    core.auth(client)

    const result = await core.call(method, params, options)

    core.save()

    res.json(result)
})

app.listen(3000)