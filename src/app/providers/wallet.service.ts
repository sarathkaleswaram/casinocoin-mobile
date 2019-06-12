import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LogService } from './log.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Observable, BehaviorSubject } from 'rxjs';
import { Subject } from 'rxjs';
import { LocalStorageService, SessionStorageService } from "ngx-store";
import { AppConstants } from '../domain/app-constants';
import { CSCUtil } from '../domain/csc-util';
import { CSCCrypto } from '../domain/csc-crypto';
import { NotificationService, SeverityType } from '../providers/notification.service';
import { CasinocoinKeypairs } from 'casinocoin-libjs';
import Big from 'big.js';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const LZString = require('lz-string');


import * as loki from 'lokijs';
import * as LokiTypes from '../domain/lokijs';
import { LokiKey } from '../domain/lokijs';

// const lfsa = require('../../../node_modules/lokijs/src/loki-fs-structured-adapter.js');
const LokiIndexedAdapter = require('../../../node_modules/lokijs/src/loki-indexed-adapter.js');
// const LokiCordovaFSAdapter = require("loki-cordova-fs-adapter");

@Injectable()
export class WalletService {

  private lokiAdapter;

  private walletDB;
  private dbMetadata;
  private accounts;
  private transactions;
  private addressbook;
  private logs;
  private keys;
  private swaps;
 
  public isWalletOpen: boolean = false;
  public openWalletSubject = new BehaviorSubject<string>(AppConstants.KEY_INIT);
  public mnemonicSubject = new BehaviorSubject<string>("");

  public balance:string = this.getWalletBalance();
  public txCount:number = this.getWalletTxCount();
  public lastTx:LokiTypes.LokiTransaction = this.getWalletLastTx();
  public currentDBMetadata: LokiTypes.LokiDBMetadata;

  public appVersionString: string = "";
  public walletPIN: string;
  public contactAccountID: string = "";

  constructor(private logger: LogService, 
              private platform: Platform,
              private localStorageService: LocalStorageService,
              private sessionStorageService: SessionStorageService,
              private notificationService: NotificationService,
              private appVersion: AppVersion ) {
    this.logger.debug("### INIT WalletService ###");
    console.log("### Platform Cordova: " + this.platform.is('cordova'));
    if (this.platform.is('cordova')) {
      this.appVersion.getVersionNumber().then(value => {
        this.appVersionString = value;
      });
//      this.lokiAdapter = new LokiCordovaFSAdapter({"prefix": "loki"});
    } else {
      this.appVersionString = "0.1.0.browser";
//      this.lokiAdapter = new LokiIndexedAdapter("casinocoin");
    }
   }

