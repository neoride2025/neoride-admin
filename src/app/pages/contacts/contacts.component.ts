import { Component } from '@angular/core';
import { ContactAPIService } from '../../apis/contact.service';
import { HelperService } from '../../services/helper.service';
import { PanelModule } from 'primeng/panel';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-contacts',
  imports: [PanelModule, AvatarModule, ButtonModule, MenuModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent {

  contactList: any[] = [
    {
      _id: 1,
      name: 'Amy Elsner',
      image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
      email: 'qWV7A@example.com',
      mobile: 1234567890,
      message: 'Lorem ipsum dolor sit amet...',
    }
  ];

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
    // this.getContacts();
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
