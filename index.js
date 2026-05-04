import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import env from "dotenv";
import { createClient } from "@supabase/supabase-js";

env.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const app = express();
const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + '/public')); // allow access to static files in public folder

app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

//enable dynamic date display

function getToday(){
    const today = new Date();
    const dayName = (today.toDateString()).split(" ");
    const date = dayName[1] + " " + dayName[2] + ", " + dayName[3];
    const day = dayName[0];
    return {date, day};
};

const {date, day} = getToday();

let list = [];
let isbnList = [];

//function to fetch data from database and update list variable for display
app.get('/', async (req, res) => {
    const {date, day} = getToday()
    const {data, error} = await supabase.from('book').select('*').order('id', {ascending: true});

    if (error) {
        console.error("Error fetching data from Supabase:", error);
    } else {
        list = data;
        // console.log("Data fetched from Supabase:", data);
    };
    // console.log({date, day});
    // console.log(list); 
    res.render("index.ejs", {
        today:  date, 
        dayName: day,
        listItems: list,
    });
    // renderReviews(list); //handle rendering in EJS
});

// function to get cover image url from openlibrary api

function getCoverUrl(isbn) {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
}

//function to sort list by field and order

async function sortBy(list, sortByField, sortOrder) {
    const result = await db.query("SELECT * FROM summary ORDER BY " + sortByField + " " + sortOrder);
  list = result.rows; 
  list.forEach(item => {
    item.date = new Date(item.date).toDateString().split(" ").slice(1).join(" ");
  });
    return list;
}

//Sort route
app.post('/sort', async (req, res) => {
    const sortByField = req.body.sortByField;
    const sortOrder = req.body.sortOrder;
    const sortedList = await sortBy(list, sortByField, sortOrder);
res.render("index.ejs", {
    today:  date, 
    dayName: day,
    listItems: sortedList,
  });
});

//Add new item route
app.post('/new', (req, res) => {
    res.render("new.ejs", {
    today:  date, 
    dayName: day,
  });
});


//log new data to console and redirect to home
app.post('/save', async (req, res) => {
    const url = getCoverUrl(req.body.isbn);
    try {
        const {} = await supabase.from('book')
    .insert([{
        name: req.body.bookname,
        isbn: req.body.isbn,
        rating: Number(req.body.rating),
        inputDate: req.body.date,
        review: req.body.review,
        url: url
    }]);
        console.log("New item added:", req.body.bookname);
        return res.redirect('/'); // Redirect to home after successful insertion
    } catch (err) {
        console.log(err);
        return res.status(500).send("Error saving data to database."); // Send error response if insertion fails
    }       
});

//Delete item route
app.post('/delete', async (req, res) => {
    const id = req.body.deleteItemId;
    try {
        const {} = await supabase.from('book')
        .delete().eq('id', id);
        // console.log("Deleted item with id:", id);
        res.redirect('/');
    } catch (err) {
        console.log(err);
        return res.status(500).send("Error deleting data from database."); // Send error response if deletion fails
    }
}); 

//edit item route, display items for editing
app.post('/edit', async (req, res) => {
    const id = req.body.editItemId;
    // console.log("Editing item with id:", id);  
    try {
      const {data} = await supabase.from('book')
      .select('*').eq('id', id);
    //   console.log("Edited item:", data[0]);
      res.render("edit.ejs", {
        today:  date, 
        dayName: day,
        bookname:  data[0].name,
        isbn: data[0].isbn,
        rating: data[0].rating,
        date: data[0].inputDate,
        review: data[0].review,
        id: data[0].id
    })} catch (err) { 
        console.log(err);
    }
});

//save edited item route
app.post('/saveEdit', async (req, res) => {
    const id = req.body.editItemId;
    const updatedData = {
        name: req.body.bookname,
        isbn: req.body.isbn,
        rating: Number(req.body.rating),
        inputDate: req.body.date,
        review: req.body.review,
        url: getCoverUrl(req.body.isbn),
    }
    try{
        const {data, error} = await supabase.from('book')
        .update(updatedData).eq('id', id).select();
        // console.log("Updated item with id:", id);
        // console.log("Updated item", updatedData);
        if (error) {  //this format suits supabase better
        console.error("Database Error:", error.message);
        console.error("Error Code:", error.code);
        return; // Stop execution
    }
    } catch (err) {
        console.log(err);
    }
    res.redirect('/');
});

app.listen(3000, () => {
  console.log(`Example app listening on port ${port}`)
//   console.log(`Today is ${today.toDateString()}`);
})