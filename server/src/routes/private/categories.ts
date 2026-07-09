import express from "express"

import db from "../../db/db"
import common from "../common"

/* === /categories/* === */
// Categorie personalizzate: etichette utente agganciate a una categoria
// ufficiale (tags di tipo expense/income), usate solo per la visualizzazione
// personale — le statistiche restano sempre raggruppate sulla categoria ufficiale.

const categoriesRouter = express.Router()

categoriesRouter.post("/get", async (req, res) => {
    const categories = await db.categories.getAllByUserId(req.userId as string)
    res.status(200).json(categories)
})

categoriesRouter.post("/add", async (req, res) => {
    const label = common.sanitizeInput(req.body.label)
    const parent_index = Number(req.body.parent_index)
    const parent_type = req.body.is_expense ? db.tags.TagType.expense.value : db.tags.TagType.income.value
    if (label === "" || !Number.isFinite(parent_index))
    {
        res.status(400).send()
        return
    }
    // Resolve the official parent tag by its client-facing index
    const parentTag = await db.tags.getReferenceByIndexAndType(parent_index, parent_type)
    if (parentTag === null)
    {
        res.status(400).send()
        return
    }
    const category = await db.categories.insertNew(req.userId as string, parentTag.id, label)
    if (category === null)
    {
        res.status(500).send()
        return
    }
    res.status(200).json(category)
})

categoriesRouter.post("/rename", async (req, res) => {
    const category_id = Number(req.body.id)
    const label = common.sanitizeInput(req.body.label)
    if (!Number.isFinite(category_id) || label === "")
    {
        res.status(400).send()
        return
    }
    const category = await db.categories.renameById(req.userId as string, category_id, label)
    if (category === null)
    {
        res.status(500).send()
        return
    }
    res.status(200).json(category)
})

categoriesRouter.post("/delete", async (req, res) => {
    const category_id = Number(req.body.id)
    if (!Number.isFinite(category_id))
    {
        res.status(400).send()
        return
    }
    const result = await db.categories.deleteById(req.userId as string, category_id)
    if (result === null || result.deletedCount !== 1)
    {
        res.status(500).send()
        return
    }
    res.status(200).send()
})

export default categoriesRouter