  createWallet( walletUUID: string, 
                walletSecret: string, 
                environment:LokiTypes.LokiDBEnvironment,
                mnemonicRecovery: string ): Observable<any> {
    // create wallet for UUID
    this.logger.debug("### WalletService Create UUID: " + walletUUID);   
    let dbPath = walletUUID + '.db';
    this.logger.debug("### WalletService Database File: " + dbPath);
    this.localStorageService.set(AppConstants.KEY_WALLET_LOCATION, dbPath);
    this.localStorageService.set(AppConstants.KEY_WALLET_MNEMONIC_RECOVERY, mnemonicRecovery);
    let collectionSubject = new Subject<any>();
    let createSubject = new Subject<any>();
    createSubject.subscribe(result => {
      if(result == AppConstants.KEY_FINISHED){
        this.openWalletSubject.next(AppConstants.KEY_LOADED);
        this.currentDBMetadata = this.getDBMetadata();
      }
    });

    collectionSubject.subscribe( collection => {
      this.logger.debug("### WalletService - collection: " + JSON.stringify(collection));
      if(collection.name == "dbMetadata"){
        this.dbMetadata = collection;
        let initDBVersion: LokiTypes.LokiDBMetadata = {
          dbVersion: AppConstants.KEY_DB_VERSION,
          appVersion: this.appVersionString,
          environment: environment,
          walletUUID: walletUUID,
          walletHash: this.generateWalletPasswordHash(walletUUID, walletSecret),
          mnemonicRecovery: mnemonicRecovery,
          creationTimestamp: CSCUtil.unixToCasinocoinTimestamp(Date.now()),
          updatedTimestamp: CSCUtil.unixToCasinocoinTimestamp(Date.now()),
          location: dbPath,
          lastOpenedTimestamp: CSCUtil.unixToCasinocoinTimestamp(Date.now())
        }
        this.dbMetadata.insert(initDBVersion);
      } else if(collection.name == "accounts")
        this.accounts = collection;
      else if(collection.name == "transactions")
        this.transactions = collection;
      else if(collection.name == "addressbook")
        this.addressbook = collection;
      else if(collection.name == "log")
        this.logs = collection;
      else if(collection.name == "keys")
        this.keys = collection;
      else if(collection.name == "swaps")
        this.swaps = collection;
      this.isWalletOpen = true;
    });
    
    /*if (this.platform.is('cordova')) {
      this.lokiAdapter = new LokiCordovaFSAdapter({"prefix": "loki"});
    } else {
      this.lokiAdapter = new LokiIndexedAdapter("casinocoin");
    }*/
    this.lokiAdapter = new LokiIndexedAdapter("casinocoin");
    let walletDB = new loki(dbPath, 
      { adapter: this.lokiAdapter,
        autoloadCallback: createCollections,
        autoload: true, 
        autosave: true, 
        autosaveInterval: 5000
    });

    function createCollections() {
      console.log("### WalletService - createCollections");
      collectionSubject.next(walletDB.addCollection("dbMetadata", {unique: ["dbVersion"]}));
      collectionSubject.next(walletDB.addCollection("accounts", {unique: ["accountID"]}));
      collectionSubject.next(walletDB.addCollection("transactions", {unique: ["txID"]}));
      collectionSubject.next(walletDB.addCollection("addressbook", {unique: ["accountID"]}));
      collectionSubject.next(walletDB.addCollection("log"));
      collectionSubject.next(walletDB.addCollection("keys", {unique: ["accountID"]}));
      collectionSubject.next(walletDB.addCollection("swaps", {unique: ["swapID"]}));
      createSubject.next(AppConstants.KEY_FINISHED);
    }
    this.walletDB = walletDB;
    return createSubject.asObservable();
  }
  
  openWallet(walletUUID: string): Observable<string> {
    this.logger.debug("### WalletService openWallet: " + walletUUID);
    let dbPath = walletUUID + '.db';
    this.logger.debug("### WalletService Open Wallet location: " + dbPath);

    let collectionSubject = new Subject<any>();
    let openSubject = new Subject<string>();
    openSubject.subscribe(result => {
      this.logger.debug("### WalletService openWallet: " + result);
      if(result == AppConstants.KEY_LOADED){
        // notify open complete
        this.currentDBMetadata = this.getDBMetadata();
        this.openWalletSubject.next(result);
        // let msg: NotificationType = {severity: SeverityType.info, title:'Wallet Message', body:'Succesfully opened the wallet.'};
        // this.notificationService.addMessage(msg);
      }
    });
    let openError = false;

    collectionSubject.subscribe( collection => {
      if(collection != null) {
        this.logger.debug("### WalletService Open Collection: " + collection.name)
        if(collection.name == "dbMetadata"){
          this.dbMetadata = collection;
        } else if(collection.name == "accounts")
          this.accounts = collection;
        else if(collection.name == "transactions")
          this.transactions = collection;
        else if(collection.name == "addressbook")
          this.addressbook = collection;
        else if(collection.name == "log")
          this.logs = collection;
        else if(collection.name == "keys")
          this.keys = collection;
        else if(collection.name == "swaps")
          this.swaps = collection;
        this.isWalletOpen = true;
      } else {
        openError = true;
        openSubject.next(AppConstants.KEY_ERRORED);
      }
    });
  
    /*if (this.platform.is('cordova')) {
      this.lokiAdapter = new LokiCordovaFSAdapter({"prefix": "loki"});
    } else {
      this.lokiAdapter = new LokiIndexedAdapter("casinocoin");
    }*/
    this.lokiAdapter = new LokiIndexedAdapter("casinocoin");
    let walletDB = new loki(dbPath, 
      { adapter: this.lokiAdapter,
        autoload: true, 
        autoloadCallback: function openCollections(result){
          // check if dbMetadata exists as we added it later ....
          let dbMeta = walletDB.getCollection("dbMetadata");
          if(dbMeta == null){
            walletDB.addCollection("dbMetadata", {unique: ["dbVersion"]});
          }
          collectionSubject.next(walletDB.getCollection("dbMetadata"));
          collectionSubject.next(walletDB.getCollection("accounts"));
          collectionSubject.next(walletDB.getCollection("transactions"));
          collectionSubject.next(walletDB.getCollection("addressbook"));
          collectionSubject.next(walletDB.getCollection("log"));
          collectionSubject.next(walletDB.getCollection("keys"));
          collectionSubject.next(walletDB.getCollection("swaps"));
          if(!openError){
            openSubject.next(AppConstants.KEY_LOADED);
          }
        },
        autosave: true, 
        autosaveInterval: 5000
    });

    this.walletDB = walletDB;
    return this.openWalletSubject.asObservable();
  }
  
