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
    Link: home=http://www.doc.gold.ac.uk/usr/33828300/

