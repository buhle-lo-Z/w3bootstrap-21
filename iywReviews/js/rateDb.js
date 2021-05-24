/* REF: https://developers.google.com/web/fundamentals/instant-and-offline/web-storage 
    IndexedDB
    - structured data model much like MySQL
    - a database built into browser - more powerful than localStorage intended for offline apps
    - to be combined with ServiceWorker & other technologies
    - has a built-in mechanism of "schema versioning", absent in server-side databases
*/

/* NB Before using the IndexedDB API, ALWAYS CHECK FOR SUPPORT in the browser 
    REF: https://medium.com/free-code-camp/a-quick-but-complete-guide-to-indexeddb-25f030425501
*/

// EXAMPLE: IndexedDB API using requests - the one I'll use for now

(() => { // the anonymous function === (function() {
    'use strict';

    // CHECK FOR SUPPORT
    if (!('indexedDB' in window)) {
        console.warn('IndexedDB not supported by this browser');
        return;
    }
    //...IndexedDB code follows

    // Create needed constants
    const list = document.querySelector('ul'); // displays inv numbers
    const invoiceInput = document.querySelector('#invoice');
    // const nameInput = document.querySelector('#name');
    const form = document.querySelector('form');
    // const submitBtn = document.querySelector('form button');
    const searchBtn = document.querySelector('form button');

    /* ******* DATABASE INITIAL SET UP ******* */
    // Create an instance of a db object for us to store the open database in
    let db; // global variable

    // event handler called when the window's load event fires
    window.onload = function () {
        /* all subsequent code is written here to make sure we don't try to use 
            IndexedDB functionality before the app has completely finished loading 
        */   
        // Open our database - versionchange transaction type created; it is created if it doesn't already exist (see onupgradeneeded below)
        let request = window.indexedDB.open('dbInvoices', 1); // version number NB - when change version, then I can make changes
        // REM: indexedDB.open doesn’t return a database, it returns a request for a database because IndexedDB is an asynchronous API

        /* MUST check database version to make sure that aren't trying to open an older version of the database 
            Can happen when visitor loads outdated JS code e.g. from proxy cache even though the database is new
            This would trigger request.onerror(), so we MUST do a version check of database via db.version then suggest a page reload/refresh
            ?? Use proper HTTP caching headers to avoid old code being loaded in the first place ??
        */
        // onerror handler signifies that the database didn't open successfully
        request.onerror = function () {
            console.log('Database failed to open');
            // console.error('Error', request.error);
        };

        // onsuccess handler signifies that the database opened successfully - there's a database obj in request.result to be used for further calls
        request.onsuccess = function () {
            // check db version BEFORE success msg

            // inform
            console.log('Database opened successfully');

            // Great! Store the opened database object in the db variable
            db = request.result;

            // Run the displayData() function to display any invoices already in the IDB (should be those for which reviews/star rating hasn't been done ONLY)
            displayData(); // displayed inside the <ul> as soon as the page loads

            // loadInvoices);
        };
    }
        // this is the most important event handler for setting up the database: request.onupgradeneeded. 
        // This handler runs if the database has not already been set up, or if the database is opened with a bigger version number than the existing stored database (when performing an upgrade)

        // Setup the database tables if this has not already been done. RUNS BEFORE THE onsuccess HANDLER ABOVE
        // Triggered if idatabase doesn't exist hence performs initialisation OR if database version is outdated when my app has been updated
        request.onupgradeneeded = function (e) {
            // Grab a reference to the opened database
            let db = e.target.result; // is the request object which is the same as db = request.result; in onsuccess handler

            // CREATE AN OBJECT STORE(=== MySQL table) to store our invoices in. Is synchronous (no await needed)
            // including an auto-incrementing key. invoices_os == single table, id is autoIncrement field which is unique for deleting or displaying a record)
            //let objectStore = db.createObjectStore('invoices_os', { keyPath: 'id', autoIncrement: true }); // can only be created/modified in onupgradeneeded
            let invoiceOS = db.createObjectStore('invoice', { keyPath: 'invoiceID', autoIncrement: true });
            // Define what data items the objectStore will contain - database schema/sturcture == fields/columns. Here, invoice_idx tracks invoice No 
            /*let invoiceIndex = */
            // objectStore.createIndex('invoice', 'invoice', { unique: true }); // allows for searching by any field with an index/field
            invoiceOS.createIndex('indexInv', 'invNumber', { unique: true });
            // SYNTAX: objectStore.createIndex(name, keyPath, [options]); 2nd option could be: multiEntry <==> ONLY used if keyPath is an array
            // if multiEntry:true, the index keeps a list of store objects for each value in array. array memebers become index keys
            /* objectStore.createIndex('name', 'name', { unique: false });
              var myIDBIndex = objectStore.createIndex(indexName, keyPath); nameOfIndex, keyPathForIndexToUse. returns NewlyCreatedIndex === An IDBIndex object: .
                var myIDBIndex = objectStore.createIndex(indexName, keyPath, objectParameters); .. [unique, multiEntry, locale]
             */

             
             /* add available invoices to start off - clear any lists before then add this one
             can't insert data during a upgrade needed event - REF: https://stackoverflow.com/questions/27359748/how-to-add-initial-data-in-indexeddb-only-once
             */
             

            console.log('Database setup complete');
        };


        /* ******* 2. ADDING DATA TO THE DATABASE requires an Object Store i.e. SAME AS a table/collection where data is stored. 
                   Requires a UNIQUE key for every value in the store                                              ******* */

        // FOR IYW: ENTER InvNo. Then SEARCH. DISPLAY/RETRIEVE already existing InvNo with associated name from database 

        // Create an onsubmit handler so that when the form is submitted the addData() function is run
        form.onsubmit = addData; // runs a function called addData() when the form is submitted

        // DEFINE the addData() function
        function addData(e) {
            // prevent default - we don't want the form to submit in the conventional way
            e.preventDefault(); // otherwise causes a page refresh & spoils the experience

            // start a transaction on the db to write data to the invoices_os data store object
            let transaction = db.transaction(['invoices'], 'readwrite'); // only to read &  write NOT to create/remove/alter

            // retrieve the store from the transaction
            let invoiceOS = transaction.objectStore('invoices'); // access the objectStore & save result in var

            // grab the values entered into the form fields as JavaScript object 
            let enteredInvoice = { 
                invoice: invoiceInput.value 
            }; /* represents a record to enter into the database i.e. 
            let enteredInvoice = { 
                number: 'LC4685', 
                name: 'John Doe' 
            }; BUT I want to search to return name matching entered InvNo
            */

            // Make a request to ADD our enteredInvoice object to the object store <-----------SEARCH DB
            let request = objectStore.add(enteredInvoice); // add new record which creates a request object

            request.onsuccess = function () {
                // Clear the form, ready for adding the next entry
                invoiceInput.value = '';
                // OR else call some method to add individually
            };

            // Report on the success of the transaction completing, when everything is done - guarantees that transaction is saved a whole
            transaction.oncomplete = function () {
                console.log('Invoice number added.'); // BUT MINE IS SEARCHING FOR AN EXISTING InvNo

                // update the display of data to show the newly added item, by running displayData() again.
                displayData(); // when the rquest succeeds, update the display of notes on the page
            };

            transaction.onerror = function () {
                console.log('Transaction not opened due to error');
            };
        }

        /* ******* 3. DISPLAYING THE DATA ******* */
        // DEFINE the displayData() function
        function displayData() {
            // Here we empty the contents of the list element each time the display is updated
            // If you don't do this, you'll get duplicates listed each time a new note is added
            while (list.firstChild) { // i.e. inside the <ul> element
                list.removeChild(list.firstChild);
            }

            // Open our object store (chained in 1 line)
            let invoiceOS = db.transaction('invoice'/*, 'readonly'*/).objectStore('invoice'); 
            /* get a cursor - which iterates through all the different data items in the store 
                ********************************************************************************************************
                ******************** SYNTAX: objectStore.openCursor(query, [direction]); *******************************
             *  ******************** query == a key, direction is option as 'next' (upwards from low to high), *********
             *  ******************** 'prev' (downwards from high to low) 'nextunique' **********************************
             *  ******************** 'prevunique' (skip to get only unique ones) ***************************************
             *  ********************************************************************************************************
             * A cursor is an obj that traverses the object storage, given a query, and returns one key/value at a time
             * It saves memory unlike get(), getALL(), getALLKeys(), which return an array of key/value
            */
            // below is chained. Instead of: let request =  objectStore.openCursor(); then request.onsuccess = function (e) { ... }
            // below allows me to display all the invoices
            invoiceOS.openCursor().onsuccess = function (e) { // triggers multiple times, once per result
                // Get a reference to the cursor - walks the store in key order (ascending by default)
                let cursor = e.target.result;
                // Then USE the cursor. If there is still another data item to iterate through, keep running this code
                if (cursor) { // check if the cursor contains a record from the datastore 
                                    /* javascript.info example:
                                    if (cursor) {
                                        let key = cursor.key; // id field, our actual inv# 
                                        let value = cursor.value; // invoice obj
                                        console.log(key, value);
                                        cursor.continue;
                                    } else {
                                        console.log("no more invoices");
                                    }
                                    */
                    // If so, create a (DOM fragment) list item, h3, and p to put each data item inside when displaying it.
                    // structure the HTML fragment, and append it inside the list
                    const listItem = document.createElement('li');
                    const h3 = document.createElement('h3'); // <h3>LC5600</h3>
                    // const para = document.createElement('p'); 

                    // populate the DOM* fragment with the data from the record
                    listItem.appendChild(h3); // number on invoice
                    // listItem.appendChild(para); 
                    list.appendChild(listItem);

                    // Put the data from the cursor inside the h3 and para
                    h3.textContent = cursor.value.invoice; // insert it* into the page (inside the <ul> element)
                    // para.textContent = cursor.value.name;

                    // Store the ID of the data item inside an attribute on the listItem, so we know
                    // which item it corresponds to. This will be useful later when we want to delete items
                    listItem.setAttribute('data-invoice-id', cursor.value.id);                    

                    // Create a button and place it inside each listItem
                    const deleteBtn = document.createElement('button');
                    listItem.appendChild(deleteBtn);
                    deleteBtn.textContent = 'Delete';

                    // Set an event handler so that when the button is clicked, the deleteItem() function is run
                    deleteBtn.onclick = deleteItem;

                    // Create another button and place it inside same listItem
                    const writeBtn = document.createElement('button');
                    listItem.appendChild(writeBtn);
                    writeBtn.textContent = 'Write a review';

                    // Set an event handler so that when the button is clicked, the reviewItem() function is run
                    writeBtn.onclick = reviewItem;

                    // Iterate to the next item in the cursor
                    cursor.continue(); //  advance the cursor to the next record in the datastore, and run the content of the if block again
                    // If there is another record to iterate to, this causes it to be inserted into the page, and then continue() is run again, and so on
                } else {
                    // Again, if list item is empty, display a 'No notes stored' message
                    if (!list.firstChild) {
                        const listItem = document.createElement('li');
                        listItem.textContent = 'No invoices stored.';
                        list.appendChild(listItem);
                    }
                    // if there are no more cursor items to iterate through, say so
                    console.log('Invoices all displayed');
                }
            };
        }

       
        /* ******* 4. DELETING DATA - after a star + review has been done ******* */
        // DEFINE the deleteItem() function
        function deleteItem(e) {
            // retrieve the name of the task we want to delete. We need to convert it to a number before trying it use it with IDB; 
            // IDB key values are type-sensitive
            let invoiceId = Number(e.target.parentNode.getAttribute('data-invoice-id'));
            // NB: data-invoice-id is a string and so MUST be passed to global built-in Number() object which expects a number

            // open a database transaction and delete the task, finding it using the id we retrieved above
            let transaction = db.transaction(['invoice'], 'readwrite'); // readwrite LOCKS the store for writing
            let invoiceOS = transaction.objectStore('invoice');
            let request = invoiceOS.delete(invoiceId); // delete the record from the database, passing it the ID

            // report that the data item has been deleted
            transaction.oncomplete = function () {
                // delete the parent of the button
                // which is the list item, so it is no longer displayed
                e.target.parentNode.parentNode.removeChild(e.target.parentNode);
                // console.log('Invoice ' + invoiceId + ' deleted.');
                alert('Invoice ' + invoiceId + ' deleted.');

                // Again, if list item is empty, display a 'No notes stored' message
                if (!list.firstChild) {
                    let listItem = document.createElement('li');
                    listItem.textContent = 'No invoices stored.';
                    list.appendChild(listItem);
                }

                 // Clean up: close connection oncee the transaction has successfully complete
                transaction.oncomplete = () => {
                db.close();
                }
            };
            // Can also delete everything in store - clears storage
            
        }

        /* ******* 4. DEFINE the searchData() function -  NOT TESTED YET. NEED TO LOAD Invoices 1st
                        - example uses getALL() not found in this VSCode version 1.46.1 (See cursors code!!) ******* */
        function searchData(e) {
            // prevent default - we don't want the form to submit in the conventional way
            e.preventDefault();
            // open a Read db transaction against invoices_os object, ready for reading the data
            let transaction = db.transaction(['invoice'], 'readonly'); 
            // call an object store that's already been added to the database
            let invoiceOS = transaction.objectStore('invoice');
           // let invoiceIndex = objectStore.index("invoice_idx"); declared/defined in onupgradeneeded()
                    
           let request = invoiceIndex.getAttribute(invoiceInput); // objectStore.getAll() ?no such method
    
           request.onsuccess = function() {
               if(request.result !== undefined) {
                   console.log("Invoice", request.result); // array of invoices with invoiceNo = ?               
               } else {
                   console.log("No such invoice");
               }
               // delete invoice from DB
               deleteItem(invoiceIndex);

               transaction.oncomplete = () => {
                db.close();
           }
        } 

        function reviewItem(e) { }
        /* Clean up: close connection - Once the transaction has successfully complete, we close our database connection.
        transaction.oncomplete = () => {
            db.close();
        };*/
    }

    // runs once at start to load list of invoices - some will have been deleted after review written
    function loadInvoices() { // as ArrayBuffers
        // var invNo = []
    }
})();