  // close the wallet
  closeWallet(){
    // first save any open changes
    if(this.walletDB != null){
      this.walletDB.saveDatabase();
    }
    // reset all collection objects
    this.dbMetadata = null;
    this.accounts = null;
    this.transactions = null;
    this.addressbook = null;
    this.logs = null;
    this.keys = null;
    this.swaps = null;
    // set wallet open to false
    this.isWalletOpen = false;
    // reset wallet object
    this.walletDB = null;
    // publish result
    this.openWalletSubject.next(AppConstants.KEY_INIT);
  }

  deleteWallet() {
    this.logger.debug("### WalletService - Delete Wallet");
    this.openWalletSubject = new BehaviorSubject<string>(AppConstants.KEY_INIT);
    this.lokiAdapter.deleteDatabase(this.localStorageService.get(AppConstants.KEY_WALLET_LOCATION));
    this.localStorageService.clear('all');
    this.sessionStorageService.clear('all');
  }

  changePin(currentPin:string, newPin: string, newPinMnemonic: string) {
    // generate wallet hash with walletUUID and new Pin
    this.logger.debug("### ChangePin - Encrypt Wallet Pin");
    let newPinHash = this.generateWalletPasswordHash(this.currentDBMetadata.walletUUID, newPin); 
    this.localStorageService.set(AppConstants.KEY_WALLET_MNEMONIC_RECOVERY, newPinMnemonic);
    
    // Decrypt all keys with old pin and update DB
    this.logger.debug("### ChangePin - Decrypt Wallet Keys with Old Pin");
    let cscCrypto = new CSCCrypto(currentPin, this.localStorageService.get(AppConstants.CSC_CRYPTO_SALT));
    let allKeys: Array<LokiTypes.LokiKey> = this.keys.find();
    allKeys.forEach( (element, index, array) => {
      element.privateKey = cscCrypto.decrypt(element.privateKey);
      element.secret = cscCrypto.decrypt(element.secret);
      element.encrypted = false;
      this.updateKey(element);
    });

    // Encrypt all keys with new pin
    this.logger.debug("### ChangePin - Encrypt Wallet Keys with New Pin");
    this.encryptAllKeys(newPin).subscribe( result => {
      if(result == AppConstants.KEY_FINISHED){
        this.logger.debug("### WalletService Pin Changed");
      }
    });

    // update Pin in LokiDBMetadata with new Pin and new mnemonic recovery
    this.currentDBMetadata.walletHash = newPinHash;
    this.currentDBMetadata.mnemonicRecovery = newPinMnemonic; 
    this.dbMetadata.update(this.currentDBMetadata);
    
    //save wallet
    this.saveWallet();
  }

