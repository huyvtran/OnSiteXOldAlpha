// import { TabsComponent                                       } from 'components/tabs/tabs'      ;
import { Log, moment, Moment, isMoment                       } from 'config/config.functions'   ;
import { Component, OnInit, OnDestroy, AfterViewInit,        } from '@angular/core'             ;
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular'             ;
import { Pipe, PipeTransform                                 } from '@angular/core'             ;
import { DomSanitizer                                        } from '@angular/platform-browser' ;
import { TranslateService                                    } from '@ngx-translate/core'       ;
import { DBSrvcs                                             } from 'providers/db-srvcs'        ;
import { SrvrSrvcs                                           } from 'providers/srvr-srvcs'      ;
import { SafePipe                                            } from 'pipes/safe'                ;
import { Message                                             } from 'domain/message'            ;
import { AlertService                                        } from 'providers/alerts'          ;
import { MessageService                                      } from 'providers/message-service' ;
import { TabsService                                         } from 'providers/tabs-service'    ;
import { Pages                                               } from 'config/config.types'       ;

@IonicPage({
  name: 'Message'
})
@Component({
  selector: 'page-message',
  templateUrl: 'message.html',
})

export class MessagePage implements OnInit {
  public lang:any;
  public language:any = "en";
  public title:string = "Message from Tino";
  public messages:Array<Message> = [];
  public message:Message = null;
  public pageReady:boolean = false;

  constructor(
    public navCtrl   : NavController    ,
    public navParams : NavParams        ,
    public translate : TranslateService ,
    public db        : DBSrvcs          ,
    public server    : SrvrSrvcs        ,
    public msg       : MessageService   ,
    // public tabs      : TabsComponent    ,
    public tabServ   : TabsService      ,
    public viewCtrl  : ViewController   ,
    public alert     : AlertService     ,
  ) {
    window["onsitemessages"] = this;
    if(this.navParams.get('message') !== undefined) { this.message = this.navParams.get('message');}
  }

  ionViewDidEnter() {
    Log.l('ionViewDidLoad MessagePage');
    this.language = this.translate.currentLang || "en";

    // this.server.fetchNewMessages().then(res => {
    //   Log.l("MessagesPage: got new message:\n", res);
    //   this.messages = res;
    //   this.message = this.messages[0];
    //   this.pageReady = true;
    // }).catch(err => {
    //   Log.l("MessagesPage: Error fetching messages from server.");
    //   Log.e(err);
    // });
  }

  ngOnInit() {
    Log.l("MessagesPage: ngOnInit() fired");
  }

  ngOnDestroy() {
    Log.l("MessagesPage: ngOnDestroy() fired");
  }

  ngAfterViewInit() {
    Log.l("MessagesPage: ngAfterViewInit() fired");
    this.tabServ.setPageLoaded();
  }

  public changedMessage(message:Message) {
    Log.l("changedMessage(): Message changed to:\n", message);
  }

  public closeMessage() {
    Log.l("closeMessage(): User clicked close message.");
    if(!this.message.read) {
      this.tabServ.decrementMessageBadge();
      this.message.setMessageRead();
      this.db.saveReadMessage(this.message).then(res => {
        Log.l("closeMessage(): Saved read message status.");
        this.viewCtrl.dismiss();
      }).catch(err => {
        Log.l("closeMessage(): Error saving message as read!");
        Log.e(err);
        this.viewCtrl.dismiss();
      });
    } else {
      this.viewCtrl.dismiss();
    }
    // this.tabs.goToPage('Message List');
  }



}
