import { Component,ChangeDetectorRef,Inject } from '@angular/core';
declare var Window;
/**
 * Generated class for the AlertComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */

@Component({
	selector: 'app-alert',
	templateUrl: 'alert.html'
})
export class AlertComponent {

	private showAlert:boolean = false;
	private content:string;
	private cd;

	constructor(@Inject(ChangeDetectorRef) cd) {
		this.cd = cd;
		Window._alert = (content)=>{
			this.showAlert = true;
			this.content = content;
			var self = this;
			setTimeout(function(){
				self.showAlert = false;
				self.cd.markForCheck();
			},2000);
		}
	}

	alertMsg(content) {
		this.showAlert = true;
		this.content = content;
		var self = this;
		setTimeout(function(){
			self.showAlert = false;
			self.cd.markForCheck();
		},2000);
	}
}
