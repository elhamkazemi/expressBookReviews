const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

//Function to check if the user is authenticated
const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
}
//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});}  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username}
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    let unChanged = true;
    if(Object.keys(books[isbn].reviews).length > 0){
        for(let i=1; i<= Object.keys(books[isbn].reviews).length; i++){
            if(books[isbn].reviews[i].username == req.session.authorization.username){
                console.log('here');
                books[isbn].reviews[i].review = req.query.review
                unChanged = false
            }
        }
        if(unChanged){
            books[isbn].reviews[Object.keys(books[isbn].reviews).length+1] =
             {username: req.session.authorization.username, review: req.query.review}
        }
    }else{
        books[isbn].reviews[1] = {username: req.session.authorization.username, review: req.query.review} 
    }

    res.send(`The review for the book with ISBN ${isbn} has been added/updated`);
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    for(let i=1; i<= Object.keys(books[isbn].reviews).length; i++){
        if(books[isbn].reviews[i].username == req.session.authorization.username){
            delete books[isbn].reviews[i];
        }
    }
    res.send(`Reviews for the book with ISBN ${isbn} posted by user ${req.session.authorization.username} deleted`);
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
