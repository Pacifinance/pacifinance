import express from "express"

import db from "../../db/mongo"

/* === /tags/* === */

const tagsRouter = express.Router()

tagsRouter.post("/get", async (req, res) => {
    // Get all the tags from the database
    let tags: any = {}
    for (let tag_type of Object.keys(db.tags.TagType))
    {
        // @ts-ignore
        const tag_type_name = db.tags.TagType[tag_type].name;
        // @ts-ignore
        const tag_type_value = db.tags.TagType[tag_type].value;
        const tags_of_type = await db.tags.getAllTagsByType(tag_type_value);
        tags[tag_type_name] = tags_of_type;
    }
    // Send the array of tags to the client with status code 200 (OK)
    res.status(200);
    res.json(tags);
});

export default tagsRouter