import { Injectable } from '@angular/core';
import { LogService } from './log.service';
import { ToastController } from '@ionic/angular';

// var notifier = require('node-notifier');
// var path = require('path');

export enum SeverityType {
    info = "Info",
    error = "Error",
    warning = "Warning"
}

export interface NotificationType {
    severity?: SeverityType;
    title: string; 
    body: string;
}

@Injectable()
export class NotificationService {
    
    // private messagesSubject = new Subject<NotificationType>();
 
    constructor( private logger: LogService,
                 private toastCtrl: ToastController ) {
        this.logger.debug("### INIT NotificationService");
    }

    async addMessage(msg: NotificationType){
        this.logger.debug("### NotificationService: " + JSON.stringify(msg));
        let toast = await this.toastCtrl.create({
            message: msg.body,
            duration: 5000,
            position: 'top'
        });         
        toast.present();

        // let notificationOptions: NotificationOptions = {
        //     tag: "CasinoCoin",
        //     icon: path.join(__dirname, 'assets/casinocoin-icon-256x256.png'),
        //     body: msg.body
        // }
        // let notification = new Notification(msg.title, notificationOptions);
        // let options: Electron.NotificationConstructorOptions = {
        //     title: msg.title,
        //     body: msg.body
        // }
        // new this.electronService.remote.Notification({title: 'test', body: 'test body'});
        // notifier.notify({
        //     title: msg.title,
        //     message: msg.body,
        //     icon: path.join(__dirname, 'assets/casinocoin-icon-256x256.png'),
        //     sound: false,
        //     wait: false
        // });
    }
 
    // success(message: string, keepAfterNavigationChange = false, growl: boolean = true) {
    //     this.keepAfterNavigationChange = keepAfterNavigationChange;
    //     if(growl){
    //         this.growlsSubject.next({type: 'success', text: message});
    //     } else {
    //         this.messagesSubject.next({ type: 'success', text: message });
    //     }
    // }
 
    // error(message: string, keepAfterNavigationChange = false, growl: boolean = true) {
    //     this.keepAfterNavigationChange = keepAfterNavigationChange;
    //     if(growl){
    //         this.growlsSubject.next({type: ' error', text: message});
    //     } else {
    //         this.messagesSubject.next({ type: 'error', text: message });   
    //     }
    // }
 
    // getMessage(): Observable<any> {
    //     return this.messagesSubject.asObservable();
    // }

    // getGrowls(): Observable<any> {
    //     return this.growlsSubject.asObservable();
    // }
}