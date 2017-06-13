import { Component, OnInit, ViewChild, Pipe, Sanitizer } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from "@angular/forms";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicPage, NavController, NavParams, LoadingController, PopoverController, ViewController } from 'ionic-angular';
import * as moment from 'moment';
import 'rxjs/add/operator/debounceTime';
import { DBSrvcs } from '../../providers/db-srvcs';
import { AuthSrvcs } from '../../providers/auth-srvcs';
import { TimeSrvc } from '../../providers/time-parse-srvc';
import { ReportBuildSrvc } from '../../providers/report-build-srvc';
import { AlertService } from '../../providers/alerts';
import { Log } from '../../config/config.functions';
import { Shift } from '../../domain/shift';
import { WorkOrder } from '../../domain/workorder';
import { Status } from '../../providers/status';
import { UserData } from '../../providers/user-data';
import { sprintf } from 'sprintf-js';
import { SafePipe } from '../../pipes/safe';
import { FancySelectComponent } from '../../components/fancy-select/fancy-select';


/**
 * Generated class for the FancySelectPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage({ name: 'Fancy Select' })
@Component({
  selector: 'page-fancy-select',
  templateUrl: 'fancy-select.html',
})
export class FancySelectPage implements OnInit {
  public title:string = "Fancy Select";
  public selectData:any = {};
  public options:Array<any> = [];
  public selected:any = null;
  public svgNumbers:any = [];
  public circChars:any = UserData.circled_numbers_chars;
  public circled_numbers: Array<string> = ["⓵", "⓶", "⓷", "⓸", "⓹", "⓺", "⓻", "⓼", "⓽"];
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public domSanitizer:DomSanitizer) {
    if (this.navParams.get('selectData') !== undefined) {
       this.selectData = this.navParams.get('selectData');
       this.options = this.selectData.options;
    }
    if(this.navParams.get('title') !== undefined) { this.title = this.navParams.get('title') }
    window['fancyselect'] = this;
  }

  ionViewDidLoad() {
    Log.l('ionViewDidLoad FancySelectPage');
  }

  ngOnInit() {
    Log.l('FancySelect: ngOnInit called. SelectData is:\n', this.selectData);
    // let len = this.selectData.numbers.length;
    // for(let i = 0; i < len; i++) {
    //   this.svgNumbers.push(this.domSanitizer.bypassSecurityTrustHtml(this.selectData.numbers[i]));
    // }
  }

  selectOption(number) {
    this.selected = this.options[number].shift;
    Log.l(`selectOption(${number}): selected option:\n`, this.selected);
    this.viewCtrl.dismiss(this.selected);
  }

  cancel() {
    Log.l("FancySelect: user clicked cancel(), no shift selected.");
    this.viewCtrl.dismiss(null);
  }

}