/* To delete a database
        let deleteRequest = indexedDB.deleteDatabase(name)
            ** track result with deleteRequest.onsuccess/onerror
 */


/* Database operations take time. 
           You don't want to hang the browser while you wait for the results, so database operations are asynchronous, 
           meaning that instead of happening immediately, they will happen at some point in the future, 
           and you get notified when they're done.
        
           Are TWO approaches to perfoming a database upgrade
            1. implement per-version upgrade fuctions: 1 to 2, 2 to 3 etc OUTSIDE onupgradeneeded
            Then INSIDE onupgradeneeded, compare versions (e.g. what was 2 is now 4) 
                and run per-version upgrades step-by-step, for every intermediate version: 2 to 3, 3 to 4
    
            2. just examine the database i.e. get a list of existing object stores as db.objectStoreNames, 
                a DOMStringList, which has the contains(name) method to check for existence.
                This approach is simpler, esp for small databases
                DEMO:
                let request = window.indexedDB.open('dbInvoices', 2);
            
                request.onupgradeneeded = function (e) { 
                    *the existing database version is less than 2 (or doesn't exist)
                    let db = request.result;
    
                    if(!db.objectStoreNames.contains('invoices_os')) ** if there isn't a invoices store
                    let objectStore = db.createObjectStore('invoices_os', { keyPath: 'id', autoIncrement: true }); ** create it
                    ** to delete an object store
                    db.deleteObjectStore('invoices_os');
                }
            
        E.G. when app is updated and need to upgrade database to next version, could:
            let request = window.indexedDB.open('dbInvoices', 2);
            
            request.onupgradeneeded = function (e) { 
                *the existing database version is less than 2 (or doesn't exist)
                let db = request.result;
                switch(e.oldVersion) {
                    case 0:
                        //version 0 means that the client had no database, a new user to our website
                        // perform initialization
                    case 1:
                        // client had version 1
                        // update
                }
    
            request.onerror = function () {
            console.log('Database failed to open');
            };
    
            request.onsuccess = function () {
                let db = request.result;
                // code to handle a PARALLEL UPGRADE if differing versions of the same database are open e.g. in separate tabs 
                db.onversionchange = function() { // ADDED AFTER SUCCESSFUL OPENING TO BE NFORMED OF PARALLEL UPDATE ATTEMPT
                    db.close();
                    alert("Database is outdated, please reload the page.");
                }  
            };
            **  If there's another open connection to the SAME database, this function triggers
            request.onblocked = function() {
                ** it SHOULDN'T if db.onversionchange was handled correctly VIA db.close();
                means that subsequent connection wasn't closed after db.onversionchange triggered
            } 
*/

