import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalTitleDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, FormCheckLabelDirective, FormLabelDirective, FormDirective, FormControlDirective, FormSelectDirective } from '@coreui/angular';

@Component({
  selector: 'app-permissions',
  imports: [TableModule, PaginationModule, PageItemDirective, PageLinkDirective, PaginationComponent, ButtonDirective, ModalToggleDirective, ModalToggleDirective, ModalComponent,
    ModalHeaderComponent, ModalTitleDirective, ModalBodyComponent, ModalFooterComponent, FormControlDirective, FormDirective, FormSelectDirective, FormLabelDirective],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PermissionsComponent {

  // array holding the values
  permissions: any[] = [
    {
      "_id": "DASHBOARD_VIEW",
      "label": "View Dashboard",
      "module": "Dashboard",
      "description": "Allows access to the main dashboard"
    },
    {
      "_id": "USERS_VIEW",
      "label": "View Users",
      "module": "User Management",
      "description": "Allows viewing the user list"
    },
    {
      "_id": "USERS_CREATE",
      "label": "Create Users",
      "module": "User Management",
      "description": "Allows creating new users"
    },
    {
      "_id": "USERS_EDIT",
      "label": "Edit Users",
      "module": "User Management",
      "description": "Allows editing user details"
    },
    {
      "_id": "USERS_DELETE",
      "label": "Delete Users",
      "module": "User Management",
      "description": "Allows deleting users"
    },
    {
      "_id": "ROLES_VIEW",
      "label": "View Roles & Permissions",
      "module": "Access Control",
      "description": "Allows viewing roles and permissions"
    },
    {
      "_id": "ROLES_MANAGE",
      "label": "Manage Roles & Permissions",
      "module": "Access Control",
      "description": "Allows creating and editing roles and permissions"
    },
    {
      "_id": "CONTACTS_VIEW",
      "label": "View Contacts",
      "module": "Contacts",
      "description": "Allows viewing contacts list"
    },
    {
      "_id": "CONTACTS_CREATE",
      "label": "Create Contacts",
      "module": "Contacts",
      "description": "Allows creating new contacts"
    },
    {
      "_id": "CONTACTS_EDIT",
      "label": "Edit Contacts",
      "module": "Contacts",
      "description": "Allows editing contact details"
    },
    {
      "_id": "CONTACTS_DELETE",
      "label": "Delete Contacts",
      "module": "Contacts",
      "description": "Allows deleting contacts"
    }
  ];
  paginatedData: any[] = []; // displaying the data

  currentPage = 1;
  pageSize = 5; // total items per page
  totalPages = 0; // will calculate based on the values length & pageSize

  // new / update permission
  isModalForUpdate = false;

  ngOnInit() {
    this.preparePermissions();
  }

  preparePermissions() {
    this.totalPages = Math.ceil(this.permissions.length / this.pageSize);
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedData = this.permissions.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get pagesArray() {
    return Array.from({ length: this.totalPages });
  }

}