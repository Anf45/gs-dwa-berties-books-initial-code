# Berties Books
Features:
    View all books (/books/list)

    Add a new book (/books/addbook)

    Bargain books under £20 (/books/bargainbooks)

    Search books (exact + partial match)

    User registration page

Run Locally
    npm install
    node index.js
    Visit: http://localhost:8000

Deploy on VM
    cd ~/06_berties_33828420
    git pull
    forever start -a --uid "bertieApp" index.js
    Link: home=http://www.doc.gold.ac.uk/usr/205/

## dotenv

I used the `dotenv` module to secure my database details.  
In `index.js` I call `require('dotenv').config()` and the MySQL pool reads from:

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

These values are stored in a local `.env` file (which is in `.gitignore`) and a separate `.env` file on the VM, so the database password is not hardcoded in the source code.

## audit

I created an `audit` table in MySQL with columns: `username`, `loginStatus`, and `loginTime`.  
In the `/users/loggedin` route, every login attempt inserts a row into this table with status `SUCCESS` or `FAILED` depending on whether `bcrypt.compare()` returns true or false.

There is also a `/users/audit` route which selects all rows from the `audit` table and renders them in `audit.ejs` as a table so I can see who logged in, whether it was successful, and when it happened.

## Access control (Lab 8a)

I used `express-session` to store a `userId` in the session after successful login.

I then used a `redirectLogin` middleware to protect some routes:

- Protected routes (login required):
  - `/users/list`
  - `/users/audit`
  - `/books/list`
  - `/books/addbook`
  - `/books/bookadded`
  - `/books/bargainbooks`

If `req.session.userId` is not set, these routes redirect to `/users/login`.

- Public routes (no login required):
  - `/` (home)
  - `/about`
  - `/users/register`
  - `/users/login`
  - `/books/search`
  - `/books/search-result`

This means only logged in users can see user details or manage/view full book lists, but anyone can visit the site and search books.

## Lab 8bc

I used the `express-sanitizer` package to protect the site against Cross Site Scripting (XSS) attacks.

In `index.js`:
    app.use(expressSanitizer());

I sanitised all user inputs that are displayed back to the browser:

In `users.js`:
    - First name
    - Last name

Example:
    const cleanFirst = req.sanitize(req.body.first);
    const cleanLast  = req.sanitize(req.body.last);

In `books.js`:
    - Book name from `/books/bookadded`
    - Search keyword from `/books/search-result`

This prevents users injecting malicious scripts such as:
    <script>alert("hack")</script>

I did NOT sanitise:
    - Passwords (they are hashed and never displayed)
    - Emails (only validated, sanitising could break valid formats)