/* ALL data operations must be made within a transaction in IndexedDB
   A failed request automatically aborts the transaction, cancelling all its changes
*/

/* ******* 1. SEARCHING DATABASE 
            Either by A KEY/KEY RANGE i.e. invoice_db.Id - not stored here because the invNo is unique
            OR by ANOTHER OBJECT FIELD e.g. invoice_db.invoiceNo ******* 
        //form.onsubmit = searchData;
*/


/* Implementing CRUD operations
The process flow for all CRUD operations is:
    open a database connection
    initiate a transaction
    indicate which object store to use
    perform the action on that store
    clean up
*/

/* TEST: - NOT WORKING
    const generateRandomString = function (length, randomString = "\LC\d[0-9]{3}") {
    let generateRandomString = function generateRandomInvNo(length, randomString = "") { 
    var generateRandomString;
    function generateRandomInvNo(length, randomString = "\LC\d[0-9]{3}") {
        try {
            randomString += Math.random().toString(20).substr(2, length);
            if (randomString.length > length)
                return randomString.slice(0, length);
        } catch (err) {
            console.log("this is the ", err, "I am getting");
        }
        // expected output: TypeError: invalid assignment to const `number'
        // Note - error messages will vary depending on browser
        return generateRandomString(length, randomString);
    };
*/
