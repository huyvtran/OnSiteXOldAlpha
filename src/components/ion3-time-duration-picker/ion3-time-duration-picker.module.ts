import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormGroup, FormControl, NG_VALUE_ACCESSOR, NG_VALIDATORS, ControlValueAccessor } from '@angular/forms';
// import { Ion3TimeDurationPicker, CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR } from './ion3-time-duration-picker';
import { Ion3TimeDurationPicker } from './ion3-time-duration-picker';

@NgModule({
  declarations: [
    Ion3TimeDurationPicker,
    // CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR,
  ],
  imports: [
    IonicPageModule.forChild(Ion3TimeDurationPicker),    
  ],
  exports: [
    Ion3TimeDurationPicker,
  ]
})
export class Ion3TimeDurationPickerModule {}