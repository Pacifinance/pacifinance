import express from "express"

import db from "../../db/db"

/* === /tags/* === */

const tagsRouter = express.Router()

tagsRouter.post("/get", async (_, res) => {
    // Get all the tags from the database
    const tags: any = {}
    for (const tag_type of Object.keys(db.tags.TagType))
    {
        // @ts-expect-error tag_type is a string key from Object.keys(), not a literal of TagType
        const tag_type_name = db.tags.TagType[tag_type].name;
        // @ts-expect-error tag_type is a string key from Object.keys(), not a literal of TagType
        const tag_type_value = db.tags.TagType[tag_type].value;
        const tags_of_type = await db.tags.getAllTagsByType(tag_type_value);
        tags[tag_type_name] = tags_of_type;
    }
    // Send the array of tags to the client with status code 200 (OK)
    res.status(200);
    res.json(tags);
});

export default tagsRouter