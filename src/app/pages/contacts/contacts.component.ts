import { Component } from '@angular/core';
import { CalloutComponent, ColComponent, RowComponent } from '@coreui/angular';
import { ContactAPIService } from '../../apis/contact.service';
import { DatePipe } from '@angular/common';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'app-contacts',
  imports: [CalloutComponent, RowComponent, ColComponent, DatePipe],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {

  contactList: any[] = [];

  randomColor = this.getRandomCoreUIColor();

  getRandomCoreUIColor(): any {
    const colors: any[] = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  constructor(
    private contactAPIService: ContactAPIService,
    public helperService: HelperService
  ) {

  }

  ngOnInit() {
    this.getContacts();
  }

  getContacts() {
    this.contactAPIService.getContacts().subscribe((res: any) => {
      console.log('res : ', res);
      if (res.status === 200) {
        this.contactList = res.data;
      }
    }, err => {
      console.log('err : ', err);
    })
  }


}