  // encrypt secret key
  encryptSecretKey(decryptPin: string) {
    let cscCrypto = new CSCCrypto(decryptPin, this.localStorageService.get(AppConstants.CSC_CRYPTO_SALT));
    let allKeys: Array<LokiTypes.LokiKey> = this.keys.find();
    allKeys.forEach( (element, index, array) => {
      if(!element.encrypted){
        element.secret = cscCrypto.encrypt(element.secret);
      }
      element.encrypted = true;
      this.updateKey(element);
    });
  }

  getMnemonicRecovery(): string {
    let dbMetadata = this.getDBMetadata();
    this.closeWallet();
    return dbMetadata.mnemonicRecovery;
  }

  getWalletMnemonic(walletUUID: string, walletLocation: string){
    let dbPath = path.join(walletLocation, (walletUUID + '.db'));
    this.logger.debug("### WalletService mnemonic Wallet location: " + dbPath);

    let collectionSubject = new Subject<any>();
    let openSubject = new Subject<string>();
    openSubject.subscribe(result => {
      this.logger.debug("### WalletService openWallet: " + result);
      if(result == AppConstants.KEY_LOADED){
        // get db info
        let dbMetadata = this.getDBMetadata();
        this.mnemonicSubject.next(dbMetadata.mnemonicRecovery);
        // close the database
        this.closeWallet();
      }
    });
    let openError = false;

    if (!fs.existsSync(dbPath)){
      this.logger.debug("### WalletService, DB does not exist: " + dbPath);
      openSubject.next(AppConstants.KEY_ERRORED);
    } else {
      collectionSubject.subscribe( collection => {
        if(collection != null) {
          this.logger.debug("### WalletService Open Collection: " + collection.name)
          if(collection.name == "dbMetadata"){
            this.dbMetadata = collection;
          }
          this.isWalletOpen = true;
        } else {
          openError = true;
          openSubject.next(AppConstants.KEY_ERRORED);
        }
      });
  
      //let cordovaAdapter = new LokiCordovaFSAdapter({"prefix": "loki"});
      let cordovaAdapter = new LokiIndexedAdapter("casinocoin");
      // let lokiFsAdapter = new lfsa();
      // let idbAdapter = new LokiIndexedAdapter('casinocoin');
      let walletDB = new loki(dbPath, 
        { adapter: cordovaAdapter,
          autoloadCallback: openCollections,
          autoload: true, 
          autosave: true, 
          autosaveInterval: 5000
      });
  
      function openCollections(result){
        // check if dbMetadata exists as we added it later ....
        collectionSubject.next(walletDB.getCollection("dbMetadata"));
        if(!openError){
          openSubject.next(AppConstants.KEY_LOADED);
        }
      }
      this.walletDB = walletDB;
    }
    return this.mnemonicSubject.asObservable();
  }

  // allow for a hard save on app exit
  saveWallet(){
    this.walletDB.saveDatabase();
  }

  updateDBMetadataVersion(newVersion: string){
    let initDBVersion: LokiTypes.LokiDBMetadata = {
      dbVersion: newVersion,
      appVersion: this.appVersionString,
      environment: this.currentDBMetadata.environment,
      walletUUID: this.currentDBMetadata.walletUUID,
      walletHash: this.currentDBMetadata.walletHash,
      mnemonicRecovery: this.currentDBMetadata.mnemonicRecovery,
      creationTimestamp: this.currentDBMetadata.creationTimestamp,
      updatedTimestamp: CSCUtil.unixToCasinocoinTimestamp(Date.now()),
      location: this.currentDBMetadata.location,
      lastOpenedTimestamp: CSCUtil.unixToCasinocoinTimestamp(Date.now())
    }
    this.dbMetadata.insert(initDBVersion);
  }

  // #########################################
  // DB Metadata Collection
  // #########################################
  getDBMetadata(): LokiTypes.LokiDBMetadata {
    return this.dbMetadata.chain().find().simplesort("updatedTimestamp", true).data()[0];
  }

  addDBMetadata(newDBMetadata: LokiTypes.LokiDBMetadata): LokiTypes.LokiDBMetadata {
    let insertMetadata = this.dbMetadata.insert(newDBMetadata);
    return insertMetadata;
  }

