// REF: https://developers.google.com/web/ilt/pwa/working-with-indexeddb

// EXAMPLE: IndexedDB using promises

(function () { // SAME AS writing an anonymous function (() => {
  'use strict';

  // CHECK FOR SUPPORT
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }
/* NOT WORKING BECAUSE OF idb.open(...) */
  // To OPEN a database, return a promise that resolves to a database object
  var dbPromise = idb.open('dbInvoices', 1, function (upgradeDb) { // idb.open(name, version, upgradeCallback)
    // console.log('making new object stores');
    /* CREATE object stores, invoice + review 
    -  A well structured IndexedDB database should have ONE object store for EACH type of data you need to persist
    */
    if (!upgradeDb.objectStoreNames.contains('invoice')) {
      console.log('Creating the invoice store');
      var invoiceStore = upgradeDb.createObjectStore('invoice', { keyPath: 'invoiceID', autoIncrement: true });
      // Indexes are updated every time you write data to the reference object store
      console.log('Creating a invNumber index');
      invoiceStore.createIndex('invNumber', 'invNumber', { unique: true }); 
      console.log('Creating a name index');
      invoiceStore.createIndex('name', 'name', { unique: false }); 
    }
    if (!upgradeDb.objectStoreNames.contains('review')) {
      var reviewStore = upgradeDb.createObjectStore('review', { keyPath: 'reviewID', autoIncrement: true });
      console.log('Creating a notes index'); // in MySQL, invNumber is FK. So how do I link it here?
      reviewStore.createIndex('notes', 'notes'); /* , { unique = true } --- not sure if required */
    }
    /* CRUD
    All data operations in IndexedDB are carried out inside a transaction. Each operation has this form:
      Get database object
      Open transaction on database
      Open object store on transaction
      Perform operation on object store
    */
    /* ADD/Create data. ALL 'readwrite' MUST have a transaction.complete method to ensure it worked at db level
    Add occurs within a transaction, so even if the promise resolves successfully it doesn't necessarily mean the operation worked.
    To be sure that the add operation was carried out, we need to check if the whole transaction has completed using the 
    transaction.complete method. transaction.complete is a promise that resolves when the transaction completes 
    and rejects if the transaction errors.*/
    dbPromise.then(function (db) {
      var tx = db.transaction('invoice', 'readwrite');
      invoiceStore = tx.objectStore('invoice');
      var newInv = {
        invNumber: 'LC4578'
      };
      invoiceStore.add(newInv);
      return tx.complete;
    }).then(function () {
      console.log('added newInv to the invoice object store!');
    });


  });

})();
