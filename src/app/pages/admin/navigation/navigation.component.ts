import { NavigationAPIService } from './../../../apis/navigation.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'app-navigation',
  imports: [],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {

  // injectable dependencies
  private navigation = inject(NavigationAPIService);

  ngOnInit() {
    this.getNavigationComponentData();
  }

  getNavigationComponentData() {
    this.navigation.getNavigationItems().subscribe(res => {
      console.log('res : ', res);
    }, err => {

    });
  }

}