  getAllDBMetadata(): Array<LokiTypes.LokiDBMetadata> {
    return this.dbMetadata.find();
  }

  // #########################################
  // Accounts Collection
  // #########################################
  addAccount(newAccount: LokiTypes.LokiAccount): LokiTypes.LokiAccount {
    let insertAccount = this.accounts.insert(newAccount);
    return insertAccount;
  }

  getAccount(accountID: string): LokiTypes.LokiAccount {
    if(this.isWalletOpen){
      if(this.accounts.count() > 0){
        return this.accounts.findOne({'accountID': {'$eq': accountID}});
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getAllAccounts(): Array<LokiTypes.LokiAccount> {
    return this.accounts.find();
  }

  updateAccount(account: LokiTypes.LokiAccount){
    this.accounts.update(account);
  }

  getAccountBalance(accountID: string): string {
    let account = this.getAccount(accountID);
    if(account){
      return account.balance;
    } else {
      return "0";
    }
  }

  isAccountMine(accountID: string): boolean {
    return (this.accounts.findOne({'accountID': {'$eq': accountID}}) != null);
  }

  isDefaultAccountMine(accountID: string): boolean {
    return (this.accounts.findOne({'accountID': {'$eq': accountID}, 'label' : 'Default Account'}) != null);
  }

  isSenderAccountOperator(accountID: string): boolean {
    return (this.accounts.findOne({'accountID': {'$eq': accountID}}) != null);
  }

  removeAccount(accountID: string) {
    this.accounts.findAndRemove({accountID: accountID});
    this.accounts.ensureId();
  }

  getAccountsMaxSequence(): number {
    return this.accounts.chain().find().simplesort("accountSequence", true).limit(1).data()[0].accountSequence;
  }
  
  // #########################################
  // Keys Collection
  // #########################################
  addKey(newKey: LokiTypes.LokiKey): LokiTypes.LokiKey {
    let insertedKey = this.keys.insert(newKey);
    return insertedKey;
  }

  getKey(accountID: string): LokiTypes.LokiKey {
    if(this.isWalletOpen){
      if(this.keys.count() > 0){
        return this.keys.findOne({'accountID': {'$eq': accountID}});
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getAllKeys(): Array<LokiTypes.LokiKey> {
    return this.keys.find();
  }

  updateKey(key: LokiTypes.LokiKey){
    this.keys.update(key);
  }

  removeKey(accountID: string) {
    this.keys.findAndRemove({accountID: accountID});
  }

  // #########################################
  // Swaps Collection
  // #########################################
  addSwap(newSwap: LokiTypes.LokiSwap): LokiTypes.LokiSwap{
    let insertedSwap = this.swaps.insert(newSwap);
    return insertedSwap;
  }

  getSwap(swapID: string): LokiTypes.LokiSwap {
    if(this.isWalletOpen){
      if(this.swaps.count() > 0){
        return this.swaps.findOne({'swapID': {'$eq': swapID}});
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getAllSwaps(): Array<LokiTypes.LokiSwap> {
    if(this.isWalletOpen){
      return this.swaps.chain().find().simplesort("updatedTimestamp", true).data();
    } else {
      return [];
    }
  }

  getSwapsFromTimestamp(checkTime: number): Array<LokiTypes.LokiSwap> {
    if(this.isWalletOpen){
      return this.swaps.find({ initiatedTimestamp: {'$gte': checkTime} });
    } else {
      return [];
    }
  }

  updateSwap(swap: LokiTypes.LokiSwap){
    this.swaps.update(swap);
  }

  // #########################################
  // Logs Collection
  // #########################################
  addLog(newLog: LokiTypes.LokiLog): LokiTypes.LokiLog{
    let insertedLog = this.logs.insert(newLog);
    return insertedLog;
  }

  getLog(timestamp: number): LokiTypes.LokiLog {
    return this.logs.findOne({'timestamp': {'$eq': timestamp}});
  }

  getAllLogs(): Array<LokiTypes.LokiLog> {
    if(this.isWalletOpen){
      return this.logs.find();
    } else {
      return [];
    }
  }

  // #########################################
  // Transactions Collection
  // #########################################
  addTransaction(newTransaction: LokiTypes.LokiTransaction): LokiTypes.LokiTransaction {
    let tx = this.getTransaction(newTransaction.txID);
    this.logger.debug("### WalletService - addTransaction: " + JSON.stringify(tx));
    if(tx == null){
      return this.transactions.insert(newTransaction);
    } else {
      return tx;
    }
  }

  getTransaction(inputTxID: string): LokiTypes.LokiTransaction {
    if(this.isWalletOpen){
      if(this.transactions.count() > 0){
        return this.transactions.findOne({'txID': {'$eq': inputTxID}});
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getAllTransactions(): Array<LokiTypes.LokiTransaction> {
    // return all transactions sorted by descending timestamp
    return this.transactions.chain().find().simplesort("timestamp", true).data();
  }

  getTransactionsLazy(offset: number, limit: number):Array<LokiTypes.LokiTransaction> {
    // return all transactions sorted by descending timestamp for offset and limit
    return this.transactions.chain().find()
                                    .simplesort("timestamp", true)
                                    .offset(offset)
                                    .limit(limit)
                                    .data();
  }

  getUnvalidatedTransactions(): Array<LokiTypes.LokiTransaction> {
    return this.transactions.find({ validated: false });
  }

  updateTransaction(transaction: LokiTypes.LokiTransaction): LokiTypes.LokiTransaction {
    let tx = this.getTransaction(transaction.txID);
    this.logger.debug("### WalletService - updateTransaction: " + JSON.stringify(tx));
    if(tx == null){
      return this.transactions.insert(transaction);
    } else {
      return this.transactions.update(transaction);
    }    
  }

  getAccountTransactions(inputAccountID: string): Array<LokiTypes.LokiTransaction>{
    // return all validated transactions for an account id sorted by ascending ledger index
    return this.transactions.chain().find(
      { $or: [{ accountID: inputAccountID, validated: true}, {destination: inputAccountID, validated: true}]}
    ).simplesort("inLedger", false).data();
  }

  getAccountTXBalance(inputAccountID: string): string {
    // get all transactions
    let totalBalance: Big = new Big("0");
    let allAccountTX: Array<LokiTypes.LokiTransaction> = this.getAccountTransactions(inputAccountID);
    allAccountTX.forEach(element => {
      // if accountID == inputAccountID its outgoing else its incomming
      if(element.accountID == inputAccountID){
        totalBalance = totalBalance.minus(element.amount);
        // also remove fees
        totalBalance = totalBalance.minus(element.fee);
      } else if(element.destination == inputAccountID){
        if(element.amount) {
          totalBalance = totalBalance.plus(element.amount);
        }
      }
    });
    // special case for the genesis account that was initialized with 40.000.000.000 coins
    if(inputAccountID == "cHb9CJAWyB4cj91VRWn96DkukG4bwdtyTh"){
      totalBalance = totalBalance.plus("4000000000000000000");
    }
    return totalBalance.toString();
  }

  isTransactionIndexValid(): boolean {
    let result = true;
    let idIndex = this.transactions.idIndex;
    let lastIndex = 0;
    idIndex.forEach(element => {
      if(element == (lastIndex + 1)){
        lastIndex = lastIndex + 1;
      } else {
        result = false;
      }
    });
    return result;
  }

  clearTransactions(){
    this.transactions.clear({removeIndices: true});
  }

  // #########################################
  // Addressbook Collection
  // #########################################
  addAddress(newAddress: LokiTypes.LokiAddress): LokiTypes.LokiAddress{
    let insertedAddress = this.addressbook.insert(newAddress);
    return insertedAddress;
  }

  getAddress(accountID: string): LokiTypes.LokiAddress {
    if(this.isWalletOpen){
      if(this.addressbook.count() > 0){
        return this.addressbook.findOne({'accountID': {'$eq': accountID}});
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getAllAddresses(): Array<LokiTypes.LokiAddress> {
      return this.addressbook.find();
  }

  updateAddress(address: LokiTypes.LokiAddress){
    this.addressbook.update(address);
  }

  removeAddress(accountID: string) {
    this.addressbook.findAndRemove({accountID: accountID});
  }

  // #########################################
  // Wallet Methods
  // #########################################
  generateWalletPasswordHash(walletUUID:string, password:string): string{
    let passwordHash = crypto.createHmac('sha256', password).update(walletUUID).digest('hex');
    return passwordHash;
  }

  checkWalletPasswordHash(password:string, inputWalletUUID?:string, inputWalletHash?:string): boolean {
    let walletUUID;
    if(inputWalletUUID){
      walletUUID = inputWalletUUID;
    } else {
      walletUUID = this.currentDBMetadata.walletUUID;
    }
    let walletHash;
    if(inputWalletHash){
      walletHash = inputWalletHash;
    } else {
      walletHash = this.currentDBMetadata.walletHash;
    }
    let passwordHash = crypto.createHmac('sha256', password).update(walletUUID).digest('hex');
    return (walletHash == passwordHash);
  }

  encryptAllKeys(password: string): Observable<string>{
    this.logger.debug("### WalletService encryptAllKeys ###");
    let encryptSubject = new BehaviorSubject<string>(AppConstants.KEY_INIT);
    // get all keys
    let allKeys: Array<LokiTypes.LokiKey> = this.keys.find();
    let cscCrypto = new CSCCrypto(password, this.localStorageService.get(AppConstants.CSC_CRYPTO_SALT));
    allKeys.forEach( (element, index, array) => {
      if(!element.encrypted){
        // encrypt private key
        let cryptedKey = cscCrypto.encrypt(element.privateKey);
        array[index].privateKey = cryptedKey;
        // encrypt secret
        let cryptedSecret = cscCrypto.encrypt(element.secret);
        array[index].secret = cryptedSecret;
        array[index].encrypted = true;
      }
      if(index == (array.length - 1)){
        encryptSubject.next(AppConstants.KEY_FINISHED);
      }
    });
    return encryptSubject.asObservable();
  }

  decryptAllKeys(password: string): Array<LokiTypes.LokiKey>{
    // check the wallet password
    // let availableWallets = this.localStorageService.get(AppConstants.KEY_AVAILABLE_WALLETS);
    // let currentWallet = this.localStorageService.get(AppConstants.KEY_CURRENT_WALLET);
    // let walletIndex = availableWallets.findIndex( item => item['walletUUID'] == currentWallet);
    // let walletObject = availableWallets[walletIndex];
    // this.logger.debug("### Check Wallet Password: " + JSON.stringify(walletObject));
    if(this.checkWalletPasswordHash(password)){
      // get all keys
      let allKeys: Array<LokiTypes.LokiKey> = this.keys.find();
      let decryptedKeys: Array<LokiTypes.LokiKey> = [];
      let cscCrypto = new CSCCrypto(password, this.localStorageService.get(AppConstants.CSC_CRYPTO_SALT));
      allKeys.forEach( (element, index, array) => {
        // decrypt key
        this.logger.debug("Decrypt["+index+"]: " + JSON.stringify(element));
        let decodedSecret:string = cscCrypto.decrypt(element.secret);
        let decodedKeypair = CasinocoinKeypairs.deriveKeypair(decodedSecret);
        // check if public key is the same
        if(decodedKeypair.publicKey == element.publicKey){
          // save decrypted values onto object
          let decodedKey: LokiKey = {
            accountID: element.accountID,
            publicKey: decodedKeypair.publicKey,
            privateKey: decodedKeypair.privateKey,
            secret: decodedSecret,
            encrypted: false
          }
          decryptedKeys.push(decodedKey);
        }
      });
      return decryptedKeys;
    } else {
      return [];
    }
  }

  getDecryptPrivateKey(password: string, walletKey: LokiTypes.LokiKey): string {
    let cscCrypto = new CSCCrypto(password, this.localStorageService.get(AppConstants.CSC_CRYPTO_SALT));
    let decodedSecret:string = cscCrypto.decrypt(walletKey.secret);
    let decodedKeypair = CasinocoinKeypairs.deriveKeypair(decodedSecret);
    if(decodedKeypair.publicKey == walletKey.publicKey){
      // password was correct, return decoded private key
      return decodedKeypair.privateKey;
    } else {
      return AppConstants.KEY_ERRORED;
    }
  }

  getDecryptSecret(password: string, walletKey: LokiTypes.LokiKey): string {
    let cscCrypto = new CSCCrypto(password, this.localStorageService.get(AppConstants.CSC_CRYPTO_SALT));
    let decodedSecret:string = cscCrypto.decrypt(walletKey.secret);
    let decodedKeypair = CasinocoinKeypairs.deriveKeypair(decodedSecret);
    if(decodedKeypair.publicKey == walletKey.publicKey){
      // password was correct, return decoded private key
      return decodedSecret;
    } else {
      return AppConstants.KEY_ERRORED;
    }
  }

  // encryptWalletPassword(password: string, words:Array<string>){
  //   // encrypt the wallet password with the words
  //   let encryptedPassword;
  //   // store the wallet password
  //   this.localStorageService.set(AppConstants.KEY_WALLET_PASSWORD, encryptedPassword);
  // }

  // decryptWalletPassword(words: Array<string>): string {
  //   // get the encrypted password
  //   let encryptedPassword = this.localStorageService.get(AppConstants.KEY_WALLET_PASSWORD);
  //   // decrypt the password
  //   let decryptedPassword;
  //   return decryptedPassword;
  // }

  importPrivateKey(keySeed:string, password:string){
    let newKeyPair: LokiTypes.LokiKey = { 
      privateKey: "", 
      publicKey: "", 
      accountID: "", 
      secret: "", 
      encrypted: false
    };
    let keypair = CasinocoinKeypairs.deriveKeypair(keySeed);
    newKeyPair.privateKey = keypair.privateKey;
    newKeyPair.publicKey = keypair.publicKey;
    newKeyPair.accountID = CasinocoinKeypairs.deriveAddress(keypair.publicKey);
    newKeyPair.secret = keySeed;
    // save the new private key
    this.addKey(newKeyPair);
    // add new account
    let walletAccount: LokiTypes.LokiAccount = {
      accountID: newKeyPair.accountID, 
      accountSequence: -1,
      balance: "0", 
      lastSequence: 0, 
      label: "Imported Private Key",
      activated: false,
      ownerCount: 0,
      lastTxID: "",
      lastTxLedger: 0
    };
    this.addAccount(walletAccount);
    // encrypt the keys
    this.encryptAllKeys(password).subscribe(result => {
      this.notificationService.addMessage( {severity: SeverityType.info, 
                                            title: 'Private Key Import', 
                                            body: 'The Private Key import is complete.'
                                           });
    });
  }
  
  getWalletBalance(): string {
    let totalBalance = new Big("0");
    this.logger.debug("### WalletService getWalletBalance, isWalletOpen: " + this.isWalletOpen);
    if(this.isWalletOpen){
      // loop over all accounts
      let accounts: Array<LokiTypes.LokiAccount> = this.accounts.find();
      accounts.forEach(element => {
        totalBalance = totalBalance.plus(element.balance);
      });
    }
    return totalBalance.toString();
  }

  getWalletTxCount(): number {
    if(this.isWalletOpen){
      return this.transactions.count();
    } else {
      return 0;
    }
  }

  getWalletLastTx(): LokiTypes.LokiTransaction {
    if(this.isWalletOpen){
      let txArray: Array<LokiTypes.LokiTransaction> = this.transactions.chain().find().simplesort("timestamp", true).data();
      if(txArray.length > 0){
        return txArray[0];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  getWalletDump(): string {
    return LZString.compressToBase64(this.walletDB.serialize());
  }

  importWalletDump(dumpContents: string){
    let decompressed = LZString.decompressFromBase64 (dumpContents);
    this.walletDB.loadJSON(decompressed);
  }
}
