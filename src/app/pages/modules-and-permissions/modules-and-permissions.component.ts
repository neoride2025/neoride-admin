import { Component } from '@angular/core';
import { ModulesComponent } from '../../components/modules/modules.component';
import { PermissionsComponent } from '../../components/permissions/permissions.component';

@Component({
  selector: 'app-modules-and-permissions',
  imports: [ModulesComponent, PermissionsComponent],
  templateUrl: './modules-and-permissions.component.html',
  styleUrl: './modules-and-permissions.component.scss',
})
export class ModulesAndPermissionsComponent {

}
